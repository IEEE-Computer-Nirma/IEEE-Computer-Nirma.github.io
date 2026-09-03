/**
 * shared.js — Centralized Header & Footer Loader with fallback for local prototyping.
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

  const fallbackHeader = `
    <nav class="nav" id="main-nav">
      <a class="nav-brand" href="{ROOT}">
        <img src="{ROOT}assets/IEEE_CS_Nirma_logo.svg" alt="IEEE CS Nirma" />
      </a>
      <ul class="nav-links">
        <li><a href="{ROOT}#events">Events</a></li>
        <li><a href="https://events.mlh.com/events/14703-hack-days-ahmedabad" target="_blank" rel="noopener">HackDays Ahmedabad</a></li>
        <li><a href="{ROOT}#gallery">Gallery</a></li>
        <li><a href="{ROOT}#team">Team</a></li>
        <li><a href="{ROOT}#about">About</a></li>
        <li><a href="{ROOT}#contact">Contact</a></li>
      </ul>
      <div class="nav-right-actions">
        <a class="nav-cta" href="https://events.mlh.com/events/14703-hack-days-ahmedabad" target="_blank" rel="noopener">HackDays Ahmedabad →</a>
      </div>
    </nav>
  `;

  const fallbackFooter = `
    <div class="footer-full">
      <footer class="site-footer">
        <span>© 2026 IEEE CS Nirma — Student Branch Chapter</span>
        <span>
          <a href="{ROOT}">Home</a> ·
          <a href="https://events.mlh.com/events/14703-hack-days-ahmedabad" target="_blank" rel="noopener">HackDays Ahmedabad</a> ·
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
