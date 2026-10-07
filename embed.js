(function () {
  'use strict';

  // Prevent duplicate execution
  if (window.__IEEE_CS_NIRMA_WIDGET_LOADED__) {
    return;
  }
  window.__IEEE_CS_NIRMA_WIDGET_LOADED__ = true;

  // Capture script element reference synchronously at load time
  var SCRIPT_ELEMENT = document.currentScript;

  // Determine base URL dynamically from currentScript src or default fallback
  function getBaseUrl() {
    var currentScript = SCRIPT_ELEMENT || document.currentScript;
    if (currentScript && currentScript.src) {
      var scriptSrc = currentScript.src;
      var lastSlash = scriptSrc.lastIndexOf('/');
      if (lastSlash !== -1) {
        return scriptSrc.substring(0, lastSlash + 1);
      }
    }
    return 'https://ieee-computer-nirma.github.io/';
  }

  var BASE_URL = getBaseUrl();
  var CSS_URL = BASE_URL + 'embed.css';
  var CONTENT_URL = BASE_URL + 'content.json';

  // Inject CSS stylesheet into head if not already injected
  function injectStylesheet() {
    if (document.querySelector('link[data-ieee-cs-widget-css]')) {
      return;
    }
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = CSS_URL;
    link.setAttribute('data-ieee-cs-widget-css', 'true');
    document.head.appendChild(link);
  }

  // Get or create container element
  function getWidgetContainer() {
    var container = document.getElementById('ieee-cs-nirma-widget');
    if (container) {
      return container;
    }

    // Fallback to inserting container directly before/after current script
    container = document.createElement('div');
    container.id = 'ieee-cs-nirma-widget';
    container.className = 'ieee-cs-nirma-widget';

    var targetScript = SCRIPT_ELEMENT || document.currentScript;
    if (targetScript && targetScript.parentNode) {
      targetScript.parentNode.insertBefore(container, targetScript);
    } else {
      document.body.appendChild(container);
    }
    return container;
  }

  // Render Loading State
  function renderLoading(container) {
    container.className = 'ieee-cs-nirma-widget';
    container.innerHTML = '';

    var loadingDiv = document.createElement('div');
    loadingDiv.className = 'ieee-cs-nirma-widget__loading';

    var spinner = document.createElement('div');
    spinner.className = 'ieee-cs-nirma-widget__spinner';

    var text = document.createElement('span');
    text.textContent = 'Loading IEEE Computer Society Chapter Content...';

    loadingDiv.appendChild(spinner);
    loadingDiv.appendChild(text);
    container.appendChild(loadingDiv);
  }

  // Render Fallback / Error State
  function renderFallback(container, message) {
    container.innerHTML = '';
    var fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'ieee-cs-nirma-widget__fallback';

    var title = document.createElement('strong');
    title.textContent = 'IEEE Computer Society Chapter — Nirma University';
    title.style.display = 'block';
    title.style.marginBottom = '4px';

    var desc = document.createElement('p');
    desc.textContent = message || 'Unable to load content at this time. Please visit https://ieee-computer-nirma.github.io for details.';

    var link = document.createElement('a');
    link.href = 'https://ieee-computer-nirma.github.io';
    link.textContent = 'Visit Chapter Website →';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'ieee-cs-nirma-widget__link-inline';
    link.style.marginTop = '8px';
    link.style.display = 'inline-block';

    fallbackDiv.appendChild(title);
    fallbackDiv.appendChild(desc);
    fallbackDiv.appendChild(link);
    container.appendChild(fallbackDiv);
  }

  // Safe DOM Helper functions
  function el(tag, className, textContent) {
    var elem = document.createElement(tag);
    if (className) elem.className = className;
    if (textContent) elem.textContent = textContent;
    return elem;
  }

  function createLink(href, text, isExternal, className) {
    var a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    a.className = className || 'ieee-cs-nirma-widget__link';
    if (isExternal) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    return a;
  }

  // Main Render Function
  function renderWidget(container, data) {
    container.innerHTML = '';

    // 1. Header Section
    if (data.chapter) {
      var header = el('header', 'ieee-cs-nirma-widget__header');

      var badge = el('span', 'ieee-cs-nirma-widget__badge', data.chapter.institution || 'Nirma University');
      header.appendChild(badge);

      var title = el('h2', 'ieee-cs-nirma-widget__title', data.chapter.name);
      header.appendChild(title);

      if (data.chapter.tagline) {
        var subtitle = el('p', 'ieee-cs-nirma-widget__subtitle', data.chapter.tagline);
        header.appendChild(subtitle);
      }

      if (data.chapter.description) {
        var desc = el('p', 'ieee-cs-nirma-widget__description', data.chapter.description);
        header.appendChild(desc);
      }

      container.appendChild(header);
    }

    // 2. IEEE Computer Society Section
    if (data.ieee_cs) {
      var section = el('section', 'ieee-cs-nirma-widget__section');

      var secHeader = el('div', 'ieee-cs-nirma-widget__section-header');
      secHeader.appendChild(el('h3', 'ieee-cs-nirma-widget__section-title', data.ieee_cs.title || 'IEEE Computer Society'));

      if (data.ieee_cs.anniversary) {
        secHeader.appendChild(el('span', 'ieee-cs-nirma-widget__anniversary', data.ieee_cs.anniversary));
      }
      section.appendChild(secHeader);

      if (data.ieee_cs.description) {
        section.appendChild(el('p', 'ieee-cs-nirma-widget__description', data.ieee_cs.description));
      }

      // Highlights Cards
      if (Array.isArray(data.ieee_cs.highlights) && data.ieee_cs.highlights.length > 0) {
        var grid = el('div', 'ieee-cs-nirma-widget__grid');
        data.ieee_cs.highlights.forEach(function (hl) {
          var card = el('div', 'ieee-cs-nirma-widget__card');
          card.appendChild(el('h4', 'ieee-cs-nirma-widget__card-title', hl.title));
          card.appendChild(el('p', 'ieee-cs-nirma-widget__card-text', hl.description));
          grid.appendChild(card);
        });
        section.appendChild(grid);
      }

      container.appendChild(section);
    }

    // 3. Nirma University Chapter Section
    if (data.nirma_chapter) {
      var nirmaSec = el('section', 'ieee-cs-nirma-widget__section');

      var nirmaHeader = el('div', 'ieee-cs-nirma-widget__section-header');
      nirmaHeader.appendChild(el('h3', 'ieee-cs-nirma-widget__section-title', data.nirma_chapter.title || 'Nirma University Chapter'));
      nirmaSec.appendChild(nirmaHeader);

      if (data.nirma_chapter.description) {
        nirmaSec.appendChild(el('p', 'ieee-cs-nirma-widget__description', data.nirma_chapter.description));
      }

      if (data.nirma_chapter.featured_guest) {
        var guest = data.nirma_chapter.featured_guest;
        var guestBox = el('div', 'ieee-cs-nirma-widget__info-box');
        var guestP = el('p', 'ieee-cs-nirma-widget__card-text');
        guestP.appendChild(document.createTextNode('Prominent guest welcomed: '));

        if (guest.linkedin) {
          var guestLink = createLink(guest.linkedin, guest.name, true, 'ieee-cs-nirma-widget__link-inline');
          guestP.appendChild(guestLink);
        } else {
          guestP.appendChild(document.createTextNode(guest.name));
        }

        if (guest.role) {
          guestP.appendChild(document.createTextNode(' (' + guest.role + ')'));
        }

        guestBox.appendChild(guestP);
        nirmaSec.appendChild(guestBox);
      }

      container.appendChild(nirmaSec);
    }

    // 4. Goals Section
    if (Array.isArray(data.goals) && data.goals.length > 0) {
      var goalsSec = el('section', 'ieee-cs-nirma-widget__section');

      var goalsHeader = el('div', 'ieee-cs-nirma-widget__section-header');
      goalsHeader.appendChild(el('h3', 'ieee-cs-nirma-widget__section-title', 'Chapter Goals'));
      goalsSec.appendChild(goalsHeader);

      var goalsGrid = el('div', 'ieee-cs-nirma-widget__grid');
      data.goals.forEach(function (goal, idx) {
        var goalCard = el('div', 'ieee-cs-nirma-widget__goal-card');
        goalCard.appendChild(el('div', 'ieee-cs-nirma-widget__goal-num', 'Goal ' + (goal.id || idx + 1)));
        goalCard.appendChild(el('h4', 'ieee-cs-nirma-widget__card-title', goal.title));
        goalCard.appendChild(el('p', 'ieee-cs-nirma-widget__card-text', goal.description));
        goalsGrid.appendChild(goalCard);
      });

      goalsSec.appendChild(goalsGrid);
      container.appendChild(goalsSec);
    }

    // 5. Faculty Advisor Section
    if (data.faculty_advisor) {
      var facSec = el('section', 'ieee-cs-nirma-widget__section');

      var facHeader = el('div', 'ieee-cs-nirma-widget__section-header');
      facHeader.appendChild(el('h3', 'ieee-cs-nirma-widget__section-title', 'Faculty Leadership'));
      facSec.appendChild(facHeader);

      var facCard = el('div', 'ieee-cs-nirma-widget__faculty-card');

      var icon = el('div', 'ieee-cs-nirma-widget__faculty-icon', 'FA');
      facCard.appendChild(icon);

      var details = el('div');
      details.appendChild(el('div', 'ieee-cs-nirma-widget__faculty-name', data.faculty_advisor.name));
      if (data.faculty_advisor.role) {
        details.appendChild(el('div', 'ieee-cs-nirma-widget__faculty-role', data.faculty_advisor.role));
      }
      if (data.faculty_advisor.affiliation) {
        details.appendChild(el('div', 'ieee-cs-nirma-widget__faculty-affil', data.faculty_advisor.affiliation));
      }

      facCard.appendChild(details);
      facSec.appendChild(facCard);
      container.appendChild(facSec);
    }

    // 6. Extensible sections: Events / Achievements / Announcements (if present)
    if (Array.isArray(data.events) && data.events.length > 0) {
      var eventsSec = el('section', 'ieee-cs-nirma-widget__section');
      var evHeader = el('div', 'ieee-cs-nirma-widget__section-header');
      evHeader.appendChild(el('h3', 'ieee-cs-nirma-widget__section-title', 'Recent Events'));
      eventsSec.appendChild(evHeader);
      var evGrid = el('div', 'ieee-cs-nirma-widget__grid');
      data.events.forEach(function (ev) {
        var evCard = el('div', 'ieee-cs-nirma-widget__card');
        evCard.appendChild(el('h4', 'ieee-cs-nirma-widget__card-title', ev.title));
        if (ev.description) evCard.appendChild(el('p', 'ieee-cs-nirma-widget__card-text', ev.description));
        evGrid.appendChild(evCard);
      });
      eventsSec.appendChild(evGrid);
      container.appendChild(eventsSec);
    }

    // 7. Links Section
    if (Array.isArray(data.links) && data.links.length > 0) {
      var linksSec = el('section', 'ieee-cs-nirma-widget__section');

      var linksHeader = el('div', 'ieee-cs-nirma-widget__section-header');
      linksHeader.appendChild(el('h3', 'ieee-cs-nirma-widget__section-title', 'Useful Links & Portals'));
      linksSec.appendChild(linksHeader);

      var linksDiv = el('div', 'ieee-cs-nirma-widget__links');
      data.links.forEach(function (lk) {
        var btn = createLink(lk.url, lk.label + (lk.external ? ' ↗' : ' →'), lk.external);
        linksDiv.appendChild(btn);
      });

      linksSec.appendChild(linksDiv);
      container.appendChild(linksSec);
    }
  }

  // Initialize Widget
  function init() {
    injectStylesheet();
    var container = getWidgetContainer();
    renderLoading(container);

    // Fetch JSON with cache-busting timestamp param
    var cacheBustUrl = CONTENT_URL + '?_t=' + new Date().getTime();

    fetch(cacheBustUrl)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP error ' + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        renderWidget(container, data);
      })
      .catch(function (err) {
        // Retry without query param in case server disallows query params
        fetch(CONTENT_URL)
          .then(function (res) {
            if (!res.ok) throw new Error('HTTP error ' + res.status);
            return res.json();
          })
          .then(function (data) {
            renderWidget(container, data);
          })
          .catch(function (error) {
            renderFallback(container, 'Failed to retrieve chapter content. Please visit official chapter site.');
          });
      });
  }

  // Execute initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
