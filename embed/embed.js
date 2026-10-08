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
    container.textContent = '';
    var loadingP = document.createElement('p');
    loadingP.className = 'ieee-cs-nirma-widget__loading';
    loadingP.textContent = 'Loading IEEE Computer Society Chapter content...';
    container.appendChild(loadingP);
  }

  // Render Fallback / Error State
  function renderFallback(container, message) {
    container.textContent = '';
    var fallbackP = document.createElement('p');
    fallbackP.className = 'ieee-cs-nirma-widget__fallback';
    fallbackP.textContent = message || 'IEEE Computer Society Chapter — Nirma University. Please visit https://ieee-computer-nirma.github.io for details.';
    container.appendChild(fallbackP);
  }

  // Resolve relative URLs to absolute BASE_URL
  function resolveUrl(relativeUrl) {
    if (!relativeUrl) return '';
    if (relativeUrl.indexOf('http://') === 0 || relativeUrl.indexOf('https://') === 0 || relativeUrl.indexOf('//') === 0) {
      return relativeUrl;
    }
    return BASE_URL + relativeUrl.replace(/^\/+/, '');
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
    container.textContent = '';

    // 1. Chapter Title & Intro
    if (data.chapter) {
      if (data.chapter.logo) {
        var logoImg = document.createElement('img');
        logoImg.src = resolveUrl(data.chapter.logo);
        logoImg.alt = data.chapter.logo_alt || data.chapter.name || 'IEEE CS Nirma Logo';
        logoImg.className = 'ieee-cs-nirma-widget__logo';
        container.appendChild(logoImg);
      }

      var title = el('h2', data.chapter.name + (data.chapter.institution ? ' — ' + data.chapter.institution : ''));
      container.appendChild(title);

      if (data.chapter.tagline) {
        var taglineP = el('p', data.chapter.tagline);
        taglineP.className = 'ieee-cs-nirma-widget__tagline';
        container.appendChild(taglineP);
      }

      // In-flow split layout: Left Image, Right Text
      if (data.chapter.description || data.chapter.image) {
        if (data.chapter.image) {
          var chapterBlock = document.createElement('div');
          chapterBlock.className = 'ieee-cs-nirma-widget__media-block';

          var mediaImgWrap = document.createElement('div');
          mediaImgWrap.className = 'ieee-cs-nirma-widget__media-img';
          var chapterImg = document.createElement('img');
          chapterImg.src = resolveUrl(data.chapter.image);
          chapterImg.alt = data.chapter.image_alt || 'IEEE CS Nirma Chapter Team';
          chapterImg.className = 'ieee-cs-nirma-widget__image';
          mediaImgWrap.appendChild(chapterImg);

          var mediaTextWrap = document.createElement('div');
          mediaTextWrap.className = 'ieee-cs-nirma-widget__media-text';
          if (data.chapter.description) {
            mediaTextWrap.appendChild(el('p', data.chapter.description));
          }

          chapterBlock.appendChild(mediaImgWrap);
          chapterBlock.appendChild(mediaTextWrap);
          container.appendChild(chapterBlock);
        } else if (data.chapter.description) {
          container.appendChild(el('p', data.chapter.description));
        }
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

      // In-flow split layout: Left Text, Right Image (reverse layout)
      if (data.nirma_chapter.description || data.nirma_chapter.image) {
        if (data.nirma_chapter.image) {
          var nirmaBlock = document.createElement('div');
          nirmaBlock.className = 'ieee-cs-nirma-widget__media-block ieee-cs-nirma-widget__media-block--reverse';

          var nirmaTextWrap = document.createElement('div');
          nirmaTextWrap.className = 'ieee-cs-nirma-widget__media-text';

          if (data.nirma_chapter.description) {
            nirmaTextWrap.appendChild(el('p', data.nirma_chapter.description));
          }

          if (data.nirma_chapter.featured_guest) {
            var guest = data.nirma_chapter.featured_guest;
            var guestCard = document.createElement('div');
            guestCard.className = 'ieee-cs-nirma-widget__guest-card';

            var guestLabel = el('span', 'Featured Industry Guest');
            guestLabel.className = 'ieee-cs-nirma-widget__guest-label';

            var guestBody = document.createElement('div');
            guestBody.className = 'ieee-cs-nirma-widget__guest-body';

            var guestName = guest.linkedin ? createLink(guest.linkedin, guest.name, true) : el('span', guest.name);
            guestName.className = 'ieee-cs-nirma-widget__guest-name';

            guestBody.appendChild(guestName);

            if (guest.role) {
              var guestRole = el('span', guest.role);
              guestRole.className = 'ieee-cs-nirma-widget__guest-role';
              guestBody.appendChild(guestRole);
            }

            guestCard.appendChild(guestLabel);
            guestCard.appendChild(guestBody);
            nirmaTextWrap.appendChild(guestCard);
          }

          var nirmaImgWrap = document.createElement('div');
          nirmaImgWrap.className = 'ieee-cs-nirma-widget__media-img';
          var nirmaImg = document.createElement('img');
          nirmaImg.src = resolveUrl(data.nirma_chapter.image);
          nirmaImg.alt = data.nirma_chapter.image_alt || data.nirma_chapter.title || 'Nirma Chapter Image';
          nirmaImg.className = 'ieee-cs-nirma-widget__image';
          nirmaImgWrap.appendChild(nirmaImg);

          nirmaBlock.appendChild(nirmaTextWrap);
          nirmaBlock.appendChild(nirmaImgWrap);
          container.appendChild(nirmaBlock);
        } else {
          if (data.nirma_chapter.description) {
            container.appendChild(el('p', data.nirma_chapter.description));
          }
          if (data.nirma_chapter.featured_guest) {
            var guestFallback = data.nirma_chapter.featured_guest;
            var guestCardFb = document.createElement('div');
            guestCardFb.className = 'ieee-cs-nirma-widget__guest-card';
            var guestLabelFb = el('span', 'Featured Industry Guest');
            guestLabelFb.className = 'ieee-cs-nirma-widget__guest-label';
            var guestBodyFb = document.createElement('div');
            guestBodyFb.className = 'ieee-cs-nirma-widget__guest-body';
            var guestNameFb = guestFallback.linkedin ? createLink(guestFallback.linkedin, guestFallback.name, true) : el('span', guestFallback.name);
            guestNameFb.className = 'ieee-cs-nirma-widget__guest-name';
            guestBodyFb.appendChild(guestNameFb);
            if (guestFallback.role) {
              var guestRoleFb = el('span', guestFallback.role);
              guestRoleFb.className = 'ieee-cs-nirma-widget__guest-role';
              guestBodyFb.appendChild(guestRoleFb);
            }
            guestCardFb.appendChild(guestLabelFb);
            guestCardFb.appendChild(guestBodyFb);
            container.appendChild(guestCardFb);
          }
        }
      }
    }

    // 4. Goals
    if (Array.isArray(data.goals) && data.goals.length > 0) {
      var goalsTitle = el('h3', 'Goals');
      container.appendChild(goalsTitle);

      var goalsList = el('ul');
      data.goals.forEach(function (goal) {
        var li = el('li');
        var strong = el('strong', goal.title + ': ');
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
