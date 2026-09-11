# ASCEND — Personal Life RPG

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

## Publish it (free, ~10 minutes)

The `dist/` folder from `npm run build` is a complete static site — no
server needed. Push this project to a GitHub repo, then:

1. Go to [vercel.com](https://vercel.com) (or [netlify.com](https://netlify.com)) and sign in with GitHub.
2. Import the repo. Framework preset: Vite. Build command: `npm run build`. Output dir: `dist`.
3. Deploy. You get a real `https://your-app.vercel.app` URL to share.

That's it — it's live. Anyone with the link can open it, and on mobile
they'll get an "Add to Home Screen" / "Install" prompt that makes it behave
like a native app icon (see below).

## It's installable (PWA)

This is configured as a Progressive Web App:
- **Android/Chrome:** visit the site, tap "Install app" (or the install icon
  in the address bar on desktop). It opens full-screen, no browser chrome.
- **iOS/Safari:** visit the site, tap Share → "Add to Home Screen."
- It works offline after the first visit — the app shell is cached by a
  service worker (`vite-plugin-pwa`), so a flaky connection won't block it
  from opening.
- Icons are in `public/` (`pwa-192.png`, `pwa-512.png`, `apple-touch-icon.png`,
  `maskable-icon.png`) generated from `icon-source.svg`-style brand marks — a
  violet/cyan ascending chevron matching the in-app palette. Swap these if
  you want a different mark; regenerate at 192/512/180px.

This gets you a real, shareable, installable app **without an App Store
review, a $99/year developer account, or a backend** — the honest fastest
path to "published."

## Game systems included

- XP/level engine with a soft-capped growth curve, attributes, rank (E→SSS)
- Quests (main/side/daily), difficulty tiers, preset packs by life domain
- Weekly boss — real-world activity damages a themed weekly challenge
- **Gems** — earned from every XP-granting action
- **Streak Freezes** — buy with gems (Settings → Gem Shop); auto-consumed to
  protect your streak if you miss exactly one day, the way Duolingo's does
- **Daily combo** — completing multiple things in one day stacks a small
  temporary XP bonus (shown as a badge on the home screen)
- Focus timer, journal, analytics, achievements with rarity tiers, character
  creation with archetypes

## What "publish" does NOT get you yet

Everything above runs entirely in the browser via `localStorage` — it's
genuinely yours, but it's also single-device and single-player. These need a
real backend and are the natural next step, roughly in order of effort:

1. **Accounts + cross-device sync** — Supabase is the fastest path (Postgres
   + auth with minimal setup); swap `loadState`/`saveState` in `App.jsx` for
   API calls.
2. **Real leaderboards** — needs accounts first, since a leaderboard is
   comparing real other users.
3. **Push notifications** ("your streak is at risk") — needs a backend to
   schedule them and a signed-in user to send them to.
4. Skill tree, world map, AI insights, smart quest generation — deferred per
   the original MVP priority order.

## Dependencies

- `react`, `react-dom` — via Vite's React template
- `recharts` — XP-progression chart and attribute radar
- `lucide-react` — icon set
- `vite-plugin-pwa` — installability + offline caching
