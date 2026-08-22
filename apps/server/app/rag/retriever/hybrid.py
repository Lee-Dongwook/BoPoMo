from typing import List, Dict, Any
from app.rag.stores.knowledge_graph import BopomoKnowledgeGraph
from app.rag.stores.vector_store import BopomoVectorStore

class HybridRAGEngine:
    def __init__(self, kg: BopomoKnowledgeGraph, vector_store: BopomoVectorStore):
        self.kg = kg
        self.vector_store = vector_store

    def retrieve_context(self, target_words: List[Dict[str, Any]]) -> str:
        context_blocks: List[str] = []

        rules_found = set()
        for word in target_words:
            word_id = word.get("word_id","")
            graph_data = self.kg.get_related_rules_and_words(word_id)
            for rule in graph_data["rules"]:
                context_blocks.append(f"[성조 규칙 경고]: {rule['name']} - {rule['description']}")
        
        if rules_found:
            context_blocks.append("### 적용되는 성조 변조 규칙\n" + "\n".join(rules_found))
        
        query_text = " ".join([w.get("meaning", "") for w in target_words])
        similar_sentences = self.vector_store.search_similar_sentences(query=query_text, top_k=2)
        
        if similar_sentences:
            sentence_blocks = [
                f"- {s['hanzi']} ({s['pinyin']}): {s['translation']}"
                for s in similar_sentences
            ]
            context_blocks.append("### 참고 표준 예문 패턴\n" + "\n".join(sentence_blocks))

        if not context_blocks:
            return "특별한 성조 변조 규칙 없음. 일반 문법을 따름."
        
        return "\n".join(context_blocks)

