(function () {
  const { CONFIG } = window.__niniChat;

  function createOverlay() {
    const root = document.createElement('div');
    root.id = CONFIG.rootId;
    root.innerHTML =
      '<div id="' + CONFIG.messagesId + '"></div>' +
      '<div id="' + CONFIG.loadingId + '" hidden>در حال بارگذاری...</div>';
    document.body.appendChild(root);
    return root;
  }

  // Most posts carry no inline font at all and should just use the overlay's
  // default (which matches ninisite's own site font). A minority of posts
  // are authored with the rich-text editor's font picker, which wraps text
  // in an inline `style="font-family:..."` — when present, the nickname
  // should match that specific post's font rather than the generic default.
  function detectMessageFont(msgEl) {
    const withFont = msgEl.querySelector('[style*="font-family" i]');
    return withFont ? withFont.style.fontFamily || null : null;
  }

  function renderPostBubble(post) {
    const row = document.createElement('div');
    row.className = 'nini-msg' + (post.isOwner ? ' nini-msg--owner' : '');
    row.dataset.postId = post.id;

    const avatar = document.createElement('img');
    avatar.className = 'nini-avatar';
    avatar.src = post.avatarUrl || '';
    avatar.loading = 'lazy';
    avatar.alt = '';

    const bubble = document.createElement('div');
    bubble.className = 'nini-bubble';

    const msg = document.createElement('div');
    msg.className = 'nini-message';
    msg.innerHTML = post.html;

    const nameEl = document.createElement('div');
    nameEl.className = 'nini-nickname';
    nameEl.textContent = post.nickname + (post.isOwner ? ' · نویسنده تاپیک' : '');
    const messageFont = detectMessageFont(msg);
    if (messageFont) nameEl.style.fontFamily = messageFont;
    bubble.appendChild(nameEl);

    if (post.quote) {
      const q = document.createElement('div');
      q.className = 'nini-quote';
      q.textContent = post.quote.text;
      if (post.quote.parentId) {
        q.dataset.quoteRef = post.quote.parentId;
        q.addEventListener('click', () => {
          const target = document.querySelector('.nini-msg[data-post-id="' + post.quote.parentId + '"]');
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
      bubble.appendChild(q);
    }

    bubble.appendChild(msg);

    row.appendChild(avatar);
    row.appendChild(bubble);
    return row;
  }

  window.__niniChat.createOverlay = createOverlay;
  window.__niniChat.renderPostBubble = renderPostBubble;
})();
