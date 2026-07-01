from typing import Dict, Any
from app.services.insights.insight_prompt import InsightPromptBuilder
from app.services.insights.insight_provider import InsightProvider
from app.services.insights.insight_serializer import InsightSerializer

class InsightBuilder:
    @staticmethod
    async def generate(
        user_question: str,
        generated_sql: str,
        execution_result: Dict[str, Any],
        chart_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Orchestration layer for generating AI insights.
        """
        
        # 1. Build Prompt
        prompt = InsightPromptBuilder.build_prompt(
            user_question=user_question,
            generated_sql=generated_sql,
            execution_result=execution_result,
            chart_data=chart_data
        )
        
        # 2. Call Provider
        provider = InsightProvider()
        raw_insights = await provider.generate_insights(prompt)
        
        # 3. Serialize and validate
        final_insights = InsightSerializer.serialize(raw_insights)
        
        return final_insights
