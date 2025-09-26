from fastapi import APIRouter
import httpx

router = APIRouter()

# 🔑 Directly use your API key
APIFY_API_KEY = "apify_api_0SkzcV25yDrHubzLsHGjnfrZrg2J713XfJMK"

@router.post("/find-linkedin")
async def find_linkedin(payload: dict):
    search = payload.get("queries", "").strip()
    if not search:
        return {"results": [], "error": "Search term is empty."}

    # Endpoint that returns dataset items directly
    url = f"https://api.apify.com/v2/acts/anchor~LinkedIn-people-finder/run-sync-get-dataset-items?token={APIFY_API_KEY}"
    body = {"first": False, "queries": search, "lang": ""}

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=body)
            if response.status_code not in [200, 201]:
                return {"results": [], "error": f"Apify request failed with status {response.status_code}"}

            try:
                items = response.json()  # dataset items list
            except ValueError:
                items = []

            if not items:
                return {"results": [], "error": "No LinkedIn profiles found."}

            # Map items to your Angular UI
            results = [
                {
                    "url": item.get("linkedinUrl"),
                    "info": item.get("info"),
                    "mySearch": item.get("mySearch"),
                    "rank": item.get("rank")
                }
                for item in items if item.get("linkedinUrl")
            ]

            return {"results": results}

    except httpx.ReadTimeout:
        return {"results": [], "error": "Request timed out. Actor may take longer to respond."}
    except Exception as e:
        return {"results": [], "error": str(e)}
