import asyncio
import uuid
from app.database.session import get_db
from app.services.saved_queries.saved_query_service import SavedQueryService
from app.schemas.saved_query import SavedQueryCreate

async def main():
    async for db in get_db():
        service = SavedQueryService(db)
        
        sq = SavedQueryCreate(
            workspace_id=uuid.UUID("dc59fd6b-75c0-46c4-83f4-12041e87579f"),
            user_prompt="Show average salary",
            generated_sql="SELECT department, AVG(salary) FROM employees GROUP BY department;",
            name="Avg Salary",
            tags=["hr"]
        )
        
        try:
            res = await service.create_saved_query(sq, "93ef5099-2a91-4da2-817d-2b47c0b05b38")
            print("Success!", res.id)
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
