from typing import List, Optional, TypedDict
from app.schemas.sentence import GeneratedSentenceResponse, WordInput

class AgentState(TypedDict):
    task_type: str  # 'GENERATE_SENTENCE' | 'PROVIDE_FEEDBACK'
    user_id: str
    target_words: List[WordInput]
    user_input_sentence: Optional[str]
    generated_sentence: Optional[GeneratedSentenceResponse]
    feedback_result: Optional[str]
    next_step: str
