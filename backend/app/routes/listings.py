import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas import (
    ListingGenerationRequest,
    GeneratedListingResponse,
    SectionRegenerateRequest,
    SectionRegenerateResponse,
)
from app.services.listing_service import listing_service
from app.services.ollama_service import (
    OllamaConnectionError,
    OllamaModelNotFoundError,
    OllamaGenerationError,
)

logger = logging.getLogger("listingcraft.routes")
router = APIRouter(prefix="/api", tags=["Listings"])


@router.post(
    "/generate-listing",
    response_model=GeneratedListingResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate optimized product listing"
)
async def generate_listing_endpoint(request: ListingGenerationRequest):
    """
    Generates a full product listing with titles, descriptions, bullet points,
    keywords, quality scores, and improvement suggestions using Ollama or Demo Mode.
    """
    try:
        response = await listing_service.generate_listing(request)
        return response
    except OllamaConnectionError as exc:
        logger.warning(f"Ollama connection error during generation: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "Ollama Service Unavailable",
                "message": str(exc),
                "suggestion": "Make sure Ollama is running ('ollama serve') or enable Demo Mode in the generator to test the interface.",
                "is_ollama_offline": True,
            },
        )
    except OllamaModelNotFoundError as exc:
        logger.warning(f"Ollama model error: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "Model Not Found",
                "message": str(exc),
                "suggestion": f"Please pull the model first using 'ollama run qwen2.5:3b'.",
                "is_model_missing": True,
            },
        )
    except OllamaGenerationError as exc:
        logger.error(f"Ollama generation failure: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={
                "error": "Model Generation Error",
                "message": str(exc),
                "suggestion": "The AI model encountered an issue producing the listing. Please retry with slightly simpler inputs or shorter text.",
            },
        )
    except Exception as exc:
        logger.exception("Unexpected error in generate_listing_endpoint")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal Server Error",
                "message": str(exc),
            },
        )


@router.post(
    "/regenerate-section",
    response_model=SectionRegenerateResponse,
    status_code=status.HTTP_200_OK,
    summary="Regenerate an individual listing section"
)
async def regenerate_section_endpoint(request: SectionRegenerateRequest):
    """
    Regenerates a single section (e.g. title, short_description, full_description, etc.)
    """
    try:
        response = await listing_service.regenerate_section(request)
        return response
    except OllamaConnectionError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"error": "Ollama Offline", "message": str(exc)},
        )
    except Exception as exc:
        logger.exception("Unexpected error in regenerate_section_endpoint")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Internal Error", "message": str(exc)},
        )
