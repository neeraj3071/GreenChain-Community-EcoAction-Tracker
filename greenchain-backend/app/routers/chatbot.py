from fastapi import APIRouter

from app.models.schemas import ChatbotRequest, ChatbotResponse
from app.services.gemini_service import gemini_service

router = APIRouter()


@router.post("/ask", response_model=ChatbotResponse)
async def ask_environment_chatbot(payload: ChatbotRequest):
    """Environment assistant endpoint backed by Gemini service."""
    result = await gemini_service.answer_environment_question(
        payload.question,
        [{"role": msg.role, "content": msg.content} for msg in payload.history],
    )

    return ChatbotResponse(
        answer=result.get("answer", ""),
        topic=result.get("topic", "general"),
        suggested_actions=result.get("suggested_actions", []),
    )
