"""
AI prompt templates.

Each module in this package contains prompt strings or builder functions
for a specific AI task (SQL generation, insight extraction, anomaly detection, etc.).

Conventions:
  - Prompts are plain strings or f-string builders — no business logic here.
  - System prompts are prefixed with ``SYSTEM_``.
  - User prompt builders are suffixed with ``_prompt``.

Example:
    from app.prompts.sql_generation import SYSTEM_SQL_EXPERT, build_sql_generation_prompt
"""
