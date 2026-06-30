"""
API v1 router — aggregates all feature routers.

Add new feature routers here as they are implemented.

Usage (in main.py):
    from app.api.v1.router import api_router
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)
"""
from fastapi import APIRouter

api_router = APIRouter()

# ── Feature routers ───────────────────────────────────────────────────────────
from app.api.v1.endpoints import auth        # noqa: E402
from app.api.v1.endpoints import workspaces  # noqa: E402
# from app.api.v1.endpoints import users
# from app.api.v1.endpoints import datasets
# from app.api.v1.endpoints import sessions
# from app.api.v1.endpoints import queries
# from app.api.v1.endpoints import analytics

api_router.include_router(auth.router,       prefix="/auth",       tags=["Authentication"])
api_router.include_router(workspaces.router, prefix="/workspaces", tags=["Workspaces"])
# api_router.include_router(users.router,      prefix="/users",      tags=["Users"])
# api_router.include_router(datasets.router,   prefix="/datasets",   tags=["Datasets"])
# api_router.include_router(sessions.router,   prefix="/sessions",   tags=["Analysis Sessions"])
# api_router.include_router(queries.router,    prefix="/queries",    tags=["Query Library"])
# api_router.include_router(analytics.router,  prefix="/analytics",  tags=["Analytics"])
