from fastapi import APIRouter, HTTPException
from app.agents.supervisor import app_graph
from app.schemas.sentence import SentenceRequest, GeneratedSentenceResponse

router = APIRouter()
@router.post("/generate", response_model=GeneratedSentenceResponse)
async def generate_sentence(request: SentenceRequest):
    try:
        inputs = {
            "task_type": "GENERATE_SENTENCE",
            "user_id": request.user_id,
            "target_words": [w.model_dump() for w in request.target_words],
            "user_input_sentence": None,
            "generated_sentence": None,
            "feedback_result": None,
            "next_step": "START"
        }

        result = await app_graph.ainvoke(inputs)

        generated = result.get("generated_sentence")
        if not generated:
            raise HTTPException(status_code=500, detail="Failed to generate sentence")
        return generated
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

