import re
import duckdb
import logging
from typing import Sequence
from contextlib import contextmanager
from app.models.dataset import Dataset

logger = logging.getLogger(__name__)

class DuckDBManager:
    """
    Manages DuckDB in-memory connections and dataset registration.
    """

    @staticmethod
    def sanitize_table_name(name: str) -> str:
        """
        Convert a filename like 'employees_sample.csv' to a valid SQL identifier
        like 'employees_sample_csv'.
        """
        # Replace non-alphanumeric characters with underscores
        clean = re.sub(r'[^a-zA-Z0-9]', '_', name)
        # Ensure it doesn't start with a number
        if clean and clean[0].isdigit():
            clean = f"t_{clean}"
        return clean.lower()

    @staticmethod
    @contextmanager
    def get_connection(datasets: Sequence[Dataset]):
        """
        Yields a fresh DuckDB connection with the given datasets registered as views.
        """
        conn = duckdb.connect(database=":memory:")
        try:
            for ds in datasets:
                if not ds.storage_key:
                    logger.warning(f"Dataset {ds.name} has no storage_key, skipping DuckDB registration")
                    continue
                
                table_name = DuckDBManager.sanitize_table_name(ds.name)
                
                # DuckDB read_csv_auto works beautifully with absolute paths
                try:
                    conn.execute(f"CREATE VIEW {table_name} AS SELECT * FROM read_csv_auto('{ds.storage_key}')")
                    logger.info(f"Registered view {table_name} for dataset {ds.name}")
                except Exception as e:
                    logger.error(f"Failed to register dataset {ds.name} in DuckDB: {str(e)}")
                    # We continue to let other datasets register
            yield conn
        finally:
            conn.close()
