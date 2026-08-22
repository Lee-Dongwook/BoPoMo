from langchain_core.prompts import ChatPromptTemplate
from app.agents.state import AgentState
from app.core.llm import get_llm
from app.rag.retriever.hybrid import HybridRAGEngine
from app.rag.dependencies import get_rag_engine

feedback_prompt = ChatPromptTemplate.from_messages([
    ("system", (
        "당신은 30년 이상의 경력이 있는 중국어 성조 및 문법 피드백 전문 AI 튜터입니다.\n"
        "아래 [참고 규칙 Context]를 바탕으로, 사용자가 작성한 문장과 목표 단어의 성조/문법 정확성을 감정적 표현 없이 오직 논리적/객관적으로 분석하여 개선점을 제시하세요.\n\n"
        "[참고 규칙 Context]:\n{rag_context}"
    )),
    ("human", "목표 단어: {target_words}\n사용자 입력 문장: {user_input}")
])

async def provide_feedback_node(state: AgentState) -> AgentState:
    try:
        llm = get_llm()
        rag_engine: HybridRAGEngine = get_rag_engine()

        raw_target_words = state.get("target_words", [])
        user_input = state.get("user_input_sentence", "")

        words_formatted = []
        target_words_dict_list = []

        for w in raw_target_words:
            w_dict = w.model_dump() if hasattr(w, "model_dump") else (w if isinstance(w, dict) else {})
            pinyin = w_dict.get("pinyin", "")
            meaning = w_dict.get("meaning", "")
            
            target_words_dict_list.append(w_dict)
            words_formatted.append(f"{pinyin}({meaning})")

        words_str = ", ".join(words_formatted)

        if user_input:
            rag_result = rag_engine.retrieve(query=user_input)
            rag_context = rag_result.get("context", "")
        else:
            rag_context = rag_engine.retrieve_context(target_words=target_words_dict_list)

        chain = feedback_prompt | llm
        response = await chain.ainvoke({
            "rag_context": rag_context,
            "target_words": words_str,
            "user_input": user_input
        })

        return {
            **state,
            "feedback_result": str(response.content),
            "next_step": "END"
        }
    except Exception as e:
        return {
            **state,
            "error_message": f"Feedback generation failed: {str(e)}",
            "next_step": "END"
        }
