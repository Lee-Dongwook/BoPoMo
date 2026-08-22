from typing import List, Dict, Any, Optional
import re
from app.rag.stores.knowledge_graph import BopomoKnowledgeGraph
from app.rag.stores.vector_store import BopomoVectorStore

class HybridRAGEngine:
    def __init__(self, kg: BopomoKnowledgeGraph, vector_store: BopomoVectorStore):
        self.kg = kg
        self.vector_store = vector_store

    def retrieve(self, query: str, top_k: int = 3) -> Dict[str, Any]:
        """
        Hybrid retrieval combining Knowledge Graph traversal and Vector similarity search.
        Returns matched words, rules, sentences, and prompt context.
        """
        matched_words: List[Dict[str, Any]] = []
        matched_rules: List[Dict[str, Any]] = []
        seen_word_ids = set()
        seen_rule_ids = set()

        # 1. Graph Traversal: Match Words in query
        for node_id, node_data in self.kg.graph.nodes(data=True):
            if node_data.get("type") == "WORD":
                hanzi = node_data.get("hanzi", "")
                pinyin = node_data.get("pinyin", "")
                
                # Check match by id, hanzi or pinyin
                is_match = False
                if node_id in query:
                    is_match = True
                elif hanzi and hanzi in query:
                    is_match = True
                elif pinyin:
                    clean_pinyin = re.sub(r"[^a-zA-Z]", "", pinyin.lower())
                    clean_query = re.sub(r"[^a-zA-Z]", "", query.lower())
                    if clean_pinyin and clean_pinyin in clean_query:
                        is_match = True

                if is_match and node_id not in seen_word_ids:
                    seen_word_ids.add(node_id)
                    matched_words.append({"id": node_id, **node_data})
                    
                    # Traverse related rules
                    related = self.kg.get_related_rules_and_words(node_id)
                    for rule in related.get("rules", []):
                        rid = rule.get("id")
                        if not rid:
                            for k, v in self.kg.graph.nodes(data=True):
                                if v.get("name") == rule.get("name"):
                                    rid = k
                                    break
                        if rid and rid not in seen_rule_ids:
                            seen_rule_ids.add(rid)
                            matched_rules.append({"id": rid, **rule})

        # 2. Heuristic rule matching from query text
        rule_heuristics = [
            ("rule-sandhi-333", ["3개", "3성 3개", "我很好", "wǒ hěn hǎo"]),
            ("rule-sandhi-33", ["3성 + 3성", "3성+3성", "3성 두 개", "3성 음절 두 개", "你好", "nǐ hǎo", "w-ni", "w-hao"]),
            ("rule-33", ["3성 + 3성", "3성+3성", "3성 두 개", "你好", "nǐ hǎo"]),
            ("rule-bu-neutral", ["是不是", "好不好", "가운데 不", "bu shì", "hǎo bu hǎo", "선택의문문"]),
            ("rule-bu-4th", ["不是", "bú shì", "4성 앞", "4성인 不", "4성 앞 성조"]),
            ("rule-bu", ["不是", "bú shì", "4성인 不", "'不(bù)' 성조 변조", "w-bu"]),
            ("rule-yi-4th", ["一个", "yí gè", "4성 앞", "1성(yī)인데 왜 2성"]),
            ("rule-yi-123", ["一天", "一年", "一起", "yì tiān", "yì nián", "yì qǐ", "1성, 2성, 3성 앞"]),
            ("rule-yi", ["一个", "yí gè", "一天", "一起", "'一(yī)' 성조 변조", "w-yi"]),
            ("rule-poly-zhe", ["看着", "睡着", "kànzhe", "shuìzháole", "shuìzháo", "다음자 '着'"]),
            ("rule-poly-hai-huan", ["还有", "还钱", "hái yǒu", "huán qián", "다음자 '还'"]),
            ("rule-neutral-reduplication", ["爸爸", "妈妈", "bàba", "māma", "친족 호칭", "첩어"]),
            ("rule-neutral", ["谢谢", "xièxie", "爸爸", "妈妈", "경성(Neutral Tone)", "w-xie"]),
            ("rule-exception-ordinal", ["第一", "十一", "dì-yī", "shíyī", "서수", "본음 유지"]),
        ]

        for rule_id, keywords in rule_heuristics:
            if rule_id not in seen_rule_ids and self.kg.graph.has_node(rule_id):
                if any(kw in query for kw in keywords):
                    seen_rule_ids.add(rule_id)
                    node_data = self.kg.graph.nodes[rule_id]
                    matched_rules.append({"id": rule_id, **node_data})

        # 3. Vector Similarity Search
        similar_sentences = []
        try:
            similar_sentences = self.vector_store.search_similar_sentences(query=query, top_k=top_k)
        except Exception:
            similar_sentences = []

        # 4. Build context
        context_str = self._format_context(matched_rules, similar_sentences)

        return {
            "words": matched_words,
            "rules": matched_rules,
            "sentences": similar_sentences,
            "context": context_str
        }

    def _format_context(self, rules: List[Dict[str, Any]], sentences: List[Dict[str, Any]]) -> str:
        blocks = []
        if rules:
            rule_texts = [f"- {r.get('name', '')}: {r.get('description', '')}" for r in rules]
            blocks.append("### 적용되는 성조 변조 및 문법 규칙\n" + "\n".join(rule_texts))

        if sentences:
            sent_texts = [f"- {s.get('hanzi', '')} ({s.get('pinyin', '')}): {s.get('translation', '')}" for s in sentences]
            blocks.append("### 참고 표준 예문 패턴\n" + "\n".join(sent_texts))

        if not blocks:
            return "특별한 성조 변조 규칙 없음. 표준 중국어 기본 문법을 따름."
        return "\n\n".join(blocks)

    def retrieve_context(self, target_words: List[Dict[str, Any]]) -> str:
        context_blocks: List[str] = []
        rules_found = []
        seen_rule_ids = set()

        for word in target_words:
            word_id = word.get("word_id", "")
            
            # If word_id is not directly given, try lookup in graph
            if not word_id:
                pinyin = word.get("pinyin", "")
                meaning = word.get("meaning", "")
                for nid, ndata in self.kg.graph.nodes(data=True):
                    if ndata.get("type") == "WORD":
                        if ndata.get("pinyin") == pinyin or (meaning and ndata.get("meaning") == meaning):
                            word_id = nid
                            break

            if word_id and self.kg.graph.has_node(word_id):
                graph_data = self.kg.get_related_rules_and_words(word_id)
                for rule in graph_data.get("rules", []):
                    r_name = rule.get("name", "")
                    r_desc = rule.get("description", "")
                    if r_name not in seen_rule_ids:
                        seen_rule_ids.add(r_name)
                        rules_found.append(f"[성조 규칙]: {r_name} - {r_desc}")

        if rules_found:
            context_blocks.append("### 적용되는 성조 변조 규칙\n" + "\n".join(rules_found))

        query_text = " ".join([w.get("meaning", "") for w in target_words if w.get("meaning")])
        if query_text:
            try:
                similar_sentences = self.vector_store.search_similar_sentences(query=query_text, top_k=2)
                if similar_sentences:
                    sentence_blocks = [
                        f"- {s['hanzi']} ({s['pinyin']}): {s['translation']}"
                        for s in similar_sentences
                    ]
                    context_blocks.append("### 참고 표준 예문 패턴\n" + "\n".join(sentence_blocks))
            except Exception:
                pass

        if not context_blocks:
            return "특별한 성조 변조 규칙 없음. 일반 문법을 따름."

        return "\n\n".join(context_blocks)


