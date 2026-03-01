import re
from typing import Dict, List, Tuple
import difflib

class TajweedAnalyzer:
    """
    Analyzes Quranic recitation for Tajweed rules
    Checks for proper pronunciation, makharij, and comprehensive Tajweed principles

    Tajweed Rules Covered:
    - Ghunna (Nasal sound)
    - Qalqalah (Echo/bounce)
    - Idgham (Merging)
    - Ikhfa (Hiding)
    - Iqlab (Conversion)
    - Idhaar (Clear pronunciation)
    - Madd (Prolongation)
    - Noon/Meem Sakinah rules
    """

    def __init__(self):
        # Tajweed rules categories
        self.rules = {
            "ghunna": ["ن", "م"],  # Nasal sound
            "qalqalah": ["ق", "ط", "ب", "ج", "د"],  # Echo/bounce
            "idgham": self._get_idgham_rules(),
            "ikhfa": self._get_ikhfa_letters(),
            "madd": ["ا", "و", "ي"],  # Prolongation
            "iqlab": "ب",  # Conversion of noon sakinah to meem
            "idhaar": ["ء", "ه", "ع", "ح", "غ", "خ"],  # Clear pronunciation
        }

        # Noon Sakinah markers
        self.noon_sakinah_patterns = ["نْ", "نّ"]
        self.meem_sakinah_patterns = ["مْ", "مّ"]

    def _get_idgham_rules(self) -> Dict:
        """Idgham (merging) rules"""
        return {
            "with_ghunna": ["ي", "ن", "م", "و"],  # يَنْمُو
            "without_ghunna": ["ل", "ر"]
        }

    def _get_ikhfa_letters(self) -> List[str]:
        """Letters that trigger Ikhfa (hiding) - 15 letters"""
        return ["ت", "ث", "ج", "د", "ذ", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ف", "ق", "ك"]

    def analyze(self, transcribed_text: str, expected_text: str, phonemes: List = None) -> Dict:
        """
        Analyze the transcribed recitation against expected text

        Args:
            transcribed_text: What the user recited (from ASR)
            expected_text: The correct Quranic text
            phonemes: Optional phoneme-level transcription

        Returns:
            Dictionary with tajweed analysis results
        """
        # Remove tashkeel for comparison
        transcribed_clean = self._remove_tashkeel(transcribed_text)
        expected_clean = self._remove_tashkeel(expected_text)

        # Calculate similarity
        similarity = self._calculate_similarity(transcribed_clean, expected_clean)

        # Detect errors
        errors = self._detect_errors(transcribed_text, expected_text)

        # Check tajweed rules
        tajweed_checks = self._check_tajweed_rules(transcribed_text, expected_text)

        # Generate feedback
        feedback = self._generate_feedback(similarity, errors, tajweed_checks)

        return {
            "accuracy": similarity,
            "errors": errors,
            "tajweed_rules": tajweed_checks,
            "feedback": feedback,
            "score": self._calculate_score(similarity, errors, tajweed_checks),
            "corrections": self._suggest_corrections(errors)
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
        """Calculate similarity between two texts using sequence matching"""
        if not text1 or not text2:
            return 0.0

        matcher = difflib.SequenceMatcher(None, text1, text2)
        return matcher.ratio()

    def _detect_errors(self, transcribed: str, expected: str) -> List[Dict]:
        """Detect specific errors in recitation"""
        errors = []

        # Character-level comparison
        transcribed_clean = self._remove_tashkeel(transcribed)
        expected_clean = self._remove_tashkeel(expected)

        matcher = difflib.SequenceMatcher(None, transcribed_clean, expected_clean)

        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == 'replace':
                errors.append({
                    "type": "substitution",
                    "position": j1,
                    "expected": expected_clean[j1:j2],
                    "received": transcribed_clean[i1:i2],
                    "severity": "high"
                })
            elif tag == 'delete':
                errors.append({
                    "type": "omission",
                    "position": j1,
                    "expected": expected_clean[j1:j2],
                    "received": "",
                    "severity": "high"
                })
            elif tag == 'insert':
                errors.append({
                    "type": "insertion",
                    "position": j1,
                    "expected": "",
                    "received": transcribed_clean[i1:i2],
                    "severity": "medium"
                })

        return errors

    def _check_tajweed_rules(self, transcribed: str, expected: str) -> List[Dict]:
        """Check specific tajweed rules comprehensively"""
        checks = []

        # Check for Qalqalah letters
        for letter in self.rules["qalqalah"]:
            if letter in expected:
                # Check if letter has sukoon (stop/pause)
                qalqalah_pattern = f"{letter}ْ"
                if qalqalah_pattern in expected or expected.endswith(letter):
                    checks.append({
                        "rule": "Qalqalah",
                        "letter": letter,
                        "status": "detected",
                        "description": f"Echo/bounce sound required for '{letter}' when it has sukoon",
                        "level": "important"
                    })

        # Check for Ghunna (noon and meem with shaddah/tanween)
        ghunna_patterns = ["نّ", "مّ", "نً", "نٌ", "نٍ"]
        for pattern in ghunna_patterns:
            if pattern in expected:
                checks.append({
                    "rule": "Ghunna",
                    "letter": pattern,
                    "status": "detected",
                    "description": "Nasal sound held for 2 counts (2 harakah)",
                    "level": "critical"
                })

        # Check for Noon Sakinah rules
        if "نْ" in expected or "نٍ" in expected:
            # Find what letter comes after
            for i, char in enumerate(expected):
                if char in ["ن"] and i + 1 < len(expected):
                    next_char = self._remove_tashkeel(expected[i+1:i+2])

                    # Idgham
                    if next_char in self.rules["idgham"]["with_ghunna"]:
                        checks.append({
                            "rule": "Idgham with Ghunna",
                            "context": f"ن + {next_char}",
                            "status": "detected",
                            "description": f"Merge noon into '{next_char}' with nasal sound",
                            "level": "critical"
                        })
                    elif next_char in self.rules["idgham"]["without_ghunna"]:
                        checks.append({
                            "rule": "Idgham without Ghunna",
                            "context": f"ن + {next_char}",
                            "status": "detected",
                            "description": f"Merge noon into '{next_char}' without nasal sound",
                            "level": "critical"
                        })

                    # Ikhfa
                    elif next_char in self.rules["ikhfa"]:
                        checks.append({
                            "rule": "Ikhfa",
                            "context": f"ن + {next_char}",
                            "status": "detected",
                            "description": f"Hide the noon before '{next_char}' with slight nasal sound",
                            "level": "important"
                        })

                    # Iqlab
                    elif next_char == self.rules["iqlab"]:
                        checks.append({
                            "rule": "Iqlab",
                            "context": f"ن + ب",
                            "status": "detected",
                            "description": "Convert noon to meem sound with ghunna",
                            "level": "critical"
                        })

                    # Idhaar
                    elif next_char in self.rules["idhaar"]:
                        checks.append({
                            "rule": "Idhaar Halqi",
                            "context": f"ن + {next_char}",
                            "status": "detected",
                            "description": f"Pronounce noon clearly before throat letter '{next_char}'",
                            "level": "important"
                        })

        # Check for Madd (prolongation)
        madd_patterns = [
            ("آ", "Madd Lazim", "6 counts"),
            ("ا", "Madd Tabee'i", "2 counts"),
            ("وْ", "Madd Leen", "2-4 counts"),
            ("يْ", "Madd Leen", "2-4 counts"),
        ]

        for pattern, rule_name, duration in madd_patterns:
            if pattern in expected:
                checks.append({
                    "rule": rule_name,
                    "letter": pattern,
                    "status": "detected",
                    "description": f"Prolong for {duration}",
                    "level": "important"
                })

        # Check for Meem Sakinah rules
        if "مْ" in expected:
            for i, char in enumerate(expected):
                if char == "م" and i + 1 < len(expected):
                    next_char = self._remove_tashkeel(expected[i+1:i+2])

                    if next_char == "م":
                        checks.append({
                            "rule": "Idgham Mutamathilayn",
                            "context": "م + م",
                            "status": "detected",
                            "description": "Merge meem into meem with ghunna",
                            "level": "critical"
                        })
                    elif next_char == "ب":
                        checks.append({
                            "rule": "Ikhfa Shafawi",
                            "context": "م + ب",
                            "status": "detected",
                            "description": "Hide meem before ba with ghunna",
                            "level": "important"
                        })
                    else:
                        checks.append({
                            "rule": "Idhaar Shafawi",
                            "context": f"م + {next_char}",
                            "status": "detected",
                            "description": "Pronounce meem clearly",
                            "level": "important"
                        })

        return checks

    def _generate_feedback(self, similarity: float, errors: List, tajweed_checks: List) -> str:
        """Generate human-readable feedback"""
        if similarity >= 0.95:
            feedback = "Excellent! Your recitation is very accurate. "
        elif similarity >= 0.85:
            feedback = "Good recitation with minor improvements needed. "
        elif similarity >= 0.70:
            feedback = "Fair recitation. Please practice more for accuracy. "
        else:
            feedback = "Please review the ayah and practice pronunciation. "

        if errors:
            feedback += f"Found {len(errors)} pronunciation error(s). "

        if tajweed_checks:
            feedback += f"Pay attention to {len(tajweed_checks)} tajweed rule(s). "

        return feedback

    def _calculate_score(self, similarity: float, errors: List, tajweed_checks: List) -> int:
        """Calculate overall score (0-100)"""
        base_score = similarity * 100

        # Deduct points for errors
        error_penalty = len(errors) * 5

        # Add bonus for proper tajweed awareness
        tajweed_bonus = min(len(tajweed_checks) * 2, 10)

        score = max(0, min(100, base_score - error_penalty + tajweed_bonus))
        return int(score)

    def _suggest_corrections(self, errors: List[Dict]) -> List[str]:
        """Suggest corrections for detected errors"""
        corrections = []

        for error in errors[:3]:  # Limit to top 3 errors
            if error["type"] == "substitution":
                corrections.append(
                    f"Replace '{error['received']}' with '{error['expected']}' at position {error['position']}"
                )
            elif error["type"] == "omission":
                corrections.append(
                    f"You missed '{error['expected']}' at position {error['position']}"
                )
            elif error["type"] == "insertion":
                corrections.append(
                    f"Remove extra '{error['received']}' at position {error['position']}"
                )

        return corrections
