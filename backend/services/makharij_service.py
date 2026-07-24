class MakharijService:
    MAKHAARIJ = {
        "jawf": {
            "letters": ["ا", "و", "ي"],
            "name_ar": "الجوف",
            "name_en": "Oral Cavity",
            "description": "Open mouth cavity — empty space in the mouth and throat",
            "detail": "The unrestricted flow of sound through the mouth. Source of alif, waw, and ya maddah."
        },
        "halq": {
            "name_ar": "الحلق",
            "name_en": "Throat",
            "subcategories": [
                {
                    "name": "Aqsal Halq",
                    "name_ar": "أقصى الحلق",
                    "name_en": "Deepest Throat",
                    "letters": ["ء", "ه"],
                    "description": "Back of the throat closest to the chest"
                },
                {
                    "name": "Wasat al-Halq",
                    "name_ar": "وسط الحلق",
                    "name_en": "Middle Throat",
                    "letters": ["ع", "ح"],
                    "description": "Middle of the throat"
                },
                {
                    "name": "Adna al-Halq",
                    "name_ar": "أدنى الحلق",
                    "name_en": "Upper Throat",
                    "letters": ["غ", "خ"],
                    "description": "Upper throat near the mouth"
                }
            ]
        },
        "lisan": {
            "name_ar": "اللسان",
            "name_en": "Tongue",
            "description": "10 distinct articulation points on the tongue",
            "subcategories": [
                {
                    "name": "Aqsal Lisan",
                    "name_ar": "أقصى اللسان",
                    "name_en": "Deepest Tongue",
                    "detail": "Back of the tongue against the soft palate",
                    "letters": ["ق"],
                    "tongue_pos": "deep_back",
                    "tafkheem": True
                },
                {
                    "name": "Aqsal Lisan 2",
                    "name_ar": "أقصى اللسان",
                    "name_en": "Deepest Tongue 2",
                    "detail": "Back of the tongue slightly forward from ق, against the hard palate",
                    "letters": ["ك"],
                    "tongue_pos": "deep_back_slightly_forward",
                    "tafkheem": False
                },
                {
                    "name": "Wasat al-Lisan",
                    "name_ar": "وسط اللسان",
                    "name_en": "Middle Tongue",
                    "detail": "Middle of the tongue against the hard palate",
                    "letters": ["ج", "ش", "ي"],
                    "tongue_pos": "middle",
                    "tafkheem": False
                },
                {
                    "name": "Hafat al-Lisan",
                    "name_ar": "حافة اللسان",
                    "name_en": "Side of Tongue",
                    "detail": "Side of the tongue against the upper molars on either side",
                    "letters": ["ض"],
                    "tongue_pos": "side",
                    "tafkheem": True
                },
                {
                    "name": "Adna al-Lisan 1",
                    "name_ar": "أدنى اللسان",
                    "name_en": "Front Tongue 1",
                    "detail": "Front of the tongue near the tip, against the upper gum",
                    "letters": ["ل"],
                    "tongue_pos": "front_tip_upper_gum",
                    "tafkheem": False
                },
                {
                    "name": "Adna al-Lisan 2",
                    "name_ar": "أدنى اللسان",
                    "name_en": "Front Tongue 2",
                    "detail": "Tip of the tongue against the upper gum, slightly back from ل",
                    "letters": ["ن"],
                    "tongue_pos": "tip_upper_gum_back",
                    "tafkheem": False,
                    "ghunna": True
                },
                {
                    "name": "Adna al-Lisan 3",
                    "name_ar": "أدنى اللسان",
                    "name_en": "Front Tongue 3",
                    "detail": "Tip of the tongue against the upper gum — with repetition (tirta'id)",
                    "letters": ["ر"],
                    "tongue_pos": "tip_upper_gum_repeated",
                    "tafkheem": "conditional"
                },
                {
                    "name": "Taraf al-Lisan 1",
                    "name_ar": "طرف اللسان",
                    "name_en": "Tip of Tongue 1",
                    "detail": "Tip of the tongue against the base of the upper incisors",
                    "letters": ["ط", "د", "ت"],
                    "tongue_pos": "tip_base_upper_incisors",
                    "tafkheem": {"ط": True, "د": False, "ت": False}
                },
                {
                    "name": "Taraf al-Lisan 2",
                    "name_ar": "طرف اللسان",
                    "name_en": "Tip of Tongue 2",
                    "detail": "Tip of the tongue between the upper and lower incisors",
                    "letters": ["ص", "ز", "س"],
                    "tongue_pos": "tip_between_incisors",
                    "tafkheem": {"ص": True, "ز": False, "س": False}
                },
                {
                    "name": "Taraf al-Lisan 3",
                    "name_ar": "طرف اللسان",
                    "name_en": "Tip of Tongue 3",
                    "detail": "Tip of the tongue between the upper and lower incisors (thickness)",
                    "letters": ["ظ", "ذ", "ث"],
                    "tongue_pos": "tip_between_incisors_thickness",
                    "tafkheem": {"ظ": True, "ذ": False, "ث": False}
                }
            ]
        },
        "shafatan": {
            "name_ar": "الشفتان",
            "name_en": "Lips",
            "subcategories": [
                {
                    "name": "Inner Lip",
                    "name_ar": "باطن الشفة",
                    "name_en": "Inner lower lip",
                    "detail": "Inner part of the lower lip against the edge of the upper incisors",
                    "letters": ["ف"],
                    "tongue_pos": "inner_lower_lip_upper_incisors"
                },
                {
                    "name": "Both Lips",
                    "name_ar": "الشفتان",
                    "detail": "Both lips together",
                    "letters": ["ب", "م", "و"],
                    "tongue_pos": "both_lips"
                }
            ]
        },
        "khayshum": {
            "letters": ["م", "ن"],
            "name_ar": "الخيشوم",
            "name_en": "Nasal Cavity",
            "description": "The nasal passage — used for ghunna (nasalization) on noon and meem mushaddadah",
            "detail": "Ghunna: A nasal sound that flows through the nose. 2 counts for regular ghunna, 4-6 counts for madd"
        }
    }

    SIFAT = {
        "hams": {"letters": ["ت", "ث", "ح", "خ", "س", "ش", "ص", "ف", "ك", "ه"], "meaning": "Whisper — breath flows freely"},
        "jahr": {"letters": ["ا", "ب", "ج", "د", "ذ", "ر", "ز", "ض", "ط", "ظ", "ع", "غ", "ق", "ل", "م", "ن", "و", "ي", "ء"], "meaning": "Voice — breath is imprisoned"},
        "shiddah": {"letters": ["أ", "ب", "ج", "د", "ط", "ق", "ك", "ت"], "meaning": "Strength — sound is completely stopped"},
        "tawassut": {"letters": ["ل", "ن", "ع", "م", "ر"], "meaning": "Medium — sound is partially stopped"},
        "rikhwah": {"letters": ["ا", "ح", "خ", "ذ", "ز", "س", "ش", "ص", "ض", "ظ", "غ", "ف", "و", "ه", "ي"], "meaning": "Softness — sound flows continuously"},
        "istila": {"letters": ["خ", "ص", "ض", "ط", "ظ", "غ", "ق"], "meaning": "Elevation — tongue rises, heavy sound (tafkheem)"},
        "istifal": {"letters": ["ا", "ب", "ت", "ث", "ج", "ح", "د", "ذ", "ر", "ز", "س", "ش", "ع", "ف", "ك", "ل", "م", "ن", "ه", "و", "ي", "ء"], "meaning": "Lowering — tongue stays down, light sound (tarqeeq)"},
        "itbaq": {"letters": ["ص", "ض", "ط", "ظ"], "meaning": "Adherence — tongue adheres to upper palate"},
        "infitah": {"letters": ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي", "ء"], "meaning": "Openness — tongue separates from palate"},
        "idhlaq": {"letters": ["ب", "ر", "ف", "ل", "م", "ن"], "meaning": "Fluency — pronounced with ease from lip/tongue tip"},
    }

    def get_makhraj(self, letter: str) -> dict:
        letter_clean = self._remove_tashkeel(letter)
        for area, data in self.MAKHAARIJ.items():
            if "letters" in data and letter_clean in data["letters"]:
                return {
                    "area": area,
                    "name_ar": data.get("name_ar", ""),
                    "name_en": data.get("name_en", ""),
                    "description": data.get("description", ""),
                    "detail": data.get("detail", ""),
                    "tafkheem": self._is_tafkheem(letter_clean)
                }
            if "subcategories" in data:
                for sub in data["subcategories"]:
                    if letter_clean in sub.get("letters", []):
                        return {
                            "area": area,
                            "makhraj_name": sub.get("name", sub.get("name_en", "")),
                            "name_ar": sub.get("name_ar", ""),
                            "name_en": sub.get("name_en", ""),
                            "detail": sub.get("detail", ""),
                            "tongue_pos": sub.get("tongue_pos", ""),
                            "tafkheem": self._is_tafkheem(letter_clean, sub)
                        }
        return {"area": "unknown", "detail": "Letter not found"}

    def _remove_tashkeel(self, text: str) -> str:
        import re
        arabic_diacritics = re.compile(r'[\u064B-\u0652\u0670\u0640]')
        return arabic_diacritics.sub('', text).strip()

    def _is_tafkheem(self, letter: str, sub: dict = None) -> bool:
        if not letter:
            return False
        if letter in ["خ", "ص", "ض", "ط", "ظ", "غ", "ق"]:
            return True
        if letter == "ر":
            return "conditional"
        if letter in ["ا", "ل"]:
            return "conditional"
        if sub and "tafkheem" in sub:
            taf = sub["tafkheem"]
            if isinstance(taf, dict):
                return taf.get(letter, False)
            return bool(taf)
        return False

    def get_sifat(self, letter: str) -> list[dict]:
        letter_clean = self._remove_tashkeel(letter)
        sifat_list = []
        for sifat_name, data in self.SIFAT.items():
            if letter_clean in data["letters"]:
                sifat_list.append({
                    "name": sifat_name,
                    "meaning": data["meaning"]
                })
        return sifat_list

    def compare_makharij(self, expected_letter: str, actual_letter: str) -> dict:
        exp = self.get_makhraj(expected_letter)
        act = self.get_makhraj(actual_letter)

        same_makhraj = exp.get("area") == act.get("area")
        same_sub_makhraj = exp.get("makhraj_name") == act.get("makhraj_name")

        return {
            "same_makhraj": same_makhraj,
            "same_sub_makhraj": same_sub_makhraj,
            "expected": exp,
            "actual": act,
            "advice": self._generate_makhraj_advice(expected_letter, actual_letter, exp, act)
        }

    def _generate_makhraj_advice(self, expected: str, actual: str,
                                  exp_makh: dict, act_makh: dict) -> str:
        expected_name = exp_makh.get("makhraj_name") or exp_makh.get("name_en", expected)
        actual_name = act_makh.get("makhraj_name") or act_makh.get("name_en", actual)
        expected_pos = exp_makh.get("tongue_pos", "")
        actual_pos = act_makh.get("tongue_pos", "")

        if exp_makh.get("area") == act_makh.get("area"):
            if expected_pos and actual_pos and expected_pos != actual_pos:
                return (
                    f"Both '{expected}' and '{actual}' come from the {act_makh.get('name_en', f'{act_makh.get('area')}')} area, "
                    f"but with different tongue positions. "
                    f"'{expected}' uses: {expected_pos}. "
                    f"'{actual}' uses: {actual_pos}. "
                    f"Adjust your tongue position slightly."
                )
            return f"Same makhraj — focus on the sifat (attributes) to distinguish '{expected}' from '{actual}'."

        exp_area = exp_makh.get("name_en") or exp_makh.get("area", "")
        act_area = act_makh.get("name_en") or act_makh.get("area", "")
        return (
            f"'{expected}' comes from the {exp_area} "
            f"while '{actual}' comes from the {act_area}. "
            f"Move your articulation point from {act_area} to {exp_area}."
        )


MAKHAARIJ_SERVICE = MakharijService()