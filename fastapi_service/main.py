from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
import os
from services.cleaning import clean_csv_file

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "../backend/uploads"

@app.post("/clean_csv")
async def clean_csv(
    filename: str = Form(...),
    removeEmpty: str = Form("true"),
    trimWhitespace: str = Form("true"),
    normalizeCase: str = Form("true"),
    removePlaceholders: str = Form("true"),
    removeDuplicates: str = Form("true"),
):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        return {"success": False, "error": "File not found"}

    # Convert string "true"/"false" to boolean
    options = {
        "removeEmpty": removeEmpty.lower() == "true",
        "trimWhitespace": trimWhitespace.lower() == "true",
        "normalizeCase": normalizeCase.lower() == "true",
        "removePlaceholders": removePlaceholders.lower() == "true",
        "removeDuplicates": removeDuplicates.lower() == "true"
    }

    df, counters = clean_csv_file(filepath, options)

    cleaned_filename = f"cleaned_{filename}"
    cleaned_path = os.path.join(UPLOAD_DIR, cleaned_filename)
    df.to_csv(cleaned_path, index=False)

    return {
        "success": True,
        "cleanedFile": cleaned_filename,
        "rows_final": len(df),
        "counters": counters
    }
