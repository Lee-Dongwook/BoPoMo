from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.agents.supervisor import app_graph

router = APIRouter(prefix="/api/ocr", tags=["OCR"])

@router.post("/upload")
async def upload_textbook_image(
    user_id: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        image_bytes = await file.read()

        inputs = {
            "task_type": "PROCESS_OCR",
            "user_id": user_id,
            "image_bytes": image_bytes,
            "query": None,
            "target_words": [],
            "ocr_result": None,
            "next_step": "START"
        }

        result = await app_graph.ainvoke(inputs)
        ocr_res = result.get("ocr_result")

        if not ocr_res:
            raise HTTPException(status_code=500, detail="OCR 교재 데이터 처리 실패")

        return {
            "status": "success",
            "message": "교재 데이터가 정제되어 RAG 지식 베이스에 즉시 등록되었습니다.",
            "data": ocr_res
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
