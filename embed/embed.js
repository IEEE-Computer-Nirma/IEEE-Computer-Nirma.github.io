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

  // Inject minimal CSS stylesheet into head if not already injected
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
    var loadingP = document.createElement('p');
    loadingP.className = 'ieee-cs-nirma-widget__loading';
    loadingP.textContent = 'Loading IEEE Computer Society Chapter content...';
    container.appendChild(loadingP);
  }

  // Render Fallback / Error State
  function renderFallback(container, message) {
    container.innerHTML = '';
    var fallbackP = document.createElement('p');
    fallbackP.className = 'ieee-cs-nirma-widget__fallback';
    fallbackP.textContent = message || 'IEEE Computer Society Chapter — Nirma University. Please visit https://ieee-computer-nirma.github.io for details.';
    container.appendChild(fallbackP);
  }

  // Safe DOM Helper functions
  function el(tag, textContent) {
    var elem = document.createElement(tag);
    if (textContent) elem.textContent = textContent;
    return elem;
  }

  function createLink(href, text, isExternal) {
    var a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    if (isExternal) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    return a;
  }

  // Main Simple Text Render Function
  function renderWidget(container, data) {
    container.innerHTML = '';

    // 1. Chapter Title & Intro
    if (data.chapter) {
      var title = el('h2', data.chapter.name + (data.chapter.institution ? ' — ' + data.chapter.institution : ''));
      container.appendChild(title);

      if (data.chapter.tagline) {
        var subtitle = el('p');
        var em = el('em', data.chapter.tagline);
        subtitle.appendChild(em);
        container.appendChild(subtitle);
      }

      if (data.chapter.description) {
        var desc = el('p', data.chapter.description);
        container.appendChild(desc);
      }
    }

    // 2. IEEE Computer Society
    if (data.ieee_cs) {
      var csTitle = el('h3', (data.ieee_cs.title || 'IEEE Computer Society') + (data.ieee_cs.anniversary ? ' (' + data.ieee_cs.anniversary + ')' : ''));
      container.appendChild(csTitle);

      if (data.ieee_cs.description) {
        var csDesc = el('p', data.ieee_cs.description);
        container.appendChild(csDesc);
      }

      if (Array.isArray(data.ieee_cs.highlights) && data.ieee_cs.highlights.length > 0) {
        var hlList = el('ul');
        data.ieee_cs.highlights.forEach(function (hl) {
          var li = el('li');
          var strong = el('strong', hl.title + ': ');
          li.appendChild(strong);
          li.appendChild(document.createTextNode(hl.description));
          hlList.appendChild(li);
        });
        container.appendChild(hlList);
      }
    }

    // 3. Nirma University Chapter
    if (data.nirma_chapter) {
      var nirmaTitle = el('h3', data.nirma_chapter.title || 'Nirma University Chapter');
      container.appendChild(nirmaTitle);

      if (data.nirma_chapter.description) {
        var nirmaDesc = el('p', data.nirma_chapter.description);
        container.appendChild(nirmaDesc);
      }

      if (data.nirma_chapter.featured_guest) {
        var guest = data.nirma_chapter.featured_guest;
        var guestP = el('p');
        guestP.appendChild(document.createTextNode('Featured Guest: '));
        if (guest.linkedin) {
          guestP.appendChild(createLink(guest.linkedin, guest.name, true));
        } else {
          guestP.appendChild(document.createTextNode(guest.name));
        }
        if (guest.role) {
          guestP.appendChild(document.createTextNode(' (' + guest.role + ')'));
        }
        container.appendChild(guestP);
      }
    }

    // 4. Goals
    if (Array.isArray(data.goals) && data.goals.length > 0) {
      var goalsTitle = el('h3', 'Goals');
      container.appendChild(goalsTitle);

      var goalsList = el('ul');
      data.goals.forEach(function (goal, idx) {
        var li = el('li');
        var strong = el('strong', (goal.id || (idx + 1)) + '. ' + goal.title + ': ');
        li.appendChild(strong);
        li.appendChild(document.createTextNode(goal.description));
        goalsList.appendChild(li);
      });
      container.appendChild(goalsList);
    }

    // 5. Faculty Advisor
    if (data.faculty_advisor) {
      var facTitle = el('h3', 'Faculty Advisor');
      container.appendChild(facTitle);

      var facP = el('p');
      var facStrong = el('strong', data.faculty_advisor.name);
      facP.appendChild(facStrong);
      if (data.faculty_advisor.role || data.faculty_advisor.affiliation) {
        var info = [];
        if (data.faculty_advisor.role) info.push(data.faculty_advisor.role);
        if (data.faculty_advisor.affiliation) info.push(data.faculty_advisor.affiliation);
        facP.appendChild(document.createTextNode(' — ' + info.join(', ')));
      }
      container.appendChild(facP);
    }

    // 6. Extensible events
    if (Array.isArray(data.events) && data.events.length > 0) {
      var evTitle = el('h3', 'Events');
      container.appendChild(evTitle);
      var evList = el('ul');
      data.events.forEach(function (ev) {
        var li = el('li');
        var strong = el('strong', ev.title + ': ');
        li.appendChild(strong);
        if (ev.description) li.appendChild(document.createTextNode(ev.description));
        evList.appendChild(li);
      });
      container.appendChild(evList);
    }

    // 7. Links
    if (Array.isArray(data.links) && data.links.length > 0) {
      var linksTitle = el('h3', 'Useful Links');
      container.appendChild(linksTitle);

      var linksList = el('ul');
      data.links.forEach(function (lk) {
        var li = el('li');
        var a = createLink(lk.url, lk.label, lk.external);
        li.appendChild(a);
        linksList.appendChild(li);
      });
      container.appendChild(linksList);
    }
  }

  // Initialize Widget
  function init() {
    injectStylesheet();
    var container = getWidgetContainer();
    renderLoading(container);

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
        fetch(CONTENT_URL)
          .then(function (res) {
            if (!res.ok) throw new Error('HTTP error ' + res.status);
            return res.json();
          })
          .then(function (data) {
            renderWidget(container, data);
          })
          .catch(function (error) {
            renderFallback(container, 'Failed to retrieve chapter content.');
          });
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
