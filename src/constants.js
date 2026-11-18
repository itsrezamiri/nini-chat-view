window.__niniChat = window.__niniChat || {};

window.__niniChat.SELECTORS = {
  post: '.topic-post',
  userInfo: '.topic-post__user-info',
  avatar: '.topic-post__user-info img.avatar',
  nickname: '.topic-post__user-info a.nickname',
  message: '.post-message.topic-post__message',
  quotation: '.topic-post__quotation',
  replyMessage: '.reply-message',
  pagination: 'ul.pagination',
  pageItem: 'li.page-item',
  pageItemActive: 'li.page-item.active',
  pageLink: 'a.page-link',
};

window.__niniChat.CONFIG = {
  rootId: 'nini-chat-root',
  messagesId: 'nini-chat-messages',
  loadingId: 'nini-chat-loading',
  scrollThresholdPx: 600,
  maxFetchRetries: 3,
};
