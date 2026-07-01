from typing import Dict, Any
from app.services.charts.chart_analyzer import ChartAnalyzer
from app.services.charts.chart_rules import ChartRules
from app.services.charts.chart_serializer import ChartSerializer

class ChartRecommender:
    @staticmethod
    def generate_chart_data(execution_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Orchestrates the chart generation pipeline:
        1. Analyzes columns
        2. Applies recommendation rules
        3. Serializes for the frontend
        """
        if not execution_result or "error" in execution_result:
            return {"chart_type": "none", "reason": "No valid execution result available."}
            
        columns = execution_result.get("columns", [])
        rows = execution_result.get("rows", [])
        row_count = execution_result.get("row_count", 0)
        
        # 1. Analyze
        schema = ChartAnalyzer.analyze(columns, rows)
        
        # 2. Recommend
        recommendation = ChartRules.evaluate(schema, row_count)
        
        # 3. Serialize
        chart_data = ChartSerializer.serialize(execution_result, recommendation)
        
        return chart_data
