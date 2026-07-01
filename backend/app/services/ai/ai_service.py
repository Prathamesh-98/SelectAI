from typing import Sequence, Tuple, Optional
import uuid
import logging

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.analysis_session import AnalysisSession
from app.models.dataset import Dataset
from app.models.message import Message
from app.models.workspace import Workspace
from app.services.ai.prompt_builder import PromptBuilder
from app.services.ai.providers.base import AIProvider
from app.services.ai.providers.gemini_provider import GeminiProvider
from app.services.ai.sql_extractor import SQLExtractor
from app.services.sql.sql_validator import SQLValidator

logger = logging.getLogger(__name__)

class AIService:
    """
    Coordinates AI prompt building and provider execution.
    Does not access FastAPI requests directly.
    """
    
    def __init__(self, session: AsyncSession, provider: AIProvider | None = None):
        self.session = session
        
        if provider:
            self.provider = provider
        else:
            if settings.AI_PROVIDER == "gemini":
                self.provider = GeminiProvider()
            else:
                # We need to import MockProvider here since it's now dynamically selected
                from app.services.ai.providers.mock_provider import MockProvider
                self.provider = MockProvider()
                
        logger.info(f"Loaded AI_PROVIDER: {settings.AI_PROVIDER}")
        logger.info(f"Selected provider: {self.provider.__class__.__name__}")
        logger.info(f"GEMINI_API_KEY loaded: {bool(settings.GEMINI_API_KEY)}")
        
    async def generate_response(
        self,
        workspace: Workspace,
        analysis_session: AnalysisSession,
        datasets: Sequence[Dataset],
        history: Sequence[Message],
        user_message: str
    ) -> Tuple[str, Optional[str], Optional[str]]:
        """
        Build the prompt and call the configured AI provider.
        Returns a tuple of (assistant_message, generated_sql, validation_error).
        """
        # 1. Build prompt
        prompt = PromptBuilder.build_analysis_prompt(
            workspace=workspace,
            session=analysis_session,
            datasets=datasets,
            history=history,
            user_message=user_message
        )
        logger.info("Prompt built successfully")
        
        # 2. Call active provider
        response_text = await self.provider.generate(prompt)
        
        # 3. Extract SQL
        generated_sql, assistant_message = SQLExtractor.extract_sql(response_text)
        
        # 4. Validate SQL
        validation_error = None
        if generated_sql:
            validation = SQLValidator.validate(generated_sql)
            if validation.is_valid:
                generated_sql = validation.normalized_sql
            else:
                validation_error = validation.error
                generated_sql = None
                assistant_message += "\n\n*(Note: The generated SQL failed validation and cannot be executed.)*"
        
        return assistant_message, generated_sql, validation_error
