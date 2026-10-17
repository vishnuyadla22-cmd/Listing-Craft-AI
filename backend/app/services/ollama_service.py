import json
import logging
import re
from typing import Dict, Any, List, Tuple
import httpx
from app.config import settings

logger = logging.getLogger("listingcraft.ollama")


class OllamaServiceError(Exception):
    """Base exception for Ollama service issues."""
    pass


class OllamaConnectionError(OllamaServiceError):
    """Raised when Ollama cannot be reached."""
    pass


class OllamaModelNotFoundError(OllamaServiceError):
    """Raised when the specified model is not pulled or available."""
    pass


class OllamaGenerationError(OllamaServiceError):
    """Raised when model inference fails or outputs unparseable data."""
    pass


class OllamaService:
    def __init__(self, base_url: str = settings.OLLAMA_BASE_URL, model: str = settings.OLLAMA_MODEL, timeout: float = settings.OLLAMA_TIMEOUT):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout

    async def check_health(self) -> Tuple[bool, bool, List[str], str]:
        """
        Checks if Ollama is running and if the configured model is installed.
        Returns: (connected, model_available, available_models, status_message)
        """
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    models = [m.get("name", "") for m in data.get("models", [])]
                    # Check if exact model or model without tag (e.g. 'qwen2.5:3b' vs 'qwen2.5:3b-instruct') is present
                    model_available = any(
                        self.model == m or self.model in m or m.startswith(self.model.split(":")[0])
                        for m in models
                    )
                    if model_available:
                        msg = f"Ollama is online and model '{self.model}' is ready."
                    else:
                        msg = f"Ollama is running, but model '{self.model}' is not pulled yet. Run 'ollama run {self.model}'."
                    return True, model_available, models, msg
                else:
                    return False, False, [], f"Ollama returned unexpected HTTP {res.status_code}"
        except httpx.ConnectError:
            return False, False, [], f"Cannot connect to Ollama at {self.base_url}. Ensure Ollama is installed and running ('ollama serve')."
        except Exception as e:
            logger.warning(f"Health check failed: {e}")
            return False, False, [], f"Ollama connection check failed: {str(e)}"

    def _extract_json_from_text(self, text: str) -> Dict[str, Any]:
        """Extract and parse JSON from raw text or markdown code fences."""
        text = text.strip()
        # Direct parse attempt
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # Match ```json ... ``` or ``` ... ```
        fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if fence_match:
            try:
                return json.loads(fence_match.group(1).strip())
            except json.JSONDecodeError:
                pass

        # Find first '{' and last '}'
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except json.JSONDecodeError:
                pass

        raise ValueError("Could not extract valid JSON from response")

    async def generate_structured(self, prompt: str, system_prompt: str) -> Dict[str, Any]:
        """
        Sends request to Ollama and returns parsed structured JSON.
        Includes single repair retry on JSON parsing failure.
        """
        url = f"{self.base_url}/api/chat"
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.4,
                "top_p": 0.9,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload)
        except httpx.ConnectError as exc:
            raise OllamaConnectionError(
                f"Could not connect to Ollama at {self.base_url}. Please verify Ollama is running."
            ) from exc
        except httpx.TimeoutException as exc:
            raise OllamaGenerationError(
                f"Ollama generation timed out after {self.timeout} seconds. The model may be loading or under heavy load."
            ) from exc
        except Exception as exc:
            raise OllamaGenerationError(f"Network error communicating with Ollama: {str(exc)}") from exc

        if response.status_code == 404:
            raise OllamaModelNotFoundError(
                f"Model '{self.model}' not found in Ollama. Run: ollama run {self.model}"
            )
        elif response.status_code != 200:
            raise OllamaGenerationError(
                f"Ollama returned HTTP error {response.status_code}: {response.text}"
            )

        try:
            resp_data = response.json()
            content = resp_data.get("message", {}).get("content", "")
            return self._extract_json_from_text(content)
        except Exception as initial_parse_err:
            logger.warning(f"Initial JSON parse failed: {initial_parse_err}. Attempting one repair retry...")
            # Controlled correction retry
            repair_payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": "You are a JSON fixer. Return ONLY the valid JSON object requested without markdown, preamble or explanation."},
                    {"role": "user", "content": f"The following text was supposed to be valid JSON. Convert it into strict, valid JSON:\n\n{content}"},
                ],
                "stream": False,
                "format": "json",
            }
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    repair_res = await client.post(url, json=repair_payload)
                if repair_res.status_code == 200:
                    repair_data = repair_res.json()
                    repaired_content = repair_data.get("message", {}).get("content", "")
                    return self._extract_json_from_text(repaired_content)
            except Exception as repair_err:
                logger.error(f"Repair retry failed: {repair_err}")
                raise OllamaGenerationError(
                    f"Model returned invalid structured output and could not be corrected: {str(initial_parse_err)}"
                ) from repair_err


ollama_service = OllamaService()
