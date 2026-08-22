from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from app.agents.state import AgentState
from app.schemas.sentence import GeneratedSentenceResponse

llm = ChatOpenAI(model="gpt-4o-mini", temperature = 0.7)
structured_llm = llm.with_structured_output(GeneratedSentenceResponse)

generator_prompt = ChatPromptTemplate.from_messsages([
    ("system", (
        "당신은 30년 이상의 경력이 있는 초급 중국어 교육 전문 AI입니다."
        "주어진 취약 단어 목록(성조 포함)을 필수적으로 활용하여 초보자가 학습하기 좋은 자연스럽고 쉬우며, 많이 활용되는 중국어 예문을 만드세요."
        "성조와 발음 학습 팁을 설명에 반드시 포함해야 합니다."
    )),
    ("human", "다음 취약 단어들을 포함한 예문을 생성해 주세요: {target_words}")
])

def generate_sentence_node(state: AgentState) -> AgentState:
    words_str = ", ".join([f"{w['pinyin']}({w['meaning']}, {w['tone']}성)" for w in state['target_words']])
    prompt_value = generator_prompt.format_messages(target_words=words_str)
    response = structured_llm.invoke(prompt_value)

    return {
        **state,
        "generated_sentence": response,
        "next_step": "END"
    }
