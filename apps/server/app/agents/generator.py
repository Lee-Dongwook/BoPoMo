from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from app.agents.state import AgentState
from app.core.llm import get_llm
from app.rag.retriever.hybrid import HybridRAGEngine
from app.rag.dependencies import get_rag_engine
from app.schemas.sentence import GeneratedSentenceResponse

parser = PydanticOutputParser(pydantic_object=GeneratedSentenceResponse)

generator_prompt = ChatPromptTemplate.from_messages([
    ("system", (
        "당신은 30년 이상의 경력이 있는 초급 중국어 교육 전문 AI입니다."
        "주어진 취약 단어 목록(성조 포함)을 필수적으로 활용하여 초보자가 학습하기 좋은 자연스럽고 쉬우며, 많이 활용되는 중국어 예문을 만드세요."
        "아래 제공된 [지식 베이스 Context]를 반드시 바탕으로 하여 문장을 구성하세요. "
        "지식 베이스에 명시된 성조 규칙과 단어 조합을 벗어나지 마세요.\n\n"
        "[지식 베이스 Context]:\n{rag_context}\n\n"
        "성조와 발음 학습 팁을 설명에 반드시 포함해야 합니다."
        "응답은 지정된 JSON 형식으로만 작성해야 합니다.\n{format_instructions}"
    )),
    ("human", "다음 취약 단어들을 포함한 예문을 생성해 주세요: {target_words}")
])

async def generate_sentence_node(state: AgentState) -> AgentState:
   try: 
        llm = get_llm()
        rag_engine: HybridRAGEngine = get_rag_engine()

        raw_target_words = state.get("target_words", [])

        formatted_words_for_prompt = []
        target_words_dict_list = []

        for w in raw_target_words:
            w_dict = w.model_dump() if hasattr(w, "model_dump") else (w if isinstance(w, dict) else {})

            pinyin = w_dict.get("pinyin", "")
            meaning = w_dict.get("meaning", "")
            tone = w_dict.get("tone", "")

            target_words_dict_list.append(w_dict)
            formatted_words_for_prompt.append(f"{pinyin}({meaning}, {tone}성)")

        words_str = ", ".join(formatted_words_for_prompt)

        rag_context = rag_engine.retrieve_context(target_words=target_words_dict_list)

        chain = generator_prompt | llm | parser
        response: GeneratedSentenceResponse = await chain.ainvoke({
                "rag_context": rag_context,
                "target_words": words_str,
                "format_instructions": parser.get_format_instructions(),
        })

        return {
            **state,
            "generated_sentence": response,
            "next_step": "END"
        }
   except Exception as e:
        return {
            **state,
            "error_message": f"Sentence generation failed: {str(e)}",
            "next_step": "END"
        }
