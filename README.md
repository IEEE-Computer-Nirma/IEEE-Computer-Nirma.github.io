# IEEE Computer Society — Nirma University Student Chapter

Official web portal for the IEEE Computer Society Student Branch Chapter at Nirma University, Ahmedabad. Built with plain HTML5, CSS3, dynamic vanilla JavaScript, and runtime JSON data assets.

## 🌟 Highlights & Features

- **Flagship Event:** **HackDays Ahmedabad** (September 26, 2026) — Featured hackathon registration and details.
- **Dynamic Content Engine:** Core page content, events, team roster, and gallery slides are loaded dynamically from JSON files (`data/events.json`, `data/team.json`, `data/gallery.json`).
- **Interactive UI & Visuals:**
  - Dynamic abstract geometric & constellation HTML5 Canvas hero animation.
  - Interactive event modal preview.
  - Image carousel for event moments and highlights.
  - Responsive, randomized Core Team grid display for peer equity.
- **Shared Components:** Header and footer navigation partials dynamically injected via `shared.js`.

---

## 📁 Repository Structure

```text
.
├── assets/                 # Emblem, logos, gallery images, and media assets
├── data/
│   ├── events.json         # Event listings, descriptions, registration URLs
│   ├── gallery.json        # Gallery images and event moment captions
│   └── team.json           # Faculty Advisor and Core Team roster
├── header.html             # Shared site navigation header
├── footer.html             # Shared site footer
├── index.html              # Main homepage & interactive portal
├── shared.css              # Global styles, variables, typography, and responsive rules
├── shared.js               # Utility script to inject global header and footer partials
└── README.md               # Project documentation
```

---

## 🚀 Quick Start & Local Preview

Because the site uses `fetch()` to load shared partials and data from the `data/` directory, run a local HTTP server for testing:

### Option A: Python HTTP Server (Recommended)

```bash
# Python 3
python3 -m http.server 8000
```

Open `http://localhost:8000` in your web browser.

### Option B: Node / npx http-server

```bash
npx http-server -p 8000
```

---

## 🛠️ Data Maintenance

To update site information, modify the corresponding JSON file under `/data`:

- **Events (`data/events.json`):** Add or update events, registration URLs, and dates.
- **Team Roster (`data/team.json`):** Manage Faculty Advisor and Core Team member details. Leave `image` empty to utilize the default Google Material Symbols profile icon placeholder.
- **Gallery (`data/gallery.json`):** Add image paths and captions for carousel highlights.

---

## 🌐 Deployment

The repository is configured for static hosting via **GitHub Pages**. Simply commit changes to the primary branch (`main`) or push to `gh-pages` to deploy.

---

**IEEE Computer Society Student Branch Chapter — Nirma University, Ahmedabad**
Contact: [deep@computer.org](mailto:deep@computer.org)
