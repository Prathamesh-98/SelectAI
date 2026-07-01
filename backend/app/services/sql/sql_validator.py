import sqlglot
from dataclasses import dataclass
from typing import Optional

@dataclass
class SQLValidationResult:
    is_valid: bool
    error: Optional[str]
    normalized_sql: str
    detected_statement: Optional[str] = None

class SQLValidator:
    """
    Validates SQL queries strictly for analytical (read-only) operations.
    """
    
    @staticmethod
    def validate(sql: str) -> SQLValidationResult:
        if not sql or not sql.strip():
            return SQLValidationResult(False, "Empty SQL query", "")
            
        try:
            expressions = sqlglot.parse(sql)
        except sqlglot.errors.ParseError as e:
            return SQLValidationResult(False, f"Syntax Error: {str(e)}", sql)
            
        if not expressions:
            return SQLValidationResult(False, "No valid SQL statements found", sql)
            
        if len(expressions) > 1:
            return SQLValidationResult(False, "Multiple statements separated by semicolons are not allowed", sql)
            
        expr = expressions[0]
        if not expr:
            return SQLValidationResult(False, "Invalid SQL statement", sql)
            
        detected = type(expr).__name__.upper()
        
        # 1. Reject comments
        if any(getattr(node, 'comments', None) for node in expr.walk()):
            return SQLValidationResult(False, "Comments are not allowed in the SQL query", sql, detected_statement=detected)
            
        # 2. Must be SELECT (or UNION which parses as Union but behaves like Select)
        if not isinstance(expr, (sqlglot.exp.Select, sqlglot.exp.Union)):
            return SQLValidationResult(
                False, 
                f"Only SELECT queries are allowed. Detected: {detected}", 
                sql, 
                detected_statement=detected
            )
            
        # 3. Explicitly reject SELECT INTO
        if list(expr.find_all(sqlglot.exp.Into)):
            return SQLValidationResult(
                False, 
                "SELECT ... INTO is not allowed as it modifies schema", 
                sql, 
                detected_statement=detected
            )
            
        # 4. Explicitly reject banned keywords nested within
        banned_types = (
            sqlglot.exp.Insert,
            sqlglot.exp.Update,
            sqlglot.exp.Delete,
            sqlglot.exp.Drop,
            sqlglot.exp.Alter,
            sqlglot.exp.Command,
            sqlglot.exp.Create,
            sqlglot.exp.Merge
        )
        for banned in banned_types:
            if list(expr.find_all(banned)):
                return SQLValidationResult(
                    False, 
                    f"Malicious keyword detected within query: {banned.__name__.upper()}", 
                    sql, 
                    detected_statement=detected
                )
                
        # 5. Normalize SQL (Postgres dialect preferred for generic use)
        try:
            normalized_sql = expr.sql(dialect="postgres", pretty=True)
        except Exception:
            normalized_sql = sql.strip()
            
        return SQLValidationResult(True, None, normalized_sql, detected_statement=detected)
