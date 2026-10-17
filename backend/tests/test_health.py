import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "configured_model" in data


@pytest.mark.asyncio
async def test_health_ollama_offline():
    with patch("app.services.ollama_service.ollama_service.check_health", new_callable=AsyncMock) as mock_health:
        mock_health.return_value = (False, False, [], "Cannot connect to Ollama")
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["ollama_connected"] is False
        assert data["model_available"] is False
        assert "setup_guidance" in data
        assert data["setup_guidance"] is not None


@pytest.mark.asyncio
async def test_health_ollama_online_and_model_ready():
    with patch("app.services.ollama_service.ollama_service.check_health", new_callable=AsyncMock) as mock_health:
        mock_health.return_value = (True, True, ["qwen2.5:3b"], "Ollama is online and model is ready.")
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["ollama_connected"] is True
        assert data["model_available"] is True
        assert "qwen2.5:3b" in data["available_models"]
