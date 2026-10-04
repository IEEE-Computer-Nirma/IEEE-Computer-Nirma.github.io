/**
 * shared.js — Centralized Header & Footer Loader with clean URL handling.
 *
 * Usage: call loadShared(root) where root is relative path to root (default '').
 */
async function loadShared(root = '') {
  root = root.replace(/\/?$/, '/').replace(/^\//, '');
  if (root === '/') root = '';

  // Clean extensionless URL handling: Strip .html from location bar if served directly
  if (window.location.protocol !== 'file:' && window.location.pathname.endsWith('.html')) {
    let cleanPath = window.location.pathname.replace(/\.html$/, '');
    if (cleanPath.endsWith('/index')) {
      cleanPath = cleanPath.replace(/\/index$/, '/');
    }
    window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
  }

  const fallbackHeader = `
    <nav class="nav" id="main-nav">
      <a class="nav-brand" href="{ROOT}">
        <img src="{ROOT}assets/IEEE_CS_Nirma_logo.svg" alt="IEEE CS Nirma" />
      </a>
      <ul class="nav-links">
        <li><a href="{ROOT}events">Events</a></li>
        <li><a href="{ROOT}achievements">Achievements</a></li>
        <li><a href="{ROOT}team">Team</a></li>
        <li><a href="{ROOT}about">About</a></li>
        <li><a href="{ROOT}contact">Contact</a></li>
      </ul>
      <div class="nav-right-actions">
        <a class="nav-cta" href="https://hack.ieeenirma.org/" target="_blank" rel="noopener">HackIEEE →</a>
      </div>
    </nav>
  `;

  const fallbackFooter = `
    <div class="footer-full">
      <footer class="site-footer">
        <span>© 2026 IEEE CS Nirma — Student Branch Chapter</span>
        <span>
          <a href="{ROOT}">Home</a> ·
          <a href="{ROOT}events">Events</a> ·
          <a href="{ROOT}achievements">Achievements</a> ·
          <a href="{ROOT}team">Team</a> ·
          <a href="{ROOT}about">About</a> ·
          <a href="{ROOT}contact">Contact</a> ·
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

  const headerHtml = await fetchPartial('header.html', fallbackHeader);
  const footerHtml = await fetchPartial('footer.html', fallbackFooter);

  const headerEl = document.getElementById('site-header');
  const footerEl = document.getElementById('site-footer');
  if (headerEl) headerEl.innerHTML = headerHtml;
  if (footerEl) footerEl.innerHTML = footerHtml;

  // Active state marking for navigation links
  const currentPath = window.location.pathname;
  const normalize = (p) => {
    const clean = p.split(/[?#]/)[0];
    const segment = clean.replace(/\/.+$/, '/').replace(/\.html$/,'').replace(/\/$/, '')
      .split('/')
      .filter(Boolean)
      .pop() || 'index';
    return segment === '' ? 'index' : segment;
  };

  const page = normalize(currentPath);
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href') || '';
    const linkPath = normalize(href);
    if (page === linkPath && linkPath !== 'index') {
      link.classList.add('active');
    }
  });

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
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
    btn.title = 'Scroll to Top';
    btn.setAttribute('aria-label', 'Scroll to Top');
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
