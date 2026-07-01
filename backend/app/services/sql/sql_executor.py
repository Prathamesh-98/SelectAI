import time
import logging
import duckdb
from typing import Sequence, Tuple
from app.models.dataset import Dataset
from app.services.sql.duckdb_manager import DuckDBManager
from app.services.sql.result_serializer import ResultSerializer

logger = logging.getLogger(__name__)

class SQLExecutor:
    """
    Executes validated SQL against in-memory DuckDB datasets.
    """

    @staticmethod
    def execute(sql: str, datasets: Sequence[Dataset]) -> Tuple[dict, int]:
        """
        Executes a SQL query and returns (execution_result, execution_time_ms).
        If an error occurs during execution, the result will contain an 'error' key.
        """
        start_time = time.perf_counter()
        result = None
        
        try:
            with DuckDBManager.get_connection(datasets) as conn:
                logger.info(f"Executing SQL in DuckDB: {sql}")
                cursor = conn.execute(sql)
                result = ResultSerializer.serialize_duckdb_result(cursor)
                
        except duckdb.Error as e:
            logger.error(f"DuckDB execution error: {str(e)}")
            result = {
                "error": f"Execution failed: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Unexpected execution error: {str(e)}")
            result = {
                "error": "An unexpected error occurred during execution."
            }
            
        execution_time_ms = int((time.perf_counter() - start_time) * 1000)
        
        return result, execution_time_ms
