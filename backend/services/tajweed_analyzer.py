import re
from typing import Dict, List, Tuple
import difflib


class TajweedAnalyzer:
    """
    Analyzes Quranic recitation for Tajweed rules by comparing
    the user's transcribed recitation against the expected Quranic text.

    Every rule check evaluates what the user *actually* produced,
    not just what exists in the expected text.
    """

    QALQALAH_LETTERS = {"ق", "ط", "ب", "ج", "د"}
    GHUNNA_LETTERS = {"ن", "م"}
    MADDA_LETTERS = {"ا", "و", "ي"}
    IDHAAR_LETTERS = {"ء", "ه", "ع", "ح", "غ", "خ"}
    IQLAB_LETTER = "ب"
    IDGHAM_WITH_GHUNNA = {"ي", "ن", "م", "و"}
    IDGHAM_WITHOUT_GHUNNA = {"ل", "ر"}
    IKHFA_LETTERS = {"ت", "ث", "ج", "د", "ذ", "ز", "س", "ش",
                     "ص", "ض", "ط", "ظ", "ف", "ق", "ك"}

    # Severity weights for scoring
    RULE_WEIGHTS = {
        "Qalqalah": 15,
        "Ghunna": 12,
        "Iqlab": 12,
        "Idgham with Ghunna": 10,
        "Idgham without Ghunna": 10,
        "Ikhfa": 8,
        "Madd Lazin": 10,
        "Madd Lazim": 10,
        "Madd Tabee'i": 5,
        "Madd Leen": 6,
        "Idhaar Halqi": 5,
        "Idgham Mutamathilayn": 10,
        "Ikhfa Shafawi": 8,
        "Idhaar Shafawi": 4,
    }

    def analyze(self, transcribed_text: str, expected_text: str,
                phonemes: List = None,
                token_confidences: List[float] = None) -> Dict:
        """
        Analyze the recited (transcribed) text against expected Quranic text.

        Args:
            transcribed_text: What the ASR heard the user say
            expected_text: The correct Quranic text with tashkeel
            phonemes: Optional phoneme-level transcription
            token_confidences: Per-character confidence from ASR [0-1]

        Returns:
            Dictionary with full Tajweed analysis
        """
        transcribed_clean = self._remove_tashkeel(transcribed_text)
        expected_clean = self._remove_tashkeel(expected_text)

        similarity = self._calculate_similarity(transcribed_clean, expected_clean)
        errors = self._detect_errors(transcribed_text, expected_text, token_confidences)
        alignment = self._align_characters(transcribed_clean, expected_clean)
        rule_results = self._check_tajweed_rules(
            transcribed_text, expected_text, alignment, token_confidences
        )
        weighted_score = self._calculate_weighted_score(
            similarity, errors, rule_results
        )
        feedback = self._generate_feedback(similarity, errors, rule_results)
        corrections = self._suggest_corrections(errors, rule_results)

        return {
            "accuracy": similarity,
            "errors": errors,
            "tajweed_rules": rule_results,
            "feedback": feedback,
            "score": weighted_score,
            "corrections": corrections,
        }

    def _remove_tashkeel(self, text: str) -> str:
        """Remove Arabic diacritical marks (tashkeel)"""
        tashkeel = [
            '\u0610', '\u0611', '\u0612', '\u0613', '\u0614', '\u0615', '\u0616',
            '\u0617', '\u0618', '\u0619', '\u061A', '\u064B', '\u064C', '\u064D',
            '\u064E', '\u064F', '\u0650', '\u0651', '\u0652', '\u0653', '\u0654',
            '\u0655', '\u0656', '\u0657', '\u0658', '\u0659', '\u065A', '\u065B',
            '\u065C', '\u065D', '\u065E', '\u065F', '\u0670', '\u06D6', '\u06D7',
            '\u06D8', '\u06D9', '\u06DA', '\u06DB', '\u06DC', '\u06DD', '\u06DE',
            '\u06DF', '\u06E0', '\u06E1', '\u06E2', '\u06E3', '\u06E4', '\u06E5',
            '\u06E6', '\u06E7', '\u06E8', '\u06E9', '\u06EA', '\u06EB', '\u06EC',
            '\u06ED'
        ]
        for mark in tashkeel:
            text = text.replace(mark, '')
        return text.strip()

    def _calculate_similarity(self, text1: str, text2: str) -> float:
        if not text1 or not text2:
            return 0.0
        matcher = difflib.SequenceMatcher(None, text1, text2)
        return matcher.ratio()

    def _align_characters(self, transcribed: str, expected: str) -> List[Dict]:
        """
        Align transcribed vs expected text character-by-character.
        Returns a list of aligned pairs with their relationship.
        """
        matcher = difflib.SequenceMatcher(None, transcribed, expected)
        aligned = []
        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == 'equal':
                for k in range(i2 - i1):
                    aligned.append({
                        "type": "match",
                        "transcribed": transcribed[i1 + k],
                        "expected": expected[j1 + k],
                        "transcribed_idx": i1 + k,
                        "expected_idx": j1 + k,
                    })
            elif tag == 'replace':
                length = max(i2 - i1, j2 - j1)
                for k in range(length):
                    t_char = transcribed[i1 + k] if k < (i2 - i1) else ''
                    e_char = expected[j1 + k] if k < (j2 - j1) else ''
                    aligned.append({
                        "type": "substitution",
                        "transcribed": t_char,
                        "expected": e_char,
                        "transcribed_idx": i1 + k if t_char else None,
                        "expected_idx": j1 + k if e_char else None,
                    })
            elif tag == 'delete':
                for k in range(i2 - i1):
                    aligned.append({
                        "type": "insertion",
                        "transcribed": transcribed[i1 + k],
                        "expected": '',
                        "transcribed_idx": i1 + k,
                        "expected_idx": None,
                    })
            elif tag == 'insert':
                for k in range(j2 - j1):
                    aligned.append({
                        "type": "omission",
                        "transcribed": '',
                        "expected": expected[j1 + k],
                        "transcribed_idx": None,
                        "expected_idx": j1 + k,
                    })
        return aligned

    def _detect_errors(self, transcribed: str, expected: str,
                       token_confidences: List[float] = None) -> List[Dict]:
        """
        Detect user recitation errors by comparing transcribed vs expected text.

        difflib conventions:
          - 'replace': a[i1:i2] → b[j1:j2] (user said wrong thing)
          - 'delete': a[i1:i2] is extra in user → insertion
          - 'insert': b[j1:j2] is missing from user → omission
        """
        errors = []
        transcribed_clean = self._remove_tashkeel(transcribed)
        expected_clean = self._remove_tashkeel(expected)
        matcher = difflib.SequenceMatcher(None, transcribed_clean, expected_clean)

        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == 'replace':
                conf = self._get_conf(token_confidences, i1, i2)
                errors.append({
                    "type": "substitution",
                    "position": j1,
                    "expected": expected_clean[j1:j2],
                    "received": transcribed_clean[i1:i2],
                    "severity": "high",
                    "confidence_level": self._confidence_label(conf),
                    "asr_confidence": conf,
                })
            elif tag == 'delete':
                # User inserted extra characters
                conf = self._get_conf(token_confidences, i1, i2)
                errors.append({
                    "type": "insertion",
                    "position": j1,
                    "expected": "",
                    "received": transcribed_clean[i1:i2],
                    "severity": "medium",
                    "confidence_level": self._confidence_label(conf),
                    "asr_confidence": conf,
                })
            elif tag == 'insert':
                # User omitted expected characters
                conf = self._get_conf(token_confidences, j1, j2)
                errors.append({
                    "type": "omission",
                    "position": j1,
                    "expected": expected_clean[j1:j2],
                    "received": "",
                    "severity": "high",
                    "confidence_level": self._confidence_label(conf),
                    "asr_confidence": conf,
                })
        return errors

    def _get_conf(self, token_confidences, start, end):
        if token_confidences and start < len(token_confidences):
            try:
                return float(min(token_confidences[start:end]))
            except (ValueError, TypeError):
                pass
        return None

    def _confidence_label(self, conf: float) -> str:
        if conf is None:
            return "unknown"
        if conf >= 0.9:
            return "high"
        if conf >= 0.7:
            return "medium"
        return "low"

    def _build_clean_index(self, text: str) -> List[Dict]:
        """
        Build an index mapping clean-text positions to original-text positions.
        Returns list of: {clean_pos, orig_pos, clean_char, orig_char_seq, has_sukoon, has_shaddah}
        """
        index = []
        clean_pos = 0
        i = 0
        while i < len(text):
            ch = text[i]
            clean_ch = self._remove_tashkeel(ch)
            if clean_ch:
                has_sukoon = (i + 1 < len(text) and text[i + 1] == '\u0652')
                has_shaddah = (i + 1 < len(text) and text[i + 1] == '\u0651')
                has_tanween = ch in ['\u064B', '\u064C', '\u064D']
                index.append({
                    "clean_pos": clean_pos,
                    "orig_pos": i,
                    "clean_char": clean_ch,
                    "orig_char": ch,
                    "has_sukoon": has_sukoon,
                    "has_shaddah": has_shaddah,
                    "has_tanween": has_tanween,
                })
                clean_pos += 1
            i += 1
        return index

    def _check_tajweed_rules(self, transcribed: str, expected: str,
                              alignment: List[Dict],
                              token_confidences: List[float] = None) -> List[Dict]:
        results = []
        clean_index = self._build_clean_index(expected)
        covered_clean_positions = set()

        # ── 1. Qalqalah check ──────────────────────────────────────────
        for entry in clean_index:
            cc = entry["clean_char"]
            if cc in self.QALQALAH_LETTERS and entry["has_sukoon"]:
                if entry["clean_pos"] not in covered_clean_positions:
                    user_letter = self._find_user_letter_at(alignment, entry["clean_pos"])
                    rule = self._evaluate_rule_application(
                        rule_name="Qalqalah",
                        rule_id=f"qalqalah_{entry['orig_pos']}",
                        user_letter=user_letter,
                        expected_letter=cc,
                        is_critical=True,
                        description=f"Echo/bounce sound required for '{cc}' when it has sukoon",
                        token_confidences=token_confidences,
                    )
                    results.append(rule)
                    covered_clean_positions.add(entry["clean_pos"])

        # ── 2. Ghunna check (noon/meem mushaddadah) ────────────────────
        for entry in clean_index:
            cc = entry["clean_char"]
            if cc in self.GHUNNA_LETTERS and (entry["has_shaddah"] or entry["has_tanween"]):
                if entry["clean_pos"] not in covered_clean_positions:
                    user_letter = self._find_user_letter_at(alignment, entry["clean_pos"])
                    rule = self._evaluate_rule_application(
                        rule_name="Ghunna",
                        rule_id=f"ghunna_{entry['orig_pos']}",
                        user_letter=user_letter,
                        expected_letter=cc,
                        is_critical=True,
                        description=f"Nasal sound (ghunna) for 2 counts on '{cc}'",
                        token_confidences=token_confidences,
                    )
                    results.append(rule)
                    covered_clean_positions.add(entry["clean_pos"])

        # ── 3. Noon Sakinah & Tanween rules ────────────────────────────
        for idx, entry in enumerate(clean_index):
            cc = entry["clean_char"]
            if cc == "ن" and (entry["has_sukoon"] or entry["has_tanween"]):
                if entry["clean_pos"] not in covered_clean_positions:
                    next_entry = None
                    for k in range(idx + 1, len(clean_index)):
                        if clean_index[k]["clean_char"]:
                            next_entry = clean_index[k]
                            break

                    if next_entry:
                        next_letter = next_entry["clean_char"]
                        user_next = self._find_user_letter_at(alignment, next_entry["clean_pos"])

                        if next_letter in self.IDGHAM_WITH_GHUNNA:
                            rule = self._evaluate_rule_application(
                                rule_name="Idgham with Ghunna",
                                rule_id=f"idgham_wg_{entry['orig_pos']}",
                                user_letter=user_next,
                                expected_letter=next_letter,
                                is_critical=True,
                                description=f"Merge noon into '{next_letter}' with nasal sound (2 counts)",
                                token_confidences=token_confidences,
                                context=f"ن + {next_letter}",
                            )
                        elif next_letter in self.IDGHAM_WITHOUT_GHUNNA:
                            rule = self._evaluate_rule_application(
                                rule_name="Idgham without Ghunna",
                                rule_id=f"idgham_wog_{entry['orig_pos']}",
                                user_letter=user_next,
                                expected_letter=next_letter,
                                is_critical=True,
                                description=f"Merge noon into '{next_letter}' without nasal sound",
                                token_confidences=token_confidences,
                                context=f"ن + {next_letter}",
                            )
                        elif next_letter in self.IKHFA_LETTERS:
                            rule = self._evaluate_rule_application(
                                rule_name="Ikhfa",
                                rule_id=f"ikhfa_{entry['orig_pos']}",
                                user_letter=user_next,
                                expected_letter=next_letter,
                                is_critical=False,
                                description=f"Hide noon before '{next_letter}' with slight ghunna (2 counts)",
                                token_confidences=token_confidences,
                                context=f"ن + {next_letter}",
                            )
                        elif next_letter == self.IQLAB_LETTER:
                            user_iqlab = self._find_user_letter_at(alignment, entry["clean_pos"])
                            rule = self._evaluate_rule_application(
                                rule_name="Iqlab",
                                rule_id=f"iqlab_{entry['orig_pos']}",
                                user_letter=user_iqlab,
                                expected_letter=cc,
                                is_critical=True,
                                description=f"Convert noon to meem before 'ب' with ghunna (2 counts)",
                                token_confidences=token_confidences,
                                context="ن + ب",
                            )
                        elif next_letter in self.IDHAAR_LETTERS:
                            rule = self._evaluate_rule_application(
                                rule_name="Idhaar Halqi",
                                rule_id=f"idhaar_{entry['orig_pos']}",
                                user_letter=user_next,
                                expected_letter=next_letter,
                                is_critical=False,
                                description=f"Pronounce noon clearly before throat letter '{next_letter}'",
                                token_confidences=token_confidences,
                                context=f"ن + {next_letter}",
                            )
                        else:
                            continue

                        results.append(rule)
                        covered_clean_positions.add(entry["clean_pos"])

        # ── 4. Madd (prolongation) check ───────────────────────────────
        for entry in clean_index:
            cc = entry["clean_char"]
            oc = entry["orig_char"]
            if cc in self.MADDA_LETTERS and entry["clean_pos"] not in covered_clean_positions:
                user_letter = self._find_user_letter_at(alignment, entry["clean_pos"])
                if oc == '\u0622':
                    rule_name = "Madd Lazim"
                    description = "Prolong for 6 counts (madd lazim)"
                    is_crit = True
                elif cc == 'ا':
                    rule_name = "Madd Tabee'i"
                    description = "Prolong for 2 counts (madd tabee'i)"
                    is_crit = False
                else:
                    continue

                rule = self._evaluate_rule_application(
                    rule_name=rule_name,
                    rule_id=f"madd_{entry['orig_pos']}",
                    user_letter=user_letter,
                    expected_letter=cc,
                    is_critical=is_crit,
                    description=description,
                    token_confidences=token_confidences,
                )
                results.append(rule)
                covered_clean_positions.add(entry["clean_pos"])

        # ── 5. Meem Sakinah rules ──────────────────────────────────────
        for idx, entry in enumerate(clean_index):
            cc = entry["clean_char"]
            if cc == "م" and entry["has_sukoon"] and entry["clean_pos"] not in covered_clean_positions:
                next_entry = None
                for k in range(idx + 1, len(clean_index)):
                    if clean_index[k]["clean_char"]:
                        next_entry = clean_index[k]
                        break

                if next_entry:
                    next_letter = next_entry["clean_char"]
                    user_next = self._find_user_letter_at(alignment, next_entry["clean_pos"])

                    if next_letter == "م":
                        rule = self._evaluate_rule_application(
                            rule_name="Idgham Mutamathilayn",
                            rule_id=f"meem_idgham_{entry['orig_pos']}",
                            user_letter=user_next,
                            expected_letter="م",
                            is_critical=True,
                            description="Merge meem into meem with ghunna (2 counts)",
                            token_confidences=token_confidences,
                            context="م + م",
                        )
                    elif next_letter == "ب":
                        rule = self._evaluate_rule_application(
                            rule_name="Ikhfa Shafawi",
                            rule_id=f"meem_ikhfa_{entry['orig_pos']}",
                            user_letter=user_next,
                            expected_letter="ب",
                            is_critical=False,
                            description="Hide meem before ba with ghunna (2 counts)",
                            token_confidences=token_confidences,
                            context="م + ب",
                        )
                    else:
                        rule = self._evaluate_rule_application(
                            rule_name="Idhaar Shafawi",
                            rule_id=f"meem_idhaar_{entry['orig_pos']}",
                            user_letter=user_next,
                            expected_letter=next_letter,
                            is_critical=False,
                            description="Pronounce meem clearly",
                            token_confidences=token_confidences,
                            context=f"م + {next_letter}",
                        )

                    results.append(rule)
                    covered_clean_positions.add(entry["clean_pos"])

        return results

    def _find_user_letter_at(self, alignment: List[Dict],
                              expected_idx: int) -> Dict:
        """Find what the user produced at a given expected-text position."""
        for item in alignment:
            if item.get("expected_idx") == expected_idx:
                return item
        return {"type": "unknown", "transcribed": "", "expected": ""}

    def _evaluate_rule_application(self, rule_name: str, rule_id: str,
                                    user_letter: Dict, expected_letter: str,
                                    is_critical: bool, description: str,
                                    token_confidences: List[float] = None,
                                    context: str = None) -> Dict:
        """
        Evaluate whether the user applied a Tajweed rule correctly.

        Returns a rule result with status:
          - "applied_correctly": user produced the expected letter
          - "applied_incorrectly": user produced a different letter
          - "not_applied": user omitted the letter entirely
          - "absent": trigger condition not found
        """
        if not user_letter or user_letter.get("type") == "unknown":
            status = "not_applied"
            user_produced = ""
        elif user_letter["type"] == "match":
            status = "applied_correctly"
            user_produced = user_letter.get("transcribed", "")
        elif user_letter["type"] == "substitution":
            status = "applied_incorrectly"
            user_produced = user_letter.get("transcribed", "")
        elif user_letter["type"] == "omission":
            status = "not_applied"
            user_produced = ""
        else:
            status = "not_applied"
            user_produced = ""

        conf = None
        if token_confidences:
            idx = user_letter.get("expected_idx")
            if idx is not None and idx < len(token_confidences):
                conf = float(token_confidences[idx])

        return {
            "rule": rule_name,
            "rule_id": rule_id,
            "letter": expected_letter,
            "context": context,
            "status": status,
            "description": description,
            "level": "critical" if is_critical else "important",
            "user_produced": user_produced,
            "expected_letter": expected_letter,
            "asr_confidence": conf,
            "confidence_level": self._confidence_label(conf),
        }

    # ── Weighted Scoring ──────────────────────────────────────────────

    def _calculate_weighted_score(self, similarity: float,
                                   errors: List[Dict],
                                   rule_results: List[Dict]) -> int:
        """
        Calculate pedagogically meaningful score (0-100).

        - 60 points from character-level similarity
        - Up to 20 points from correct Tajweed rule application
        - Up to 20 point perfection bonus (no errors + all rules applied)
        """
        base_score = similarity * 60

        penalty = 0
        for rule in rule_results:
            weight = self.RULE_WEIGHTS.get(rule["rule"], 5)
            if rule["status"] == "applied_incorrectly":
                penalty += weight * 0.6
            elif rule["status"] == "not_applied":
                penalty += weight

        for error in errors:
            if error["type"] == "substitution":
                penalty += 3
            elif error["type"] == "omission":
                penalty += 4
            elif error["type"] == "insertion":
                penalty += 2

        bonus = 0
        total_rule_weight = 0
        for rule in rule_results:
            if rule["status"] == "applied_correctly":
                weight = self.RULE_WEIGHTS.get(rule["rule"], 5)
                bonus += min(weight * 0.3, 5)
                total_rule_weight += weight

        has_no_errors = len(errors) == 0
        all_rules_applied = all(
            r["status"] == "applied_correctly" for r in rule_results
            if r["status"] != "absent"
        )
        if has_no_errors and all_rules_applied and similarity > 0.95:
            bonus += 20

        score = base_score - penalty + bonus
        score = max(0, min(100, score))
        return int(round(score))

    # ── Feedback Generation ────────────────────────────────────────────

    def _generate_feedback(self, similarity: float, errors: List[Dict],
                           rule_results: List[Dict]) -> str:
        parts = []

        if similarity >= 0.95:
            parts.append("Masha'Allah! Excellent recitation with high accuracy.")
        elif similarity >= 0.85:
            parts.append("Good recitation. A few areas to polish.")
        elif similarity >= 0.70:
            parts.append("Fair effort. Focus on the suggested corrections.")
        else:
            parts.append("Please review the ayah carefully and practice more.")

        incorrect_rules = [r for r in rule_results
                           if r["status"] in ("applied_incorrectly", "not_applied")]
        missed_critical = [r for r in incorrect_rules if r["level"] == "critical"]
        missed_important = [r for r in incorrect_rules if r["level"] == "important"]

        if missed_critical:
            rules_list = ", ".join(set(r["rule"] for r in missed_critical))
            parts.append(f"Focus on critical rules: {rules_list}.")
        if missed_important:
            rules_list = ", ".join(set(r["rule"] for r in missed_important))
            parts.append(f"Also review: {rules_list}.")

        correct_rules = [r for r in rule_results
                         if r["status"] == "applied_correctly"]
        if correct_rules:
            rules_list = ", ".join(set(r["rule"] for r in correct_rules[:3]))
            parts.append(f"Good application of: {rules_list}.")

        return " ".join(parts)

    def _suggest_corrections(self, errors: List[Dict],
                              rule_results: List[Dict]) -> List[str]:
        corrections = []

        for error in errors[:3]:
            conf = error.get("confidence_level", "unknown")
            prefix = ""
            if conf == "low":
                prefix = "[Low confidence — may be transcription issue] "

            if error["type"] == "substitution":
                corrections.append(
                    f"{prefix}Replace '{error['received']}' with '{error['expected']}' at position {error['position']}"
                )
            elif error["type"] == "omission":
                corrections.append(
                    f"{prefix}Add '{error['expected']}' at position {error['position']}"
                )
            elif error["type"] == "insertion":
                corrections.append(
                    f"{prefix}Remove extra '{error['received']}' at position {error['position']}"
                )

        incorrect_rules = [r for r in rule_results
                           if r["status"] in ("applied_incorrectly", "not_applied")
                           and r["level"] == "critical"]
        for rule in incorrect_rules[:2]:
            letter = rule.get("letter", "")
            if rule["status"] == "not_applied":
                corrections.append(
                    f"Apply '{rule['rule']}' on letter '{letter}': {rule['description']}"
                )
            else:
                corrections.append(
                    f"Correct '{rule['rule']}' on letter '{letter}': {rule['description']}"
                )

        return corrections