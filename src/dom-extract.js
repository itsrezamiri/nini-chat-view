(function () {
  const { SELECTORS } = window.__niniChat;

  function hrefPathname(rawHref) {
    try {
      return new URL(rawHref, location.origin).pathname;
    } catch (e) {
      return rawHref || '';
    }
  }

  function isAdPost(node) {
    if (node.id === 'forum-native-ad') return true;

    const nicknameEl = node.querySelector('a.nickname');
    const nicknameHref = nicknameEl ? hrefPathname(nicknameEl.getAttribute('href') || '') : '';
    if (!/^\/user\//.test(nicknameHref)) return true;

    const links = Array.from(node.querySelectorAll('a[href]'));
    if (links.length > 0 && links.every((a) => /^\/s\//.test(hrefPathname(a.getAttribute('href') || '')))) {
      return true;
    }
    return false;
  }

  function sanitizeMessageFragment(rawHtml) {
    const wrapper = new DOMParser().parseFromString(
      '<div>' + rawHtml + '</div>',
      'text/html'
    ).body.firstChild;

    wrapper.querySelectorAll('script, style, iframe, object, embed').forEach((el) => el.remove());

    wrapper.querySelectorAll('*').forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
      });
      if (el.tagName === 'A') {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
      if (el.tagName === 'IMG') el.setAttribute('loading', 'lazy');
    });

    return wrapper.innerHTML;
  }

  // The quoted-reply block (.topic-post__quotation) is a SIBLING of the
  // message div within the post, not nested inside it — so it must be
  // searched for at the post level, not scoped to the message element.
  function extractQuote(node) {
    const quoteBlock = node.querySelector(SELECTORS.quotation);
    if (!quoteBlock) return null;
    const replyMessageEl = quoteBlock.querySelector(SELECTORS.replyMessage);
    const parentId = replyMessageEl ? replyMessageEl.getAttribute('data-id') : null;
    const text = (replyMessageEl || quoteBlock).textContent.trim();
    return { parentId, text };
  }

  function extractPostId(node) {
    const dataId = node.getAttribute('data-id');
    if (dataId) return dataId;
    const match = (node.id || '').match(/^post-(\d+)$/);
    return match ? match[1] : null;
  }

  function extractPosts(doc) {
    return Array.from(doc.querySelectorAll(SELECTORS.post))
      .map((node) => {
        if (isAdPost(node)) return { isAd: true };

        const id = extractPostId(node);
        if (!id) return null;

        const isOwner = node.classList.contains('topic-owner');
        const avatarEl = node.querySelector(SELECTORS.avatar);
        const nicknameEl = node.querySelector(SELECTORS.nickname);
        const avatarUrl = avatarEl
          ? avatarEl.getAttribute('data-original') || avatarEl.getAttribute('data-src') || avatarEl.getAttribute('src') || ''
          : '';
        const nickname = nicknameEl ? nicknameEl.textContent.trim() : 'کاربر';
        const msgEl = node.querySelector(SELECTORS.message);
        const quote = extractQuote(node);
        const html = sanitizeMessageFragment(msgEl ? msgEl.innerHTML : '');

        return { isAd: false, id, isOwner, avatarUrl, nickname, quote, html };
      })
      .filter((p) => p !== null);
  }

  window.__niniChat.isAdPost = isAdPost;
  window.__niniChat.sanitizeMessageFragment = sanitizeMessageFragment;
  window.__niniChat.extractQuote = extractQuote;
  window.__niniChat.extractPosts = extractPosts;
})();
