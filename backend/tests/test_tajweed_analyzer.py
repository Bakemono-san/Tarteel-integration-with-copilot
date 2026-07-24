import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.tajweed_analyzer import TajweedAnalyzer


def test_identical_text_high_score():
    a = TajweedAnalyzer()
    r = a.analyze("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ")
    assert r["score"] >= 80, f"Expected >=80, got {r['score']}"
    assert len(r["errors"]) == 0
    assert all(rule["status"] == "applied_correctly" for rule in r["tajweed_rules"])


def test_substitution_detection():
    a = TajweedAnalyzer()
    r = a.analyze("بِسْمِ اللَّهِ الرَّحْمَٰنِ الكَرِيمِ", "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ")
    total = len(r["errors"])
    assert total >= 1


def test_omission_detection():
    a = TajweedAnalyzer()
    r = a.analyze("بِسْمِ اللَّهِ", "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ")
    omissions = [e for e in r["errors"] if e["type"] == "omission"]
    assert len(omissions) > 0


def test_insertion_detection():
    a = TajweedAnalyzer()
    r = a.analyze("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ extra", "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ")
    insertions = [e for e in r["errors"] if e["type"] == "insertion"]
    assert len(insertions) > 0


def test_score_drops_for_errors():
    a = TajweedAnalyzer()
    perfect = a.analyze("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ")
    wrong = a.analyze("بِسْمِ اللَّهِ الرَّحِيمِ", "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ")
    assert perfect["score"] > wrong["score"]


def test_madd_detection():
    a = TajweedAnalyzer()
    r = a.analyze("الْحَمْدُ لِلَّهِ", "الْحَمْدُ لِلَّهِ")
    madd = [rule for rule in r["tajweed_rules"] if "Madd" in rule["rule"]]
    assert len(madd) > 0


def test_empty_inputs():
    a = TajweedAnalyzer()
    assert a.analyze("", "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ")["score"] == 0
    assert a.analyze("", "")["score"] == 0


def test_feedback_corrections():
    a = TajweedAnalyzer()
    r = a.analyze("بِسْمِ اللَّهِ", "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ")
    assert len(r["feedback"]) > 0
    assert len(r["corrections"]) > 0


def test_confidence_in_errors():
    a = TajweedAnalyzer()
    r = a.analyze("بِسْمِ اللَّهِ", "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
                  token_confidences=[0.95] * 10)
    for e in r["errors"]:
        assert "confidence_level" in e


def test_remove_tashkeel():
    a = TajweedAnalyzer()
    assert a._remove_tashkeel("بِسْمِ") == "بسم"
    assert a._remove_tashkeel("الرَّحْمَٰنِ") == "الرحمن"


def test_build_clean_index():
    a = TajweedAnalyzer()
    idx = a._build_clean_index("بِسْمِ")
    assert len(idx) == 3  # ب, س, م
    assert idx[0]["clean_char"] == "ب"
    assert idx[0]["has_sukoon"] == False
    assert idx[0]["has_shaddah"] == False


def test_alignment():
    a = TajweedAnalyzer()
    aligned = a._align_characters("بسم الله", "بسم الله الرحمن")
    matches = [x for x in aligned if x["type"] == "match"]
    assert len(matches) > 0
    omissions = [x for x in aligned if x["type"] == "omission"]
    assert len(omissions) > 0


if __name__ == "__main__":
    tests = [
        ("identical_text_high_score", test_identical_text_high_score),
        ("substitution_detection", test_substitution_detection),
        ("omission_detection", test_omission_detection),
        ("insertion_detection", test_insertion_detection),
        ("score_drops_for_errors", test_score_drops_for_errors),
        ("madd_detection", test_madd_detection),
        ("empty_inputs", test_empty_inputs),
        ("feedback_corrections", test_feedback_corrections),
        ("confidence_in_errors", test_confidence_in_errors),
        ("remove_tashkeel", test_remove_tashkeel),
        ("build_clean_index", test_build_clean_index),
        ("alignment", test_alignment),
    ]
    for name, fn in tests:
        try:
            fn()
            print(f"  ✓ {name}")
        except AssertionError as e:
            print(f"  ✗ {name}: {e}")
    print(f"\n  {len(tests)} tests run")