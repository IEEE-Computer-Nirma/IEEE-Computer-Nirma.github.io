// Shared across every page: mobile nav, content.json hydration, countdown.

const CONTENT_URL = (() => {
  // Works whether the page lives at the site root or one level deep.
  return document.body.dataset.contentPath || 'assets/data/content.json';
})();

function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );
}

function fillTextTargets(root, content) {
  root.querySelectorAll('[data-content]').forEach((el) => {
    const path = el.getAttribute('data-content');
    const value = path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), content);
    if (value !== undefined) el.textContent = value;
  });
  root.querySelectorAll('[data-content-href]').forEach((el) => {
    const path = el.getAttribute('data-content-href');
    const value = path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), content);
    if (value !== undefined) el.setAttribute('href', value);
  });
}

function renderOrganizers(content) {
  const grid = document.getElementById('org-grid');
  if (grid) {
    grid.innerHTML = content.organizers.map((o) => `
      <div class="org-card">
        <img src="${o.logo}" alt="${o.name} logo" loading="lazy">
        <h3>${o.name}</h3>
        <div class="org-sub">${o.chapter}</div>
      </div>
    `).join('');
  }

  const footerLogos = document.getElementById('footer-logos');
  if (footerLogos) {
    footerLogos.innerHTML = content.organizers.map((o) =>
      `<img src="${o.logo}" alt="${o.name} logo" title="${o.name}" loading="lazy">`
    ).join('');
  }
}

function startCountdown(targetIso) {
  const el = document.getElementById('countdown');
  if (!el) return;
  const target = new Date(targetIso).getTime();

  const cells = {
    d: el.querySelector('[data-c="d"]'),
    h: el.querySelector('[data-c="h"]'),
    m: el.querySelector('[data-c="m"]'),
    s: el.querySelector('[data-c="s"]'),
  };

  const initialDiff = target - Date.now();
  if (initialDiff <= 0) {
    Object.values(cells).forEach((c) => { if (c) c.textContent = '00'; });
    return;
  }

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      Object.values(cells).forEach((c) => { if (c) c.textContent = '00'; });
      clearInterval(timer);
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (cells.d) cells.d.textContent = String(d).padStart(2, '0');
    if (cells.h) cells.h.textContent = String(h).padStart(2, '0');
    if (cells.m) cells.m.textContent = String(m).padStart(2, '0');
    if (cells.s) cells.s.textContent = String(s).padStart(2, '0');
  }

  tick();
  const timer = setInterval(tick, 1000);
}

async function hydrateFromContent() {
  try {
    const res = await fetch(CONTENT_URL);
    const content = await res.json();
    fillTextTargets(document, content);
    renderOrganizers(content);
    if (content.event && content.event.launchDate) {
      startCountdown(content.event.launchDate);
    }
    document.dispatchEvent(new CustomEvent('content:ready', { detail: content }));
  } catch (err) {
    console.error('Could not load site content.json', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  hydrateFromContent();
});
