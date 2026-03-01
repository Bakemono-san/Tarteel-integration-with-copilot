from typing import Dict, List, Optional
import json
import os
import requests
from pathlib import Path

class QuranService:
    """
    Service for accessing Quran text with tashkeel
    Fetches from Quran.com API and caches locally
    """

    def __init__(self):
        self.cache_dir = Path(__file__).parent.parent / "cache"
        self.cache_dir.mkdir(exist_ok=True)

        self.quran_data = self._load_quran_data()
        self.surah_info = self._load_surah_info()

        # Load from API if cache is empty
        if not self.quran_data or not self.surah_info:
            self._fetch_from_api()

    def _load_quran_data(self) -> Dict:
        """Load Quran text data from cache or use fallback"""
        cache_file = self.cache_dir / "quran_data.json"

        if cache_file.exists():
            try:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading cache: {e}")

        # Fallback data with more surahs
        return self._get_fallback_quran_data()

    def _get_fallback_quran_data(self) -> Dict:
        """Comprehensive fallback Quran data"""
        return {
            "1": {  # Surah Al-Fatihah
                "1": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
                "2": "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
                "3": "الرَّحْمَٰنِ الرَّحِيمِ",
                "4": "مَالِكِ يَوْمِ الدِّينِ",
                "5": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
                "6": "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
                "7": "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ"
            },
            "2": {  # Al-Baqarah
                "1": "الم",
                "2": "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ",
                "3": "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ",
                "4": "وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ",
                "5": "أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ"
            },
            "112": {  # Al-Ikhlas
                "1": "قُلْ هُوَ اللَّهُ أَحَدٌ",
                "2": "اللَّهُ الصَّمَدُ",
                "3": "لَمْ يَلِدْ وَلَمْ يُولَدْ",
                "4": "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ"
            },
            "113": {  # Al-Falaq
                "1": "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
                "2": "مِن شَرِّ مَا خَلَقَ",
                "3": "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
                "4": "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ",
                "5": "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ"
            },
            "114": {  # An-Nas
                "1": "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
                "2": "مَلِكِ النَّاسِ",
                "3": "إِلَٰهِ النَّاسِ",
                "4": "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
                "5": "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ",
                "6": "مِنَ الْجِنَّةِ وَالنَّاسِ"
            }
        }

    def _load_surah_info(self) -> Dict:
        """Load Surah metadata"""
        cache_file = self.cache_dir / "surah_info.json"

        if cache_file.exists():
            try:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading surah info cache: {e}")

        return self._get_fallback_surah_info()

    def _get_fallback_surah_info(self) -> Dict:
        """Comprehensive surah metadata"""
        return {
            "1": {
                "number": 1,
                "name": "الفاتحة",
                "englishName": "Al-Fatihah",
                "englishNameTranslation": "The Opening",
                "revelationType": "Meccan",
                "numberOfAyahs": 7
            },
            "2": {
                "number": 2,
                "name": "البقرة",
                "englishName": "Al-Baqarah",
                "englishNameTranslation": "The Cow",
                "revelationType": "Medinan",
                "numberOfAyahs": 286
            },
            "112": {
                "number": 112,
                "name": "الإخلاص",
                "englishName": "Al-Ikhlas",
                "englishNameTranslation": "The Sincerity",
                "revelationType": "Meccan",
                "numberOfAyahs": 4
            },
            "113": {
                "number": 113,
                "name": "الفلق",
                "englishName": "Al-Falaq",
                "englishNameTranslation": "The Daybreak",
                "revelationType": "Meccan",
                "numberOfAyahs": 5
            },
            "114": {
                "number": 114,
                "name": "الناس",
                "englishName": "An-Nas",
                "englishNameTranslation": "The Mankind",
                "revelationType": "Meccan",
                "numberOfAyahs": 6
            }
        }

    def _fetch_from_api(self):
        """Fetch Quran data from external API (Quran.com or Al-Quran Cloud)"""
        try:
            print("🌐 Fetching Quran data from API...")

            # Fetch from Al-Quran Cloud API (free, no auth required)
            base_url = "http://api.alquran.cloud/v1"

            # Get all surahs metadata
            response = requests.get(f"{base_url}/meta", timeout=10)
            if response.status_code == 200:
                meta_data = response.json()
                if meta_data.get("code") == 200:
                    surahs = meta_data["data"]["surahs"]["references"]

                    # Update surah info
                    self.surah_info = {}
                    for surah in surahs:
                        self.surah_info[str(surah["number"])] = {
                            "number": surah["number"],
                            "name": surah["name"],
                            "englishName": surah["englishName"],
                            "englishNameTranslation": surah["englishNameTranslation"],
                            "revelationType": surah["revelationType"],
                            "numberOfAyahs": surah["numberOfAyahs"]
                        }

                    # Save to cache
                    self._save_cache("surah_info.json", self.surah_info)
                    print("✅ Surah metadata fetched successfully")

            # For now, we'll keep the fallback data for ayahs
            # In a production app, you'd fetch all ayahs here
            print("💡 Using fallback ayah data. Consider downloading full Quran text.")

        except Exception as e:
            print(f"⚠️  Could not fetch from API: {e}")
            print("Using fallback data")

    def _save_cache(self, filename: str, data: Dict):
        """Save data to cache"""
        try:
            cache_file = self.cache_dir / filename
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error saving cache: {e}")

    def get_surah(self, surah_number: int) -> Dict:
        """Get complete surah with all ayahs"""
        surah_key = str(surah_number)

        if surah_key not in self.surah_info:
            return {"error": "Surah not found"}

        info = self.surah_info[surah_key]
        ayahs = self.quran_data.get(surah_key, {})

        return {
            "surah": info,
            "ayahs": [
                {
                    "number": int(ayah_num),
                    "text": text,
                    "numberInSurah": int(ayah_num)
                }
                for ayah_num, text in ayahs.items()
            ]
        }

    def get_ayah(self, surah_number: int, ayah_number: int) -> Dict:
        """Get specific ayah"""
        surah_key = str(surah_number)
        ayah_key = str(ayah_number)

        if surah_key not in self.quran_data:
            return {"error": "Surah not found"}

        if ayah_key not in self.quran_data[surah_key]:
            return {"error": "Ayah not found"}

        return {
            "surahNumber": surah_number,
            "ayahNumber": ayah_number,
            "text": self.quran_data[surah_key][ayah_key],
            "surahName": self.surah_info[surah_key]["name"],
            "surahEnglishName": self.surah_info[surah_key]["englishName"]
        }

    def get_ayah_text(self, surah_number: int, ayah_number: int) -> str:
        """Get just the text of an ayah"""
        surah_key = str(surah_number)
        ayah_key = str(ayah_number)

        if surah_key in self.quran_data and ayah_key in self.quran_data[surah_key]:
            return self.quran_data[surah_key][ayah_key]

        return ""

    def get_all_surahs(self) -> List[Dict]:
        """Get list of all surahs"""
        return [info for info in self.surah_info.values()]
