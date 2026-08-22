from datetime import datetime, timedelta, timezone
from typing import Dict, Any
from app.db.supabase import get_supabase_client

class SRSService:
    @staticmethod
    async def record_quiz_result(
        user_id : str,
        word_id: str,
        quiz_type: str,
        is_correct: bool,
        response_time_ms: int,
        audio_score: float = None
    ) -> Dict[str, Any]:
        supabase = get_supabase_client()

        supabase.table("quiz_logs").insert({
            "user_id": user_id,
            "word_id": word_id,
            "quiz_type": quiz_type,
            "is_correct": is_correct,
            "response_time_ms": response_time_ms,
            "audio_score": audio_score
        }).execute()

        srs_response = supabase.table("user_srs_states") \
            .select("*") \
            .eq("user_id", user_id) \
            .eq("word_id", word_id) \
            .maybe_single() \
            .execute()
        
        srs_data = srs_response.data

        if not srs_data:
            interval_days = 1
            ease_factor = 2.50
            review_count = 0
        else:
            interval_days = srs_data["interval_days"]
            ease_factor = float(srs_data["ease_factor"])
            review_count = srs_data["review_count"]
        
        if not is_correct:
            interval_days = 1
            review_count = 0
            ease_factor = max(1.30, ease_factor - 0.20)

        else:
            review_count += 1
            if review_count == 1:
                interval_days = 1
            elif review_count == 2:
                interval_days = 6
            else:
                interval_days = int(interval_days * ease_factor)
            
            if response_time_ms < 2000:
                ease_factor += 0.10
        
        next_review_at = datetime.now(timezone.utc) + timedelta(days=interval_days)

        updated_srs = supabase.table("user_srs_states").upsert({
            "user_id": user_id,
            "word_id": word_id,
            "interval_days": interval_days,
            "ease_factor": round(ease_factor, 2),
            "review_count": review_count,
            "next_review_at": next_review_at.isoformat(),
            "last_reviewed_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }, on_conflict="user_id, word_id").execute()

        return updated_srs.data
