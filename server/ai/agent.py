"""Public entry points for the Dhandho AI assistant."""

from typing import Optional

from langchain_core.messages import HumanMessage

from ai.graph.workflow import build_ai_graph, shared_checkpointer

__all__ = ["ask_ai_assistant", "build_ai_graph", "shared_checkpointer"]


def ask_ai_assistant(
    user_message: str,
    db,
    conversation_id: Optional[str] = "default_conversation",
    user_id: Optional[int] = 1,
) -> dict:
    """Run one user message through the AI graph and return its state."""
    thread_id = f"user_{user_id or 1}_conv_{conversation_id or 'default_conversation'}"
    graph = build_ai_graph(db)
    state = graph.invoke(
        {
            "messages": [HumanMessage(content=user_message)],
            "user_id": user_id or 1,
            "conversation_id": conversation_id or "default_conversation",
        },
        config={"configurable": {"thread_id": thread_id}},
    )
    return {
        "response": state["messages"][-1].content,
        "intent": state.get("intent"),
        "collected_data": state.get("collected_data"),
        "missing_fields": state.get("missing_fields"),
        "proposal": state.get("pending_proposal"),
    }
