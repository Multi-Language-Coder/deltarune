# DELTARUNE web port — standalone & offline

## Standalone single file — `chapter5-standalone.html`

One self-contained HTML file. All page-loader logic is inlined; the heavy runtime,
game data, and audio stream from the CDN, so you can host or share just this one file.

- **Needs internet** (pulls data from jsDelivr) and **needs the repo pushed to GitHub**
  first — jsDelivr serves from `Multi-Language-Coder/deltarune@main`, so until that push
  lands the CDN has nothing to serve.
- To point it somewhere else, edit the `<base href="...">` near the top of the file.
- On a local dev server it auto-detects localhost and loads locally instead, so you can
  test it now without the push.

Why not a *fully* embedded single file? The game is ~158 MB (`game.unx`) + ~25 MB runtime
+ 286 MB music. Base64-embedding all of that is ~600 MB of HTML, which crashes browsers —
so the runtime/data stay external.

## Offline (no internet) — `play-offline.bat`

Your setup is already CDN-free for local play: every page uses origin-relative paths and
all audio comes from the shared `/mus/` and `/audios/` folders in this repo. So "offline"
just means serving this folder locally.

Double-click **`play-offline.bat`** — it starts a local server on
`http://127.0.0.1:8080/` and opens the menu. Close the server window to stop.
(Requires Python; if you don't have it, any static server works — point it at this folder
and open `index.html`.)

Every chapter, all music, and all sound effects load from local files — no internet needed.

### Want it to work offline *in the browser itself* (installable PWA)?
That's possible too — a service worker can cache the whole game (runtime + `game.unx` +
audio, ~450 MB for ch5) after one online load, so it then runs with no server at all.
The caching groundwork is already here (`sw.js`, the "Preload all audio" toggle). Ask and
I'll extend it to cache the runtime + game data as well.
