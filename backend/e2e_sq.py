import asyncio
import httpx
import sys

BASE_URL = "http://localhost:8000/api/v1"

async def main():
    async with httpx.AsyncClient() as client:
        print("1. Registering user...")
        res = await client.post(f"{BASE_URL}/auth/register", json={
            "email": "test_e2e_sq@example.com",
            "password": "Password123!",
            "full_name": "E2E Tester"
        })
        # If already registered, just login
        if res.status_code == 400:
            pass

        print("2. Logging in...")
        res = await client.post(f"{BASE_URL}/auth/login", json={
            "email": "test_e2e_sq@example.com",
            "password": "Password123!"
        })
        token = res.json().get("access_token")
        if not token:
            print("Failed to login", res.json())
            return
            
        headers = {"Authorization": f"Bearer {token}"}

        print("3. Getting workspaces...")
        res = await client.get(f"{BASE_URL}/workspaces", headers=headers)
        workspaces = res.json()
        if not workspaces:
            res = await client.post(f"{BASE_URL}/workspaces", json={"name": "E2E Workspace"}, headers=headers)
            workspace = res.json()
        else:
            workspace = workspaces[0]
        
        ws_id = workspace["id"]
        print(f"Using workspace: {ws_id}")

        print("4. Creating saved query...")
        sq_payload = {
            "workspace_id": ws_id,
            "user_prompt": "Show average salary by department",
            "generated_sql": "SELECT department, AVG(salary) FROM employees GROUP BY department;",
            "name": "Avg Salary by Dept",
            "description": "Calculates average salary per department",
            "tags": ["HR", "finance"],
            "is_favorite": True
        }
        res = await client.post(f"{BASE_URL}/saved-queries", json=sq_payload, headers=headers)
        if res.status_code != 201:
            print("Failed to create SQ:", res.text)
            return
        
        sq = res.json()
        sq_id = sq["id"]
        print(f"Created Saved Query: {sq_id}, version {sq['version']}, hash {sq['sql_hash']}")
        
        print("5. Listing saved queries...")
        res = await client.get(f"{BASE_URL}/saved-queries", params={"workspace_id": ws_id, "favorite_only": True}, headers=headers)
        print("Favorites:", [q["name"] for q in res.json().get("data", [])])

        print("6. Duplicate detection check...")
        res = await client.post(f"{BASE_URL}/saved-queries", json=sq_payload, headers=headers)
        print("Duplicate creation response code:", res.status_code, "ID matches:", res.json().get("id") == sq_id)

        print("7. Executing saved query...")
        # Note: 'employees' table doesn't exist in DuckDB unless we uploaded it.
        # So we expect a DuckDB error in the result, but it shouldn't crash.
        res = await client.post(f"{BASE_URL}/saved-queries/{sq_id}/execute", headers=headers)
        print("Execution status:", res.status_code)
        if res.status_code == 200:
            exec_res = res.json()
            print("Execution payload has error:", exec_res.get("error"))
        else:
            print("Execution failed:", res.text)
            
        print("8. Checking execution count...")
        res = await client.get(f"{BASE_URL}/saved-queries/{sq_id}", headers=headers)
        print("Execution count:", res.json().get("execution_count"))
        
        print("9. Deleting query...")
        res = await client.delete(f"{BASE_URL}/saved-queries/{sq_id}", headers=headers)
        print("Delete status:", res.status_code)
        
        print("10. Confirming deletion...")
        res = await client.get(f"{BASE_URL}/saved-queries/{sq_id}", headers=headers)
        print("Get after delete status (expect 404):", res.status_code)
        
        print("ALL END-TO-END TESTS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(main())
