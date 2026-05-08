# Band Live Cue Board

A full-screen, real-time cue board for live bands. The band leader taps a tile on their device and every bandmate's screen flashes that cue within ~100–200 ms — powered by Firebase Realtime Database.

**Live app → [bandcueboard.vercel.app](https://bandcueboard.vercel.app)**

---

## What it does

- **Leader** creates a room, gets a 4-digit code, and taps tiles to fire cues
- **Bandmates** join with the code and see a fullscreen colour-flash display the instant each cue lands
- **Settings** let the leader rename any tile — changes sync to all devices live
- Installable as a **PWA** from Safari or Chrome — works as a home screen app with no browser chrome
- **Offline resilient** — the UI shell loads from cache; the last-seen cue stays on screen if connectivity drops

---

## Cue categories

| Category | Colour | Tiles |
|---|---|---|
| Song Structure | Indigo | Intro, Verse, Pre-Chorus, Chorus, Bridge, Solo, Outro |
| Dynamics | Amber | Build Up, Break Down, Soft / Quiet, Loud / Big |
| Tempo | Cyan | Slow Down, Hold Tempo, Speed Up |
| Key Changes | Violet | Key +1, Key -1, Key +2, Key -2 |
| Commands | Rose | Repeat, Vamp, Tag Ending, Improv, Go / Start, Stop / End |

---

## Tech stack

| Layer | Choice |
|---|---|
| UI | React 19 + Tailwind CSS v4 |
| Build | Vite 8 |
| Real-time sync | Firebase Realtime Database |
| PWA / service worker | vite-plugin-pwa (Workbox generateSW) |
| Hosting | Vercel |

---

## Project structure

```
src/
  App.jsx                 Screen state machine (lobby → leader / bandmate / settings)
  constants.js            CATEGORIES, COLOR_MAP, tileKey() — shared across screens
  firebase.js             Firebase init (reads VITE_FIREBASE_* env vars)
  components/
    CueTile.jsx           Tap tile with local press-flash animation
  screens/
    Lobby.jsx             Create room / join room with 4-digit code
    LeaderBoard.jsx       Full tile board, Firebase writes, room code badge
    BandmateView.jsx      Read-only fullscreen cue display, offline banner
    Settings.jsx          Rename tiles; changes written to Firebase
scripts/
  generate-icons.mjs      Regenerate PWA icons from SVG source via sharp
public/
  icon-192.png            Android / Chrome install icon
  icon-512.png            Android splash screen icon
  icon-maskable-512.png   Adaptive icon (safe-zone aware)
  apple-touch-icon.png    iOS Safari "Add to Home Screen" icon (180×180)
```

---

## Firebase database structure

```
rooms/{roomCode}/
  createdAt:    number          Unix ms timestamp
  currentCue:
    label:      string          e.g. "Chorus"
    color:      string          e.g. "indigo"
    ts:         number          Unix ms — change detector for bandmate flash
  tileNames:
    "0-0":      string          Custom label for category 0, tile 0
    "1-2":      string          Custom label for category 1, tile 2
    ...
```

---

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/abelthampyjohn/bandcueboard
cd bandcueboard
npm install
```

### 2. Firebase project

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. **Build → Realtime Database → Create database** (choose a region)
3. Start in **test mode** for development:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### 3. Environment variables

```bash
cp .env.example .env
```

Fill in the values from **Firebase Console → Project Settings → Your apps → SDK config**:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. Run

```bash
npm run dev
```

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add each `VITE_FIREBASE_*` variable in **Vercel Dashboard → Project → Settings → Environment Variables**, then redeploy so the build bakes them in.

---

## PWA — installing to home screen

### iOS Safari
Share → **Add to Home Screen** → the app opens full-screen with no browser UI.

### Android Chrome
Three-dot menu → **Add to Home Screen** / **Install app**.

The service worker precaches all static assets so the app shell loads instantly on repeat visits and offline.

---

## Regenerate icons

If you change the icon design, re-run:

```bash
node scripts/generate-icons.mjs
```

This reads the SVG source in the script and writes four PNGs to `public/` via `sharp`.

---

## Vercel cache headers

Set in `vercel.json`:

| Path | Policy |
|---|---|
| `/sw.js` | `no-cache` — browser always revalidates the service worker |
| `/workbox-*` | `immutable` — content-hashed, safe to cache forever |
| `/assets/*` | `immutable` — Vite hashes all asset filenames |
