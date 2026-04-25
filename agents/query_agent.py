import json
import os
from datetime import datetime
from uuid import uuid4

import requests
from uagents import Agent, Context, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    TextContent,
    chat_protocol_spec,
)

MONGO_DATA_API_URL = os.getenv("MONGO_DATA_API_URL", "")
MONGO_DATA_API_KEY = os.getenv("MONGO_DATA_API_KEY", "")
MONGO_DATABASE = os.getenv("MONGO_DATABASE", "vigil")
MONGO_DATASOURCE = os.getenv("MONGO_DATASOURCE", "Cluster0")

agent = Agent(name="vigil_query_agent", seed=os.getenv("QUERY_AGENT_SEED", "vigil-query-agent-seed"))
chat_proto = Protocol(spec=chat_protocol_spec)


def get_top_ignored(n: int = 3) -> list:
    if not MONGO_DATA_API_URL or not MONGO_DATA_API_KEY:
        return []
    try:
        resp = requests.post(
            f"{MONGO_DATA_API_URL}/action/find",
            headers={"api-key": MONGO_DATA_API_KEY, "Content-Type": "application/json"},
            json={
                "collection": "countries",
                "database": MONGO_DATABASE,
                "dataSource": MONGO_DATASOURCE,
                "filter": {"invisible_index": {"$gt": 0}},
                "sort": {"invisible_index": -1},
                "limit": n,
                "projection": {"_id": 1, "name": 1, "invisible_index": 1},
            },
            timeout=8,
        ).json()
        return resp.get("documents", [])
    except Exception:
        return []


def generate_response(query_text: str) -> str:
    top = get_top_ignored(3)
    if not top:
        return "I cannot access live Vigil data right now. Please try again in a minute."
    if "top" in query_text.lower() or "most ignored" in query_text.lower():
        lines = [f"{item.get('name', item.get('_id'))} ({item.get('_id')}): {item.get('invisible_index', 0):,.1f}" for item in top]
        return "Top ignored crises right now: " + "; ".join(lines)
    first = top[0]
    return (
        f"The most ignored crisis right now is {first.get('name', first.get('_id'))} "
        f"with an Invisible Index of {first.get('invisible_index', 0):,.1f}."
    )


@chat_proto.on_message(ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    await ctx.send(sender, ChatAcknowledgement(timestamp=datetime.utcnow(), acknowledged_msg_id=msg.msg_id))
    query_text = ""
    for item in msg.content:
        if hasattr(item, "text"):
            query_text = item.text
            break
    response_text = generate_response(query_text or "")
    await ctx.send(
        sender,
        ChatMessage(msg_id=str(uuid4()), timestamp=datetime.utcnow(), content=[TextContent(type="text", text=response_text)]),
    )
    await ctx.send(
        sender,
        ChatMessage(msg_id=str(uuid4()), timestamp=datetime.utcnow(), content=[EndSessionContent(type="end-session")]),
    )


agent.include(chat_proto, publish_manifest=True)

if __name__ == "__main__":
    agent.run()
