from typing import List, Dict, Any
from app.rag.stores.knowledge_graph import BopomoKnowledgeGraph

class HybridRAGEngine:
    def __init__(self, kg: BopomoKnowledgeGraph, vector_store=None):
        self.kg = kg
        self.vector_store = vector_store

    def retrieve_context(self, target_words: List[Dict[str, Any]]) -> str:
        context_blocks: List[str] = []

        for word in target_words:
            word_id = word.get("word_id","")
            graph_data = self.kg.get_related_rules_and_words(word_id)

            for rule in graph_data["rules"]:
                context_blocks.append(f"[성조 규칙 경고]: {rule['name']} - {rule['description']}")

        if not context_blocks:
            return "특별한 성조 변조 규칙 없음. 일반 문법을 따름."
        
        return "\n".join(context_blocks)

