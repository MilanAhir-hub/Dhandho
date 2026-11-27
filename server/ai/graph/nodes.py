"""LangGraph nodes for the Dhandho AI assistant.

assistant_node: talks to the Groq model, parses its JSON reply, tracks collected data.
propose_node: validates the data and saves a pending proposal (nothing is executed yet).
"""

import json
import os
from typing import List

from langchain_core.messages import AIMessage, SystemMessage
from langchain_groq import ChatGroq

from ai.graph.state import AgentState
from ai.prompts.system_prompt import SYSTEM_PROMPT
from ai.proposals import create_proposal
from ai.tools.product_tools import validate_product_data
from ai.tools.supplier_tools import validate_supplier_data

KNOWN_INTENTS = ("propose", "create_supplier", "ask_followup", "other")
FALLBACK_REPLY = "Sorry, I did not understand that. Could you rephrase it?"


def _get_llm() -> ChatGroq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is missing in server/.env")
    return ChatGroq(
        model=os.getenv("GROQ_MODEL_NAME", "openai/gpt-oss-20b"),
        temperature=0,
    )


def _parse_model_text(text: str) -> dict:
    """Parse the model's JSON reply, falling back to a safe conversational default."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = [ln for ln in cleaned.splitlines() if not ln.strip().startswith("```")]
        cleaned = "\n".join(lines).strip()

    # Try direct parse
    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return parsed
    except ValueError:
        pass

    # Try extracting JSON object {...} if surrounded by other text/markdown
    if "{" in cleaned and "}" in cleaned:
        start = cleaned.find("{")
        end = cleaned.rfind("}") + 1
        try:
            parsed = json.loads(cleaned[start:end])
            if isinstance(parsed, dict):
                return parsed
        except ValueError:
            pass

    # If the model replied in pure conversational text like ChatGPT
    return {
        "reply": cleaned or FALLBACK_REPLY,
        "intent": "other",
        "name": None,
        "price": None,
        "stock": None,
        "phone": None,
        "company_name": None,
    }


def _merge_collected(collected: dict, parsed: dict) -> dict:
    merged = dict(collected)
    name = parsed.get("name")
    if isinstance(name, str) and name.strip():
        merged["name"] = name.strip()
    if parsed.get("phone") is not None:
        merged["phone"] = str(parsed["phone"]).strip()
    if parsed.get("company_name") is not None:
        merged["company_name"] = str(parsed["company_name"]).strip()
    for key in ("price", "stock"):
        if key in parsed and parsed[key] is not None:
            try:
                merged[key] = float(parsed[key])
            except (TypeError, ValueError):
                continue
    return merged


def _missing_fields(collected: dict) -> List[str]:
    missing = []
    if not collected.get("name"):
        missing.append("name")
    if collected.get("price") is None:
        missing.append("price")
    if collected.get("stock") is None:
        missing.append("stock")
    return missing


def assistant_node(state: AgentState) -> dict:
    """Ask the model for a JSON decision and update the conversation state."""
    llm = _get_llm()
    messages = [SystemMessage(content=SYSTEM_PROMPT)] + list(state["messages"])
    raw = llm.invoke(messages).content or ""
    parsed = _parse_model_text(raw)

    reply = str(parsed.get("reply") or "").strip() or FALLBACK_REPLY
    intent = parsed.get("intent")
    if intent not in KNOWN_INTENTS:
        intent = "other"

    collected = _merge_collected(state.get("collected_data") or {}, parsed)
    if intent == "create_supplier" and collected.get("name"):
        missing = []
    elif intent == "create_supplier":
        intent = "ask_followup"
        missing = ["name"]
    elif intent == "ask_followup":
        missing = _missing_fields(collected)
    else:
        missing = []
    return {
        "messages": [AIMessage(content=reply)],
        "intent": intent,
        "collected_data": collected,
        "missing_fields": missing,
    }


def propose_node(state: AgentState) -> dict:
    """Validate the collected data and save a pending proposal."""
    collected = state.get("collected_data") or {}
    if state.get("intent") == "create_supplier":
        try:
            clean = validate_supplier_data(collected)
        except ValueError as exc:
            return {
                "messages": [
                    AIMessage(content=f"I cannot propose this yet: {exc}. Please correct it and try again.")
                ],
                "intent": None,
                "pending_proposal": None,
            }

        proposal_id = create_proposal(
            user_id=state["user_id"],
            conversation_id=state["conversation_id"],
            action="create_supplier",
            payload=clean,
        )
        pending = {
            "proposal_id": proposal_id,
            "action": "create_supplier",
            "data": clean,
            "status": "pending",
        }
        message = "\n".join(
            [
                "Here is the supplier proposal. Nothing is saved yet.",
                f"- Name: {clean['name']}",
                f"- Phone: {clean['phone'] or 'Not provided'}",
                f"- Company: {clean['company_name'] or 'Not provided'}",
                "Please approve or reject this proposal.",
            ]
        )
        return {
            "messages": [AIMessage(content=message)],
            "intent": "propose",
            "collected_data": clean,
            "missing_fields": [],
            "pending_proposal": pending,
        }

    try:
        clean = validate_product_data(collected)
    except ValueError as exc:
        return {
            "messages": [
                AIMessage(content=f"I cannot propose this yet: {exc}. Please correct it and try again.")
            ],
            "intent": None,
            "pending_proposal": None,
        }

    proposal_id = create_proposal(
        user_id=state["user_id"],
        conversation_id=state["conversation_id"],
        action="create_product",
        payload=clean,
    )
    pending = {
        "proposal_id": proposal_id,
        "action": "create_product",
        "data": clean,
        "status": "pending",
    }
    message = "\n".join(
        [
            "Here is the product proposal. Nothing is saved yet.",
            f"- Name: {clean['name']}",
            f"- Price: Rs {clean['price']}",
            f"- Stock: {clean['stock']}",
            "Please approve or reject this proposal.",
        ]
    )
    return {
        "messages": [AIMessage(content=message)],
        "intent": "propose",
        "collected_data": clean,
        "missing_fields": [],
        "pending_proposal": pending,
    }


def route_after_assistant(state: AgentState) -> str:
    """Send 'propose' intent to the propose node, everything else to the end."""
    if state.get("intent") == "propose":
        return "propose"
    return "end"
