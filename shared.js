/**
 * shared.js — Centralized Header & Footer Loader with clean URL handling, Page Loader & Mobile Nav.
 */
async function loadShared(root = '') {
  root = root.replace(/\/?$/, '/').replace(/^\//, '');
  if (root === '/') root = '';

  // 1. Clean extensionless URL handling
  if (window.location.protocol !== 'file:' && window.location.pathname.endsWith('.html')) {
    let cleanPath = window.location.pathname.replace(/\.html$/, '');
    if (cleanPath.endsWith('/index')) {
      cleanPath = cleanPath.replace(/\/index$/, '/');
    }
    window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
  }

  // 2. Inject Page Loader Overlay if not present
  if (!document.getElementById('page-loader')) {
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.innerHTML = `
      <canvas id="loader-canvas"></canvas>
      <div class="loader-content">
        <div class="loader-brand">IEEE CS NIRMA</div>
        <div class="loader-bar-wrap"><div class="loader-bar-inner"></div></div>
      </div>
    `;
    document.body.appendChild(loader);
    initLoaderCanvas();
  }

  const fallbackHeader = `
    <nav class="nav" id="main-nav">
      <a class="nav-brand" href="{ROOT}">
        <img src="{ROOT}assets/IEEE_CS_Nirma_logo.svg" alt="IEEE CS Nirma" />
      </a>
      <button class="nav-toggle" id="nav-toggle" aria-label="Toggle Navigation" aria-expanded="false">
        <span class="hamburger-bar"></span>
        <span class="hamburger-bar"></span>
        <span class="hamburger-bar"></span>
      </button>
      <ul class="nav-links" id="nav-links">
        <li><a href="{ROOT}events">Events</a></li>
        <li><a href="{ROOT}achievements">Achievements</a></li>
        <li><a href="{ROOT}team">Team</a></li>
        <li><a href="{ROOT}about">About</a></li>
        <li><a href="{ROOT}contact">Contact</a></li>
        <li class="mobile-cta-li">
          <a class="nav-cta" href="https://hack.ieeenirma.org/" target="_blank" rel="noopener">HackIEEE →</a>
        </li>
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

  // Active navigation link highlighting
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

  // Mobile Menu Drawer Setup
  setupMobileNav();

  // Back to Top button
  if (!document.querySelector('.back-to-top')) {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
    btn.title = 'Scroll to Top';
    btn.setAttribute('aria-label', 'Scroll to Top');
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) btn.classList.add('visible');
      else btn.classList.remove('visible');
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Initialize Canvas Hero background
  initPageCanvas();

  // Content reveal on scroll
  setupScrollReveal();

  // Smooth dismiss loader overlay
  dismissLoader();
}

function setupMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('click', (e) => {
      if (links.classList.contains('open') && !links.contains(e.target) && !toggle.contains(e.target)) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }
}

function dismissLoader() {
  setTimeout(() => {
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
      setTimeout(() => loader.remove(), 500);
    }
  }, 350);
}

function initLoaderCanvas() {
  const canvas = document.getElementById('loader-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = window.innerWidth, height = window.innerHeight;
  canvas.width = width; canvas.height = height;

  const nodes = Array.from({ length: 30 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
  }));

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.strokeStyle = `rgba(255, 163, 0, ${(1 - dist / 120) * 0.25})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
        }
      }
    }
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
      ctx.fillStyle = '#111111';
      ctx.beginPath(); ctx.arc(n.x, n.y, 2, 0, Math.PI * 2); ctx.fill();
    });
    if (document.getElementById('page-loader')) requestAnimationFrame(animate);
  }
  animate();
}

function initPageCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = 0, height = 0, nodes = [], time = 0, mouse = { x: -1000, y: -1000 };

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    initNodes();
  }

  function initNodes() {
    nodes = [];
    const count = Math.min(Math.floor((width * height) / 10000), 35);
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 1,
        isAccent: Math.random() < 0.25
      });
    }
  }

  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  function drawAbstractShapes() {
    time += 0.005;
    const centerX = width * 0.8;
    const centerY = height * 0.5;
    const polyRadius = Math.min(width, height) * 0.3;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(time * 0.4);

    ctx.strokeStyle = 'rgba(230, 230, 230, 0.5)';
    ctx.lineWidth = 1;
    const sides = 6;
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
      const angle = (i * 2 * Math.PI) / sides;
      const px = Math.cos(angle) * polyRadius;
      const py = Math.sin(angle) * polyRadius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.rotate(-time * 0.7);
    ctx.strokeStyle = 'rgba(255, 163, 0, 0.18)';
    ctx.beginPath();
    for (let i = 0; i <= 3; i++) {
      const angle = (i * 2 * Math.PI) / 3;
      const px = Math.cos(angle) * (polyRadius * 0.65);
      const py = Math.sin(angle) * (polyRadius * 0.65);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#f0f0f0';
    const gridStep = 45;
    for (let x = 22; x < width; x += gridStep) {
      for (let y = 22; y < height; y += gridStep) {
        ctx.fillRect(x, y, 1.2, 1.2);
      }
    }

    drawAbstractShapes();

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          const alpha = (1 - dist / 130) * 0.2;
          ctx.strokeStyle = `rgba(180, 180, 180, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;

      if (n.x < 0) n.x = width;
      if (n.x > width) n.x = 0;
      if (n.y < 0) n.y = height;
      if (n.y > height) n.y = 0;

      ctx.fillStyle = n.isAccent ? '#FFA300' : '#222222';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  resize();
  animate();
}

function setupScrollReveal() {
  const elements = document.querySelectorAll('.event-card, .team-card, .achievement-card, .about-grid > div, .contact-block');
  elements.forEach(el => el.classList.add('reveal-fade'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
}
