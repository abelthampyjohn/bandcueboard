# Band Live Cue Board

Real-time live cue board for bands. The leader taps a tile → all bandmate devices flash that cue within ~100–200 ms via Firebase Realtime Database.

## Features

- **4-digit room codes** — leader creates a room, bandmates join with the code
- **Leader view** — full tile board across 5 categories (Song Structure, Dynamics, Tempo, Key Changes, Commands)
- **Bandmate view** — read-only fullscreen cue display with colour flash on every new cue
- **Settings** — leader can rename any tile; changes sync to all devices instantly
- Optimised for iPad and phone landscape mode — huge high-contrast tiles

## Setup

### 1. Firebase project

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Realtime Database** (not Firestore) in your region
3. Set database rules to allow read/write (for development):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

> For production, scope rules to authenticated users or specific paths.

### 2. Environment variables

Copy `.env.example` to `.env` and fill in your Firebase project values:

```bash
cp .env.example .env
```

Find the values in **Firebase Console → Project Settings → Your apps → SDK setup and configuration**.

### 3. Run

```bash
npm install
npm run dev
```

## Database structure

```
rooms/{roomCode}/
  createdAt:    number   (Unix ms)
  currentCue:
    label:      string   (e.g. "Chorus")
    color:      string   (e.g. "indigo")
    ts:         number   (Unix ms — used to detect new cues)
  tileNames:
    "0-0":      string   (custom label for category 0, tile 0)
    "0-1":      string   ...
```

## Build

```bash
npm run build
```
