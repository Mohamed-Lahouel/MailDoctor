import pandas as pd
import re

def clean_csv_file(filepath: str, options: dict):
    df = pd.read_csv(filepath)
    if "email" not in df.columns:
        raise ValueError("CSV must contain 'email' column")

    df["original_email"] = df["email"]
    counters = {
        "empty_removed": 0,
        "spaces_trimmed": 0,
        "hidden_chars_removed": 0,
        "multiple_spaces_fixed": 0,
        "placeholders_removed": 0,
        "duplicates_removed": 0
    }

    # Remove empty rows
    if options.get("removeEmpty", True):
        before_empty = len(df)
        df = df.dropna(subset=["email"])
        counters["empty_removed"] += before_empty - len(df)

    # Clean emails
    def clean_email(email):
        if not isinstance(email, str):
            return None
        original_email = email

        if options.get("trimWhitespace", True):
            email = email.strip()
            if email != original_email:
                counters["spaces_trimmed"] += 1

        if options.get("stripHiddenChars", True):
            cleaned_email = re.sub(r"[\t\n\r\u00A0]", "", email)
            if cleaned_email != email:
                counters["hidden_chars_removed"] += 1
                email = cleaned_email

        if options.get("normalizeCase", True):
            email = email.lower()

        if options.get("fixMultipleSpaces", True):
            cleaned_email = re.sub(r"\s+", "", email)
            if cleaned_email != email:
                counters["multiple_spaces_fixed"] += 1
                email = cleaned_email

        if options.get("removePlaceholders", True):
            placeholders = ["noemail", "unknown", "n/a", "none", "null", "test@test.com"]
            if email in placeholders:
                counters["placeholders_removed"] += 1
                return None

        return email

    df["email"] = df["email"].apply(clean_email)
    df = df.dropna(subset=["email"])

    # Remove duplicates
    if options.get("removeDuplicates", True):
        before_dupes = len(df)
        df = df.drop_duplicates(subset=["email"])
        counters["duplicates_removed"] = before_dupes - len(df)

    return df, counters
