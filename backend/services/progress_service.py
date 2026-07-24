import sqlite3
import json
import os
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional


class ProgressService:
    def __init__(self, db_path: str = None):
        if db_path is None:
            db_path = str(Path(__file__).parent.parent / "data" / "progress.db")
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self._init_db()

    def _get_conn(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        conn = self._get_conn()
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL DEFAULT 'default',
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ended_at TIMESTAMP,
                duration_seconds INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS recitation_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                user_id TEXT NOT NULL DEFAULT 'default',
                surah_number INTEGER NOT NULL,
                ayah_number INTEGER NOT NULL,
                accuracy REAL,
                score INTEGER,
                error_count INTEGER,
                tajweed_rules_found TEXT DEFAULT '[]',
                tajweed_rules_missed TEXT DEFAULT '[]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions(id)
            );

            CREATE TABLE IF NOT EXISTS rule_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL DEFAULT 'default',
                rule_name TEXT NOT NULL,
                total_attempts INTEGER DEFAULT 0,
                correct_attempts INTEGER DEFAULT 0,
                last_practiced TIMESTAMP,
                UNIQUE(user_id, rule_name)
            );

            CREATE TABLE IF NOT EXISTS surah_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL DEFAULT 'default',
                surah_number INTEGER NOT NULL,
                ayahs_practiced INTEGER DEFAULT 0,
                total_ayahs INTEGER DEFAULT 0,
                best_accuracy REAL DEFAULT 0,
                last_practiced TIMESTAMP,
                UNIQUE(user_id, surah_number)
            );
        """)
        conn.commit()
        conn.close()

    def start_session(self, user_id: str = "default") -> int:
        conn = self._get_conn()
        cur = conn.execute(
            "INSERT INTO sessions (user_id, started_at) VALUES (?, ?)",
            (user_id, datetime.now().isoformat())
        )
        session_id = cur.lastrowid
        conn.commit()
        conn.close()
        return session_id

    def end_session(self, session_id: int):
        conn = self._get_conn()
        started = conn.execute(
            "SELECT started_at FROM sessions WHERE id = ?", (session_id,)
        ).fetchone()
        if started:
            started_dt = datetime.fromisoformat(started["started_at"])
            duration = int((datetime.now() - started_dt).total_seconds())
            conn.execute(
                "UPDATE sessions SET ended_at = ?, duration_seconds = ? WHERE id = ?",
                (datetime.now().isoformat(), duration, session_id)
            )
            conn.commit()
        conn.close()

    def save_recitation(self, surah: int, ayah: int, analysis: dict,
                        session_id: int = None, user_id: str = "default"):
        conn = self._get_conn()
        conn.execute(
            """INSERT INTO recitation_results 
               (session_id, user_id, surah_number, ayah_number, accuracy, score, 
                error_count, tajweed_rules_found, tajweed_rules_missed)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                session_id or 0,
                user_id,
                surah,
                ayah,
                analysis.get("accuracy", 0),
                analysis.get("score", 0),
                len(analysis.get("errors", [])),
                json.dumps([
                    r["rule"] for r in analysis.get("tajweed_rules", [])
                    if r.get("status") == "applied_correctly"
                ], ensure_ascii=False),
                json.dumps([
                    r["rule"] for r in analysis.get("tajweed_rules", [])
                    if r.get("status") in ("applied_incorrectly", "not_applied")
                ], ensure_ascii=False),
            )
        )

        # Update rule_progress
        now = datetime.now().isoformat()
        for rule in analysis.get("tajweed_rules", []):
            rule_name = rule["rule"]
            conn.execute(
                """INSERT INTO rule_progress (user_id, rule_name, total_attempts, correct_attempts, last_practiced)
                   VALUES (?, ?, 1, ?, ?)
                   ON CONFLICT(user_id, rule_name) DO UPDATE SET
                       total_attempts = total_attempts + 1,
                       correct_attempts = correct_attempts + ?
                   WHERE user_id = ? AND rule_name = ?""",
                (user_id, rule_name,
                 1 if rule.get("status") == "applied_correctly" else 0,
                 now,
                 1 if rule.get("status") == "applied_correctly" else 0,
                 user_id, rule_name)
            )

        # Update surah_progress
        conn.execute(
            """INSERT INTO surah_progress (user_id, surah_number, ayahs_practiced, total_ayahs, best_accuracy, last_practiced)
               VALUES (?, ?, 1, ?, ?, ?)
               ON CONFLICT(user_id, surah_number) DO UPDATE SET
                   ayahs_practiced = ayahs_practiced + 1,
                   best_accuracy = MAX(best_accuracy, ?),
                   last_practiced = ?
               WHERE user_id = ? AND surah_number = ?""",
            (user_id, surah, self._get_surah_ayah_count(surah),
             analysis.get("accuracy", 0), now,
             analysis.get("accuracy", 0), now,
             user_id, surah)
        )

        conn.commit()
        conn.close()

    def _get_surah_ayah_count(self, surah: int) -> int:
        from services.quran_service import QuranService
        qs = QuranService()
        data = qs.get_surah(surah)
        if data and "ayahs" in data:
            return len(data["ayahs"])
        return 0

    def get_weakness_profile(self, user_id: str = "default") -> list[dict]:
        conn = self._get_conn()
        rows = conn.execute(
            """SELECT rule_name, total_attempts, correct_attempts, last_practiced
               FROM rule_progress WHERE user_id = ?
               ORDER BY (CAST(correct_attempts AS FLOAT) / MAX(total_attempts, 1)) ASC
               LIMIT 10""",
            (user_id,)
        ).fetchall()
        conn.close()

        profile = []
        for row in rows:
            accuracy = row["correct_attempts"] / max(row["total_attempts"], 1)
            profile.append({
                "rule": row["rule_name"],
                "total_attempts": row["total_attempts"],
                "correct_attempts": row["correct_attempts"],
                "accuracy": round(accuracy, 2),
                "last_practiced": row["last_practiced"],
                "needs_practice": accuracy < 0.7,
            })
        return profile

    def get_accuracy_trend(self, days: int = 30, user_id: str = "default") -> list[dict]:
        conn = self._get_conn()
        cutoff = (datetime.now() - timedelta(days=days)).isoformat()
        rows = conn.execute(
            """SELECT DATE(created_at) as day, AVG(accuracy) as avg_accuracy, COUNT(*) as count
               FROM recitation_results
               WHERE user_id = ? AND created_at >= ?
               GROUP BY DATE(created_at)
               ORDER BY day""",
            (user_id, cutoff)
        ).fetchall()
        conn.close()
        return [
            {"date": r["day"], "avg_accuracy": round(r["avg_accuracy"], 3), "count": r["count"]}
            for r in rows
        ]

    def get_recent_activity(self, limit: int = 20, user_id: str = "default") -> list[dict]:
        conn = self._get_conn()
        rows = conn.execute(
            """SELECT surah_number, ayah_number, accuracy, score, error_count, created_at
               FROM recitation_results
               WHERE user_id = ?
               ORDER BY created_at DESC
               LIMIT ?""",
            (user_id, limit)
        ).fetchall()
        conn.close()
        return [dict(r) for r in rows]

    def get_surah_progress(self, user_id: str = "default") -> list[dict]:
        conn = self._get_conn()
        rows = conn.execute(
            """SELECT surah_number, ayahs_practiced, total_ayahs, best_accuracy, last_practiced
               FROM surah_progress WHERE user_id = ?
               ORDER BY last_practiced DESC""",
            (user_id,)
        ).fetchall()
        conn.close()
        return [dict(r) for r in rows]


PROGRESS_SERVICE = ProgressService()