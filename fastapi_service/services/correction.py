import pandas as pd
import difflib

# Known domains (expandable)
known_domains = [
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com",
    "icloud.com", "protonmail.com", "zoho.com", "yandex.com", "gmx.com",
    "esprit.tn", "harvard.edu", "stanford.edu", "mit.edu", "ox.ac.uk",
    "cam.ac.uk", "umich.edu", "utoronto.ca", "unimelb.edu.au",
    "mail.ru", "qq.com", "163.com", "126.com", "sina.com",
    "orange.fr", "free.fr", "live.com", "btinternet.com", "comcast.net"
]

def correct_domain_auto(email, cutoff=0.7):
    if "@" not in email:
        return email
    local, domain = email.split("@", 1)
    closest = difflib.get_close_matches(domain.lower(), known_domains, n=1, cutoff=cutoff)
    corrected = closest[0] if closest else domain
    return f"{local}@{corrected}"

def correct_invalid_domains(filepath: str):
    df = pd.read_csv(filepath)

    if "original_email" not in df.columns:
        df["original_email"] = df["email"]

    if "reason" not in df.columns:
        raise ValueError("CSV must contain 'reason' column from validation output")

    corrected_emails = []
    corrections_count = 0

    for _, row in df.iterrows():
        email = row["email"]
        reason = row["reason"]

        if "Domain" in reason or "MX" in reason or "not found" in reason:
            corrected_email = correct_domain_auto(email)
            if corrected_email != email:
                corrections_count += 1
            corrected_emails.append(corrected_email)
        else:
            corrected_emails.append(email)

    df["email"] = corrected_emails
    return df, corrections_count

