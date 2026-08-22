from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class TutorRequest(BaseModel):
    user_id: str = Field(..., description="사용자 ID", example="user_123")
    query: str = Field(..., description="중국어 성조/문법 관련 질문 내용", example="不是(bú shì)에서 不는 왜 2성으로 읽히나요?")


class ChineseGrammarDetail(BaseModel):
    target_pinyin: str = Field(..., description="성조 변조가 적용된 병음 표현", example="bú shì")
    modified_syllable: str = Field(..., description="변조된 음절 요약", example="不 (bù -> bú)")
    rule_description: str = Field(..., description="성조 변조 및 예외 규칙에 대한 논리적 설명")


class TutorResponse(BaseModel):
    query: str = Field(..., description="원래 질문")
    result: ChineseGrammarDetail = Field(..., description="LLM 및 RAG 기반 정교한 성조 분석 결과")
    retrieved_rules_count: Optional[int] = Field(default=0, description="RAG에서 검색된 참고 규칙 수")
