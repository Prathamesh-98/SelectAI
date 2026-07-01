from datetime import date, datetime
import math

class ResultSerializer:
    """
    Serializes DuckDB execution results into a JSON-compatible format.
    """

    @staticmethod
    def serialize_duckdb_result(cursor) -> dict:
        """
        Extracts columns and rows from a DuckDB cursor and ensures all types
        are JSON serializable.
        """
        # Extract column names
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        
        # Extract all rows
        raw_rows = cursor.fetchall()
        
        serialized_rows = []
        for row in raw_rows:
            serialized_row = []
            for val in row:
                if val is None:
                    serialized_row.append(None)
                elif isinstance(val, (datetime, date)):
                    serialized_row.append(val.isoformat())
                elif isinstance(val, float):
                    if math.isnan(val) or math.isinf(val):
                        serialized_row.append(None)
                    else:
                        serialized_row.append(val)
                else:
                    # Ints, strings, booleans are generally fine
                    serialized_row.append(val)
            serialized_rows.append(serialized_row)
            
        return {
            "columns": columns,
            "rows": serialized_rows,
            "row_count": len(serialized_rows)
        }
