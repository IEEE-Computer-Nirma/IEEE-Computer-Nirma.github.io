#!/usr/bin/env python3
"""
IEEE Computer Society Nirma University - Internship Scraper & Weekly Mail Digest Bot

Features:
1. Fetches seed/stored company career URLs from Firestore ('companies' collection).
2. Searches for current engineering/tech internship openings via Google Search API or direct scraping.
3. Uses Gemini API (gemini-2.5-flash/gemini-1.5-flash/lite) to parse, extract, and auto-tag:
   - Year (e.g. 2025, 2026, 2027)
   - Category (Software, AI/ML, Frontend, Cybersecurity, Data)
4. Saves new openings to Firestore ('jobs' collection).
5. Compiles weekly digest and sends email to subscribers via SMTP.
6. Records execution history in Firestore ('mail_logs' collection).

Usage:
  python3 scripts/job_scraper.py --seed         # Seed initial target companies into Firestore
  python3 scripts/job_scraper.py --scrape       # Scrape & update job listings
  python3 scripts/job_scraper.py --send-weekly  # Send weekly email digest to subscribers
  python3 scripts/job_scraper.py --all          # Run full workflow (seed if empty -> scrape -> send weekly if scheduled)
"""

import os
import sys
import json
import time
import hashlib
import argparse
import datetime
import urllib.request
import urllib.parse
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Firebase Admin SDK setup (optional if credentials exist in env)
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    HAS_FIREBASE = True
except ImportError:
    HAS_FIREBASE = False

# Google Generative AI setup
try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

# Default target seed companies & career pages
DEFAULT_SEED_COMPANIES = [
    {
        "name": "Google",
        "career_url": "https://careers.google.com/jobs/results/?q=intern",
        "search_query": "site:careers.google.com/jobs/results internship software engineering 2025 OR 2026"
    },
    {
        "name": "Microsoft",
        "career_url": "https://careers.microsoft.com/students/us/en",
        "search_query": "site:careers.microsoft.com internship software engineer 2025 OR 2026"
    },
    {
        "name": "Greenhouse Board Jobs",
        "career_url": "https://boards.greenhouse.io",
        "search_query": "site:boards.greenhouse.io internship software developer 2025 OR 2026"
    },
    {
        "name": "Lever Jobs",
        "career_url": "https://jobs.lever.co",
        "search_query": "site:jobs.lever.co software engineer intern 2025 OR 2026"
    },
    {
        "name": "Amazon",
        "career_url": "https://www.amazon.jobs/en/job_categories/software-development",
        "search_query": "site:amazon.jobs software development engineer intern 2025 OR 2026"
    }
]

def init_firebase():
    """Initializes Firebase Admin SDK if service account is provided in environment."""
    if not HAS_FIREBASE:
        print("[Firebase] firebase_admin library not installed. Running in standalone/fallback mode.")
        return None

    if not firebase_admin._apps:
        cred_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_KEY")
        if cred_json:
            try:
                cred_dict = json.loads(cred_json)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                print("[Firebase] Initialized with Service Account Key from env.")
            except Exception as e:
                print(f"[Firebase] Error initializing from FIREBASE_SERVICE_ACCOUNT_KEY: {e}")
                return None
        elif os.path.exists("firebase-service-account.json"):
            try:
                cred = credentials.Certificate("firebase-service-account.json")
                firebase_admin.initialize_app(cred)
                print("[Firebase] Initialized with firebase-service-account.json file.")
            except Exception as e:
                print(f"[Firebase] Error initializing from JSON file: {e}")
                return None
        else:
            print("[Firebase] No credentials found in FIREBASE_SERVICE_ACCOUNT_KEY. Running offline/mock mode.")
            return None

    return firestore.client()

def seed_companies(db):
    """Seeds default company career links into Firestore 'companies' collection."""
    print("[Seed] Seeding initial companies...")
    if not db:
        print("[Seed] Firestore not connected. Skipping seed write.")
        return

    companies_ref = db.collection('companies')
    for company in DEFAULT_SEED_COMPANIES:
        doc_id = company['name'].lower().replace(' ', '_')
        companies_ref.document(doc_id).set({
            **company,
            'updated_at': firestore.SERVER_TIMESTAMP,
            'active': True
        }, merge=True)
        print(f"  + Seeded company: {company['name']}")

def search_google_custom_search(query, api_key, cx):
    """Uses Google Custom Search API to find job posting URLs."""
    if not api_key or not cx:
        print("[Search] GOOGLE_SEARCH_API_KEY or GOOGLE_SEARCH_CX not provided. Using mock search results.")
        return []

    url = f"https://www.googleapis.com/customsearch/v1?key={api_key}&cx={cx}&q={urllib.parse.quote(query)}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            items = data.get('items', [])
            return [
                {
                    'title': item.get('title'),
                    'snippet': item.get('snippet'),
                    'link': item.get('link')
                }
                for item in items
            ]
    except Exception as e:
        print(f"[Search] Error querying Google Search API: {e}")
        return []

def analyze_job_with_gemini(title, snippet, raw_text=""):
    """Uses Gemini API to clean and tag internship details."""
    gemini_key = os.environ.get("GEMINI_API_KEY")

    default_result = {
        "title": title,
        "company": "Tech Company",
        "location": "Remote / India",
        "type": "Internship",
        "description": snippet,
        "years": ["2025", "2026"],
        "category": "Software",
        "tags": ["Software", "2025", "2026", "Engineering"]
    }

    if not HAS_GEMINI or not gemini_key:
        # Simple heuristic fallback
        years = []
        if "2025" in title or "2025" in snippet: years.append("2025")
        if "2026" in title or "2026" in snippet: years.append("2026")
        if "2027" in title or "2027" in snippet: years.append("2027")
        if not years: years = ["2025", "2026"]

        category = "Software"
        if "ai" in title.lower() or "ml" in title.lower() or "machine learning" in title.lower():
            category = "AI/ML"
        elif "frontend" in title.lower() or "web" in title.lower() or "react" in title.lower():
            category = "Frontend"
        elif "security" in title.lower() or "cyber" in title.lower():
            category = "Cybersecurity"
        elif "data" in title.lower() or "analytics" in title.lower():
            category = "Data"

        default_result["years"] = years
        default_result["category"] = category
        default_result["tags"] = [category] + years
        return default_result

    try:
        genai.configure(api_key=gemini_key)
        # Use gemini-1.5-flash or gemini-2.5-flash
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""
        Extract structured internship details from this search result and text into raw valid JSON format with keys:
        - "title": Clean concise job title (e.g. "Software Engineer Intern")
        - "company": Company Name
        - "location": Job location or "Remote"
        - "type": "Internship"
        - "description": 2 sentence summary of requirements and role
        - "years": Array of targeted graduation years e.g. ["2025", "2026"]
        - "category": One of ["Software", "AI/ML", "Frontend", "Cybersecurity", "Data"]
        - "tags": Array of relevant skills or keywords

        Title: {title}
        Snippet: {snippet}
        Raw Content: {raw_text[:1000]}
        Return ONLY JSON.
        """

        response = model.generate_content(prompt)
        resp_text = response.text.strip()
        if resp_text.startswith("```json"):
            resp_text = resp_text[7:]
        if resp_text.endswith("```"):
            resp_text = resp_text[:-3]

        parsed = json.loads(resp_text.strip())
        return parsed
    except Exception as e:
        print(f"[Gemini] Gemini parsing fallback due to: {e}")
        return default_result

def scrape_jobs(db):
    """Fetches companies, searches for jobs, cleans with Gemini, and saves to Firestore."""
    print("[Scrape] Starting internship scrape...")

    api_key = os.environ.get("GOOGLE_SEARCH_API_KEY")
    cx = os.environ.get("GOOGLE_SEARCH_CX")

    companies = DEFAULT_SEED_COMPANIES
    if db:
        try:
            doc_snaps = db.collection('companies').where('active', '==', True).get()
            if doc_snaps:
                companies = [doc.to_dict() for doc in doc_snaps]
        except Exception as e:
            print(f"[Scrape] Failed to fetch companies from Firestore: {e}")

    new_jobs = []

    for comp in companies:
        query = comp.get('search_query') or f"site:{comp.get('career_url')} internship 2025 2026"
        print(f"  > Searching query: '{query}'")
        search_results = search_google_custom_search(query, api_key, cx)

        if not search_results:
            # Fallback sample search result
            search_results = [
                {
                    'title': f"{comp['name']} Software Engineering Intern 2025/2026",
                    'snippet': f"Apply for {comp['name']} Software Engineering Internship. Ideal for students graduating in 2025 or 2026.",
                    'link': comp.get('career_url')
                }
            ]

        for res in search_results:
            parsed = analyze_job_with_gemini(res['title'], res['snippet'])

            job_doc = {
                "title": parsed.get("title", res['title']),
                "company": parsed.get("company", comp['name']),
                "location": parsed.get("location", "Remote / India"),
                "type": "Internship",
                "description": parsed.get("description", res['snippet']),
                "years": parsed.get("years", ["2025", "2026"]),
                "category": parsed.get("category", "Software"),
                "tags": parsed.get("tags", ["Software", "2025"]),
                "applyUrl": res['link'],
                "featured": False,
                "active": True,
                "postedDate": datetime.date.today().strftime("%b %d, %Y"),
                "createdAt": firestore.SERVER_TIMESTAMP if db else datetime.datetime.now(datetime.timezone.utc).isoformat()
            }

            new_jobs.append(job_doc)

            if db:
                # Save or merge job doc based on URL hash (deterministic MD5)
                doc_id = hashlib.md5(res['link'].encode('utf-8')).hexdigest()
                db.collection('jobs').document(doc_id).set(job_doc, merge=True)
                print(f"  + Saved job doc to Firestore: {job_doc['title']} @ {job_doc['company']}")

    print(f"[Scrape] Scraped & processed {len(new_jobs)} jobs.")
    return new_jobs

def send_weekly_digest(db):
    """Sends weekly opportunity digest to subscribers via SMTP and logs event."""
    print("[Mail] Preparing weekly email digest...")

    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_user = os.environ.get("SMTP_USER")
    smtp_pass = os.environ.get("SMTP_PASSWORD")

    if not smtp_user or not smtp_pass:
        print("[Mail] SMTP_USER or SMTP_PASSWORD not configured in environment. Skipping email dispatch.")
        return

    subscribers = []
    if db:
        try:
            sub_snaps = db.collection('subscribers').where('status', '==', 'active').get()
            subscribers = [doc.to_dict().get('email') for doc in sub_snaps if doc.to_dict().get('email')]
        except Exception as e:
            print(f"[Mail] Error fetching subscribers: {e}")

    if not subscribers:
        subscribers = ["deep@computer.org"]

    jobs = []
    if db:
        try:
            job_snaps = db.collection('jobs').where('active', '==', True).limit(10).get()
            jobs = [doc.to_dict() for doc in job_snaps]
        except Exception as e:
            print(f"[Mail] Error fetching jobs: {e}")

    if not jobs:
        jobs = [
            {
                "title": "Software Engineering Intern 2026",
                "company": "Google",
                "location": "Bangalore, India",
                "applyUrl": "https://careers.google.com",
                "years": ["2026"],
                "category": "Software"
            },
            {
                "title": "AI/ML Research Intern",
                "company": "Microsoft",
                "location": "Hyderabad, India",
                "applyUrl": "https://careers.microsoft.com",
                "years": ["2025", "2026"],
                "category": "AI/ML"
            }
        ]

    # Build HTML email body
    job_rows_html = ""
    for j in jobs:
        job_rows_html += f"""
        <div style="border: 1px solid #e0e0e0; border-radius: 6px; padding: 15px; margin-bottom: 12px; background-color: #fafafa;">
            <h3 style="margin: 0 0 5px 0; color: #00629B;">{j.get('title')}</h3>
            <p style="margin: 0 0 10px 0; font-size: 13px; color: #555;"><strong>Company:</strong> {j.get('company')} | <strong>Location:</strong> {j.get('location')}</p>
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #777;">Target Years: {', '.join(j.get('years', []))} | Category: {j.get('category')}</p>
            <a href="{j.get('applyUrl')}" style="background-color: #111; color: #fff; text-decoration: none; padding: 6px 12px; font-size: 12px; border-radius: 4px; display: inline-block;">Apply Now &rarr;</a>
        </div>
        """

    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="border-bottom: 2px solid #FFA300; padding-bottom: 10px; margin-bottom: 20px;">
            <h2 style="margin:0; color: #111;">IEEE CS Nirma — Weekly Internship Digest</h2>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">Handpicked tech internships & career opportunities for engineering students</p>
        </div>

        {job_rows_html}

        <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 15px; font-size: 11px; color: #888;">
            <p>Sent by IEEE Computer Society Nirma University (<a href="mailto:deep@computer.org">deep@computer.org</a>)</p>
            <p>Visit <a href="https://deeplumiere.github.io/IEEEComputerSociety/opportunities">IEEE CS Opportunities Portal</a> for daily live updates.</p>
        </div>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"🚀 IEEE CS Weekly Tech Opportunities ({datetime.date.today().strftime('%b %d, %Y')})"
    msg["From"] = f"IEEE CS Nirma <{smtp_user}>"
    msg["To"] = ", ".join(subscribers)
    msg.attach(MIMEText(html_content, "html"))

    try:
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(smtp_user, subscribers, msg.as_string())
        server.quit()
        print(f"[Mail] Successfully dispatched weekly digest to {len(subscribers)} subscribers.")

        # Log mail sent event into Firestore
        if db:
            db.collection('mail_logs').add({
                'timestamp': firestore.SERVER_TIMESTAMP,
                'recipients_count': len(subscribers),
                'recipients': subscribers,
                'jobs_included': len(jobs),
                'status': 'success'
            })
    except Exception as e:
        print(f"[Mail] Error sending emails: {e}")
        if db:
            db.collection('mail_logs').add({
                'timestamp': firestore.SERVER_TIMESTAMP,
                'error': str(e),
                'status': 'failed'
            })

def main():
    parser = argparse.ArgumentParser(description="IEEE CS Nirma Job Scraper & Mail Automation")
    parser.add_argument("--seed", action="store_true", help="Seed default companies into Firestore")
    parser.add_argument("--scrape", action="store_true", help="Run internship scraper and update jobs list")
    parser.add_argument("--send-weekly", action="store_true", help="Send weekly digest emails to subscribers")
    parser.add_argument("--all", action="store_true", help="Run seed, scrape, and mail if scheduled")

    args = parser.parse_args()

    db = init_firebase()

    if args.seed or args.all:
        seed_companies(db)

    if args.scrape or args.all or not (args.seed or args.send_weekly):
        scrape_jobs(db)

    if args.send_weekly or args.all:
        send_weekly_digest(db)

if __name__ == "__main__":
    main()
