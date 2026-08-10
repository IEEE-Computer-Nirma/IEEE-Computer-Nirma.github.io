# NextWave 2026 — site

A minimal, white-background, `#FFA300`-accented multi-page site: home (coming
soon + countdown), contact, call-for-speakers, sponsorship/partnership, and a
password-locked leads dashboard. All forms write to the same Firestore
project you were already using.

## File map

```
index.html            Home — hero, countdown, chapters, CTA cards
contact.html           Contact form + organiser details
speakers.html          Call-for-speakers form
sponsorship.html       Sponsorship / co-host form
leads.html              Password-locked submissions dashboard
assets/data/content.json   Edit event name, date, chapters, contact info here
assets/css/style.css        One shared stylesheet
assets/js/main.js           Nav toggle + content.json hydration + countdown
assets/js/firebase-config.js  Shared Firebase init (one place to edit keys)
assets/js/firebase-forms.js   Handles contact/speaker/sponsor submissions
assets/js/firebase-auth.js    Login/logout for the leads page
assets/js/firebase-leads.js   Loads submissions into the leads table
assets/img/                   Logos (see placeholders below)
```

## Things I couldn't include — please check

1. **Hover-effect reference file.** You mentioned a `code.txt` for the hover
   effect, but it wasn't in the upload. I used a restrained default instead
   (buttons lift + drop a hard shadow, links grow an underline, cards lift
   with an accent border on hover — all in `style.css`). Send the file and
   I'll swap it in.
2. **Chapter logos.** Only `logo.svg` (the hackathon logo) was uploaded. The
   three chapter logos are placeholder badges at
   `assets/img/logo-ieee-cs.svg`, `logo-ieee-itss.svg`, `logo-ieee-sps.svg`.
   Replace those three files with the real IEEE CS / ITSS / SPS chapter
   logos (keep the same filenames, or update the paths in
   `assets/data/content.json`).
3. **Event name, date, and venue.** I used `NextWave 2026` and a placeholder
   November 2026 date as stand-ins so the countdown has something to count
   to — update `assets/data/content.json` → `event` once these are final.

## Editing content without touching HTML

Most of the text that changes often (event name, tagline, launch date/time,
venue, chapter names, chair contact info) lives in
`assets/data/content.json` and is pulled into every page at load time via
`main.js`. Update that one file and it updates everywhere, including the
countdown target.

## Firebase — what changed from your original scripts

- `CLIENT_ID` moved from `"plusonehms"` to `"ieee-nirma-hackathon"` in
  `firebase-config.js`, since your Firestore project (`contact-us-6b48d`)
  looks shared across more than one site and the old id read like a
  different client's tag. All writes and the leads query use this new id.
  Change it there (one place) if you'd rather use something else.
- Contact, speaker and sponsorship forms all write to the same
  `submissions` collection, tagged with `type: "contact" | "speaker" |
  "sponsor"` so they can be told apart on the leads page.
- Forms stay open to anyone (no login needed to submit), as requested.

## Locking the leads page

`leads.html` is gated with **Firebase Authentication** (email/password),
not a hardcoded password in the JS — a hardcoded client-side password can
be read by anyone who opens dev tools, which isn't real security. To finish
setup:

1. In the [Firebase console](https://console.firebase.google.com/) →
   your `contact-us-6b48d` project → **Authentication** → **Sign-in
   method**, enable **Email/Password**.
2. Under **Authentication** → **Users**, add an account for yourself (and
   anyone else on the org team) with an email + password.
3. That's it — `leads.html` will show a login form, and only signed-in
   accounts see the submissions table.

You should also lock down **Firestore rules** so reads require sign-in
while writes (form submissions) stay open, e.g.:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /submissions/{docId} {
      allow read: if request.auth != null;
      allow create: if request.resource.data.clientId == "ieee-nirma-hackathon";
      allow update, delete: if false;
    }
  }
}
```

(Set this in the Firebase console under **Firestore Database** → **Rules**.)
Without rules like these, anyone with your API key could currently read the
`submissions` collection directly through the Firestore API even with the
login gate on the page itself — the page-level login is a UI gate, not a
data-level one, until rules are added.

## "Served on JSON"

The site is a set of plain static HTML pages (works on any static host —
Netlify, Vercel, Firebase Hosting, GitHub Pages), with the editable content
factored out into `assets/data/content.json` so you're not hunting through
five HTML files to update the date or a phone number.

## Hosting note copy

The line about other chapters being welcome to co-host or host a future
edition lives in `content.json` → `hostingNote`, and is shown on the home
page and at the top of the sponsorship page — edit the wording there.
