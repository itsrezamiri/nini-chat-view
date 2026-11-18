(function () {
  const { SELECTORS } = window.__niniChat;

  function normalizeDigits(str) {
    return str
      .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
      .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  }

  function extractPaginationInfo(doc) {
    const paginationEl = doc.querySelector(SELECTORS.pagination);
    if (!paginationEl) return { currentPage: 1, lastPage: 1, hasNext: false };

    const items = Array.from(paginationEl.querySelectorAll(SELECTORS.pageItem));
    const activeItem = paginationEl.querySelector(SELECTORS.pageItemActive);

    const readNum = (el) => {
      const link = el.querySelector(SELECTORS.pageLink);
      const rawText = (link ? link.textContent : el.textContent).trim();
      const n = parseInt(normalizeDigits(rawText), 10);
      return Number.isNaN(n) ? null : n;
    };

    const currentPage = activeItem ? readNum(activeItem) || 1 : 1;
    const numericPages = items.map(readNum).filter((n) => n !== null);
    const lastPage = numericPages.length ? Math.max(...numericPages) : currentPage;

    return { currentPage, lastPage, hasNext: currentPage < lastPage };
  }

  function buildPageUrl(pageNumber) {
    const url = new URL(location.href);
    url.searchParams.set('page', String(pageNumber));
    return url.toString();
  }

  async function fetchPageDoc(pageNumber) {
    const res = await fetch(buildPageUrl(pageNumber), { credentials: 'same-origin' });
    if (!res.ok) throw new Error('nini-chat: page fetch failed ' + res.status);
    const text = await res.text();
    return new DOMParser().parseFromString(text, 'text/html');
  }

  window.__niniChat.normalizeDigits = normalizeDigits;
  window.__niniChat.extractPaginationInfo = extractPaginationInfo;
  window.__niniChat.buildPageUrl = buildPageUrl;
  window.__niniChat.fetchPageDoc = fetchPageDoc;
})();
