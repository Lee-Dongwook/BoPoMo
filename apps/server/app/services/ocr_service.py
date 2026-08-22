import json
from typing import Dict, Any, List
from app.core.llm import get_llm, generate_structured_json

class OCRPipelineService:
    def __init__(self):
        self.llm = get_llm()
    
    async def extract_text_from_image(self, image_bytes: bytes) -> str:  # pyright: ignore[reportUnusedParameter]
        return "看着 kànzhe 지속보어: 동작의 지속을 나타낼 때는 경성 zhe로 읽는다."

    async def clean_and_structure_ocr_text(self, raw_text: str) -> Dict[str, Any]:
        prompt = f"""
        아래는 중국어 교재 이미지에서 OCR로 추출한 텍스트입니다.
        오탈자나 깨진 핀인을 교정하고, 반드시 아래 JSON 구조로만 변환하세요.

        [OCR 텍스트]
        {raw_text}

        [출력 JSON 포맷]
        {{
            "hanzi": "추출된 한자 단어/문장",
            "pinyin": "정확한 핀인 및 성조 표기",
            "rule_category": "문법/성조 규칙 카테고리 (예: 지속보어, 3성변조 등)",
            "explanation": "핵심 설명 요약"
        }}
        """

        return await generate_structured_json(self.llm, prompt)
