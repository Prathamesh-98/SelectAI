from typing import Dict, Any
import json

class InsightPromptBuilder:
    @staticmethod
    def build_prompt(
        user_question: str,
        generated_sql: str,
        execution_result: Dict[str, Any],
        chart_data: Dict[str, Any]
    ) -> str:
        """
        Constructs a structured prompt for the AI to generate business insights.
        Safely truncates execution results to prevent token overflow.
        """
        
        # Summarize large datasets
        rows = execution_result.get("rows", [])
        columns = execution_result.get("columns", [])
        total_rows = execution_result.get("row_count", 0)
        
        if total_rows > 50:
            sample_rows = rows[:50]
            result_context = (
                f"Dataset contains {total_rows} rows. Here is a sample of the first 50 rows:\n"
                f"Columns: {json.dumps(columns)}\n"
                f"Sample Rows: {json.dumps(sample_rows)}"
            )
        else:
            result_context = (
                f"Dataset contains {total_rows} rows.\n"
                f"Columns: {json.dumps(columns)}\n"
                f"Rows: {json.dumps(rows)}"
            )
            
        chart_type = chart_data.get("chart_type", "none") if chart_data else "none"
        
        prompt = f"""You are a senior data analyst providing business insights.

RULES:
- Summarize the results concisely.
- Explain what the numbers mean.
- Highlight trends, anomalies, and notable patterns.
- Provide business recommendations.
- Mention limitations when appropriate.
- NEVER invent information.
- NEVER assume missing values.
- NEVER mention unavailable columns.
- NEVER mention information outside the execution result.
- NEVER analyze the full dataset (only analyze the provided execution result).
- Professional tone.
- Maximum response length: 300 words.

INPUT DATA:

User Question:
{user_question}

SQL Query Used:
{generated_sql}

Query Results:
{result_context}

Recommended Chart:
{chart_type}

Explain the results and provide actionable business insights based solely on the data provided above.
"""
        return prompt
