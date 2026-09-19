# Little Moment — birthday experience

A no-build, single-page birthday celebration website for Mommy. It is intentionally dependency-free: open `index.html` directly or serve the folder from any static host.

## Run locally

```bash
cd birthday-experience
python3 -m http.server 4173
# open http://localhost:4173
```

## Personalize

- Change the name and long message in `script.js` inside `CONFIG`.
- Update the page title and short hero copy in `index.html`.
- Replace the `defaultMemories` image URLs in `script.js` with your own hosted images.
- Uploaded photos and guestbook wishes use `localStorage` as a polished frontend-only fallback.

## Included interactions

- Animated hero with cake illustration, theme toggle, share/copy-link toast, and synthetic birthday music player.
- Progressive typewriter message reveal.
- Three-candle interaction with microphone blow detection and tap fallback, smoke/embers, wish gate, and locked surprise.
- Gift-box reveal with final celebration and replay button.
- Memory gallery with local image previews, captions/dates, lazy loading, masonry layout, and lightbox navigation.
- Digital guestbook with stickers, character limits, validation, and local persistence.
- IntersectionObserver scroll reveals, responsive mobile layout, keyboard support, reduced-motion handling, and axe-audited semantics.
