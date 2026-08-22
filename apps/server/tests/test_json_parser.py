import pytest
from app.utils.json_parser import RobustJsonParser


def test_parse_pure_json():
    raw = '{"feedback": "Good", "phonetics": "ní hǎo", "rules": ["rule-33"]}'
    res = RobustJsonParser.parse(raw)
    assert res["feedback"] == "Good"


def test_parse_markdown_wrapped_json():
    raw = """
    Here is the response:
    ```json
    {
        "feedback": "Great job",
        "phonetics": "bú shì",
        "rules": ["rule-bu"]
    }
    ```
    Hope this helps!
    """
    res = RobustJsonParser.parse(raw)
    assert res["feedback"] == "Great job"
    assert res["rules"] == ["rule-bu"]


def test_parse_trailing_comma_json():
    raw = '{"feedback": "Fix", "phonetics": "yí gè", "rules": ["rule-yi"],}'
    res = RobustJsonParser.parse(raw)
    assert res["feedback"] == "Fix"


def test_parse_invalid_text_raises_value_error():
    raw = "This is not a JSON response at all."
    with pytest.raises(ValueError):
        RobustJsonParser.parse(raw)
