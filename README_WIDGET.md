# IEEE Computer Society Content Syndication Widget

A production-ready, lightweight embeddable content widget for the IEEE Computer Society Student Chapter at Nirma University.

This widget allows external sites (such as the main Nirma University website at `https://technology.nirmauni.ac.in/student/ieee-computer-society-cs/`) to display live chapter information, global IEEE Computer Society highlights, leadership, goals, and portal links through a single `<script>` tag without using iframes or complex API integrations.

---

## 🛠️ How It Works

```text
Host Webpage (e.g., Nirma University site)
       ↓
<script src="https://ieee-computer-nirma.github.io/embed.js"></script>
       ↓
Fetches https://ieee-computer-nirma.github.io/content.json
       ↓
Renders safe HTML DOM + Scoped CSS into host container
```

### Key Technical Attributes
- **Zero Dependencies:** Pure vanilla JavaScript (ES5/ES6 compatible). No React, Vue, or external libraries.
- **No iFrame:** Renders standard native HTML elements directly into the host DOM.
- **Isolated Styling:** Uses strongly scoped CSS classes (`.ieee-cs-nirma-widget*`) to prevent style leaks or pollution.
- **Safe Rendering:** Uses `document.createElement()` and `textContent` to avoid unsafe HTML injection.
- **Auto Container Detection:** Automatically creates and inserts container at the exact `<script>` tag location or binds to an existing `<div id="ieee-cs-nirma-widget"></div>`.
- **Fault-Tolerant:** Includes loading indicators and non-disruptive fallback UI if fetch fails.

---

## 🚀 1. Installation Guide for Nirma Web Team

To embed the IEEE Computer Society section into any page on the Nirma University website, add the following single line of HTML where you want the content section to appear:

```html
<script src="https://ieee-computer-nirma.github.io/embed.js"></script>
```

*(Optional)* If you prefer to specify an explicit placement container:

```html
<div id="ieee-cs-nirma-widget"></div>
<script src="https://ieee-computer-nirma.github.io/embed.js" defer></script>
```

---

## 📝 2. How IEEE CS Nirma Updates Content

All content is managed directly in `content.json` in the root of the GitHub repository.

When `content.json` is edited and committed to the `main` branch, all embedded widgets on external sites automatically display the updated content on their next load.

---

## 📊 3. Structure of `content.json`

The JSON file follows a modular and extensible schema:

```json
{
  "meta": {
    "title": "IEEE Computer Society Student Chapter — Nirma University",
    "lastUpdated": "2025-03-01",
    "version": "1.0.0"
  },
  "chapter": {
    "name": "IEEE Computer Society Student Chapter",
    "institution": "Nirma University",
    "tagline": "Empowering Tomorrow's Engineers and Leaders",
    "description": "..."
  },
  "ieee_cs": {
    "title": "IEEE Computer Society",
    "description": "...",
    "anniversary": "80th Anniversary (2026)",
    "highlights": [
      {
        "id": "sc24",
        "title": "SC24",
        "description": "..."
      }
    ]
  },
  "nirma_chapter": {
    "title": "Nirma University Chapter",
    "established": "2025",
    "description": "...",
    "featured_guest": {
      "name": "Naren Kachroo",
      "role": "Head of Google Cloud India",
      "linkedin": "http://in.linkedin.com/in/naren-kachroo"
    }
  },
  "goals": [
    {
      "id": 1,
      "title": "Foster Technical Innovation & Research Excellence",
      "description": "..."
    }
  ],
  "faculty_advisor": {
    "name": "Dr. Umesh Bodkhe",
    "role": "Faculty Advisor",
    "affiliation": "Department of Computer Science & Engineering, Nirma University"
  },
  "links": [
    {
      "label": "IEEE Computer Society",
      "url": "https://www.computer.org",
      "external": true
    }
  ],
  "events": [],
  "announcements": [],
  "achievements": [],
  "sponsors": [],
  "leadership": [],
  "gallery": []
}
```

---

## ➕ 4. Future Extensibility (Adding New Sections)

The widget is designed to easily render future sections without structural changes. For example, to add upcoming events or achievements:

Add entries to the respective arrays in `content.json`:

```json
"events": [
  {
    "title": "HackDays Ahmedabad",
    "date": "2025-04-15",
    "description": "24-hour developer hackathon centered on open-source engineering."
  }
]
```

`embed.js` automatically detects populated arrays in `events`, `announcements`, `achievements`, or `sponsors` and dynamically generates new card sections!

---

## 🧪 5. Local Testing & Verification

To test the embed widget locally:

1. Start a local HTTP server from the repository root:
   ```bash
   python3 -m http.server 8000
   ```
2. Open the test suite in your browser:
   `http://localhost:8000/embed/test-embed.html` or `http://localhost:8000/embed/`
3. Inspect the responsive layout across desktop, tablet, and mobile viewports.
