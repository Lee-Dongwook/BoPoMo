from typing import List, Dict, Any
import networkx as nx

class BopomoKnowledgeGraph:
    def __init__(self):
        self.graph = nx.DiGraph()

    def add_word_node(self, word_id: str, pinyin: str, hanzi: str, tone: int, meaning: str):
        self.graph.add_node(
            word_id,
            type="WORD",
            pinyin=pinyin,
            hanzi=hanzi,
            tone=tone,
            meaning=meaning
        )
    
    def add_tone_rule_node(self, rule_id: str, rule_name: str, description: str):
        self.graph.add_node(
            rule_id,
            type="TONE_RULE",
            name=rule_name,
            description=description
        )

    def add_relation(self, source_id: str, target_id: str, relation_type: str):
        self.graph.add_edge(source_id, target_id, relation=relation_type)

    def get_related_rules_and_words(self, word_id: str) -> Dict[str, Any]:
        if not self.graph.has_node(word_id):
            return {"rules": [], "related_words": []}
        
        neighbors = list(self.graph.neighbors(word_id))
        predecessors = list(self.graph.predecessors(word_id))
        all_connected = set(neighbors + predecessors)

        rules = []
        related_words = []

        for node in all_connected:
            node_data = self.graph.nodes[node]
            if node_data.get("type") == "TONE_RULE":
                rules.append(node_data)
            elif node_data.get("type") == "WORD":
                related_words.append(node_data)
        
        return {"rules": rules, "related_words": related_words}
