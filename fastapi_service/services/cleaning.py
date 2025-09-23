import pandas as pd
import re

def clean_csv_file(filepath: str, options: dict):
    df = pd.read_csv(filepath)
    
    if "email" not in df.columns:
        raise ValueError("CSV must contain 'email' column")

    df["original_email"] = df["email"]
    counters = {
        "empty_removed": 0,
        "spaces_fixed": 0,          # unified counter for all space fixes
        "hidden_chars_removed": 0,
        "placeholders_removed": 0,
        "duplicates_removed": 0,
        "case_normalized": 0
    }

    # Remove empty rows
    if options.get("removeEmpty", True):
        before_empty = len(df)
        df = df.dropna(subset=["email"])
        df = df[df["email"].str.strip() != ""]
        counters["empty_removed"] += before_empty - len(df)

    # Clean emails
    def clean_email(email):
        if not isinstance(email, str) or email.strip() == "":
            return None

        # Remove quotes
        email = email.strip('"').strip("'")

        # Trim leading/trailing whitespace
        if options.get("trimWhitespace", True):
            trimmed = email.strip()
            if trimmed != email:
                counters["spaces_fixed"] += 1
                email = trimmed

        # Remove hidden characters
        if options.get("stripHiddenChars", True):
            cleaned = re.sub(r"[\t\n\r\u00A0]", "", email)
            if cleaned != email:
                counters["hidden_chars_removed"] += 1
                email = cleaned

        # Lowercase
        if options.get("normalizeCase", True):
            lowered = email.lower()
            if lowered != email:
                counters["case_normalized"] += 1
                email = lowered

        # Fix multiple spaces in local part only
        if options.get("fixMultipleSpaces", True):
            local, sep, domain = email.partition('@')
            if sep == '@':  
                local_clean = re.sub(r"\s+", ".", local)
                if local_clean != local:
                    counters["spaces_fixed"] += 1
                    email = f"{local_clean}@{domain}"

        # Remove placeholders
        if options.get("removePlaceholders", True):
            placeholders = ["noemail", "unknown", "n/a", "none", "null", "test@test.com"]
            if email in placeholders:
                counters["placeholders_removed"] += 1
                return None

        return email if email != "" else None

    df["email"] = df["email"].apply(clean_email)
    df = df.dropna(subset=["email"])

    # Remove duplicates
    if options.get("removeDuplicates", True):
        before_dupes = len(df)
        df = df.drop_duplicates(subset=["email"])
        counters["duplicates_removed"] = before_dupes - len(df)

    return df, counters
