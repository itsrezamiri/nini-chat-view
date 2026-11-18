window.__niniChat = window.__niniChat || {};

window.__niniChat.DEFAULT_SETTINGS = {
  enabled: true,
  theme: 'light',
  align: 'right',
  fontSize: 14,
};

window.__niniChat.loadSettings = function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(window.__niniChat.DEFAULT_SETTINGS, (stored) => {
      resolve(Object.assign({}, window.__niniChat.DEFAULT_SETTINGS, stored));
    });
  });
};

window.__niniChat.applySettings = function applySettings(root, settings) {
  if (!root) return;
  root.dataset.theme = settings.theme;
  root.dataset.align = settings.align;
  root.style.setProperty('--nini-font-size', settings.fontSize + 'px');
};
