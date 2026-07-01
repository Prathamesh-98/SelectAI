from abc import ABC, abstractmethod

class AIProvider(ABC):
    """Abstract interface for AI generation providers."""
    
    @abstractmethod
    async def generate(self, prompt: str) -> str:
        """
        Generate a response based on the provided prompt string.
        
        Args:
            prompt: The formatted instruction string for the AI.
            
        Returns:
            The generated response string.
        """
        pass
