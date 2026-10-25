# Cramberry website

Static site (HTML, CSS, vanilla JS). No framework, no build step, no backend, no keys.

## Deploy to Vercel
1. Put this folder in a repo (or drag it into vercel.com/new).
2. Framework preset: **Other**. Build command: none. Output directory: `.` (the folder root).
3. `vercel.json` turns on clean URLs, so `/play`, `/dashboard` and `/setup` work.

## Pages
- `index.html` home (intro, hero battle, Cubbie loop, phone, games + bestiary, cards, "im cooked", tools, add, demo, team)
- `play.html` the in-browser boss battle (`/play?boss=lime` picks a fruit)
- `dashboard.html` demo squad dashboard (sample data, labelled)
- `setup.html` interactive install guide (ticks saved in localStorage)

## Files
- `css/site.css` shared tokens, header, footer, buttons, arena · `css/home.css` home · `css/sub.css` dashboard + setup
- `js/sprite-data.js` all 27 pixel characters (same data as `assets/sprites/sprites.json`)
- `js/common.js` sprite renderer, intro FLIP, reveals, copy + toasts, grow-from-button
- `js/battle.js` the demo battle, same rules as `cramberry/engine.py`
- `js/home.js`, `js/play.js`, `js/dashboard.js`, `js/setup.js` page behaviour
- `tools/make_pages.py` rebuilds the 4 HTML pages from `tools/pages/*.html` with one shared header and footer.
  Edit a partial, then run `python tools/make_pages.py`. (Not deployed; see `.vercelignore`.)

## Placeholders to fill
- **Team roles**: `tools/pages/home.html`, the three `data-todo="role"` lines.
- **Demo video**: `tools/pages/home.html`, the `data-todo="demo-video-url"` box (swap in an `<iframe>` or link).

## Assumptions
- The demo battle adds two **simulated** squadmates (Sunny 60% accurate, Malaika 75%) so the real squad rules
  (damage share, crits, boss hitting back, wagers) have something to work with. It says so on screen.
- The demo uses 20 s per question (the bot uses 25 s) and the bot's real wager options: Play safe / Bet half / ALL IN.
- XP after a battle uses the bot's formula: 10 + points/5, +25 for a win. Badges: Boss Slayer, Perfect Round,
  On Fire, High Roller, with the same conditions as the bot.
- If the boss is above 30 HP after the last question, the bot's outcome is "survived"; the demo shows it as
  "The boss got away".
- "im cooked" uses the bot's exact PANIC pattern. You type as Sunny, so the rally card is word for word.
- The dashboard's numbers are sample data (labelled "Demo · sample data").
- `wordmark-light-sword.png` wasn't in the uploads; the header draws the logo live instead (berry sprite + Pixelify).
- Cubbie's mascot is used only for "your Cubbie" in the loop and phone mock-ups.
