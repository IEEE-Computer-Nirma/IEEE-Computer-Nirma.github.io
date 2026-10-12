# Firebase, Google Search, Gemini & Cron Job Setup Guide

This guide explains how to set up Firebase Firestore, Google Custom Search API, Gemini LLM parsing, and GitHub Actions Secrets for the IEEE Computer Society Nirma University Opportunities Portal.

---

## 🔑 1. Required GitHub Secrets

Since this is a public repository, sensitive credentials (like Firebase Admin service keys, Gemini API keys, and SMTP credentials) must be configured as **GitHub Repository Secrets**:

1. Go to your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.
2. Add the following secrets:

| Secret Name | Description | Example / Format |
|---|---|---|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase Admin Service Account JSON | `{"type": "service_account", "project_id": "ieee-cs-nirma", ...}` |
| `GOOGLE_SEARCH_API_KEY` | Google Custom Search API Key | `AIzaSy...` |
| `GOOGLE_SEARCH_CX` | Google Custom Search Engine ID (CX) | `012345678901234567890:abcdefghijk` |
| `GEMINI_API_KEY` | Gemini API Key (`gemini-1.5-flash` or `gemini-3.5-flash-lite`) | `AIzaSy...` |
| `SMTP_HOST` | Email SMTP Server Host | `smtp.gmail.com` |
| `SMTP_PORT` | Email SMTP Port | `587` |
| `SMTP_USER` | Email SMTP Username | `deep@computer.org` |
| `SMTP_PASSWORD` | Email App Password | `xxxx xxxx xxxx xxxx` |
| `ADMIN_EMAILS` | Allowed Admin Email Addresses | `deep@computer.org,ieee.cs@nirmauni.ac.in` |

---

## 🔥 2. Firestore Collections & Security Rules

Set up the following collections in Firebase Console -> **Firestore Database**:

- `jobs`: Stores internship listings, category, year tags, active status, and featured flag.
- `companies`: Target companies and career board URLs to search.
- `subscribers`: Emails subscribed to the weekly opportunity digest.
- `mail_logs`: Execution logs of sent weekly digest emails.

### Recommended Firestore Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Public read access for jobs & active companies
    match /jobs/{jobId} {
      allow read: if true;
      allow write: if request.auth != null && (
        request.auth.token.email == 'deep@computer.org' ||
        request.auth.token.email.endsWith('@computer.org')
      );
    }

    match /companies/{companyId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'deep@computer.org';
    }

    // Public create access for subscribers
    match /subscribers/{email} {
      allow read, delete: if request.auth != null;
      allow create, update: if true;
    }

    // Admin read access for logs
    match /mail_logs/{logId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🔐 3. Firebase Web Authentication Setup

1. Go to **Firebase Console** -> **Authentication** -> **Sign-in method**.
2. Enable **Google Sign-In**.
3. Under **Authorized Domains**, add your GitHub Pages domain (e.g. `deeplumiere.github.io`).
4. In `firebase-config.js`, update `firebaseConfig` with your Web App project parameters.

---

## 🤖 4. Automated Daily Cron Job

The repository includes a GitHub Action workflow located at `.github/workflows/daily-jobs.yml`.
- Runs automatically **every day at 01:00 UTC**.
- Scrapes new internships via `python3 scripts/job_scraper.py --all`.
- Cleans and extracts year/category tags using **Gemini API**.
- Sends the weekly email digest to all registered subscribers.
