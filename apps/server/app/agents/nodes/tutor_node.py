from app.agents.state import AgentState
from app.rag.dependencies import get_rag_engine
from app.rag.retriever.hybrid import HybridRAGEngine
from app.core.llm import get_llm, build_chinese_few_shot_prompt, generate_structured_json

async def tutor_node(state: AgentState) -> AgentState:
    try:
        query = state.get("query", "")
        if not query:
            return {
                **state,
                "error_message": "튜터 질의를 위한 query가 입력되지 않았습니다.",
                "next_step": "END"
            }

        rag_engine: HybridRAGEngine = get_rag_engine()
        
        
        retrieved_res = rag_engine.retrieve(query=query, top_k=3)
        context_str = retrieved_res.get("context", "")

        
        llm = get_llm()
        prompt = build_chinese_few_shot_prompt(query=query, context=context_str)
        structured_res = await generate_structured_json(llm=llm, prompt=prompt)

        return {
            **state,
            "tutor_result": structured_res,
            "next_step": "END"
        }
    except Exception as e:
        return {
            **state,
            "error_message": f"Tutor node process failed: {str(e)}",
            "next_step": "END"
        }
