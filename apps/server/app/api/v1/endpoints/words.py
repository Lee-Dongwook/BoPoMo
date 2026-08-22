from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from app.db.supabase import get_supabase_client

router = APIRouter()


class DueWordResponse(BaseModel):
    word_id: str
    hanzi: str
    pinyin: str
    meaning: str
    tone: int
    interval_days: int


@router.get("/due/{user_id}", response_model=List[DueWordResponse])
async def get_due_words(user_id: str, limit: int = 5):
    try:
        supabase = get_supabase_client()

        response = supabase.table("user_srs_states") \
            .select("word_id, interval_days, words(hanzi, pinyin, meaning, tone)") \
            .eq("user_id", user_id) \
            .lte("next_review_at", "now()") \
            .order("next_review_at", desc=False) \
            .limit(limit) \
            .execute()

        result = []
        for row in response.data:
            word = row["words"]
            result.append(DueWordResponse(
                word_id=row["word_id"],
                hanzi=word["hanzi"],
                pinyin=word["pinyin"],
                meaning=word["meaning"],
                tone=word["tone"],
                interval_days=row["interval_days"]
            ))

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch due words: {str(e)}")
