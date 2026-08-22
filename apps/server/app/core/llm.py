import os
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_ollama import ChatOllama
from langchain_openai import ChatOpenAI

def get_llm(model_name: str = "gemma2") -> BaseChatModel:
    """
    환경변수에 OPENAI_API_KEY등 상용 LLM API KEY 입력 안된 상태거나
    USE_LOCAL_LLM=true 상태일 경우
    로컬 OLLAMA 모델로 전환됩니다.
    """

    use_local = os.getenv("USE_LOCAL_LLM", "true").lower() == "true"
    openai_key = os.getenv("OPENAI_API_KEY")

    if use_local or not openai_key:
        # 로컬 Ollama 호출 (기본 포트: http://localhost:11434)
        return ChatOllama(
            model=os.getenv("OLLAMA_MODEL", model_name),
            temperature=0.7,
            format="json",  # JSON 구조화 출력 강제
        )

    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.7,
    )

