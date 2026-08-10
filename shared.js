/**
 * shared.js — Centralized Header & Footer Loader with fallback for file:// protocol.
 *
 * Usage: call loadShared(root) where root is the relative path to the
 * project root from the current page, e.g. '' for root pages, '../' for nextwave-2026/.
 *
 * The page must have:
 *   <div id="site-header"></div>   — where the nav will be injected
 *   <div id="site-footer"></div>   — where the footer will be injected
 */
async function loadShared(root = '') {
  root = root.replace(/\/?$/, '/').replace(/^\//, '');
  if (root === '/') root = '';

  const isNextWave = window.location.pathname.includes('nextwave-2026');

  // Fallback HTML structures for file:// protocol (local browsing) or fetch failure
  const fallbackMainHeader = `
    <nav class="nav" id="main-nav">
      <a class="nav-brand" href="{ROOT}">
        <img src="{ROOT}assets/IEEE_CS_Nirma_logo.svg" alt="IEEE CS Nirma" />
      </a>
      <ul class="nav-links">
        <li><a href="{ROOT}#events">Events</a></li>
        <li><a href="{ROOT}novahack-2026" target="_blank">NovaHack 2026</a></li>
        <li><a href="{ROOT}nextwave-2026/">NextWave 2026</a></li>
        <li><a href="{ROOT}#gallery">Gallery</a></li>
        <li><a href="{ROOT}#team">Team</a></li>
        <li><a href="{ROOT}#about">About</a></li>
        <li><a href="{ROOT}#contact">Contact</a></li>
        <li><a href="{ROOT}ctf/leaderboard">🏆 Leaderboard</a></li>
      </ul>
      <div class="nav-right-actions">
        <a class="nav-cta" href="{ROOT}ctf/">CTF Arena →</a>
        <div id="ctf-nav-extension" style="display:none; align-items:center; gap:15px; margin-left: 15px;"></div>
      </div>
    </nav>
  `;

  const fallbackNextWaveHeader = `
    <nav class="nav" id="main-nav">
      <a class="nav-brand" href="{ROOT}nextwave-2026/">
        <img src="{ROOT}nextwave-2026/assets/img/hackathon-logo.svg" alt="NextWave 2026 logo">
        <span data-content="event.name">NextWave 2026</span>
      </a>
      <ul class="nav-links">
        <li><a id="nav-home" href="{ROOT}nextwave-2026/index.html">Home</a></li>
        <li><a id="nav-hosts" href="{ROOT}nextwave-2026/hosts.html">Hosts</a></li>
        <li><a id="nav-speak" href="{ROOT}nextwave-2026/speakers.html">Speak</a></li>
        <li><a id="nav-sponsor" href="{ROOT}nextwave-2026/sponsorship.html">Sponsor</a></li>
        <li><a id="nav-contact" href="{ROOT}nextwave-2026/contact.html">Contact</a></li>
      </ul>
      <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </nav>
  `;

  const fallbackMainFooter = `
    <div class="footer-full">
      <footer class="site-footer">
        <span>© 2026 IEEE CS Nirma — Student Branch Chapter</span>
        <span>
          <a href="{ROOT}">Home</a> ·
          <a href="{ROOT}novahack-2026" target="_blank">NovaHack 2026</a> ·
          <a href="{ROOT}nextwave-2026/">NextWave 2026</a> ·
          <a href="{ROOT}ctf/">CTF Arena</a> ·
          <a href="{ROOT}ctf/leaderboard">🏆 Leaderboard</a> ·
          <a href="mailto:deep@computer.org">deep@computer.org</a>
        </span>
      </footer>
    </div>
  `;

  const fallbackNextWaveFooter = `
    <div class="footer-full">
      <footer class="site-footer">
        <span>© 2026 IEEE CS Nirma — Student Branch Chapter</span>
        <span>
          <a href="{ROOT}nextwave-2026/">Home</a> ·
          <a href="{ROOT}nextwave-2026/hosts.html">Hosts</a> ·
          <a href="{ROOT}nextwave-2026/speakers.html">Speakers</a> ·
          <a href="{ROOT}nextwave-2026/sponsorship.html">Sponsorship</a> ·
          <a href="mailto:deep@computer.org">deep@computer.org</a>
        </span>
      </footer>
    </div>
  `;

  async function fetchPartial(file, fallbackHtml) {
    if (window.location.protocol === 'file:') {
      return fallbackHtml.replace(/\{ROOT\}/g, root);
    }
    try {
      const res = await fetch(root + file);
      if (!res.ok) throw new Error(res.status);
      const text = await res.text();
      return text.replace(/\{ROOT\}/g, root);
    } catch (e) {
      console.warn('[shared.js] Failed to load', file, '; using fallback.', e);
      return fallbackHtml.replace(/\{ROOT\}/g, root);
    }
  }

  const headerHtml = isNextWave ? fallbackNextWaveHeader.replace(/\{ROOT\}/g, root) : await fetchPartial('header.html', fallbackMainHeader);
  const footerHtml = isNextWave ? fallbackNextWaveFooter.replace(/\{ROOT\}/g, root) : await fetchPartial('footer.html', fallbackMainFooter);

  const headerEl = document.getElementById('site-header');
  const footerEl = document.getElementById('site-footer');
  if (headerEl) headerEl.innerHTML = headerHtml;
  if (footerEl) footerEl.innerHTML = footerHtml;

  // Active state marking for navigation links
  const currentPath = window.location.pathname;
  if (isNextWave) {
    let activeId = 'nav-home';
    if (currentPath.includes('hosts.html')) activeId = 'nav-hosts';
    else if (currentPath.includes('speakers.html')) activeId = 'nav-speak';
    else if (currentPath.includes('sponsorship.html')) activeId = 'nav-sponsor';
    else if (currentPath.includes('contact.html')) activeId = 'nav-contact';

    const activeLink = document.getElementById(activeId);
    if (activeLink) activeLink.classList.add('active');
  } else {
    const normalize = (p) => {
      const clean = p.split(/[?#]/)[0];
      return clean.replace(/\/.+$/, '/').replace(/\.html$/,'').replace(/\/$/, '')
        .split('/')
        .filter(Boolean)
        .pop() || 'index';
    };
    const page = normalize(currentPath);
    document.querySelectorAll('.nav-links a').forEach(link => {
      const href = link.getAttribute('href') || '';
      const linkPath = normalize(href);
      if (page === linkPath) {
        link.classList.add('active');
      }
    });
  }

  // Set up mobile nav toggle behavior globally
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => links.classList.remove('open'))
    );
  }

  // Create and inject Back to Top button
  if (!document.querySelector('.back-to-top')) {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.innerHTML = '▲';
    btn.title = 'Scroll to Top';
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
