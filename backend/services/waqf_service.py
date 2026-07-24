class WaqfService:
    WAQF_MARKS = {
        "مـ": {
            "name": "Waqf Lazim",
            "name_ar": "وقف لازم",
            "meaning": "Mandatory Stop",
            "description": "Must stop here. Stopping is required to avoid changing the meaning.",
            "severity": "critical",
        },
        "ط": {
            "name": "Waqf Mutlaq",
            "name_ar": "وقف مطلق",
            "meaning": "Absolute Stop",
            "description": "Perfect place to stop — the meaning is complete.",
            "severity": "recommended",
        },
        "ج": {
            "name": "Waqf Ja'iz",
            "name_ar": "وقف جائز",
            "meaning": "Permissible Stop",
            "description": "Permissible to stop — both stopping and continuing are acceptable.",
            "severity": "permissible",
        },
        "ز": {
            "name": "Waqf Mujawwaz",
            "name_ar": "وقف مجوز",
            "meaning": "Better to Continue",
            "description": "Continuing is better, but stopping is allowed if needed for breath.",
            "severity": "continue_preferred",
        },
        "ص": {
            "name": "Waqf Murakhkhas",
            "name_ar": "وقف مرخص",
            "meaning": "Prefer to Stop",
            "description": "Stopping is preferred due to the length of the phrase.",
            "severity": "stop_preferred",
        },
        "ق": {
            "name": "Qeela 'alayhil-Waqf",
            "name_ar": "قيل عليه الوقف",
            "meaning": "Better to Continue",
            "description": "It is said stopping is allowed here, but continuing is better.",
            "severity": "continue_preferred",
        },
        "س": {
            "name": "Saktah",
            "name_ar": "سكتة",
            "meaning": "Brief Pause (No Breath)",
            "description": "Brief pause without taking a new breath. More common in Hafs 'an 'Aasim recitation.",
            "severity": "pause_no_breath",
        },
        "لا": {
            "name": "La Waqf",
            "name_ar": "لا وقف",
            "meaning": "Must Not Stop",
            "description": "Must not stop here — stopping would break the meaning.",
            "severity": "forbidden",
        },
    }

    def get_waqf_mark_info(self, mark: str) -> dict:
        mark_clean = mark.strip()
        return self.WAQF_MARKS.get(mark_clean, {
            "name": "Unknown",
            "name_ar": "غير معروف",
            "meaning": "Unknown waqf mark",
            "description": "No information available for this mark.",
            "severity": "unknown",
        })

    def get_all_marks(self) -> dict:
        return self.WAQF_MARKS

    def suggest_waqf_points(self, ayah_text: str) -> list[dict]:
        suggestions = []
        ayah_clean = ayah_text

        for i, ch in enumerate(ayah_clean):
            ch_code = hex(ord(ch))
            if ch == '\u06DA':  # Small high meem (مـ) - Waqf Lazim
                suggestions.append({"position": i, "mark": "مـ", "char": "مـ"})
            elif ch == '\u06DB':  # ط
                suggestions.append({"position": i, "mark": "ط", "char": "ط"})
            elif ch == '\u06DC':  # ج
                suggestions.append({"position": i, "mark": "ج", "char": "ج"})
            elif ch == '\u06DD':  # لا
                suggestions.append({"position": i, "mark": "لا", "char": "لا"})
            elif ch == '\u06DE':  # ز
                suggestions.append({"position": i, "mark": "ز", "char": "ز"})
            elif ch == '\u06DF':  # ص
                suggestions.append({"position": i, "mark": "ص", "char": "ص"})
            elif ch == '\u06E0':  # ص
                suggestions.append({"position": i, "mark": "ص", "char": "ص"})
            elif ch == '\u06E1':  # س (saktah)
                suggestions.append({"position": i, "mark": "س", "char": "س"})
            elif ch == '\u06E2':  # ق
                suggestions.append({"position": i, "mark": "ق", "char": "ق"})
            elif ch == '\u06E3':  # ص
                suggestions.append({"position": i, "mark": "ص", "char": "ص"})
            elif ch == '\u06E4':  # ص
                suggestions.append({"position": i, "mark": "ص", "char": "ص"})
            elif ch == '\u06E5':  # small waw (وَقْفَة)
                suggestions.append({"position": i, "mark": "وَقْفَة", "char": "و"})
            elif ch == '\u06E6':  # small waw
                suggestions.append({"position": i, "mark": "وَقْفَة", "char": "و"})
            elif ch == '\u06E7':  # س
                suggestions.append({"position": i, "mark": "س", "char": "س"})
            elif ch == '\u06E8':  # ص
                suggestions.append({"position": i, "mark": "ص", "char": "ص"})
            elif ch == '\u06E9':  # ص
                suggestions.append({"position": i, "mark": "ص", "char": "ص"})
            elif ch == '\u06EA':  # لا
                suggestions.append({"position": i, "mark": "لا", "char": "لا"})
            elif ch == '\u06EB':
                suggestions.append({"position": i, "mark": "Waqf", "char": "?"})
            elif ch == '\u06EC':
                suggestions.append({"position": i, "mark": "Waqf", "char": "?"})
            elif ch == '\u06ED':
                suggestions.append({"position": i, "mark": "Ruku", "char": "ۭ"})

        augmented = []
        for s in suggestions:
            mark_info = self.get_waqf_mark_info(s["mark"])
            augmented.append({**s, **mark_info})
        return augmented

    def evaluate_stop(self, ayah_text: str, stopped_position: int) -> dict:
        if stopped_position >= len(ayah_text):
            return {
                "valid": True,
                "note": "End of ayah — complete stop is always valid.",
                "severity": "info",
            }

        for i, ch in enumerate(ayah_text):
            ch_code = hex(ord(ch))
            if i == stopped_position:
                mark_char = ch
                mark_symbol = None
                for sym, data in self.WAQF_MARKS.items():
                    if ch == '\u06DA': mark_symbol = "مـ"
                    elif ch == '\u06DB': mark_symbol = "ط"
                    elif ch == '\u06DC': mark_symbol = "ج"
                    elif ch == '\u06DD': mark_symbol = "لا"
                    elif ch == '\u06DE': mark_symbol = "ز"
                    elif ch == '\u06DF': mark_symbol = "ص"
                    elif ch == '\u06E0': mark_symbol = "ص"
                    elif ch == '\u06E1': mark_symbol = "س"
                    elif ch == '\u06E2': mark_symbol = "ق"
                    elif ch == '\u06E3': mark_symbol = "ص"
                    elif ch == '\u06E4': mark_symbol = "ص"
                    elif ch == '\u06E5': mark_symbol = "س"
                    elif ch == '\u06E6': mark_symbol = "س"
                    elif ch == '\u06E7': mark_symbol = "س"
                    elif ch == '\u06E8': mark_symbol = "ص"
                    elif ch == '\u06E9': mark_symbol = "ص"
                    elif ch == '\u06EA': mark_symbol = "لا"
                    elif ch == '\u06EB': mark_symbol = "ج"
                    elif ch == '\u06EC': mark_symbol = "ج"
                    elif ch == '\u06ED': mark_symbol = "۝"

                if mark_symbol:
                    info = self.get_waqf_mark_info(mark_symbol)
                    valid = info["severity"] not in ("forbidden", "continue_preferred")
                    return {
                        "valid": valid,
                        "mark": mark_symbol,
                        "note": f"{info['name_ar']}: {info['description']}",
                        "severity": info["severity"],
                    }

        return {
            "valid": True,
            "note": "No waqf mark at this position — stopping is permissible if meaning is complete.",
            "severity": "permissible",
        }


WAQF_SERVICE = WaqfService()