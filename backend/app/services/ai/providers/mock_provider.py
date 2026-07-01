import asyncio
from app.services.ai.providers.base import AIProvider

class MockProvider(AIProvider):
    """Mock AI provider for development and testing."""
    
    async def generate(self, prompt: str) -> str:
        # Simulate network delay to make testing UI robust
        await asyncio.sleep(1.0)
        return "I'm your AI analyst. AI integration will be implemented in the next phase."
