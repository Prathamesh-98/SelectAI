from typing import Dict, Any

class ChartRules:
    @staticmethod
    def evaluate(schema: Dict[str, str], num_rows: int) -> Dict[str, Any]:
        """
        Evaluates the schema and returns the recommended chart type and mapping.
        """
        if num_rows > 100:
            return {"chart_type": "none", "reason": "Large datasets (>100 rows) are best viewed as a table."}
        if num_rows == 0:
            return {"chart_type": "none", "reason": "No data returned."}
            
        columns = list(schema.keys())
        types = list(schema.values())
        
        # Categorize columns
        categoricals = [c for c, t in schema.items() if t == "categorical"]
        numerics = [c for c, t in schema.items() if t == "numeric"]
        datetimes = [c for c, t in schema.items() if t == "datetime"]
        percentages = [c for c, t in schema.items() if t == "percentage"]
        identifiers = [c for c, t in schema.items() if t == "identifier"]

        # 1. Single Numeric -> KPI
        if len(columns) == 1 and len(numerics) == 1 and num_rows == 1:
            return {
                "chart_type": "kpi",
                "confidence": 0.95,
                "y_axis": numerics[0]
            }

        # 2. Datetime + Numeric -> Line
        if len(datetimes) >= 1 and len(numerics) >= 1:
            return {
                "chart_type": "line",
                "confidence": 0.9,
                "x_axis": datetimes[0],
                "y_axis": numerics[0]
            }

        # 3. Category + Percentage -> Pie
        if len(categoricals) >= 1 and len(percentages) >= 1:
            return {
                "chart_type": "pie",
                "confidence": 0.85,
                "x_axis": categoricals[0],
                "y_axis": percentages[0]
            }

        # 4. Category + Numeric -> Bar
        if len(categoricals) >= 1 and len(numerics) >= 1:
            # If there's an identifier, maybe use it as category if no other category exists
            # but we already found a categorical.
            return {
                "chart_type": "bar",
                "confidence": 0.9,
                "x_axis": categoricals[0],
                "y_axis": numerics[0]
            }

        # 5. Identifier + Numeric -> Bar (fallback for Category + Numeric if only ID exists)
        if len(identifiers) >= 1 and len(numerics) >= 1:
            return {
                "chart_type": "bar",
                "confidence": 0.7,
                "x_axis": identifiers[0],
                "y_axis": numerics[0]
            }

        # 6. Two Numeric -> Scatter
        if len(numerics) >= 2:
            return {
                "chart_type": "scatter",
                "confidence": 0.8,
                "x_axis": numerics[0],
                "y_axis": numerics[1]
            }

        return {"chart_type": "none", "reason": "Result shape is not suitable for visualization."}
