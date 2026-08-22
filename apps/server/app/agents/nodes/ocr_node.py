from typing import Dict, Any
from app.services.ocr_service import OCRPipelineService
from app.rag.dependencies import get_rag_engine

async def ocr_process_node(state: Dict[str, Any]) -> Dict[str, Any]:
    image_bytes = state.get("image_bytes")
    user_id = state.get("user_id", "default_user")
    
    pipeline = OCRPipelineService()
    rag_engine = get_rag_engine()

    raw_text = await pipeline.extract_text_from_image(image_bytes)

    cleaned_data = await pipeline.clean_and_structure_ocr_text(raw_text)

    rag_engine.add_user_document(user_id=user_id, document=cleaned_data)

    return {
        "ocr_result": cleaned_data,
        "next_step": "END"
    }
