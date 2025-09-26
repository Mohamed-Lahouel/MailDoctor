from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv   # ✅ Add this line
load_dotenv(dotenv_path="../backend/.env")  # adjust path if needed

# Import your existing services
from services.cleaning import clean_csv_file
from services.validation import validate_csv_file
from services.correction import correct_invalid_domains

# ✅ Import the new Apify LinkedIn service router
from services import apify_service


app = FastAPI()

# Allow CORS for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # in production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path for uploads (PHP backend writes files here too)
UPLOAD_DIR = "../backend/uploads"


# ---------------- CSV Endpoints ---------------- #

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


@app.post("/validate_csv")
async def validate_csv(
    filename: str = Form(...),
    syntax: str = Form("true"),
    domain: str = Form("true"),
    smtp: str = Form("false")
):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        return {"success": False, "error": "File not found"}

    options = {
        "syntax": syntax.lower() == "true",
        "domain": domain.lower() == "true",
        "smtp": smtp.lower() == "true"
    }

    df, counters = validate_csv_file(filepath, options)
    validated_filename = f"validated_{filename}"
    df.to_csv(os.path.join(UPLOAD_DIR, validated_filename), index=False)

    return {
        "success": True,
        "validatedFile": validated_filename,
        "counters": counters
    }


@app.post("/correct_csv")
async def correct_csv(filename: str = Form(...)):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        return {"success": False, "error": "File not found"}

    try:
        corrected_df, count = correct_invalid_domains(filepath)
        corrected_filename = f"corrected_{filename}"
        corrected_path = os.path.join(UPLOAD_DIR, corrected_filename)
        corrected_df.to_csv(corrected_path, index=False)

        return {
            "success": True,
            "correctedFile": corrected_filename,
            "correctionsCount": count
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


# ---------------- Apify LinkedIn Endpoint ---------------- #

# ✅ Include the Apify router here
app.include_router(apify_service.router, prefix="/api")
