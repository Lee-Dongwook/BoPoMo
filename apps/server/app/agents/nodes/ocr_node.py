from app.agents.state import AgentState
from app.services.ocr_service import OCRPipelineService
from app.rag.dependencies import get_rag_engine
from app.rag.retriever.hybrid import HybridRAGEngine

async def ocr_process_node(state: AgentState) -> AgentState:
    try:
        image_bytes = state.get("image_bytes")
        user_id = state.get("user_id", "default_user")

        if not image_bytes:
            return {
                **state,
                "error_message": "OCR 처리를 위한 이미지 데이터가 전달되지 않았습니다.",
                "next_step": "END"
            }

        pipeline = OCRPipelineService()
        rag_engine: HybridRAGEngine = get_rag_engine()

        raw_text = await pipeline.extract_text_from_image(image_bytes)        
        cleaned_data = await pipeline.clean_and_structure_ocr_text(raw_text)

        if hasattr(rag_engine, "vector_store") and hasattr(rag_engine.vector_store, "add_document"):
            rag_engine.vector_store.add_document(user_id=user_id, document=cleaned_data)

        return {
            **state,
            "ocr_result": cleaned_data,
            "next_step": "END"
        }
    except Exception as e:
        return {
            **state,
            "error_message": f"OCR pipeline process failed: {str(e)}",
            "next_step": "END"
        }
