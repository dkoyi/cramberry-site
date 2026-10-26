#!/usr/bin/env python3
"""Writes the static pages with one shared header and footer. Run after editing a partial:
    python tools/make_pages.py
The output is plain HTML; Vercel serves it as is (no build step)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://cramberry-site.vercel.app"
PAGES = ROOT / "tools" / "pages"

ADD = "https://discord.com/oauth2/authorize?client_id=1563704377833689098&amp;scope=bot+applications.commands&amp;permissions=117760"
REPO = "https://github.com/MalaikaKamranKhan/Track3"
SKILL = REPO + "/blob/main/cubbie-skill/squad-link/SKILL.md"
SETUP = REPO + "/blob/main/SETUP.md"
# The demo video: paste the YouTube video id (the part after watch?v=) and run this script again.
VIDEO_ID = "d9Y_zhhDnA4"


def video():
    if VIDEO_ID:
        return (f'<iframe src="https://www.youtube-nocookie.com/embed/{VIDEO_ID}?rel=0" title="Cramberry demo video" '
                'loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" '
                'allowfullscreen></iframe>')
    return ('<div class="video-soon"><canvas data-sprite="cramberry" data-scale="5" aria-hidden="true"></canvas>'
            '<p>Demo video coming soon</p></div>')

GH_SVG = ('<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 '
          '5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52'
          '-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82'
          '-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1'
          '.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46'
          '.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>')
PLUS_SVG = '<svg class="ico" viewBox="0 0 10 10" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M4 1h2v3h3v2H6v3H4V6H1V4h3z"/></svg>'
BURGER_SVG = '<svg viewBox="0 0 12 12" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M1 2h10v2H1zm0 3h10v2H1zm0 3h10v2H1z"/></svg>'
CLOSE_SVG = '<svg viewBox="0 0 12 12" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M2 1h2v1h1v1h2V2h1V1h2v2H9v1H8v1H7v2h1v1h1v1h1v2H8v-1H7v-1H5v1H4v1H2V9h1V8h1V7h1V5H4V4H3V3H2z"/></svg>'
SUN_SVG = ('<svg class="i-sun" viewBox="0 0 12 12" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" '
           'd="M5 0h2v2H5zM5 10h2v2H5zM0 5h2v2H0zM10 5h2v2h-2zM1 1h2v2H1zM9 1h2v2H9zM1 9h2v2H1zM9 9h2v2H9zM4 3h4v1h1v4H8v1H4V8H3V4h1z"/></svg>')
MOON_SVG = ('<svg class="i-moon" viewBox="0 0 12 12" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" '
            'd="M4 1h4v1H6v1H5v2H4v2h1v2h1v1h2v1H4v-1H2V9H1V3h1V2h2z"/></svg>')

# Runs before first paint: applies the saved theme (dark by default), and on the home page hides the header logo until the
# intro animation lands on it, so the logo is never on screen twice.
THEME_BOOT = """<script>
(function () {
  var d = document.documentElement, t = null;
  try { t = localStorage.getItem("cb-theme"); } catch (e) {}
  if (t !== "light" && t !== "dark") t = "dark";
  d.dataset.theme = t;
  if (d.dataset.intro === "1" && !matchMedia("(prefers-reduced-motion: reduce)").matches) d.classList.add("intro-pending");
})();
</script>"""

# the home page embeds the demo video: open the YouTube connections early so it shows up faster
PRECONNECT = """
<link rel="preconnect" href="https://www.youtube-nocookie.com">
<link rel="preconnect" href="https://i.ytimg.com">"""

NAV = [("Demo", "index.html#top"), ("How it works", "index.html#how"), ("Cubbie", "index.html#cubbie"),
       ("Games", "index.html#games"), ("Team", "index.html#team")]


def head(title, desc, path="", extra_css="", intro=False):
    url = f"{SITE}/{path}"
    img = f"{SITE}/assets/logo/social-preview.png"
    return f"""<!doctype html>
<html lang="en" class="no-js"{' data-intro="1"' if intro else ""}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#f6f0e4" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#14161e" media="(prefers-color-scheme: dark)">
{THEME_BOOT}
<link rel="canonical" href="{url}">
<meta property="og:site_name" content="Cramberry">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:type" content="website">
<meta property="og:image" content="{img}">
<meta property="og:image:width" content="1280">
<meta property="og:image:height" content="640">
<meta property="og:image:alt" content="Cramberry, the blue pixel berry, and the line: turn your Discord study group chat into a cram battle">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{img}">
<link rel="icon" type="image/png" href="assets/logo/favicon-64.png">
<link rel="apple-touch-icon" href="assets/logo/apple-touch-icon.png">
<link rel="preload" href="assets/fonts/PixelifySans-Medium.ttf" as="font" type="font/ttf" crossorigin>
<link rel="preload" href="assets/fonts/Outfit-Bold.ttf" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="css/site.css">{PRECONNECT if intro else ''}
{extra_css}
</head>"""


def header(active=""):
    links = "".join(
        f'<a href="{h}"{" class=\"active\" aria-current=\"page\"" if active == n else ""}>{n}</a>' for n, h in NAV)
    sheet_links = "".join(f'<a href="{h}">{n}</a>' for n, h in NAV) + '<a href="dashboard.html">Squad dashboard</a>' + f'<a href="{REPO}" target="_blank" rel="noopener">GitHub</a>'
    return f"""<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap hdr">
    <a class="logo" href="index.html" aria-label="Cramberry home">
      <canvas data-sprite="berry" data-scale="3" aria-hidden="true"></canvas>
      <span class="logo-word" aria-hidden="true">Cramberry</span>
    </a>
    <nav class="nav" aria-label="Main">{links}</nav>
    <div class="hdr-cta">
      <a class="btn add-discord" href="{ADD}" target="_blank" rel="noopener">{PLUS_SVG}Add to Discord</a>
      <a class="icon-btn gh" href="{REPO}" target="_blank" rel="noopener" aria-label="Cramberry on GitHub">{GH_SVG}</a>
      <button class="icon-btn theme-toggle" type="button" aria-label="Switch to dark mode" aria-pressed="false">{SUN_SVG}{MOON_SVG}</button>
      <button class="icon-btn burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="sheet">{BURGER_SVG}</button>
    </div>
  </div>
</header>
<div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-label="Menu">
  <div class="sheet-top">
    <a class="logo" href="index.html"><canvas data-sprite="berry" data-scale="2" aria-hidden="true"></canvas><span class="logo-word">Cramberry</span></a>
    <button class="icon-btn sheet-close" type="button" aria-label="Close menu">{CLOSE_SVG}</button>
  </div>
  <nav aria-label="Mobile">{sheet_links}</nav>
  <a class="btn" href="{ADD}" target="_blank" rel="noopener">{PLUS_SVG}Add to Discord</a>
</div>"""


def footer():
    return f"""<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <img src="assets/logo/wordmark-badge.png" width="1583" height="380" alt="Cramberry" loading="lazy">
        <p class="signoff">Nobody gets cooked alone.</p>
        <p class="muted" style="margin-top:10px">Cubbie Hackathon · Track 3 (Group Chat Assistant) · DevHacks Fall 2026 · team wildberry</p>
      </div>
      <div>
        <h4>Project</h4>
        <ul>
          <li><a href="{REPO}" target="_blank" rel="noopener">GitHub repo</a></li>
          <li><a href="{REPO}#readme" target="_blank" rel="noopener">README</a></li>
          <li><a href="{SETUP}" target="_blank" rel="noopener">Setup guide</a></li>
          <li><a href="{REPO}/blob/main/LICENSE" target="_blank" rel="noopener">MIT License</a></li>
        </ul>
      </div>
      <div>
        <h4>Try it</h4>
        <ul>
          <li><a href="{ADD}" target="_blank" rel="noopener">Add to Discord</a></li>
          <li><a href="dashboard.html">Squad dashboard (demo)</a></li>
          <li><a href="{SKILL}" target="_blank" rel="noopener">Cubbie skill (squad-link)</a></li>
          <li><a href="https://hackathon.cubbie.ai/" target="_blank" rel="noopener">Cubbie Hackathon</a></li>
        </ul>
      </div>
    </div>
    <div class="credits">
      <span>Cubbie and its mascot belong to Cubbie. Fonts: Outfit and Pixelify Sans (OFL).</span>
      <span class="foot-peek"><canvas data-sprite="cramberry" data-scale="2" aria-hidden="true"></canvas><canvas data-sprite="boss-defeated" data-scale="2" aria-hidden="true"></canvas></span>
    </div>
  </div>
</footer>"""


def scripts(*names):
    return "\n".join(f'<script src="js/{n}.js" defer></script>' for n in ("sprite-data", "common", *names))


def page(file, title, desc, body, active="", css="", js=(), body_class=""):
    for key, val in {"ADD": ADD, "REPO": REPO, "SKILL": SKILL, "SETUP": SETUP, "PLUS": PLUS_SVG, "GH": GH_SVG,
                     "VIDEO": video()}.items():
        body = body.replace("{{" + key + "}}", val)
    extra_css = "".join(f'<link rel="stylesheet" href="css/{c}.css">' for c in css.split() if c)
    path = "" if file == "index.html" else file.removesuffix(".html")
    html = f"""{head(title, desc, path, extra_css, intro='id="intro"' in body)}
<body class="{body_class}">
{header(active)}
<main id="main">
{body}
</main>
{footer()}
{scripts(*js)}
</body>
</html>
"""
    (ROOT / file).write_text(html, encoding="utf-8")
    print("wrote", file, len(html))


if __name__ == "__main__":
    page("index.html", "Cramberry · turn your Discord study group chat into a cram battle",
         "Cramberry is a Discord bot for study groups: when someone says im cooked, it starts a 2-minute quiz the whole group plays, and each person's Cubbie texts them what they missed.",
         (PAGES / "home.html").read_text(encoding="utf-8"), css="home", js=("home",), body_class="home")
    page("dashboard.html", "Squad dashboard · Cramberry (demo)",
         "What a study squad looks like after a week of Cramberry: leaderboard, streaks, battles, deadlines and weak spots.",
         (PAGES / "dashboard.html").read_text(encoding="utf-8"), css="sub", js=("dashboard",), body_class="dash-page")
