class CurriculumService:
    TIERS = [
        {
            "tier": 1,
            "title": "الفاتحة والاخلاص والمعوذات",
            "title_en": "Al-Fatihah & Protection Surahs",
            "surahs": [1, 112, 113, 114],
            "focus_rules": ["Idhaar Halqi", "Ghunna", "Madd Tabee'i"],
            "focus_rules_ar": ["الإظهار الحلقي", "الغنة", "المد الطبيعي"],
            "mastery_required": 0.85,
            "description": "The most recited surahs in daily prayer — master these first."
        },
        {
            "tier": 2,
            "title": "سور قصيرة من جزء عم",
            "title_en": "Short Surahs from Juz' 30",
            "surahs": [109, 110, 108, 107, 106, 105, 104, 103],
            "focus_rules": ["Qalqalah", "Ikhfa", "Madd Tabee'i"],
            "focus_rules_ar": ["القلقلة", "الإخفاء", "المد الطبيعي"],
            "mastery_required": 0.82,
            "description": "Short, frequently recited surahs for building Tajweed confidence."
        },
        {
            "tier": 3,
            "title": "جزء عم الجزء الثاني",
            "title_en": "Juz' 30 Continued",
            "surahs": [102, 101, 100, 99, 97, 95, 94, 93],
            "focus_rules": ["Idgham", "Ghunna", "Madd Lazim"],
            "focus_rules_ar": ["الإدغام", "الغنة", "المد اللازم"],
            "mastery_required": 0.80,
            "description": "Medium surahs introducing more Idgham and Madd rules."
        },
        {
            "tier": 4,
            "title": "آخر جزء عم",
            "title_en": "End of Juz' 30",
            "surahs": [91, 90, 89, 88, 87, 86, 85, 84, 83],
            "focus_rules": ["Iqlab", "Madd Leen", "Idgham with Ghunna"],
            "focus_rules_ar": ["الإقلاب", "المد اللين", "الإدغام بغنة"],
            "mastery_required": 0.80,
            "description": "Longer ayahs with varied Madd types."
        },
        {
            "tier": 5,
            "title": "سور من جزء تبارك",
            "title_en": "Juz' 29 (Tabarak)",
            "surahs": [78, 79, 80, 81, 82, 67],
            "focus_rules": ["Meem Sakinah", "Ikhfa Shafawi", "Qalqalah Kubra"],
            "focus_rules_ar": ["أحكام الميم الساكنة", "الإخفاء الشفوي", "القلقلة الكبرى"],
            "mastery_required": 0.78,
            "description": "Meem Sakinah rules in depth with longer passages."
        },
        {
            "tier": 6,
            "title": "سور مدنية متوسطة",
            "title_en": "Medium Madani Surahs",
            "surahs": [36, 55, 18, 19],
            "focus_rules": ["All rules combined", "Waqf practice", "Madd Far'i"],
            "focus_rules_ar": ["جميع الأحكام", "الوقف", "المد الفرعي"],
            "mastery_required": 0.75,
            "description": "Longer surahs requiring sustained Tajweed application."
        },
        {
            "tier": 7,
            "title": "سور مدنية طويلة",
            "title_en": "Long Madani Surahs (Partial)",
            "surahs": [2, 3, 4],
            "focus_rules": ["Comprehensive", "Consistency", "Fluency"],
            "focus_rules_ar": ["شامل", "الاستمرارية", "الطلاقة"],
            "mastery_required": 0.72,
            "description": "Partial recitations from the longest surahs."
        },
    ]

    def __init__(self, progress_service=None):
        self._progress = progress_service

    def set_progress_service(self, progress_service):
        self._progress = progress_service

    def get_all_tiers(self) -> list[dict]:
        return self.TIERS

    def get_current_tier(self, user_id: str = "default") -> dict:
        if not self._progress:
            return self.TIERS[0]
        profile = self._progress.get_weakness_profile(user_id)
        for tier in self.TIERS:
            tier_surahs = tier["surahs"]
            focus_rules = tier["focus_rules"]
            all_mastered = True
            for rule in focus_rules:
                for entry in profile:
                    if entry["rule"] == rule:
                        if entry["accuracy"] < tier["mastery_required"]:
                            all_mastered = False
                        break
            if not all_mastered:
                return tier
        return self.TIERS[-1]

    def get_next_unlocked_surahs(self, tier: int) -> list[int]:
        for t in self.TIERS:
            if t["tier"] == tier:
                return t["surahs"]
        return self.TIERS[0]["surahs"]

    def check_unlock_progress(self, user_id: str = "default", target_tier: int = 1) -> dict:
        if not self._progress or target_tier == 1:
            return {"tier_complete": True, "progress": 1.0, "required": 1.0}

        current_tier_data = None
        for t in self.TIERS:
            if t["tier"] == target_tier - 1:
                current_tier_data = t
                break

        if not current_tier_data:
            return {"tier_complete": True, "progress": 1.0, "required": 1.0}

        profile = self._progress.get_weakness_profile(user_id)
        focus_rules = current_tier_data["focus_rules"]
        rule_progresses = []
        all_mastered = True
        for rule in focus_rules:
            found = False
            for entry in profile:
                if entry["rule"] == rule:
                    needed = current_tier_data["mastery_required"]
                    rule_progresses.append({
                        "rule": rule,
                        "current": entry["accuracy"],
                        "required": needed,
                        "mastered": entry["accuracy"] >= needed,
                    })
                    found = True
                    break
            if not found:
                rule_progresses.append({
                    "rule": rule, "current": 0, "required": current_tier_data["mastery_required"], "mastered": False
                })
                all_mastered = False

        total_progress = (sum(r["current"] for r in rule_progresses) /
                          max(len(rule_progresses), 1))

        return {
            "tier_complete": all_mastered,
            "progress": round(total_progress, 3),
            "required": current_tier_data["mastery_required"],
            "rules": rule_progresses,
        }

    def get_recommended_next_ayah(self, user_id: str = "default") -> dict:
        if not self._progress:
            return {"surah": 1, "ayah": 1}
        tier = self.get_current_tier(user_id)
        focus_rule = tier["focus_rules"][0]
        profile = self._progress.get_weakness_profile(user_id)
        weakest_rule = None
        for entry in profile:
            if entry["rule"] in tier["focus_rules"] and entry["needs_practice"]:
                weakest_rule = entry["rule"]
                break
        return {
            "surah": tier["surahs"][0],
            "tier": tier["tier"],
            "title_en": tier["title_en"],
            "focus_rule": weakest_rule or focus_rule,
        }


CURRICULUM_SERVICE = CurriculumService()