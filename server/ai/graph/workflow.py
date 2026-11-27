"""Builds the Dhandho AI assistant LangGraph.

Flow: START -> assistant -> (propose | END) ; propose -> END
The same MemorySaver checkpointer is shared with the approve/reject endpoints
so their update_state calls write into the same conversation memory.
"""

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph

from ai.graph.nodes import assistant_node, propose_node, route_after_assistant
from ai.graph.state import AgentState

shared_checkpointer = MemorySaver()


def build_ai_graph(db=None):
    """Compile the AI graph. db is accepted for router compatibility (unused)."""
    builder = StateGraph(AgentState)
    builder.add_node("assistant", assistant_node)
    builder.add_node("propose", propose_node)
    builder.add_edge(START, "assistant")
    builder.add_conditional_edges(
        "assistant",
        route_after_assistant,
        {"propose": "propose", "end": END},
    )
    builder.add_edge("propose", END)
    return builder.compile(checkpointer=shared_checkpointer)
