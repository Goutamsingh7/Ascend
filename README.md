# ASCEND — Personal Life RPG (local dev project)

## Setup

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview   # serve the production build locally to check it
```

The `dist/` folder that `npm run build` produces is a static site — you can
deploy it as-is to Vercel, Netlify, GitHub Pages, or any static host.

## What's here

- `src/App.jsx` — the whole app: player/XP/level system, quests, presets,
  focus timer, journal, analytics, achievements, character screen, settings.
- Data persists in the browser via `localStorage` (key: `ascend-state`).
  It's per-browser, not synced across devices — see "Notes" below.
- Fonts (Rajdhani, Sora) load from Google Fonts at runtime — you'll need an
  internet connection the first time a font loads, then it's cached.

## Dependencies

- `react`, `react-dom` — via Vite's React template
- `recharts` — the XP-progression line chart and attribute radar chart
- `lucide-react` — icon set used throughout the UI

## Notes / next steps

- **No backend yet.** This is a fully local, single-user app. If you want
  cross-device sync or multiple accounts, the next step is adding a real
  backend (e.g. Supabase — gives you Postgres + auth with minimal setup) and
  swapping the `loadState`/`saveState` functions in `App.jsx` for API calls.
- **Not yet built:** skill tree, weekly boss system, world map, AI insights,
  smart quest generation — these were intentionally deferred per the MVP
  priority order.
