from typing import Dict, Any

class ChartSerializer:
    @staticmethod
    def serialize(execution_result: Dict[str, Any], recommendation: Dict[str, Any]) -> Dict[str, Any]:
        """
        Takes the execution_result and the rule recommendation, 
        and serializes it into the final frontend-friendly JSON structure.
        """
        chart_type = recommendation.get("chart_type")
        
        if chart_type == "none":
            return recommendation
            
        columns = execution_result.get("columns", [])
        rows = execution_result.get("rows", [])
        
        x_axis = recommendation.get("x_axis")
        y_axis = recommendation.get("y_axis")
        
        try:
            x_idx = columns.index(x_axis) if x_axis else -1
            y_idx = columns.index(y_axis) if y_axis else -1
        except ValueError:
            return {"chart_type": "none", "reason": "Recommended axis not found in columns."}
            
        # Extract labels and data
        labels = []
        data = []
        for row in rows:
            if x_idx != -1:
                labels.append(str(row[x_idx]))
            if y_idx != -1:
                # Handle nulls
                val = row[y_idx]
                data.append(val if val is not None else 0)
                
        # Format Title
        title = f"{y_axis} by {x_axis}" if x_axis and y_axis else f"{y_axis}"
        
        return {
            "chart_type": chart_type,
            "title": title,
            "x_axis": x_axis,
            "y_axis": y_axis,
            "confidence": recommendation.get("confidence", 0.5),
            "labels": labels,
            "datasets": [
                {
                    "label": y_axis,
                    "data": data
                }
            ]
        }
