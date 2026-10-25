#!/usr/bin/env python3
"""Writes the four static pages with one shared header and footer. Run after editing a partial:
    python tools/make_pages.py
The output is plain HTML; Vercel serves it as is (no build step)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / "tools" / "pages"

ADD = "https://discord.com/oauth2/authorize?client_id=1563704377833689098&amp;scope=bot+applications.commands&amp;permissions=117760"
REPO = "https://github.com/MalaikaKamranKhan/Track3"
SKILL = REPO + "/blob/main/cubbie-skill/squad-link/SKILL.md"

GH_SVG = ('<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 '
          '5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52'
          '-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82'
          '-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1'
          '.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46'
          '.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>')
PLUS_SVG = '<svg class="ico" viewBox="0 0 10 10" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M4 1h2v3h3v2H6v3H4V6H1V4h3z"/></svg>'
BURGER_SVG = '<svg viewBox="0 0 12 12" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M1 2h10v2H1zm0 3h10v2H1zm0 3h10v2H1z"/></svg>'
CLOSE_SVG = '<svg viewBox="0 0 12 12" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M2 1h2v1h1v1h2V2h1V1h2v2H9v1H8v1H7v2h1v1h1v1h1v2H8v-1H7v-1H5v1H4v1H2V9h1V8h1V7h1V5H4V4H3V3H2z"/></svg>'

NAV = [("How it works", "index.html#how"), ("Games", "index.html#games"), ("Cubbie", "index.html#cubbie"),
       ("Play", "play.html"), ("Setup", "setup.html"), ("Team", "index.html#team")]


def head(title, desc, extra_css=""):
    return f"""<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#f6f0e4">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="assets/logo/social-preview.png">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="assets/logo/favicon-64.png">
<link rel="apple-touch-icon" href="assets/logo/apple-touch-icon.png">
<link rel="preload" href="assets/fonts/PixelifySans-Medium.ttf" as="font" type="font/ttf" crossorigin>
<link rel="preload" href="assets/fonts/Outfit-Bold.ttf" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="css/site.css">
{extra_css}
</head>"""


def header(active=""):
    links = "".join(
        f'<a href="{h}"{" class=\"active\" aria-current=\"page\"" if active == n else ""}>{n}</a>' for n, h in NAV)
    sheet_links = "".join(f'<a href="{h}">{n}</a>' for n, h in NAV) + '<a href="dashboard.html">Squad dashboard</a>'
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
          <li><a href="{REPO}/blob/main/SETUP.md" target="_blank" rel="noopener">Setup guide</a></li>
          <li><a href="{REPO}/blob/main/LICENSE" target="_blank" rel="noopener">MIT License</a></li>
        </ul>
      </div>
      <div>
        <h4>Try it</h4>
        <ul>
          <li><a href="play.html">Play a demo battle</a></li>
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
    body = body.replace("{{ADD}}", ADD).replace("{{REPO}}", REPO).replace("{{SKILL}}", SKILL).replace("{{PLUS}}", PLUS_SVG).replace("{{GH}}", GH_SVG)
    extra_css = "".join(f'<link rel="stylesheet" href="css/{c}.css">' for c in css.split() if c)
    html = f"""{head(title, desc, extra_css)}
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
    page("index.html", "Cramberry · your study squad's boss battle, right in Discord",
         "A pixel berry knight that turns a study group's Discord into a quiz game, and talks to each student's own Cubbie.",
         (PAGES / "home.html").read_text(), css="home", js=("battle", "home"), body_class="home")
    page("play.html", "Play · Cramberry demo battle",
         "Fight the Caches Boss in your browser with the real Cramberry battle rules.",
         (PAGES / "play.html").read_text(), active="Play", css="", js=("battle", "play"), body_class="play-page")
    page("dashboard.html", "Squad dashboard · Cramberry (demo)",
         "What a study squad looks like after a week of Cramberry: leaderboard, streaks, battles, deadlines and weak spots.",
         (PAGES / "dashboard.html").read_text(), css="sub", js=("dashboard",), body_class="dash-page")
    page("setup.html", "Setup · run your own Cramberry",
         "Install Cramberry in your own Discord server and connect your Cubbie, step by step.",
         (PAGES / "setup.html").read_text(), active="Setup", css="sub", js=("setup",), body_class="setup-page")
