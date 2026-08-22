from fastapi import APIRouter, HTTPException
from app.agents.supervisor import app_graph
from app.schemas.tutor import TutorRequest, TutorResponse

router = APIRouter(prefix="/api/tutor", tags=["Tutor"])

@router.post("/ask", response_model=TutorResponse)
async def ask_tutor(request: TutorRequest):
    try:
        inputs = {
            "task_type": "TUTOR_QUESTION",
            "user_id": request.user_id,
            "query": request.query,
            "target_words": [],
            "user_input_sentence": None,
            "generated_sentence": None,
            "tutor_result": None,
            "next_step": "START"
        }

        result = await app_graph.ainvoke(inputs)

        tutor_res = result.get("tutor_result")
        if not tutor_res:
            raise HTTPException(status_code=500, detail="튜터링 응답 생성에 실패했습니다.")
        return tutor_res

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
