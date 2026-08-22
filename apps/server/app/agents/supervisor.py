from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.generator import generate_sentence_node
from app.agents.feedback import provide_feedback_node

def route_task(state: AgentState) -> str:
    task = state.get("task_type")
    if task == "GENERATE_SENTENCE":
        return "generator"
    elif task == "PROVIDE_FEEDBACK":
        return "feedback"
    return "generator"

workflow = StateGraph(AgentState)

workflow.add_node("generator", generate_sentence_node)
workflow.add_node("feedback", provide_feedback_node)

workflow.set_conditional_entry_point(
    route_task,
    {
        "generator": "generator",
        "feedback": "feedback",
    }
)

workflow.add_edge("generator", END)
workflow.add_edge("feedback", END)

app_graph = workflow.compile()
