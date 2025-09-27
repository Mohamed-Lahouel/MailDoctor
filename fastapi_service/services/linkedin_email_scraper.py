# services/linkedin_email_scraper.py
from fastapi import APIRouter
from pydantic import BaseModel
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import time, re

# ---------------- Constants ---------------- #
EMAIL_REGEX = r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"
PAGE_WAIT = 4

# ---------------- Pydantic Model ---------------- #
class ProfileURL(BaseModel):
    profile_url: str

# ---------------- Helper Functions ---------------- #
def extract_emails_from_html(html: str):
    soup = BeautifulSoup(html, "html.parser")
    emails = []

    # Extract mailto links
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.lower().startswith("mailto:"):
            emails.append(href.split("mailto:")[1].split("?")[0])

    # Extract emails from text
    text = soup.get_text(" ", strip=True)
    found = re.findall(EMAIL_REGEX, text)
    emails.extend(found)

    # Deduplicate
    seen = set(); out = []
    for e in emails:
        if e not in seen:
            seen.add(e); out.append(e)
    return out

def fetch_linkedin_emails(profile_url: str, visit_external: bool = True):
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")          # run Chrome without UI
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--start-maximized")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)

    try:
        driver.get(profile_url)
        time.sleep(PAGE_WAIT)

        # Click "Contact info" if exists
        try:
            contact_btn = driver.find_element(By.XPATH, "//a[@data-control-name='contact_see_more']")
            contact_btn.click()
            time.sleep(2)
        except Exception:
            pass

        html = driver.page_source
        emails = extract_emails_from_html(html)

        # Visit external links if enabled
        if visit_external:
            soup = BeautifulSoup(html, "html.parser")
            links = [
                urljoin(profile_url, a['href'])
                for a in soup.find_all('a', href=True)
                if 'linkedin.com' not in a['href'] and a['href'].startswith('http')
            ]
            for site in links:
                driver.get(site)
                time.sleep(PAGE_WAIT)
                emails.extend(extract_emails_from_html(driver.page_source))

        # Deduplicate final list
        return list(dict.fromkeys(emails))
    finally:
        driver.quit()

# ---------------- FastAPI Router ---------------- #
router = APIRouter()

@router.post("/find-linkedin-email")
async def get_linkedin_email(data: ProfileURL):
    """
    POST endpoint that accepts a JSON with a LinkedIn profile URL and returns a list of emails found.
    """
    try:
        emails = fetch_linkedin_emails(data.profile_url)
        if emails:
            return {"success": True, "emails": emails}
        else:
            return {"success": False, "emails": [], "error": "No emails found"}
    except Exception as e:
        return {"success": False, "emails": [], "error": str(e)}
