from langchain_core.prompts import ChatPromptTemplate
from app.agents.state import AgentState
from app.core.llm import get_llm

feedback_prompt = ChatPromptTemplate.from_messages([
    ("system", (
        "당신은 30년 이상의 경력이 있는 중국어 성조 및 문법 피드백 전문 AI 튜터입니다. "
        "사용자가 작성한 문장과 목표 단어의 성조/문법 정확성을 감정적 표현 없이 오직 논리적/객관적으로 분석하여 개선점을 제시하세요."
    )),
    ("human", "목표 단어: {target_words}\n사용자 입력 문장: {user_input}")
])

def provide_feedback_node(state: AgentState) -> AgentState:
    llm = get_llm()
    words_str = ", ".join([f"{w['pinyin']}({w['meaning']})" for w in state["target_words"]])
    user_input = state.get("user_input_sentence", "")
    
    prompt_value = feedback_prompt.format_messages(target_words=words_str, user_input=user_input)
    response = llm.invoke(prompt_value)

    return {
        **state,
        "feedback_result": str(response.content),
        "next_step": "END"
    }
