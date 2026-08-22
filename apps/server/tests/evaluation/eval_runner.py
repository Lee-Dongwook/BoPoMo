import json
import pytest
from typing import Dict, Any
from app.rag.dependencies import get_rag_engine
from app.llm.client import get_local_llm_client
from tests.evaluation.eval_dataset import EVAL_DATASET


class RAGAndLLMEvaluator:
    def __init__(self):
        self.rag_engine = get_rag_engine()
        self.llm_client = get_local_llm_client()

    def evaluate_retrieval(self, item: Dict[str, Any]) -> Dict[str, float]:
        """Hybrid RAG 검색 결과 평가 (Hit Rate / Precision)"""
        query = item["query"]
        retrieved_context = self.rag_engine.retrieve(query=query, top_k=3)

        retrieved_word_ids = [w["id"] for w in retrieved_context.get("words", [])]
        retrieved_rule_ids = [r["id"] for r in retrieved_context.get("rules", [])]

        expected_words = set(item["expected_word_ids"])
        expected_rules = set(item["expected_rule_ids"])

        word_hit = len(expected_words.intersection(set(retrieved_word_ids))) / len(expected_words) if expected_words else 1.0
        rule_hit = len(expected_rules.intersection(set(retrieved_rule_ids))) / len(expected_rules) if expected_rules else 1.0

        return {
            "word_recall": word_hit,
            "rule_recall": rule_hit,
            "context": retrieved_context
        }

    async def evaluate_json_parsing(self, query: str, context: Dict[str, Any], expected_keys: List[str]) -> bool:
        """로컬 LLM 응답의 올바른 JSON 파싱 여부 및 키 검증"""
        prompt = f"""
        다음 맥락 정보를 활용해 사용자의 질문에 답하세요.
        반드시 다음 JSON 형식을 엄격히 지켜서 응답하세요:
        {{
            "feedback": "설명 내용",
            "phonetics": "발음 가이드",
            "rules": ["적용된 규칙 목록"]
        }}

        [맥락]
        {json.dumps(context, ensure_ascii=False)}

        [질문]
        {query}
        """

        try:
            response = await self.llm_client.generate(prompt=prompt)
            # 1. pure JSON 파싱 검증
            parsed_json = json.loads(response)

            # 2. 필수 키(Key) 존재 여부 검증
            for key in expected_keys:
                if key not in parsed_json:
                    return False
            return True
        except (json.JSONDecodeError, Exception):
            return False
