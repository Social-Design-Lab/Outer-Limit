function __outerLimitHidePage() {
  document.documentElement.style.setProperty('opacity', '0', 'important');
  document.documentElement.style.setProperty('visibility', 'hidden', 'important');
  document.documentElement.style.setProperty('background', '#fff', 'important');

  if (document.body) {
    document.body.style.setProperty('opacity', '0', 'important');
    document.body.style.setProperty('visibility', 'hidden', 'important');
    document.body.style.setProperty('background', '#fff', 'important');
  }
}

function __outerLimitShowPage() {
  document.documentElement.style.setProperty('opacity', '1', 'important');
  document.documentElement.style.setProperty('visibility', 'visible', 'important');

  if (document.body) {
    document.body.style.setProperty('opacity', '1', 'important');
    document.body.style.setProperty('visibility', 'visible', 'important');
  }

  const tag = document.getElementById('__outer_limit_hide__');
  if (tag) tag.remove();
}

function __outerLimitIsRedditAuthPage() {
  return /^\/(login|register|account\/login|account\/register)\b/.test(window.location.pathname);
}

__outerLimitHidePage();
window.__outerLimitHidePage = __outerLimitHidePage;

// Inject a <style> tag as an extra guarantee that nothing renders before the
// extension has had a chance to manipulate the DOM.
try {
  const hideStyle = document.createElement('style');
  hideStyle.id = '__outer_limit_hide__';
  hideStyle.textContent = 'html,body{opacity:0!important;visibility:hidden!important;background:#fff!important;}';
  document.documentElement.appendChild(hideStyle);
} catch (e) {
  // ignore — documentElement may not be ready in extreme cases
}

if (__outerLimitIsRedditAuthPage()) {
  __outerLimitShowPage();
}

// Hide the outgoing document before Chrome starts navigation. This prevents the
// previous Reddit page from being kept on screen for one frame during page load.
window.addEventListener('pagehide', __outerLimitHidePage, { capture: true });
window.addEventListener('beforeunload', __outerLimitHidePage, { capture: true });

document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  const link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
  if (!link || link.target === '_blank') {
    return;
  }

  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
    return;
  }

  try {
    const nextUrl = new URL(href, window.location.href);
    if (nextUrl.hostname.endsWith('reddit.com')) {
      __outerLimitHidePage();
    }
  } catch (e) {
    // ignore malformed URLs
  }
}, true);

// Suppress the original tab title until the extension decides what to show.
// The browser sets the tab title as soon as it parses <title>, which is earlier
// than any code in content.js can intervene. Override it as it gets parsed.
window.__outerLimit_titleState = {
  locked: true,
  placeholder: ' ',
  suppressed: null
};
document.title = window.__outerLimit_titleState.placeholder;
const __outerLimit_titleObs = new MutationObserver(() => {
  const state = window.__outerLimit_titleState;
  if (state.locked && document.title !== state.placeholder) {
    state.suppressed = document.title;
    document.title = state.placeholder;
  }
});
__outerLimit_titleObs.observe(document, {
  childList: true,
  subtree: true,
  characterData: true
});
window.__outerLimit_releaseTitle = function (forcedTitle) {
  const state = window.__outerLimit_titleState;
  state.locked = false;
  __outerLimit_titleObs.disconnect();
  if (forcedTitle != null) {
    document.title = forcedTitle;
  } else if (state.suppressed != null) {
    document.title = state.suppressed;
  }
};

// Wake up the service worker as early as possible so that subsequent
// chrome.runtime.sendMessage calls from content.js are instant.
try {
  chrome.runtime.sendMessage({ message: "ping" }, () => {
    if (chrome.runtime.lastError) {
      // ignore — we just need to wake the SW
    }
  });
} catch (e) {
  // ignore
}

setTimeout(() => {
  if (document.documentElement.style.opacity === '0') {
    document.documentElement.style.setProperty('opacity', '1', 'important');
    document.documentElement.style.setProperty('visibility', 'visible', 'important');
    if (document.body) {
      document.body.style.setProperty('opacity', '1', 'important');
      document.body.style.setProperty('visibility', 'visible', 'important');
    }
    const tag = document.getElementById('__outer_limit_hide__');
    if (tag) tag.remove();
  }
}, 30000);
