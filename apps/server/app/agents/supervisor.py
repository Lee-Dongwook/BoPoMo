from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.generator import generate_sentence_node
from app.agents.feedback import provide_feedback_node
from app.agents.nodes.tutor_node import tutor_node
from app.agents.nodes.ocr_node import ocr_process_node

def route_task(state: AgentState) -> str:
    task = state.get("task_type")
    if task == "GENERATE_SENTENCE":
        return "generator"
    elif task == "PROVIDE_FEEDBACK":
        return "feedback"
    elif task == "TUTOR_QUESTION":
        return "tutor"
    elif task == "PROCESS_OCR":
        return "ocr"
        
    return END

workflow = StateGraph(AgentState)

workflow.add_node("generator", generate_sentence_node)
workflow.add_node("feedback", provide_feedback_node)
workflow.add_node("tutor", tutor_node)
workflow.add_node("ocr", ocr_process_node)

workflow.set_conditional_entry_point(
    route_task,
    {
        "generator": "generator",
        "feedback": "feedback",
        "tutor": "tutor",
        "ocr": "ocr",
        END: END
    }
)

workflow.add_edge("generator", END)
workflow.add_edge("feedback", END)
workflow.add_edge("tutor", END)
workflow.add_edge("ocr", END)

app_graph = workflow.compile()
