import json
import logging
import asyncio
import time
import traceback
from typing import Dict, Any
from google import genai
from google.genai import types
from google.genai.errors import ClientError

from app.core.config import settings

logger = logging.getLogger(__name__)

class InsightProvider:
    def __init__(self):
        try:
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        except Exception as e:
            logger.error(f"InsightProvider: Failed to initialize Gemini client: {e}")
            self.client = None
            
        self.model = "gemini-2.5-flash"

    def _fallback(self, summary: str, recommendations: list = None, limitations: list = None) -> Dict[str, Any]:
        return {
            "summary": summary,
            "key_findings": [],
            "recommendations": recommendations or [],
            "limitations": limitations or []
        }

    async def generate_insights(self, prompt: str) -> Dict[str, Any]:
        """
        Calls Gemini to generate structured JSON insights with retries and robust error handling.
        """
        if not self.client:
            return self._fallback("Insights unavailable (Client not initialized).")
            
        max_retries = 3
        base_delay = 1 # seconds
        
        for attempt in range(max_retries + 1):
            start_time = time.time()
            try:
                logger.info(f"Insight Generation started (Attempt {attempt + 1}/{max_retries + 1})")
                
                response = await self.client.aio.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.2,
                        response_mime_type="application/json",
                        response_schema=types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "summary": types.Schema(type=types.Type.STRING),
                                "key_findings": types.Schema(
                                    type=types.Type.ARRAY, 
                                    items=types.Schema(type=types.Type.STRING)
                                ),
                                "recommendations": types.Schema(
                                    type=types.Type.ARRAY, 
                                    items=types.Schema(type=types.Type.STRING)
                                ),
                                "limitations": types.Schema(
                                    type=types.Type.ARRAY, 
                                    items=types.Schema(type=types.Type.STRING)
                                )
                            },
                            required=["summary", "key_findings", "recommendations", "limitations"]
                        )
                    )
                )
                
                duration = time.time() - start_time
                raw_json = response.text
                
                # Strip markdown fences
                cleaned_json = raw_json.strip()
                if cleaned_json.startswith("```json"):
                    cleaned_json = cleaned_json[7:]
                elif cleaned_json.startswith("```"):
                    cleaned_json = cleaned_json[3:]
                if cleaned_json.endswith("```"):
                    cleaned_json = cleaned_json[:-3]
                cleaned_json = cleaned_json.strip()
                
                try:
                    data = json.loads(cleaned_json)
                    logger.info(f"Insight Generation succeeded. Model: {self.model}, Duration: {duration:.2f}s, Attempt: {attempt + 1}")
                    return data
                except json.JSONDecodeError as e:
                    logger.error(f"Insight Generation JSON Parse Error: {e}\nRaw Response:\n{raw_json}")
                    return self._fallback(
                        "AI insights format was invalid.",
                        recommendations=["Please try running the query again."],
                        limitations=["The AI returned a malformed response."]
                    )
                
            except ClientError as e:
                duration = time.time() - start_time
                err_msg = str(e).lower()
                status_code = getattr(e, 'code', None) or (429 if '429' in err_msg else None)
                
                if status_code == 429 or "quota" in err_msg or "resource_exhausted" in err_msg:
                    logger.warning(f"Insight generation 429 Quota Exceeded. Duration: {duration:.2f}s. Attempt: {attempt + 1}")
                    if attempt < max_retries:
                        delay = base_delay * (2 ** attempt)
                        logger.info(f"Retrying in {delay} seconds...")
                        await asyncio.sleep(delay)
                        continue
                    else:
                        logger.error(f"Insight generation failed after {max_retries} retries due to quota limits.")
                        return self._fallback(
                            "AI insights are temporarily unavailable because the Gemini API quota has been exceeded.",
                            recommendations=["Try again after the quota resets.", "Or configure a paid Gemini API key."],
                            limitations=["No AI insights could be generated due to API quota limits."]
                        )
                
                elif status_code == 401 or status_code == 403 or "api key" in err_msg:
                    logger.error(f"Insight generation Invalid API Key. Duration: {duration:.2f}s.\nTraceback:\n{traceback.format_exc()}")
                    return self._fallback(
                        "AI insights are unavailable due to an invalid API key.",
                        recommendations=["Check your Gemini API key configuration in settings."]
                    )
                    
                else:
                    logger.error(f"Insight generation API Error (ClientError): {e}. Duration: {duration:.2f}s.\nTraceback:\n{traceback.format_exc()}")
                    return self._fallback("Insights unavailable due to an API error.")
                    
            except asyncio.TimeoutError:
                duration = time.time() - start_time
                logger.error(f"Insight generation Network Timeout. Duration: {duration:.2f}s.")
                return self._fallback(
                    "AI insights timed out while waiting for a response.",
                    recommendations=["Please try running the query again. The network may be slow."]
                )
                
            except Exception as e:
                duration = time.time() - start_time
                logger.error(f"Insight generation Unknown Error: {type(e).__name__} - {e}. Duration: {duration:.2f}s.\nTraceback:\n{traceback.format_exc()}")
                return self._fallback("An unknown error occurred while generating AI insights.")

        return self._fallback("Insights unavailable.")
