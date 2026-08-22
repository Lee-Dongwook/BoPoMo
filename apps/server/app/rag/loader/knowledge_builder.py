from app.rag.data.hsk1_seed import SENTENCES_SEED, TONE_RULES_SEED, WORDS_SEED
from app.rag.stores.knowledge_graph import BopomoKnowledgeGraph
from app.rag.stores.vector_store import BopomoVectorStore

def seed_knowledge_graph() -> BopomoKnowledgeGraph:
    kg = BopomoKnowledgeGraph()

    # 1. 성조 변조 규칙 노드 주입
    for rule in TONE_RULES_SEED:
        kg.add_tone_rule_node(
            rule_id=rule["id"],
            rule_name=rule["name"],
            description=rule["description"]
        )

    # 2. 어휘 노드 및 규칙 엣지 바인딩
    for word in WORDS_SEED:
        kg.add_word_node(
            word_id=word["id"],
            pinyin=word["pinyin"],
            hanzi=word["hanzi"],
            tone=word["tone"],
            meaning=word["meaning"]
        )

        for rule_id in word.get("rules", []):
            kg.add_relation(word["id"], rule_id, "APPLIES_RULE")

    return kg


def seed_vector_store(vector_store: BopomoVectorStore) -> None:
    """HSK 1급 기초 예문 벡터 임베딩 및 인덱싱"""
    vector_store.add_sentences(SENTENCES_SEED)



