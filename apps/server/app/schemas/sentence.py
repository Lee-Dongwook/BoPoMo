from typing import List, Optional
from pydantic import BaseModel, Field

class WordInput(BaseModel):
    pinyin: str = Field(description="병음 (예: mā)")
    meaning: str = Field(description="한국어 뜻")
    tone: int = Field(ge=1, le=5, description="성조 (1~5)")

class SentenceRequest(BaseModel):
    user_id: str
    target_words: List[WordInput] = Field(min_length=1, description="문장에 포함할 취약 단어 목록")

class GeneratedSentenceResponse(BaseModel):
    hanzi: str = Field(description="중국어 한자 문장")
    pinyin: str = Field(description="성조 포함 병음")
    translation: str = Field(description="한국어 번역")
    explanation: str = Field(description="문장 구조 및 성조 학습 팁")
