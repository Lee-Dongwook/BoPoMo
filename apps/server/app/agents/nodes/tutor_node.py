from typing import Dict, Any
from app.rag.dependencies import get_rag_engine
from app.core.llm import get_llm, build_chinese_few_shot_prompt, generate_structured_json

async def tutor_node(state: Dict[str, Any]) -> Dict[str, Any]:
    query = state.get("query", "")
    
    rag_engine = get_rag_engine()
    retrieved_context = rag_engine.retrieve(query=query, top_k=3)
    
    llm = get_llm()
    prompt = build_chinese_few_shot_prompt(query=query, context=retrieved_context)
    structured_res = await generate_structured_json(llm=llm, prompt=prompt)
    
    return {
        "tutor_result": structured_res,
        "next_step": "END"
    }
