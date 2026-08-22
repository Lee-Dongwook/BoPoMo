import pytest
import os
import shutil
from app.rag.stores.knowledge_graph import BopomoKnowledgeGraph
from app.rag.stores.vector_store import BopomoVectorStore
from app.rag.loader.knowledge_builder import seed_knowledge_graph
from app.rag.retriever.hybrid import HybridRAGEngine

TEST_CHROMA_DIR = "./data/test_chroma_db"

@pytest.fixture
def setup_rag():
    # 1. Knowledge Graph 초기화 및 시드 데이터 로드
    kg = seed_knowledge_graph()

    # 2. 테스트용 In-Memory Vector Store 초기화
    vector_store = BopomoVectorStore(in_memory=True)
    
    # 기초 예문 임베딩 데이터 인덱싱
    sample_sentences = [
        {"id": "s-1", "hanzi": "你好", "pinyin": "nǐ hǎo", "translation": "안녕하세요"},
        {"id": "s-2", "hanzi": "不好", "pinyin": "bù hǎo", "translation": "좋지 않다"},
    ]
    vector_store.add_sentences(sample_sentences)

    engine = HybridRAGEngine(kg=kg, vector_store=vector_store)

    yield engine


def test_knowledge_graph_seed(setup_rag):
    engine = setup_rag
    # '你' (w-ni) 단어에 대한 연관 성조 규칙(3성+3성 변조) 노드 검색 검증
    graph_data = engine.kg.get_related_rules_and_words("w-ni")
    assert len(graph_data["rules"]) > 0
    assert graph_data["rules"][0]["name"] == "3성 + 3성 변조"


def test_hybrid_retriever_context(setup_rag):
    engine = setup_rag
    
    target_words = [
        {"word_id": "w-ni", "meaning": "너", "pinyin": "nǐ", "tone": 3},
        {"word_id": "w-hao", "meaning": "좋다", "pinyin": "hǎo", "tone": 3}
    ]

    context = engine.retrieve_context(target_words)

    # Context에 Graph(성조 규칙)와 Vector(표준 예문) 검색 결과가 모두 병합되었는지 검증
    assert "3성 + 3성 변조" in context
    assert "你好" in context
    assert "안녕하세요" in context
