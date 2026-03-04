from typing import Dict, List
import json
import os
import requests
from pathlib import Path

class QuranService:
    """
    Service for accessing complete Quran text with tashkeel
    Uses Quran.cloud API as primary source, with local caching
    """

    def __init__(self):
        self.cache_dir = Path(__file__).parent.parent / "cache"
        self.cache_dir.mkdir(exist_ok=True)

        self.surah_info = self._load_or_fetch_surah_info()
        self.quran_data = self._load_or_fetch_quran_data()

        # Validate cache completeness
        self._validate_cache()

    def _load_or_fetch_surah_info(self) -> Dict:
        """Load surah info from cache or fetch from API"""
        cache_file = self.cache_dir / "surah_info.json"

        if cache_file.exists():
            try:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    print(f"✅ Loaded {len(data)} surahs from cache")
                    return data
            except Exception as e:
                print(f"⚠️  Cache read error: {e}")

        # Fetch from API
        print("📡 Fetching surah info from Quran.cloud API...")
        try:
            response = requests.get('http://api.alquran.cloud/v1/meta', timeout=10)
            if response.status_code == 200:
                meta = response.json()
                if meta.get('code') == 200:
                    surahs_data = meta['data']['surahs']['references']

                    # Convert to our format
                    surah_info = {}
                    for surah in surahs_data:
                        surah_info[str(surah['number'])] = {
                            'name': surah.get('name', ''),
                            'englishName': surah.get('englishName', ''),
                            'englishNameTranslation': surah.get('englishNameTranslation', ''),
                            'revelation': surah.get('revelationType', ''),
                            'ayahs': surah.get('numberOfAyahs', 0)
                        }

                    # Cache it
                    try:
                        with open(cache_file, 'w', encoding='utf-8') as f:
                            json.dump(surah_info, f, ensure_ascii=False, indent=2)
                        print(f"✅ Cached {len(surah_info)} surahs")
                    except Exception as e:
                        print(f"⚠️  Cache write error: {e}")

                    return surah_info
        except Exception as e:
            print(f"❌ API fetch error: {e}")

        # Fallback
        print("⚠️  Using fallback data...")
        return self._get_fallback_surah_info()

    def _load_or_fetch_quran_data(self) -> Dict:
        """Load complete Quran text from cache or fetch from API"""
        cache_file = self.cache_dir / "quran_complete.json"

        if cache_file.exists():
            try:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    total_ayahs = sum(len(ayahs) for ayahs in data.values())
                    print(f"✅ Loaded {total_ayahs} ayahs from {len(data)} surahs in cache")

                    # Validate that we have all surahs
                    if len(data) < 114:
                        print(f"⚠️  Cache incomplete: only {len(data)}/114 surahs. Refetching...")
                        # Fall through to fetch from API
                    else:
                        return data
            except Exception as e:
                print(f"⚠️  Cache read error: {e}")

        # Fetch from API - using Uthmani script with full tashkeel
        print("📡 Fetching complete Quran with tashkeel from Quran.cloud API...")
        print("   (This may take 30-60 seconds...)")
        try:
            # Use quran-uthmani for full Uthmanic script with all diacritics
            response = requests.get(
                'http://api.alquran.cloud/v1/quran/quran-uthmani',
                timeout=60
            )

            if response.status_code == 200:
                data = response.json()
                if data.get('code') == 200:
                    quran = data['data']

                    # Convert to our format
                    quran_data = {}
                    for surah in quran['surahs']:
                        surah_num = str(surah['number'])
                        quran_data[surah_num] = {}

                        for ayah in surah['ayahs']:
                            ayah_num = str(ayah['numberInSurah'])
                            quran_data[surah_num][ayah_num] = ayah['text']

                    # Validate before caching
                    if len(quran_data) != 114:
                        print(f"⚠️  API returned incomplete data: {len(quran_data)}/114 surahs")
                    else:
                        print(f"✅ Fetched all {len(quran_data)} surahs from API")

                    # Cache it
                    try:
                        with open(cache_file, 'w', encoding='utf-8') as f:
                            json.dump(quran_data, f, ensure_ascii=False, indent=2)
                        total_ayahs = sum(len(ayahs) for ayahs in quran_data.values())
                        print(f"✅ Cached {total_ayahs} ayahs from {len(quran_data)} surahs")
                    except Exception as e:
                        print(f"⚠️  Cache write error: {e}")

                    return quran_data
                else:
                    print(f"❌ API returned error code: {data.get('code')}")
            else:
                print(f"❌ API request failed with status: {response.status_code}")
        except requests.Timeout:
            print(f"❌ API request timeout (>60s)")
        except Exception as e:
            print(f"❌ API fetch error: {e}")

        # Fallback
        print("⚠️  Using fallback data (limited)...")
        return self._get_fallback_quran_data()

    def _get_fallback_surah_info(self) -> Dict:
        """Fallback surah info using local database"""
        from ..quran_database import QURAN_DATA

        surah_info = {}
        for surah_num_str, data in QURAN_DATA.items():
            surah_info[surah_num_str] = {
                'name': data.get('name', f'Surah {surah_num_str}'),
                'englishName': data.get('englishName', f'Surah {surah_num_str}'),
                'englishNameTranslation': data.get('englishNameTranslation', ''),
                'revelation': data.get('revelation', 'Unknown'),
                'ayahs': data.get('ayahs', 1)
            }

        print(f"📚 Using fallback surah info: {len(surah_info)} surahs")
        return surah_info

    def _get_fallback_quran_data(self) -> Dict:
        """Minimal fallback Quran data"""
        return {
            str(i): {str(j): f"Ayah {j}" for j in range(1, 8)}
            for i in range(1, 115)
        }

    def get_all_surahs(self) -> List[Dict]:
        """Get list of all 114 surahs"""
        surahs = []
        for surah_num in range(1, 115):
            key = str(surah_num)
            if key in self.surah_info:
                info = self.surah_info[key].copy()
                info['number'] = surah_num
                surahs.append(info)
        return surahs

    def get_surah(self, surah_number: int) -> Dict:
        """Get surah with all ayahs"""
        surah_key = str(surah_number)

        if surah_key not in self.surah_info:
            return {"error": "Surah not found"}

        info = self.surah_info[surah_key]
        ayahs_dict = self.quran_data.get(surah_key, {})

        ayahs = [
            {
                "number": int(ayah_num),
                "text": text,
                "numberInSurah": int(ayah_num)
            }
            for ayah_num, text in sorted(ayahs_dict.items(), key=lambda x: int(x[0]))
        ]

        return {
            "surah": info,
            "ayahs": ayahs
        }

    def get_ayah(self, surah_number: int, ayah_number: int) -> Dict:
        """Get specific ayah"""
        surah_key = str(surah_number)
        ayah_key = str(ayah_number)

        if surah_key not in self.surah_info:
            return {"error": "Surah not found"}

        if surah_key not in self.quran_data:
            return {"error": "Ayah not found"}

        if ayah_key not in self.quran_data[surah_key]:
            return {"error": "Ayah not found"}

        surah_info = self.surah_info[surah_key]

        return {
            "surahNumber": surah_number,
            "ayahNumber": ayah_number,
            "text": self.quran_data[surah_key][ayah_key],
            "surahName": surah_info.get("name", ""),
            "surahEnglishName": surah_info.get("englishName", ""),
            "totalAyahs": surah_info.get("ayahs", 1),
        }

    def get_ayah_text(self, surah_number: int, ayah_number: int) -> str:
        """Get just the text of an ayah"""
        surah_key = str(surah_number)
        ayah_key = str(ayah_number)

        if surah_key in self.quran_data and ayah_key in self.quran_data[surah_key]:
            return self.quran_data[surah_key][ayah_key]

        return ""

    def _validate_cache(self):
        """Validate that all 114 surahs are loaded"""
        missing_surahs = []
        empty_surahs = []

        for surah_num in range(1, 115):
            surah_key = str(surah_num)

            # Check if surah exists
            if surah_key not in self.quran_data:
                missing_surahs.append(surah_num)
            elif len(self.quran_data[surah_key]) == 0:
                empty_surahs.append(surah_num)

        # Log results
        total_surahs = len(self.quran_data)
        total_ayahs = sum(len(ayahs) for ayahs in self.quran_data.values())

        print(f"\n{'='*60}")
        print(f"📖 QURAN DATA LOADED")
        print(f"{'='*60}")
        print(f"Total Surahs: {total_surahs}/114")
        print(f"Total Ayahs:  {total_ayahs}")

        if missing_surahs:
            print(f"\n⚠️  WARNING: Missing {len(missing_surahs)} surah(s): {missing_surahs}")
            print(f"   Run: rm -rf cache/*.json && restart backend to regenerate cache")
        else:
            print(f"✅ All 114 surahs loaded")

        if empty_surahs:
            print(f"\n⚠️  WARNING: Empty {len(empty_surahs)} surah(s): {empty_surahs}")

        print(f"{'='*60}\n")
