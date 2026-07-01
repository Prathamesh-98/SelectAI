import re
from typing import List, Dict

class ChartAnalyzer:
    @staticmethod
    def analyze(columns: List[str], rows: List[list]) -> Dict[str, str]:
        """
        Analyzes the execution result columns and rows to classify data types.
        Returns a dict mapping column name -> type (numeric, categorical, datetime, percentage, identifier).
        """
        schema = {}
        
        # If there are no rows, fallback to name-only heuristics
        sample_row = rows[0] if rows else [None] * len(columns)
        
        for idx, col in enumerate(columns):
            col_lower = col.lower()
            val = sample_row[idx]
            
            # 1. Identifier
            if col_lower == "id" or col_lower.endswith("_id") or col_lower.endswith("id"):
                schema[col] = "identifier"
                continue
                
            # 2. Percentage
            if "percent" in col_lower or "rate" in col_lower or "ratio" in col_lower:
                schema[col] = "percentage"
                continue
            if isinstance(val, float) and 0.0 <= val <= 1.0:
                # Potential percentage, but let's be careful. Let's just trust names primarily for percentage,
                # or if value is tightly bounded.
                pass
                
            # 3. Datetime
            if "date" in col_lower or "year" in col_lower or "month" in col_lower or "time" in col_lower or "day" in col_lower:
                schema[col] = "datetime"
                continue
            if isinstance(val, str):
                # ISO 8601 simple check
                if re.match(r"^\d{4}-\d{2}-\d{2}", val):
                    schema[col] = "datetime"
                    continue
                    
            # 4. Numeric
            numeric_keywords = ["salary", "price", "count", "amount", "total", "sum", "avg", "min", "max", "revenue", "age"]
            if any(kw in col_lower for kw in numeric_keywords):
                schema[col] = "numeric"
                continue
            if isinstance(val, (int, float)):
                schema[col] = "numeric"
                continue
                
            # 5. Categorical (fallback)
            schema[col] = "categorical"
            
        return schema
