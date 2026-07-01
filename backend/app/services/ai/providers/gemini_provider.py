import os
import logging
from google import genai
from google.genai import types

from app.core.config import settings
from app.services.ai.providers.base import AIProvider

logger = logging.getLogger(__name__)

class GeminiProvider(AIProvider):
    """Gemini implementation of the AIProvider using google-genai SDK."""
    
    def __init__(self):
        # We explicitly pass the key from the central config to the client
        try:
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {e}")
            self.client = None
            
        # We use a standard analytical model
        self.model = "gemini-2.5-flash"
        
    async def generate(self, prompt: str) -> str:
        if not self.client:
            return "I'm sorry, the AI service is currently unavailable. Please try again later."
            
        try:
            logger.info("Gemini request started")
            response = await self.client.aio.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.2, # Low temperature for more analytical/deterministic output
                )
            )
            logger.info("Gemini response received")
            return response.text
        except Exception as e:
            logger.error("Gemini API error during generate", exc_info=True)
            return "I'm sorry, the AI service is currently unavailable. Please try again later."
