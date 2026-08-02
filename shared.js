/**
 * shared.js — Loads header.html and footer.html into any page.
 *
 * Usage: call loadShared(root) where root is the relative path to the
 * project root from the current page, e.g. '' for root pages, '../' for ctf/.
 *
 * The page must have:
 *   <div id="site-header"></div>   — where the nav will be injected
 *   <div id="site-footer"></div>   — where the footer will be injected
 */
async function loadShared(root = '') {
  root = root.replace(/\/?$/, '/').replace(/^\//, '');
  if (root === '/') root = '';

  async function fetchPartial(file) {
    try {
      const res = await fetch(root + file);
      if (!res.ok) throw new Error(res.status);
      const text = await res.text();
      return text.replace(/\{ROOT\}/g, root);
    } catch (e) {
      console.warn('[shared.js] Failed to load', file, e);
      return '';
    }
  }

  const [headerHtml, footerHtml] = await Promise.all([
    fetchPartial('header.html'),
    fetchPartial('footer.html'),
  ]);

  const headerEl = document.getElementById('site-header');
  const footerEl = document.getElementById('site-footer');
  if (headerEl) headerEl.innerHTML = headerHtml;
  if (footerEl) footerEl.innerHTML = footerHtml;

  // Mark the current page link as active
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href') || '';
    // match on the final path segment (filename)
    const linkFile = href.split('/').filter(Boolean).pop() || '';
    const pageFile = currentPath.split('/').filter(Boolean).pop() || 'index.html';
    if (linkFile && linkFile === pageFile) {
      link.classList.add('active');
    }
    // Special: mark index.html links active on root page
    if ((pageFile === '' || pageFile === 'index.html') && (linkFile === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Create and inject Back to Top button
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
