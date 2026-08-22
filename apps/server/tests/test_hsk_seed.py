import pytest
from app.rag.loader.knowledge_builder import seed_knowledge_graph
from app.rag.data.hsk1_seed import WORDS_SEED, TONE_RULES_SEED


def test_hsk1_knowledge_graph_structure():
    kg = seed_knowledge_graph()

    # 1. 전체 노드 개수 검증
    assert len(kg.graph.nodes) == len(WORDS_SEED) + len(TONE_RULES_SEED)

    # 2. '不(bù)' 단어 검색 시 '不 성조 변조' 규칙 노드가 잘 추출되는지 검증
    bu_data = kg.get_related_rules_and_words("w-bu")
    assert len(bu_data["rules"]) > 0
    assert bu_data["rules"][0]["name"] == "'不(bù)' 성조 변조"
