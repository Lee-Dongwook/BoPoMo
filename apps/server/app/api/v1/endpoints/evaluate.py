from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field
from typing import List, Optional
from app.services.audio_evaluator import TonePitchAnalyzer

router = APIRouter()


class AudioEvaluationResponse(BaseModel):
    is_correct: bool = Field(description="목표 성조 일치 여부")
    score: float = Field(description="성조 파형 일치 점수 (0~100)")
    target_tone: int = Field(description="목표 성조 (1~4)")
    detected_tone: Optional[int] = Field(description="분석된 성조")
    pitch_contour: List[float] = Field(description="정규화된 F0 피치 파형 배열")
    feedback: str = Field(description="분석 결과 피드백")


@router.post("/pitch", response_model=AudioEvaluationResponse)
async def evaluate_audio_pitch(
    target_tone: int = Form(..., ge=1, le=5, description="목표 성조 (1~5성)"),
    file: UploadFile = File(..., description="사용자 음성 녹음 파일 (wav, mp3, m4a)")
):
    try:
        audio_bytes = await file.read()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="Empty audio file")

        result = TonePitchAnalyzer.evaluate_tone(
            audio_bytes=audio_bytes,
            target_tone=target_tone
        )

        return AudioEvaluationResponse(
            is_correct=result["is_correct"],
            score=result["score"],
            target_tone=target_tone,
            detected_tone=result["detected_tone"],
            pitch_contour=result["pitch_contour"],
            feedback=result["feedback"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio evaluation failed: {str(e)}")
