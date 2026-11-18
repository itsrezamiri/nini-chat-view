(function () {
  const { CONFIG } = window.__niniChat;
  const state = {
    page: 1,
    lastPage: 1,
    loading: false,
    exhausted: false,
    retryCount: 0,
    seenIds: new Set(),
    built: false,
  };
  let messagesEl, loadingEl, rootEl, currentSettings;

  function renderAndAppend(posts) {
    const frag = document.createDocumentFragment();
    posts.forEach((p) => frag.appendChild(window.__niniChat.renderPostBubble(p)));
    messagesEl.appendChild(frag);
  }

  function dedupe(posts) {
    const fresh = posts.filter((p) => !p.isAd && !state.seenIds.has(p.id));
    fresh.forEach((p) => state.seenIds.add(p.id));
    return fresh;
  }

  async function loadNextPage() {
    if (state.loading || state.exhausted) return;
    state.loading = true;
    loadingEl.hidden = false;
    try {
      const nextNum = state.page + 1;
      const doc = await window.__niniChat.fetchPageDoc(nextNum);
      const pag = window.__niniChat.extractPaginationInfo(doc);
      const fresh = dedupe(window.__niniChat.extractPosts(doc));

      if (fresh.length === 0) {
        state.exhausted = true;
      } else {
        renderAndAppend(fresh);
        state.page = pag.currentPage || nextNum;
      }
      if (!pag.hasNext) state.exhausted = true;
      state.retryCount = 0;
    } catch (err) {
      console.error('[nini-chat]', err);
      state.retryCount += 1;
      if (state.retryCount >= CONFIG.maxFetchRetries) state.exhausted = true;
    } finally {
      state.loading = false;
      loadingEl.hidden = true;
    }
  }

  function onScroll() {
    if (state.loading || state.exhausted) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesEl;
    if (scrollHeight - (scrollTop + clientHeight) < CONFIG.scrollThresholdPx) {
      loadNextPage();
    }
  }

  function resetState() {
    state.page = 1;
    state.lastPage = 1;
    state.loading = false;
    state.exhausted = false;
    state.retryCount = 0;
    state.seenIds = new Set();
  }

  async function buildChatView() {
    if (state.built) return;
    state.built = true;
    document.documentElement.classList.add('nini-chat-active');
    document.body.classList.add('nini-chat-active');

    rootEl = window.__niniChat.createOverlay();
    window.__niniChat.applySettings(rootEl, currentSettings);
    messagesEl = rootEl.querySelector('#' + CONFIG.messagesId);
    loadingEl = rootEl.querySelector('#' + CONFIG.loadingId);

    // The live document lazy-mounts reply posts as the page is scrolled, so
    // relying on `document` here would only capture whatever happened to be
    // mounted by document_idle. A fresh fetch of page 1 returns the full
    // static HTML with every post already present, same as a next-page fetch.
    let initialDoc = document;
    try {
      initialDoc = await window.__niniChat.fetchPageDoc(1);
    } catch (e) {
      console.error('[nini-chat] failed to fetch page 1, falling back to live document', e);
      initialDoc = document;
    }

    const firstPag = window.__niniChat.extractPaginationInfo(initialDoc);
    const firstPosts = dedupe(window.__niniChat.extractPosts(initialDoc));
    renderAndAppend(firstPosts);

    state.page = firstPag.currentPage;
    state.lastPage = firstPag.lastPage;
    state.exhausted = !firstPag.hasNext;

    messagesEl.addEventListener('scroll', onScroll, { passive: true });
  }

  function teardownChatView() {
    if (!state.built) return;
    state.built = false;
    document.documentElement.classList.remove('nini-chat-active');
    document.body.classList.remove('nini-chat-active');
    if (rootEl) rootEl.remove();
    rootEl = null;
    messagesEl = null;
    loadingEl = null;
    resetState();
  }

  async function init() {
    currentSettings = await window.__niniChat.loadSettings();
    if (currentSettings.enabled) {
      await buildChatView();
    }

    chrome.runtime.onMessage.addListener((message) => {
      if (!message || message.type !== 'NINI_SETTINGS_CHANGED') return;
      currentSettings = Object.assign({}, currentSettings, message.settings);

      if ('enabled' in message.settings) {
        if (currentSettings.enabled) buildChatView();
        else teardownChatView();
      }
      if (rootEl) window.__niniChat.applySettings(rootEl, currentSettings);
    });
  }

  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();
