from app.rag.stores.knowledge_graph import BopomoKnowledgeGraph

def seed_knowledge_graph() -> BopomoKnowledgeGraph:
    kg = BopomoKnowledgeGraph()

    kg.add_tone_rule_node(
        rule_id="rule-33",
        rule_name="3성 + 3성 변조",
        description="3성이 연속될 경우 앞의 3성은 2성으로 올려서 발음합니다. (예: 你好 nǐ hǎo -> ní hǎo)"
    )
    kg.add_tone_rule_node(
        rule_id="rule-bu",
        rule_name="'不(bù)' 성조 변조",
        description="'不' 뒤에 4성이 올 경우 '不'는 2성(bú)으로 변하여 발음합니다. (예: 不是 bú shì)"
    )
    kg.add_tone_rule_node(
        rule_id="rule-yi",
        rule_name="'一(yī)' 성조 변조",
        description="'一' 뒤에 4성이 오면 2성(yí)으로, 1/2/3성이 오면 4성(yì)으로 발음합니다."
    )

    words = [
        {"id": "w-ni", "pinyin": "nǐ", "hanzi": "你", "tone": 3, "meaning": "너"},
        {"id": "w-hao", "pinyin": "hǎo", "hanzi": "好", "tone": 3, "meaning": "좋다"},
        {"id": "w-bu", "pinyin": "bù", "hanzi": "不", "tone": 4, "meaning": "아니다"},
        {"id": "w-shi", "pinyin": "shì", "hanzi": "是", "tone": 4, "meaning": "이다"},
        {"id": "w-yi", "pinyin": "yī", "hanzi": "一", "tone": 1, "meaning": "하나"},
    ]

    for w in words:
        kg.add_word_node(
            word_id=w["id"],
            pinyin=w["pinyin"],
            hanzi=w["hanzi"],
            tone=w["tone"],
            meaning=w["meaning"]
        )

    kg.add_relation("w-ni", "rule-33", "APPLIES_RULE")
    kg.add_relation("w-hao", "rule-33", "APPLIES_RULE")
    kg.add_relation("w-bu", "rule-bu", "APPLIES_RULE")
    kg.add_relation("w-yi", "rule-yi", "APPLIES_RULE")

    return kg




