import re
from typing import Tuple, Optional

class SQLExtractor:
    """
    Utility class for extracting SQL blocks from AI generated responses.
    """
    
    @staticmethod
    def extract_sql(response_text: str) -> Tuple[Optional[str], str]:
        """
        Extracts a SQL block from the response text.
        
        Args:
            response_text: The full text response from the AI.
            
        Returns:
            A tuple containing:
            - generated_sql: The extracted SQL query string, or None if no SQL block exists.
            - assistant_message: The original text with the SQL block removed (or kept, but typically 
                                 the user wants the SQL separated. Wait, the requirements say "Extract the SQL block. 
                                 Return: generated_sql, assistant_message_without_sql").
                                 Wait, the user said "Return generated_sql, assistant_message_without_sql".
                                 So we will remove the ```sql...``` block from the assistant message.
        """
        # Find all ```sql ... ``` blocks (non-greedy)
        pattern = r"```sql\s*(.*?)\s*```"
        match = re.search(pattern, response_text, re.IGNORECASE | re.DOTALL)
        
        if not match:
            return None, response_text.strip()
            
        generated_sql = match.group(1).strip()
        
        # Remove the SQL block from the message
        # We replace the whole block (including the backticks) with an empty string
        assistant_message_without_sql = re.sub(pattern, "", response_text, flags=re.IGNORECASE | re.DOTALL).strip()
        
        return generated_sql, assistant_message_without_sql
