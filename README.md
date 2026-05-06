# Wolfe Co — Landing

Single-page Vite + React landing for Wolfe Co. Scroll-driven scrubbed video hero, snap deck below.

## Dev

```bash
npm install
npm run dev    # http://localhost:5173
```

In dev (no `VITE_HERO_VIDEO` set), the hero shows a drop-zone — drag a `.mp4` in to test.

## Production / Vercel

1. Drop your hero file at `public/hero.mp4`.
2. Set env var:
   ```
   VITE_HERO_VIDEO=/hero.mp4
   ```
   Locally: copy `.env.example` to `.env.local`. On Vercel: Project → Settings → Environment Variables.
3. `npm run build` (output → `dist/`). `vercel --prod` to deploy.

When `VITE_HERO_VIDEO` is set the upload UI is skipped and the hero auto-loads.

## Hero video requirements

- **Codec:** H.264 (`.mp4`) — best iOS Safari compatibility. WebM/MOV also accepted in dev.
- **Aspect:** 9:16 vertical (cropped via `object-fit: cover`).
- **Duration:** 4–6 seconds. The whole clip scrubs over 300vh of scroll.
- **FPS:** 30. Higher fps wastes bytes — playhead lerps smoothly anyway.
- **Bitrate / size:** target < 8 MB. Encode with `-crf 23 -preset slow -movflags +faststart` so it streams while loading.
- **Audio:** strip it. `-an` in ffmpeg.

Reference encode:

```bash
ffmpeg -i input.mov \
  -vf "scale=1080:1920,fps=30" \
  -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p \
  -movflags +faststart -an \
  public/hero.mp4
```

## Structure

```
index.html
src/
  main.jsx
  App.jsx                       # the landing
  components/ScrollVideoBG.jsx  # scrubbed video bg w/ uploader fallback
public/                         # drop hero.mp4 here for prod
vercel.json
```

## iOS notes

`<video playsInline muted preload="auto">` + canvas paint approach avoids iOS Safari's autoplay/inline restrictions. The component lerps `currentTime` toward a scroll-mapped target in `requestAnimationFrame`, then paints each `seeked` frame to a 2D canvas — bypasses iOS's 60fps `currentTime` cap and produces smoother scrub than direct `<video>` rendering.
