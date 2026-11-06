# C3

C3 is a lightweight all-in-one hub for gm3$, music, browsing, and an1m3. It is an active beta project built with plain HTML, CSS, and JavaScript.

## Structure

- `index.html` contains the launcher and workspace shell.
- `app.js` owns navigation, themes, catalogs, media playback, and settings.
- `styles.css` contains the responsive visual system and theme variants.
- `assets/toolbar-icons/` contains the launcher artwork and toolbar assets.
- `assets/theme-logos/` contains per-theme logos.
- `assets/videos/` contains the video backgrounds used by each theme.
- `scram/` contains the local Scramjet, BareMux, service-worker, and worker entry points.

## Run Locally

```sh
python3 -m http.server 5173
```

Open `http://localhost:5173` in a browser. A static server is required because Scramjet service workers do not run from `file://` URLs.

## Deployment

C3 is a static site and can be deployed from the repository root:

- GitHub Pages: enable Pages from the repository's deployment settings.
- Render: use the included `render.yaml` blueprint as a static site.
- Cloudflare Pages: use `wrangler.toml`, or select the repository with `.` as the output directory.
- Netlify: use the included `netlify.toml`.
- Railway: use `railway.json`; it serves the repository with Python's static HTTP server.

The site has no build step and does not require a package installation. Keep the site on HTTPS in production so service workers and media APIs are available.

## External Services

- Scramjet and BareMux provide the local browser runtime and Wisp transport.
- gmshelf provides the selectable gm3$ catalogs.
- AniList provides an1m3 search metadata and episode counts.
- Lyra provides direct HLS media streams.
- iTunes Search provides music preview metadata and audio URLs.

## Known Limitations

- The Scramjet runtime depends on a reachable Wisp transport and published worker assets.
- Lyra HLS downloads expose the stream playlist URL; browsers may play it rather than force a file download because the media is cross-origin.
- External catalogs and media services can rate-limit or change independently of C3.
- The browser runtime and third-party media integrations depend on external services and may be unavailable when those services are down.
- Game documents are loaded in a restricted sandbox because catalog content is third-party.