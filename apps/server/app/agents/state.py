from typing import List, Optional, TypedDict, Any, Literal
from app.schemas.sentence import GeneratedSentenceResponse, WordInput
from app.schemas.tutor import TutorResponse

TaskType = Literal[
    'GENERATE_SENTENCE', 
    'PROVIDE_FEEDBACK', 
    'TUTOR_QUESTION', 
    'PROCESS_OCR'
]

class AgentState(TypedDict):
    task_type: TaskType
    user_id: str
    next_step: str
    error_message: Optional[str]

    target_words: List[WordInput]
    user_input_sentence: Optional[str]
    generated_sentence: Optional[GeneratedSentenceResponse]
    feedback_result: Optional[str]

    query: Optional[str]
    tutor_result: Optional[TutorResponse]

    image_bytes: Optional[bytes]
    ocr_result: Optional[dict[str, Any]]
    
