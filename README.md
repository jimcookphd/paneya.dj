# P4#!Я — paneya.dj

Version 0.2: Webamp 2.3.1 with its bundled authentic classic Winamp 2.x skin, enlarged to 150%, plus a simulated terminal.

Static Cloudflare Pages website. Copy index.html, style.css, player.js, playlist.json to the root of the GitHub repository. The player loads MP3s from Cloudflare R2.

**Important:** R2 must send CORS headers permitting `https://paneya-dj.pages.dev` (and later `https://paneya.dj`). Webamp's documentation requires CORS for remote tracks. Configure the bucket's CORS policy to allow GET and HEAD, origins `https://paneya-dj.pages.dev`, `https://paneya.dj`, and `https://www.paneya.dj`. For initial testing, `*` is an option for public MP3s. If playback fails, inspect the browser console for CORS errors.

The Webamp JavaScript module loads from unpkg.com. To avoid a third-party runtime dependency later, we can vendor the bundle into the repository. Webamp is MIT-licensed; Winamp skin artwork has separate rights.

Terminal: help, ls, play [number], pause, stop, next, prev, about, clear. `play N` replaces the current Webamp queue with tracks from N onward.
