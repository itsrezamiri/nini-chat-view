const DEFAULTS = { enabled: true, theme: 'light', align: 'right', fontSize: 14 };

function els() {
  return {
    enabled: document.getElementById('enabled'),
    theme: document.getElementById('theme'),
    align: document.getElementById('align'),
    fontSize: document.getElementById('fontSize'),
    fontSizeValue: document.getElementById('fontSizeValue'),
  };
}

function load() {
  chrome.storage.local.get(DEFAULTS, (settings) => {
    const e = els();
    e.enabled.checked = settings.enabled;
    e.theme.value = settings.theme;
    e.align.value = settings.align;
    e.fontSize.value = settings.fontSize;
    e.fontSizeValue.textContent = settings.fontSize + 'px';
  });
}

function save(partial) {
  chrome.storage.local.set(partial, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.id) return;
      chrome.tabs.sendMessage(tab.id, { type: 'NINI_SETTINGS_CHANGED', settings: partial }, () => {
        void chrome.runtime.lastError;
      });
    });
  });
}

function wire() {
  const e = els();
  e.enabled.addEventListener('change', () => save({ enabled: e.enabled.checked }));
  e.theme.addEventListener('change', () => save({ theme: e.theme.value }));
  e.align.addEventListener('change', () => save({ align: e.align.value }));
  e.fontSize.addEventListener('input', () => {
    e.fontSizeValue.textContent = e.fontSize.value + 'px';
    save({ fontSize: Number(e.fontSize.value) });
  });
}

load();
wire();
