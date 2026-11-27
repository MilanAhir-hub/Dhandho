# Shared state for the AI assistant graph.
from typing import Annotated, Any, Dict, List, Optional, TypedDict

from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    """State passed between nodes of the AI assistant graph."""

    # Chat history; add_messages keeps appended messages across turns.
    messages: Annotated[list, add_messages]
    user_id: int
    conversation_id: str
    # Last intent decided by the assistant node.
    intent: Optional[str]
    # Product fields collected so far (name, price, stock).
    collected_data: Optional[Dict[str, Any]]
    # Which of the required fields are still missing.
    missing_fields: Optional[List[str]]
    # Proposal awaiting approval, if any.
    pending_proposal: Optional[Dict[str, Any]]
