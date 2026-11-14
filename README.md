# P4#!Я — paneya.dj

A minimal Winamp-inspired music player and simulated terminal. Static HTML, CSS, and JavaScript; deployed to Cloudflare Pages.

## Adding music

Upload MP3s to an audio host with direct HTTPS URLs (Cloudflare R2 is planned). Edit `playlist.json`:

```json
[
  {"title": "Future Funk — Take 1", "url": "https://YOUR-AUDIO-HOST/future-funk-01.mp3"},
  {"title": "Future Funk — Take 2", "url": "https://YOUR-AUDIO-HOST/future-funk-02.mp3"}
]
```

Audio hosting must permit browser playback and ideally byte-range requests. If using a different origin, configure CORS there if necessary. Do not put MP3 files in the Git repository.

## Local preview

From this directory:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` in Firefox. (Use a local server rather than `file://` because the player fetches `playlist.json`.)

## Cloudflare Pages

Deploy the repository root as a static Pages project. No build command or framework needed. Pushes to `main` trigger deployment.

The terminal is a **simulation**, not a real shell.
