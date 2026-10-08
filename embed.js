(function () {
  'use strict';

  // Prevent duplicate execution if the script is included more than once
  var LOADED_FLAG = '__IEEE_CS_NIRMA_WIDGET_LOADED__';
  if (window[LOADED_FLAG]) {
    return;
  }
  window[LOADED_FLAG] = true;

  // Captured synchronously: document.currentScript is null after load
  var SCRIPT_ELEMENT = document.currentScript;

  var DEFAULT_BASE_URL = 'https://ieee-computer-nirma.github.io/';
  var ROOT_CLASS = 'ieee-cs-nirma-widget';
  var CONTAINER_ID = 'ieee-cs-nirma-widget';
  var TITLE_ID = CONTAINER_ID + '-title';
  var FETCH_TIMEOUT_MS = 10000;
  var LINK_PROTOCOLS = ['http:', 'https:', 'mailto:'];
  var IMAGE_PROTOCOLS = ['http:', 'https:'];

  // content.json and embed.css are loaded from the same folder as this script
  function getBaseUrl() {
    if (SCRIPT_ELEMENT && SCRIPT_ELEMENT.src) {
      try {
        return new URL('.', SCRIPT_ELEMENT.src).href;
      } catch (e) { /* fall through to default */ }
    }
    return DEFAULT_BASE_URL;
  }

  var BASE_URL = getBaseUrl();
  var CSS_URL = BASE_URL + 'embed.css';
  var CONTENT_URL = BASE_URL + 'content.json';

  // ---------- Helpers ----------

  function str(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  // Resolves against BASE_URL and only allows the given protocols
  // (blocks javascript:, data: and similar). Returns '' if unusable.
  function safeUrl(value, allowedProtocols) {
    var raw = str(value);
    if (!raw) return '';
    var parsed;
    try {
      parsed = new URL(raw, BASE_URL);
    } catch (e) {
      return '';
    }
    return allowedProtocols.indexOf(parsed.protocol) !== -1 ? parsed.href : '';
  }

  // Links to other sites open in a new tab and say so for screen readers
  function createLink(url, label) {
    var href = safeUrl(url, LINK_PROTOCOLS);
    var text = str(label);
    if (!href || !text) return null;

    var a = el('a', null, text);
    a.href = href;

    var parsed = new URL(href);
    if (parsed.protocol !== 'mailto:' && parsed.origin !== window.location.origin) {
      a.target = '_blank';
      a.rel = 'noopener';
      a.appendChild(el('span', ROOT_CLASS + '__sr-only', ' (opens in a new tab)'));
    }
    return a;
  }

  // alt is used exactly as given in the JSON; an empty string marks a decorative image
  function createImage(src, alt, className, lazy) {
    var url = safeUrl(src, IMAGE_PROTOCOLS);
    if (!url) return null;

    var img = document.createElement('img');
    img.src = url;
    img.alt = typeof alt === 'string' ? alt : '';
    img.className = className;
    img.decoding = 'async';
    if (lazy) img.loading = 'lazy';
    img.addEventListener('error', function () {
      if (img.parentNode) img.parentNode.removeChild(img);
    });
    return img;
  }

  // Heading level for the widget title; sections use the next level down.
  // Hosts can set data-heading-level (1-5) on the container or the script tag.
  function getHeadingLevel(container) {
    var level = parseInt(container.getAttribute('data-heading-level'), 10);
    if (!level && SCRIPT_ELEMENT) {
      level = parseInt(SCRIPT_ELEMENT.getAttribute('data-heading-level'), 10);
    }
    if (isNaN(level)) level = 2;
    return Math.min(Math.max(level, 1), 5);
  }

  function addSection(container, title, level) {
    var section = el('section', ROOT_CLASS + '__section');
    var heading = str(title);
    if (heading) {
      section.appendChild(el('h' + level, ROOT_CLASS + '__heading', heading));
    }
    container.appendChild(section);
    return section;
  }

  function addParagraph(parent, text, className) {
    var value = str(text);
    if (value) parent.appendChild(el('p', className, value));
  }

  // <figure> with an image and optional caption. If the image fails to load,
  // the whole figure is removed and onFail() lets the layout close the gap.
  function createFigure(src, alt, caption, onFail) {
    var img = createImage(src, alt, ROOT_CLASS + '__photo', true);
    if (!img) return null;

    var figure = el('figure', ROOT_CLASS + '__figure');
    figure.appendChild(img);
    var text = str(caption);
    if (text) figure.appendChild(el('figcaption', ROOT_CLASS + '__caption', text));

    img.addEventListener('error', function () {
      if (figure.parentNode) figure.parentNode.removeChild(figure);
      if (onFail) onFail();
    });
    return figure;
  }

  // Heading + paragraphs on one side, figure on the other (stacked on small screens).
  // Text always comes first in the DOM; "reverse" only changes the visual order.
  function renderSplit(container, data, level, paragraphs, reverse) {
    var texts = paragraphs.map(str).filter(Boolean);
    var title = str(data.title);
    var textOnlyClass = ROOT_CLASS + '__split--text-only';

    var section = el('section', ROOT_CLASS + '__section ' + ROOT_CLASS + '__split' +
      (reverse ? ' ' + ROOT_CLASS + '__split--reverse' : ''));

    var figure = createFigure(data.image, data.image_alt, data.image_caption, function () {
      section.classList.add(textOnlyClass);
    });
    if (!texts.length && !figure) return;

    var textBox = el('div', ROOT_CLASS + '__split-text');
    if (title) textBox.appendChild(el('h' + level, ROOT_CLASS + '__heading', title));
    texts.forEach(function (text) {
      textBox.appendChild(el('p', null, text));
    });
    section.appendChild(textBox);

    if (figure) section.appendChild(figure);
    else section.classList.add(textOnlyClass);

    container.appendChild(section);
  }

  // Builds a <ul>/<ol> from [{ title, description }]; returns null if nothing usable
  function buildTitledList(rawItems, ordered, listClass) {
    if (!Array.isArray(rawItems)) return null;
    var items = rawItems.filter(function (item) {
      return item && (str(item.title) || str(item.description));
    });
    if (!items.length) return null;

    var list = el(ordered ? 'ol' : 'ul', listClass ? ROOT_CLASS + '__' + listClass : null);
    if (listClass) list.setAttribute('role', 'list');
    items.forEach(function (item) {
      var li = el('li');
      if (str(item.title)) li.appendChild(el('strong', ROOT_CLASS + '__item-title', str(item.title)));
      if (str(item.description)) li.appendChild(document.createTextNode(str(item.description)));
      list.appendChild(li);
    });
    return list;
  }

  // Section shape: { title, items: [{ title, description }] }
  function renderTitledList(container, data, level, ordered, listClass) {
    var list = data && buildTitledList(data.items, ordered, listClass);
    if (!list) return;
    addSection(container, data.title, level).appendChild(list);
  }

  // ---------- States ----------

  function renderLoading(container) {
    container.classList.add(ROOT_CLASS);
    container.setAttribute('aria-busy', 'true');
    container.textContent = '';
    var p = el('p', ROOT_CLASS + '__loading', 'Loading IEEE Computer Society Student Chapter content…');
    p.setAttribute('role', 'status');
    container.appendChild(p);
  }

  function renderFallback(container) {
    container.removeAttribute('aria-busy');
    container.removeAttribute('role');
    container.removeAttribute('aria-labelledby');
    container.textContent = '';
    var p = el('p', ROOT_CLASS + '__fallback', "Couldn't load the chapter information. It's available at ");
    var link = createLink(DEFAULT_BASE_URL, 'ieee-computer-nirma.github.io');
    if (link) p.appendChild(link);
    p.appendChild(document.createTextNode('.'));
    container.appendChild(p);
  }

  // ---------- Sections ----------

  function renderIntro(container, chapter, level) {
    if (!chapter) return;
    var hero = el('div', ROOT_CLASS + '__hero');

    var logo = createImage(chapter.logo, chapter.logo_alt, ROOT_CLASS + '__logo', false);
    if (logo) hero.appendChild(logo);

    var name = str(chapter.name);
    var institution = str(chapter.institution);
    var title = name && institution ? name + ' — ' + institution : (name || institution);
    if (title) {
      var h = el('h' + level, ROOT_CLASS + '__title', title);
      h.id = TITLE_ID;
      hero.appendChild(h);
      container.setAttribute('role', 'region');
      container.setAttribute('aria-labelledby', TITLE_ID);
    }

    addParagraph(hero, chapter.tagline, ROOT_CLASS + '__tagline');
    addParagraph(hero, chapter.description);
    container.appendChild(hero);
  }

  function renderWhatWeDo(container, data, level) {
    if (!data) return;
    renderSplit(container, data, level, Array.isArray(data.paragraphs) ? data.paragraphs : [], false);
  }

  function renderChapter(container, data, level) {
    if (!data) return;
    renderSplit(container, data, level, Array.isArray(data.paragraphs) ? data.paragraphs : [data.description], true);
  }

  function renderAdvisor(container, data, level) {
    if (!data || !str(data.name)) return;
    var section = addSection(container, data.title, level);
    var p = el('p');
    p.appendChild(el('strong', null, str(data.name)));
    if (str(data.affiliation)) {
      p.appendChild(document.createElement('br'));
      p.appendChild(document.createTextNode(str(data.affiliation)));
    }
    section.appendChild(p);
  }

  function renderIeeeCs(container, data, level) {
    if (!data) return;
    var section = addSection(container, data.title, level);
    addParagraph(section, data.description);
    var highlights = buildTitledList(data.highlights, false);
    if (highlights) section.appendChild(highlights);
  }

  function renderLinks(container, data, level) {
    if (!data || !Array.isArray(data.items)) return;
    var list = el('ul', ROOT_CLASS + '__links');
    list.setAttribute('role', 'list');
    data.items.forEach(function (item) {
      if (!item) return;
      var a = createLink(item.url, item.label);
      if (!a) return;
      var li = el('li');
      li.appendChild(a);
      list.appendChild(li);
    });
    if (!list.firstChild) return;
    addSection(container, data.title, level).appendChild(list);
  }

  // Section order is fixed here; content comes from content.json
  function renderWidget(container, data, level) {
    if (!data || typeof data !== 'object') {
      throw new Error('content.json is not a valid object');
    }
    var sub = Math.min(level + 1, 6);

    container.textContent = '';
    container.removeAttribute('aria-busy');

    renderIntro(container, data.chapter, level);
    renderWhatWeDo(container, data.what_we_do, sub);
    renderChapter(container, data.nirma_chapter, sub);
    renderTitledList(container, data.goals, sub, true, 'goals');
    renderTitledList(container, data.events, sub, false); // optional, shown only when present
    renderIeeeCs(container, data.ieee_cs, sub);
    renderAdvisor(container, data.faculty_advisor, sub);
    renderLinks(container, data.links, sub);
  }

  // ---------- Loading ----------

  function injectStylesheet() {
    if (document.querySelector('link[data-ieee-cs-widget-css]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CSS_URL;
    link.setAttribute('data-ieee-cs-widget-css', 'true');
    document.head.appendChild(link);
  }

  // Reuse a container the host already placed; otherwise create one next to the script.
  // Never insert into <head>, where the element would not be displayed.
  function getContainer() {
    var container = document.getElementById(CONTAINER_ID);
    if (container) return container;

    container = el('div', ROOT_CLASS);
    container.id = CONTAINER_ID;

    var parent = SCRIPT_ELEMENT && SCRIPT_ELEMENT.parentNode;
    if (parent && parent !== document.head && document.body && document.body.contains(SCRIPT_ELEMENT)) {
      parent.insertBefore(container, SCRIPT_ELEMENT);
    } else {
      (document.body || document.documentElement).appendChild(container);
    }
    return container;
  }

  function loadContent() {
    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, FETCH_TIMEOUT_MS) : null;

    function done() {
      if (timer) clearTimeout(timer);
    }

    return fetch(CONTENT_URL, controller ? { signal: controller.signal } : undefined)
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP error ' + response.status);
        return response.json();
      })
      .then(function (data) { done(); return data; },
            function (err) { done(); throw err; });
  }

  function init() {
    injectStylesheet();
    var container = getContainer();
    var level = getHeadingLevel(container);
    renderLoading(container);

    loadContent()
      .then(function (data) {
        renderWidget(container, data, level);
      })
      .catch(function (err) {
        if (window.console && console.warn) {
          console.warn('[IEEE CS Nirma widget] Could not render content:', err);
        }
        renderFallback(container);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();