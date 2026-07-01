from typing import Any, Sequence

from app.models.analysis_session import AnalysisSession
from app.models.dataset import Dataset
from app.models.message import Message
from app.models.workspace import Workspace

class PromptBuilder:
    """Constructs prompts for the AI Provider."""
    
    @staticmethod
    def build_analysis_prompt(
        workspace: Workspace,
        session: AnalysisSession,
        datasets: Sequence[Dataset],
        history: Sequence[Message],
        user_message: str
    ) -> str:
        """
        Build a comprehensive prompt string combining context, history, and the new message.
        """
        prompt_parts = []
        
        # 1. System Context & Workspace
        prompt_parts.append(f"You are an AI Data Analyst working in the '{workspace.name}' workspace.")
        if workspace.description:
            prompt_parts.append(f"Workspace context: {workspace.description}")
            
        # SQL Constraints
        prompt_parts.append("\nSTRICT RULES FOR SQL GENERATION:")
        prompt_parts.append("- Only generate SELECT queries.")
        prompt_parts.append("- Never generate: INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE.")
        prompt_parts.append("- Use only the provided dataset metadata.")
        prompt_parts.append("- Return SQL inside a fenced ```sql block.")
        prompt_parts.append("- After the SQL block, provide a short natural-language explanation.")
            
        # 2. Session Context
        prompt_parts.append(f"\nCurrent Session: {session.name}")
        if session.goal:
            prompt_parts.append(f"Session Goal: {session.goal}")
            
        # 3. Datasets Metadata
        if datasets:
            prompt_parts.append("\nAvailable Datasets:")
            for ds in datasets:
                ds_name = getattr(ds, "name", "Unknown")
                rows = getattr(ds, "row_count", None)
                rows_str = str(rows) if rows is not None else "Unknown"
                size = getattr(ds, "file_size_bytes", None)
                size_str = f"{size} bytes" if size is not None else "Unknown"
                
                prompt_parts.append("Dataset:")
                prompt_parts.append(ds_name)
                prompt_parts.append("\nRows:")
                prompt_parts.append(rows_str)
                prompt_parts.append("\nColumns:\n")
                
                # Handle columns correctly
                columns_meta = getattr(ds, "columns_metadata", None)
                
                cols = []
                if isinstance(columns_meta, dict) and "columns" in columns_meta:
                    cols = columns_meta["columns"]
                elif isinstance(columns_meta, list):
                    cols = columns_meta
                    
                if isinstance(cols, list) and len(cols) > 0:
                    for c in cols:
                        if isinstance(c, dict):
                            c_name = c.get("name", "Unknown")
                            c_type = c.get("type") or c.get("dtype") or c.get("datatype")
                            if c_type:
                                prompt_parts.append(f"{c_name} ({c_type})\n")
                            else:
                                prompt_parts.append(f"{c_name}\n")
                else:
                    prompt_parts.append("Unknown\n")
        else:
            prompt_parts.append("\nNo datasets are currently attached to this session.")
            
        # 4. Conversation History
        if history:
            prompt_parts.append("\nConversation History:")
            for msg in history:
                role_str = "User" if msg.role == "user" else "Assistant"
                prompt_parts.append(f"{role_str}: {msg.content}")
                if msg.has_sql and getattr(msg, "generated_sql", None):
                    prompt_parts.append(f"SQL Generated:\n{msg.generated_sql}")
                    
        # 5. User Message
        prompt_parts.append(f"\nUser: {user_message}\nAssistant:")
        
        return "\n".join(prompt_parts)
