# services/validation.py
import pandas as pd
import re
import dns.resolver
import smtplib
from email.utils import parseaddr
import time

# -----------------------------
# Syntax Check
# -----------------------------
def check_syntax(email: str):
    """Check if email has valid syntax using regex."""
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if not re.match(email_regex, email):
        return False, "Invalid syntax"
    return True, "Valid syntax"

# -----------------------------
# Domain Check
# -----------------------------
def check_domain(email: str):
    """Check if email's domain has MX records with retries and fallback."""
    _, email_address = parseaddr(email)
    if not email_address or '@' not in email_address:
        return False, "Invalid syntax (no domain)", None

    domain = email_address.split('@')[1]
    resolver = dns.resolver.Resolver()
    resolver.nameservers = ['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1', '9.9.9.9']  # Google, Cloudflare, Quad9
    resolver.timeout = 5
    resolver.lifetime = 10

    for attempt in range(1, 4):
        try:
            mx_records = resolver.resolve(domain, 'MX')
            if mx_records:
                return True, "Valid domain", mx_records
            return False, "Domain not found (no MX records)", None
        except dns.resolver.NXDOMAIN:
            try:
                # Fallback to A record
                a_records = resolver.resolve(domain, 'A')
                if a_records:
                    return False, "Domain exists but no MX records", None
            except Exception:
                return False, "Domain not found", None
        except dns.resolver.NoAnswer:
            return False, "Domain has no MX records", None
        except dns.resolver.Timeout:
            if attempt == 3:
                return False, "DNS check failed: Timeout", None
            time.sleep(1)
        except Exception as e:
            return False, f"DNS check failed: {str(e)}", None

# -----------------------------
# SMTP Check
# -----------------------------
def check_smtp(email: str, mx_records):
    """Check if SMTP server accepts the email address."""
    try:
        mx_record = sorted(mx_records, key=lambda r: r.preference)[0]
        mx_host = str(mx_record.exchange).rstrip('.')
        with smtplib.SMTP(mx_host, 25, timeout=10) as server:
            server.ehlo_or_helo_if_needed()
            server.mail('noreply@mydomain.com')
            code, _ = server.rcpt(email)
            if code in (250, 251):
                return True, "SMTP check passed"
            return False, f"SMTP check failed (code {code})"
    except Exception as e:
        return False, f"SMTP check failed: {str(e)}"

# -----------------------------
# CSV Validation
# -----------------------------
def validate_csv_file(filepath: str, options: dict):
    """
    Validate emails in a CSV while preserving original_email column.
    Returns a DataFrame with: email, original_email, valid, reason
    """
    df = pd.read_csv(filepath)
    if "email" not in df.columns:
        raise ValueError("CSV must contain 'email' column")

    # Ensure original_email exists
    if "original_email" not in df.columns:
        df["original_email"] = df["email"]

    counters = {
        "total": 0,
        "valid": 0,
        "risky": 0,
        "invalid": 0
    }

    results = []
    for idx, row in df.iterrows():
        email = row["email"]
        original_email = row["original_email"]
        counters["total"] += 1
        is_valid = True
        reason_list = []

        # Syntax check
        if options.get("syntax", True):
            valid_syntax, reason = check_syntax(email)
            if not valid_syntax:
                is_valid = False
            reason_list.append(reason)

        # Domain check
        mx_records = None
        if is_valid and options.get("domain", True):
            valid_domain, reason, mx_records = check_domain(email)
            if not valid_domain:
                is_valid = False
            reason_list.append(reason)

        # SMTP check
        if is_valid and options.get("smtp", False) and mx_records:
            valid_smtp, reason = check_smtp(email, mx_records)
            if not valid_smtp:
                is_valid = False
            reason_list.append(reason)

        # Update counters
        if is_valid:
            counters["valid"] += 1
        elif "Invalid" in reason_list[0] or "not found" in reason_list[0]:
            counters["invalid"] += 1
        else:
            counters["risky"] += 1

        results.append({
            "email": email,
            "original_email": original_email,
            "valid": is_valid,
            "reason": "; ".join(reason_list)
        })

    results_df = pd.DataFrame(results)
    return results_df, counters
