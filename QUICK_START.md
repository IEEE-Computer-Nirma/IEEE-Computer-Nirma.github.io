# Quick Start — CyberSurge 2.0 CTF Setup (5 Steps)

Get the CTF platform live in 30 minutes.

## Step 1: Fork & Clone (5 min)

```bash
# Clone this repo
git clone https://github.com/<username>/cybersurge-ctf.git
cd cybersurge-ctf

# Create docs folder (GitHub Pages will serve from here)
mkdir -p docs
cp index.html challenges.html challenges.js README.md docs/

# Push to GitHub
git add docs/
git commit -m "Initial CTF platform setup"
git push origin main
```

## Step 2: Enable GitHub Pages (2 min)

1. Go to your GitHub repo Settings
2. Scroll to "Pages" section
3. Select **Source:** "Deploy from a branch"
4. Choose **Branch:** "main", **Folder:** "/docs"
5. Click "Save"
6. Wait 1–2 minutes, then visit: `https://<username>.github.io/<repo>/`

✅ You should see the teaser page with countdown timer.

---

## Step 3: Create Firebase Project (10 min)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" → name it **"CyberSurge-2.0-CTF"** → Create
3. Once created, click the project
4. In left sidebar, click **"Build"** → **"Firestore Database"**
5. Click "Create Database"
   - Select region: **us-central1** (or closest to you)
   - Start in **"Test Mode"** (we'll lock it down later)
   - Click "Create"
6. Go back home. Click **"Build"** → **"Authentication"**
7. Click **"Get Started"**
8. Under "Sign-in method", enable **"Email/Password"**

---

## Step 4: Set Up Firestore Collections (8 min)

In Firestore Database tab, create these collections:

### Collection 1: `challenges`

Click "+ Start collection"
- Collection ID: `challenges`
- Auto-generate first document? **No**
- Add your first challenge manually:

```
Document ID: challenge_1
Fields:
  title: "Read the Room"
  category: "Warmup"
  points: 50
  difficulty: "Easy"
  flagHash: "abc123..."  // SHA-256 hash of flag{...}
  description: "Find the flag in page source"
  hints: array of {text: "...", penalty: 10}
```

*Repeat for all 10 challenges. Use the challenge data from `challenges.js` as a reference.*

### Collection 2: `teams`

Click "+ Add Collection"
- Collection ID: `teams`
- Auto-generate doc ID, click "Auto-ID" → Add document with sample data:

```
Document ID: (auto)
Fields:
  teamName: "Team Alpha"
  members: ["Alice", "Bob"]
  joinedAt: 2026-08-22 10:00:00
  loginCode: "TEAM01"
```

### Collection 3: `submissions`

Just create an empty collection (will auto-populate as teams submit):
- Collection ID: `submissions`
- Skip the first document

### Collection 4: `solves`

Empty collection:
- Collection ID: `solves`

### Collection 5: `leaderboard`

Empty collection:
- Collection ID: `leaderboard`

---

## Step 5: Configure Security & Auth Domain (5 min)

### 5A: Add GitHub Pages to Authorized Domains

1. In Firebase Console, go to **Build** → **Authentication**
2. Click the **Settings** tab at the top
3. Scroll down to "Authorized domains"
4. Click "Add domain"
5. Enter: `<username>.github.io`
6. Click "Add"

### 5B: Update Firestore Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace the existing rules with the contents of `firestore-rules.txt` (in this repo)
3. Click **"Publish"**

---

## ✅ Test It

1. Visit your site: `https://<username>.github.io/<repo>/`
2. You should see:
   - ✅ Hero section with countdown
   - ✅ 10 locked challenge placeholders
   - ✅ Live leaderboard section (empty for now)
   - ✅ Navigation bar

3. On Aug 22, NovaHack 2026 event goes live with problem statements and live challenge submissions.

---

## 🎯 Before the Hackathon (Aug 21)

- [ ] Generate SHA-256 hashes of all 10 flags
  ```bash
  echo -n "flag{example}" | sha256sum
  ```
- [ ] Update all challenge docs in Firestore with correct flagHash values
- [ ] Create team list (email → loginCode mapping)
- [ ] Add teams to Firebase Authentication (pre-create accounts)
- [ ] Do a dry run: log in as a team, submit a test flag
- [ ] Check that leaderboard updates when a team solves

---

## 🚀 On Event Day (Aug 22, 9:00 AM)

1. **Go live:** Announce the CTF URL to all teams
2. **Team login:** Teams use pre-assigned codes to sign in
3. **Challenges unlock:** All 10 challenges appear in `challenges.html`
4. **Live leaderboard:** Monitor Firestore for real-time scores
5. **Support:** Answer questions in Discord/Slack

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Site won't load | Wait 2 min, hard refresh (Ctrl+Shift+R) |
| Login fails silently | Check if `github.io` is in Authorized Domains |
| Flag submission doesn't work | Verify flagHash matches the actual flag SHA-256 |
| Leaderboard empty | Did the team's submission succeed? Check Firestore logs |
| "Permission denied" errors | Verify Firestore security rules are published |

---

## 📞 Support

- **GitHub Pages docs:** https://pages.github.com/
- **Firebase docs:** https://firebase.google.com/docs
- **Firestore rules:** https://firebase.google.com/docs/firestore/security/overview

Good luck! 🎯⚡
