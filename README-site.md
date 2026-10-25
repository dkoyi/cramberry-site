# Cramberry website

Static site (HTML, CSS, vanilla JS). No framework, no build step, no backend, no keys. Hosted on Vercel
(framework preset "Other", no build command, output directory = the repo root).

## Pages
- `index.html` home: demo video, how it works (Cubbie + Canvas), Cubbie phone demo, games with a live battle,
  the real Discord cards, "im cooked", study tools, add to Discord, team
- `dashboard.html` demo squad dashboard (sample data, labelled)

Setup instructions live in the main repo's [SETUP.md](https://github.com/MalaikaKamranKhan/Track3/blob/main/SETUP.md).

## Editing
The HTML pages are generated so they share one header and footer. Edit `tools/pages/home.html` or
`tools/pages/dashboard.html` (or the header/footer in `tools/make_pages.py`), then run:

```
python tools/make_pages.py
```

**Demo video:** set `VIDEO_ID` at the top of `tools/make_pages.py` to the YouTube video id (the part after `watch?v=`)
and run the command above. Until then the home page shows a "coming soon" frame.

## Files
- `css/site.css` shared tokens (light + dark theme), header, footer, buttons, battle effects
- `css/home.css` home page · `css/sub.css` dashboard
- `js/sprite-data.js` all pixel characters (from the bot's own sprite code)
- `js/common.js` sprite renderer, theme toggle, intro animation, reveals, copy buttons
- `js/home.js` home page behaviour · `js/dashboard.js` dashboard
- `tools/make_pages.py` builds the pages (not deployed; see `.vercelignore`)

## Placeholders to fill
- **Team roles:** `tools/pages/home.html`, the three `data-todo="role"` lines.
- **Demo video:** `VIDEO_ID` in `tools/make_pages.py`.
