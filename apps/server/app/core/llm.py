import os
import json
from typing import Dict, Any, List
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_ollama import ChatOllama
from langchain_openai import ChatOpenAI
from app.utils.json_parser import RobustJsonParser

def get_llm(model_name: str = "qwen2.5") -> BaseChatModel:
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
            temperature=0.1,
            format="json",  # JSON 구조화 출력 강제
        )

    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.1,
        model_kwargs={"response_format": {"type": "json_object"}}
    )

def build_chinese_few_shot_prompt(query: str, context: List[Dict[str, Any]]) -> str:
    """
    성조 변조, 다음자, 예외 규칙 명확화를 위한 Few-Shot 예시가 포함된 프롬프트를 생성합니다.
    """
    few_shot_examples = [
        {
            "query": "你好(nǐ hǎo)에서 你의 성조는 왜 2성으로 소리 지나요?",
            "response": {
                "target_pinyin": "ní hǎo",
                "modified_syllable": "你 (nǐ -> ní)",
                "rule_description": "3성 음절 두 개가 연속으로 올 때 앞의 3성 음절은 2성으로 변조됩니다."
            }
        },
        {
            "query": "不是(bú shì)에서 원래 4성인 不가 왜 2성으로 읽히나요?",
            "response": {
                "target_pinyin": "bú shì",
                "modified_syllable": "不 (bù -> bú)",
                "rule_description": "'不(bù)' 뒤에 4성 음절이 오면 '不'는 2성(bú)으로 변조됩니다."
            }
        },
        {
            "query": "看着(kànzhe)의 着와 睡着了(shuìzháole)의 着는 발음과 성조가 어떻게 다른가요?",
            "response": {
                "target_pinyin": "kàn zhe / shuì zháo le",
                "modified_syllable": "着 (zhe vs zháo)",
                "rule_description": "동작의 지속을 나타낼 때는 경성 'zhe'로, 목적 달성/목표 도달의 결과보어로 쓰일 때는 2성 'zháo'로 읽습니다."
            }
        }
    ]

    prompt = """
            당신은 중국어 성조 변조 및 문법 전문 교육 AI 시스템입니다.
            아래 제공된 [참고 규칙]을 최우선으로 사용하여 질문에 답변하세요.

            답변할 때 아래의 [Few-Shot 예시] 구조와 정교함을 엄격하게 따르세요.
            반드시 정확한 JSON 포맷 하나만 반환해야 합니다.

            [Few-Shot 예시]
            """
    for ex in few_shot_examples:
        prompt += f"\n질문: {ex['query']}\n응답:\n{json.dumps(ex['response'], ensure_ascii=False, indent=2)}\n"

        prompt += f"""
            [참고 규칙]
            {json.dumps(context, ensure_ascii=False, indent=2)}

            [실제 질문]
            {query}

            [응답 (JSON)]:
            """
    return prompt

async def generate_structured_json(llm: BaseChatModel, prompt: str) -> dict:
    response = await llm.ainvoke(prompt)
    content_str = response.content if isinstance(response.content, str) else str(response.content)
    
    return RobustJsonParser.parse(content_str)
