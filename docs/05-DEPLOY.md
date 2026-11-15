# 05 · Deploy

- **GitHub Pages:** `.github/workflows/pages.yml` runs the tests on every push to `main`, then
  publishes `index.html`, `styles.css`, `favicon.svg` and `src/`.
- **CI:** `.github/workflows/ci.yml` syntax-checks every file and runs the tests on Node 20,
  22 and 24.
- **Local:** `npm start` serves on http://127.0.0.1:5173 (set `PORT` to change it). ES modules
  do not load from `file://`.
- **Debug:** add `?debug` to the URL to get `window.__gt` (`game`, `progress()`, `coins(n)`,
  `unlockAll()`). Add `&play=tet&seed=4` to open a machine with a fixed pile, which is handy for
  demos and screenshots.
- **Storage:** everything is kept in `localStorage` under the `gapthu:` prefix (`progress`,
  `round`, `muted`, `seen-howto`). In a private window or with storage blocked, the game still
  plays but does not save.
