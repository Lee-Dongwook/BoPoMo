from typing import Dict, List, Any

EVAL_DATASET: List[Dict[str, Any]] = [
    {
        "id": "eval-01",
        "query": "你(nǐ)랑 好(hǎo)가 만나면 성조가 어떻게 바뀌는지 설명해줘.",
        "expected_word_ids": ["w-ni", "w-hao"],
        "expected_rule_ids": ["rule-33"],
        "expected_json_keys": ["feedback", "phonetics", "rules"]
    },
    {
        "id": "eval-02",
        "query": "不是(bú shì)에서 不의 원래 성조는 4성인데 왜 2성으로 읽어?",
        "expected_word_ids": ["w-bu", "w-shi"],
        "expected_rule_ids": ["rule-bu"],
        "expected_json_keys": ["feedback", "phonetics", "rules"]
    },
    {
        "id": "eval-03",
        "query": "一个(yí gè)에서 一의 성조 변조 규칙을 알고 싶어.",
        "expected_word_ids": ["w-yi", "w-ge"],
        "expected_rule_ids": ["rule-yi"],
        "expected_json_keys": ["feedback", "phonetics", "rules"]
    },
    {
        "id": "eval-04",
        "query": "谢谢(xièxie)의 뒤에 있는 음절은 왜 성조 표시가 없어?",
        "expected_word_ids": ["w-xie"],
        "expected_rule_ids": ["rule-neutral"],
        "expected_json_keys": ["feedback", "phonetics", "rules"]
    }
]
