# Nini Chat View

A read-only Chrome (Manifest V3) extension that turns a ninisite.com forum
discussion thread into a chat-app-style view: only real posts and replies
are shown as chat bubbles, promotional/ad posts are filtered out, quoted
replies are rendered as inline quote excerpts, and more of the thread loads
automatically as you scroll.

## Features

- Chat-bubble view of a thread's posts, with avatars and nicknames
- Promotional/native-ad posts filtered out of the stream
- Quoted replies shown as a clickable excerpt that jumps to the quoted post
- Infinite scroll — fetches and appends subsequent pages automatically
- Popup settings (click the toolbar icon):
  - Enable/disable the chat view live, without reloading the page
  - Light/dark theme
  - Message alignment: right, center, left, or a focused centered column
  - Font size

This extension is **read-only** — it does not post replies back to
ninisite.com.

## Install (unpacked)

1. Clone this repo.
2. Open `chrome://extensions` (or `edge://extensions`).
3. Enable **Developer mode**.
4. Click **Load unpacked** and select this repo's folder.
5. Open any `https://www.ninisite.com/discussion/topic/...` thread.

## Project structure

```
manifest.json       MV3 manifest
src/constants.js    Shared selectors and config
src/settings.js     Settings defaults + load/apply helpers (chrome.storage)
src/dom-extract.js  Post/ad/quote extraction from ninisite's HTML
src/paginate.js     Pagination parsing, page fetching
src/render.js       Overlay + chat bubble DOM construction
src/content.js      Orchestrator: builds the view, handles scroll/settings
src/popup.html      Toolbar popup UI
src/popup.js        Popup logic (reads/writes settings, messages the tab)
src/styles.css      Chat view styling (RTL, themes, alignment, font size)
```

## Notes

- Built against ninisite's current HTML structure (as of November 2026);
  if ninisite changes their markup, selectors in `constants.js` and
  `dom-extract.js` may need updating.
- Settings are stored locally per-browser via `chrome.storage.local`.
