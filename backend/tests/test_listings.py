import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.services.ollama_service import OllamaConnectionError, OllamaModelNotFoundError, OllamaGenerationError

client = TestClient(app)

SAMPLE_VALID_REQUEST = {
    "product_name": "Handmade Ceramic Coffee Mug",
    "category": "Home & Kitchen",
    "description": "12oz handcrafted ceramic mug with an ergonomic handle and matte white finish. Microwave and dishwasher safe.",
    "platform": "etsy",
    "target_audience": "Coffee lovers and gift shoppers",
    "brand_name": "ArtisanCrafts",
    "features": ["12oz capacity", "Lead-free ceramic", "Matte glaze", "Dishwasher safe"],
    "tone": "friendly",
    "language": "English",
    "keywords_to_include": ["ceramic mug", "coffee lover gift"],
    "words_to_avoid": ["cure", "medical"],
    "desired_title_length": "medium",
    "demo_mode": False
}


def test_input_validation_missing_required():
    # Missing description and category
    response = client.post("/api/generate-listing", json={"product_name": "Test"})
    assert response.status_code == 422


def test_input_validation_invalid_platform():
    bad_req = dict(SAMPLE_VALID_REQUEST)
    bad_req["platform"] = "unsupported_platform"
    response = client.post("/api/generate-listing", json=bad_req)
    assert response.status_code == 422


def test_demo_mode_generation():
    req = dict(SAMPLE_VALID_REQUEST)
    req["demo_mode"] = True
    response = client.post("/api/generate-listing", json=req)
    assert response.status_code == 200
    data = response.json()
    assert data["is_demo_mode"] is True
    assert "Handmade Ceramic Coffee Mug" in data["title"]
    assert len(data["alternative_titles"]) >= 2
    assert len(data["selling_points"]) >= 3
    assert len(data["keywords"]) >= 3
    assert len(data["tags"]) >= 3
    assert data["quality_score"]["overall_score"] > 50
    assert len(data["improvement_suggestions"]) >= 1


@pytest.mark.asyncio
async def test_real_ai_generation_success():
    mock_llm_json = {
        "title": "ArtisanCrafts Handmade Ceramic Coffee Mug - 12oz Microwave Safe Matte Glaze",
        "alternative_titles": [
            "Handcrafted 12oz Ceramic Mug | Dishwasher Safe Coffee Cup",
            "Artisan Ceramic Coffee Mug for Daily Brews & Gifting",
            "12oz Minimalist White Ceramic Coffee Mug"
        ],
        "short_description": "Enjoy your morning coffee with this ergonomic 12oz handcrafted ceramic mug.",
        "full_description": "### Daily Comfort in Every Sip\nCrafted with premium lead-free clay...",
        "selling_points": [
            "[HANDCRAFTED BEAUTY] Each mug is individually shaped with durable ceramic.",
            "[PERFECT CAPACITY] 12oz size fits nicely under standard coffee machines.",
            "[EFFORTLESS CLEANING] 100% dishwasher and microwave safe.",
            "[COMFORTABLE GRIP] Ergonomically curved handle prevents spills.",
            "[PERFECT GIFT] Packaged safely for housewarming and birthday gifts."
        ],
        "keywords": ["ceramic coffee mug", "handmade mug", "12oz mug", "coffee gift", "artisan pottery"],
        "tags": ["ceramic mug", "coffee gift", "handmade pottery", "home decor", "tea lover"],
        "call_to_action": "Order your handcrafted mug today and elevate your morning ritual!",
        "quality_score": {
            "overall_score": 92,
            "seo_score": 90,
            "readability_score": 94,
            "persuasiveness_score": 92,
            "summary": "Outstanding listing with strong SEO appeal and rich bullet points."
        },
        "improvement_suggestions": [
            "Add dimensions in inches for international buyers."
        ]
    }

    with patch("app.services.ollama_service.ollama_service.generate_structured", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_llm_json
        
        req = dict(SAMPLE_VALID_REQUEST)
        req["demo_mode"] = False
        response = client.post("/api/generate-listing", json=req)
        assert response.status_code == 200
        data = response.json()
        assert data["is_demo_mode"] is False
        assert data["title"] == mock_llm_json["title"]
        assert data["quality_score"]["overall_score"] == 92
        assert len(data["selling_points"]) == 5


@pytest.mark.asyncio
async def test_ollama_service_unavailable():
    with patch("app.services.ollama_service.ollama_service.generate_structured", new_callable=AsyncMock) as mock_gen:
        mock_gen.side_effect = OllamaConnectionError("Cannot connect to Ollama")
        
        req = dict(SAMPLE_VALID_REQUEST)
        req["demo_mode"] = False
        response = client.post("/api/generate-listing", json=req)
        assert response.status_code == 503
        data = response.json()
        assert "detail" in data
        assert data["detail"]["is_ollama_offline"] is True


@pytest.mark.asyncio
async def test_ollama_model_not_found():
    with patch("app.services.ollama_service.ollama_service.generate_structured", new_callable=AsyncMock) as mock_gen:
        mock_gen.side_effect = OllamaModelNotFoundError("Model not found")
        
        req = dict(SAMPLE_VALID_REQUEST)
        req["demo_mode"] = False
        response = client.post("/api/generate-listing", json=req)
        assert response.status_code == 503
        data = response.json()
        assert data["detail"]["is_model_missing"] is True


def test_regenerate_section_demo_mode():
    req = {
        "section": "title",
        "context": {
            **SAMPLE_VALID_REQUEST,
            "demo_mode": True
        },
        "current_value": "Old Title"
    }
    response = client.post("/api/regenerate-section", json=req)
    assert response.status_code == 200
    data = response.json()
    assert data["section"] == "title"
    assert data["is_demo_mode"] is True
    assert data["value"] is not None
