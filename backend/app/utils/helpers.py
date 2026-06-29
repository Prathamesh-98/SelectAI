"""
Shared helper utilities.

Keep functions here pure and dependency-free (no imports from app.core, app.database, etc.)
so this module can be imported anywhere without triggering circular imports.
"""
import math
import uuid
from datetime import datetime, timezone


def generate_uuid() -> str:
    """Return a new UUID4 as a lowercase string."""
    return str(uuid.uuid4())


def utcnow() -> datetime:
    """Return the current UTC datetime (timezone-aware)."""
    return datetime.now(timezone.utc)


def paginate(*, total: int, page: int, page_size: int) -> dict:
    """
    Compute pagination metadata.

    Args:
        total:     Total number of records matching the query.
        page:      Current page number (1-indexed).
        page_size: Number of records per page.

    Returns:
        A dict with ``total``, ``page``, ``page_size``, ``pages``, ``has_next``, ``has_previous``.
    """
    pages = math.ceil(total / page_size) if page_size > 0 else 0
    return {
        "total":        total,
        "page":         page,
        "page_size":    page_size,
        "pages":        pages,
        "has_next":     page < pages,
        "has_previous": page > 1,
    }


def slugify(text: str, max_length: int = 64) -> str:
    """
    Convert a string to a URL-safe slug.

    Example:
        slugify("Q2 Sales Deep Dive!") → "q2-sales-deep-dive"
    """
    import re
    slug = text.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    slug = re.sub(r"-+", "-", slug).strip("-")
    return slug[:max_length]
