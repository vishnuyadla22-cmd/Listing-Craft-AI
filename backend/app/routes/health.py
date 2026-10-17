from fastapi import APIRouter
from app.schemas import HealthResponse
from app.services.ollama_service import ollama_service
from app.config import settings

router = APIRouter(prefix="/api", tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def get_health():
    """
    Checks backend status and verifies if Ollama is connected and the target model is available.
    """
    connected, model_available, available_models, message = await ollama_service.check_health()
    
    guidance = None
    if not connected:
        guidance = (
            f"Ollama server is not detected at {settings.OLLAMA_BASE_URL}.\n"
            "Steps to fix:\n"
            "1. Download & install Ollama from https://ollama.com\n"
            "2. Start Ollama: 'ollama serve'\n"
            f"3. Pull model: 'ollama run {settings.OLLAMA_MODEL}'\n"
            "Alternatively, use Demo Mode in the generator for simulated testing."
        )
    elif not model_available:
        guidance = (
            f"Model '{settings.OLLAMA_MODEL}' was not found among installed models: {available_models or 'none'}.\n"
            f"Run: 'ollama run {settings.OLLAMA_MODEL}' to pull and load the weights."
        )

    return HealthResponse(
        status="healthy",
        ollama_connected=connected,
        model_available=model_available,
        model_name=settings.OLLAMA_MODEL,
        available_models=available_models,
        message=message,
        setup_guidance=guidance,
    )
