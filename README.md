# CyberSurge 2.0 CTF Platform

A Google-CTF-styled Capture The Flag platform for IEEE CS Nirma University's 8-hour hackathon. Built with plain HTML/CSS/JS, hosted on GitHub Pages, with Firestore for team ranking and leaderboard.

## 📋 Files Overview

- **`index.html`** — Main landing page featuring NovaHack 2026, Problem Statements, and Pre-Event CTF Arena
- **`challenges.html`** — Challenge viewer with Python scripts, hints, and flag submission (live pre-event fun & practice arena)
- **`challenges.js`** — Challenge data (10 challenges with scripts, hints, descriptions)
- **`firestore-rules.js`** — Firestore security rules for team-based scoring
- **`config.example.json`** — Firebase config template (rename to `config.json` and fill in your credentials)

## 🚀 Quick Start

### 1. Clone & Set Up

```bash
git clone https://github.com/<username>/<repo>.git
cd <repo>
```

### 2. Create GitHub Pages Branch

GitHub Pages serves from either:
- **Branch:** Create a `gh-pages` branch and push HTML/CSS/JS there
- **Folder:** Use `/docs` folder in main branch and enable Pages in Settings

Recommended: Use `/docs` folder for simplicity.

```bash
mkdir docs
mv index.html challenges.html challenges.js README.md docs/
git add docs/
git commit -m "Add CTF platform files"
git push origin main
```

Then in GitHub repo Settings → Pages → Source: select "main branch /docs folder" → Save.

Your site will be live at: `https://<username>.github.io/<repo>/`

### 3. Firebase Setup (Firestore + Auth)

#### 3.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project → name it "CyberSurge-2.0-CTF"
3. Enable Firestore Database (start in Test Mode for development)
4. Enable Authentication → Email/Password provider

#### 3.2 Get Firebase Config

1. Project Settings → General → under "Your apps" section
2. Click "Web" icon to create a web app
3. Copy the config object:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

#### 3.3 Add Firebase to Your Pages

Create `docs/firebase-init.js`:

```javascript
// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

#### 3.4 Set Up Firestore Collections

In Firebase Console → Firestore Database → Create collections:

**Collection: `teams`**
```
Document: {teamId}
  - teamName: "Team Alpha"
  - members: ["alice", "bob"]
  - joinedAt: 2026-08-22T10:00:00Z
  - loginCode: "TEAM01"
```

**Collection: `challenges`**
```
Document: {challengeId}
  - title: "Read the Room"
  - category: "Warmup"
  - points: 50
  - flagHash: "SHA256_HASH_OF_FLAG"
  - hints: [{text: "...", pointPenalty: 10}, ...]
```

**Collection: `submissions`** (auto-created on first submission)
```
  - teamId: "team-alpha-123"
  - challengeId: 1
  - submittedFlagHash: "SHA256_HASH_OF_SUBMITTED"
  - isCorrect: true
  - timestamp: 2026-08-22T10:15:00Z
  - attemptNumber: 1
```

**Collection: `solves`** (auto-created on correct solve)
```
Document: {teamId}_challenge_{challengeId}
  - teamId: "team-alpha-123"
  - challengeId: 1
  - points: 50
  - attempts: 3
  - firstViewedAt: 2026-08-22T10:05:00Z
  - solvedAt: 2026-08-22T10:15:00Z
  - timeToSolveSeconds: 600
  - hintsUsed: 1
```

**Collection: `leaderboard`** (denormalized, one doc per team)
```
Document: {teamId}
  - teamName: "Team Alpha"
  - totalPoints: 200
  - totalSolves: 2
  - lastSolveAt: 2026-08-22T10:15:00Z
```

### 4. Firestore Security Rules

In Firebase Console → Firestore → Rules, replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Teams can only write their own doc
    match /teams/{teamId} {
      allow read: if true;
      allow create, update: if request.auth.uid == teamId;
    }
    
    // Challenges are read-only
    match /challenges/{doc=**} {
      allow read: if true;
      allow write: if false;
    }
    
    // Teams can only create submissions (never edit/delete)
    match /submissions/{doc=**} {
      allow create: if request.auth != null && request.resource.data.teamId == request.auth.uid;
      allow read: if request.auth.uid == resource.data.teamId;
      allow update, delete: if false;
    }
    
    // Teams can only update their own solve docs
    match /solves/{doc=**} {
      allow create: if request.auth != null && request.resource.data.teamId == request.auth.uid;
      allow read: if request.auth.uid == resource.data.teamId;
      allow update: if request.auth != null && request.auth.uid == resource.data.teamId;
      allow delete: if false;
    }
    
    // Teams can only read their own leaderboard entry
    match /leaderboard/{teamId} {
      allow read: if true;  // Everyone can read the public leaderboard
      allow create, update: if request.auth.uid == teamId;
      allow delete: if false;
    }
  }
}
```

Publish the rules.

### 5. Add Authorized Domains (Critical!)

Firebase Auth requires your GitHub Pages domain to be authorized:

1. Firebase Console → Authentication → Settings
2. Scroll to "Authorized domains"
3. Add: `<username>.github.io`
4. Save

Without this, team login will silently fail.

---

## 🎯 Platform Lifecycle

### Phase 1: Pre-Event Fun (Now → Aug 22, 10:00 AM IST)

- `index.html` serves the landing page & problem statements
- Pre-event fun CTF arena active for practice
- 10 challenge cards unlocked for warm-up
- "Register Team" button points to registration form
- Live leaderboard active

**What to do:** Teams register, warm up with pre-event CTF challenges, review problem statements.

### Phase 2: Live Hackathon Event (Aug 22, 10:00 AM → Aug 23, 10:00 AM)

- NovaHack 2026 24-hour hackathon goes live with 2 Problem Statements:
  1. Autonomous Contract Review Agent (AI & LegalTech)
  2. AI Meeting Intelligence Platform (AI & Enterprise Intelligence)
- Real-time flag submission & project evaluation
- Leaderboard updates live as teams solve

### Phase 3: General Practice Arena (After Aug 23)

- `index.html` displays event wrap-up and problem statement archives
- `challenges.html` remains open continuously in general as a practice platform
- All solutions are published (writeups/walkthroughs)
- Teams can replay to learn

---

## 🔧 Team Login & Setup

### Option A: Email-Link Authentication (Recommended for 8hr hackathon)

1. **Before the event**, generate a Google Sheet with team codes:
   ```
   Team         | Code      | Email
   ============|========== |===============
   Team Alpha  | TEAM01    | team-alpha@mail.com
   Team Beta   | TEAM02    | team-beta@mail.com
   ```

2. **Create pre-auth users** in Firebase → Authentication:
   - Add each team email
   - Use temporary password or email-link sign-in

3. **On event day**, teams click "Login" → enter their email → click link in email → dashboard opens

### Option B: Simple Team Code Entry

Add a login modal in `index.html`:

```html
<div id="login-modal" style="display:none;">
  <input type="text" id="team-code" placeholder="Enter team code (e.g., TEAM01)">
  <button onclick="loginTeam()">Join the Arena</button>
</div>
```

Map team code to Firestore doc during login.

---

## 🌐 Customization Checklist

- [ ] Replace "CyberSurge 2.0" with your CTF name
- [ ] Add your own 10 challenges (or use placeholders)
- [ ] Generate SHA-256 hashes of each flag for `flagHash`
- [ ] Create Python scripts for each challenge
- [ ] Update event date/time in countdown
- [ ] Add your chapter logo/colors (currently: green/teal theme)
- [ ] Set up Firestore collections & rules
- [ ] Test login flow with 2–3 dummy teams
- [ ] Configure Firebase Authorized Domains
- [ ] Create team registration form (Google Form or link)

---

## 📊 During the Event

### For Organizers

1. **Monitor in real time:**
   ```
   Firebase Console → Firestore → leaderboard collection
   ```
   Refresh to see live points and solve counts.

2. **Troubleshoot logins:**
   - Check if team's email is created in Authentication
   - Verify GitHub Pages domain is in Authorized Domains
   - Test login with a dummy account before event

3. **If flag is wrong:**
   - Only admins with Firebase access can update `flagHash`
   - Re-deploy the site with corrected hash
   - Or manually update one solve doc (not recommended — maintain fairness)

4. **Downtime/crashes:**
   - GitHub Pages is highly available; static site won't crash
   - Firestore has auto-scaling; unlikely to go down
   - Worst case: revert to cached version or use local backup leaderboard

### For Participants

1. **Can't log in:**
   - Check email is in team list
   - Look for email-link confirmation email (check spam)
   - Verify browser accepts cookies

2. **Flag not accepted:**
   - Ensure format is exactly `flag{...}` (no spaces)
   - Re-run Python script to double-check output
   - Read hints if stuck

3. **Script errors:**
   - Ensure Python 3.10+ installed
   - Install required packages: `pip install Pillow requests`
   - Ask TA for help if dependencies are missing

---

## 📁 File Structure (Recommended)

```
<repo>/
├── docs/
│   ├── index.html          (landing/teaser page)
│   ├── challenges.html     (challenge viewer — live pre-event fun & practice arena)
│   ├── challenges.js       (challenge data)
│   ├── firebase-init.js    (Firebase config)
│   ├── firestore-rules.js  (security rules reference)
│   └── README.md           (this file)
├── challenges/             (optional: host Python scripts here)
│   ├── 01-read-room/
│   │   ├── solve.py
│   │   └── page.html
│   ├── 02-say-cheese/
│   │   ├── solve.py
│   │   └── photo.jpg
│   └── ...
└── .gitignore
```

---

## 🔐 Security Notes

- **Flags are hashed:** Firestore never stores plaintext flags, only SHA-256 hashes
- **Client-side validation:** Flag checking happens in browser (not tamper-proof, acceptable for low-stakes hackathon)
- **Security rules:** Prevent teams from faking points or seeing other team's attempts
- **Auth:** Email-link prevents spoofing (team must have access to registered email)

For a more robust system (future):
- Move flag validation to a Cloud Function
- Use HMAC verification instead of hash comparison
- Add rate limiting on submissions

---

## 🚀 Deployment Checklist (Day Before Event)

- [ ] Push all files to GitHub (`docs/` folder)
- [ ] Verify GitHub Pages is enabled & live at `https://<username>.github.io/<repo>/`
- [ ] Test `index.html` loads with countdown
- [ ] Firebase project created & Firestore ready
- [ ] Authorized Domains includes GitHub Pages URL
- [ ] All 10 challenges added to Firebase `challenges` collection
- [ ] Test team login with a dummy account
- [ ] Verify `challenges.html` loads after login
- [ ] Test flag submission flow (submit a correct flag)
- [ ] Check leaderboard updates in real time
- [ ] Dry run with 3–5 friends for 15 min (find bugs early)
- [ ] Backup flags & solutions locally
- [ ] Slack/Discord channel for tech support ready

---

## 📞 Support & Troubleshooting

**GitHub Pages not updating?**
- Wait 1 min, hard refresh browser (Ctrl+Shift+R)
- Check Actions tab — any build failures?

**Firestore rules rejected submissions?**
- Verify rules syntax in Firebase Console
- Test with a dummy team to isolate issue

**Login always fails?**
- Check Firebase Authentication email is created
- Verify Authorized Domains includes your GitHub domain
- Check browser console for error messages

**Leaderboard not updating?**
- Is the team's Firestore write succeeding? (Check Firestore logs)
- Did the flag hash match? (Verify with a test flag)
- Refresh page manually to check

---

## 📝 Post-Event (Aug 24+)

1. **Publish solutions:**
   - Add writeups to `challenges.html` or a new `solutions.html`
   - Link to GitHub repos of working scripts
   
2. **Archive for next year:**
   - Freeze this repo as a template
   - Next year's organizers can fork & customize

3. **Feedback survey:**
   - Send teams a form asking difficulty, clarity, favorite challenge
   - Use feedback to tweak challenge scores & hints

4. **Event report:**
   - Export leaderboard screenshot for documentation
   - Count challenges solved, average time, participation by category
   - Share metrics with IEEE chapter leadership

---

## 📚 Additional Resources

- [Google CTF Inspiration](https://capturetheflag.withgoogle.com/)
- [Firebase Docs](https://firebase.google.com/docs)
- [GitHub Pages Docs](https://pages.github.com/)
- [Firestore Security Best Practices](https://firebase.google.com/docs/firestore/security/overview)

---

**Built for IEEE CS Nirma University by the 8-hour hackathon organizing team.**

Good luck, hackers! 🎯
