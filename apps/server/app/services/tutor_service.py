from typing import Dict, Any, List
from app.rag.dependencies import get_rag_engine
from app.core.llm import get_llm, get_local_llm_client, build_chinese_few_shot_prompt, generate_structured_json

class ChineseTutorService:
    def __init__(self, model_name: str = "qwen2.5"):
        self.rag_engine = get_rag_engine()
        self.llm = get_llm(model_name=model_name)
        self.local_client = get_local_llm_client(model_name=model_name)
    
    async def answer_question(self, query: str) -> Dict[str, Any]:
        retrieved_context: List[Dict[str, Any]] = self.rag_engine.retrieve(query=query, top_k=3)
        prompt = build_chinese_few_shot_prompt(query=query, context=retrieved_context)
        structured_response = await generate_structured_json(llm=self.llm, prompt=prompt)

        return {
            "query": query,
            "response": structured_response,
            "retrieved_rules_count": len(retrieved_context),
            "retrieved_rules": retrieved_context
        }
