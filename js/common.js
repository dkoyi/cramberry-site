/* Cramberry · shared behaviour: sprites, header, intro, reveals, copy + toasts, grow-from-button arena. */
(function () {
  "use strict";
  const CB = (window.CB = window.CB || {});
  const doc = document.documentElement;
  doc.classList.remove("no-js");
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  CB.reduced = reduced;
  const store = {
    get(k, s = localStorage) { try { return s.getItem(k); } catch (e) { return null; } },
    set(k, v, s = localStorage) { try { s.setItem(k, v); } catch (e) { /* storage blocked */ } },
  };
  CB.store = store;

  /* ---------------- sprites ---------------- */
  const DATA = window.CB_SPRITES || {};
  // berry recolours for the team cards (blue body → fruit accent)
  const TINTS = {
    grape: { "#1b4fa8": "#3c1670", "#1f6fe0": "#622ca4", "#3a8cef": "#9256d6" },
    tangerine: { "#1b4fa8": "#b84c0e", "#1f6fe0": "#ee781e", "#3a8cef": "#ffa84c" },
    lime: { "#1b4fa8": "#3e7a1e", "#1f6fe0": "#70b230", "#3a8cef": "#a4da56" },
  };
  const sprites = {
    data: DATA,
    has: (n) => !!DATA[n],
    /** Draw sprite `name` into `canvas`. The canvas keeps its own box (data-box) and the art is right/bottom aligned
     *  inside it, so frames of different widths (hurt = 22 px) swap without jumping. */
    draw(canvas, name) {
      const s = DATA[name];
      if (!s) return;
      const bw = +canvas.dataset.box || s.w;
      const bh = +canvas.dataset.boxh || s.h;
      if (canvas.width !== bw) canvas.width = bw;
      if (canvas.height !== bh) canvas.height = bh;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, bw, bh);
      const dx = Math.max(0, bw - s.w);   // right-aligned: a 22 px "hurt" frame adds its sweat drop on the left
      const dy = Math.max(0, bh - s.h);
      const tint = TINTS[canvas.dataset.tint] || null;
      for (let y = 0; y < s.h; y++) {
        const row = s.rows[y];
        for (let x = 0; x < s.w; x++) {
          const c = row[x];
          if (c === ".") continue;
          const col = s.palette[parseInt(c, 16)];
          ctx.fillStyle = (tint && tint[col]) || col;
          ctx.fillRect(dx + x, dy + y, 1, 1);
        }
      }
      canvas.dataset.frame = name;
    },
    /** <canvas data-sprite="boss-grape" data-scale="6"> → drawn and sized at an integer scale. */
    mount(root = document) {
      root.querySelectorAll("canvas[data-sprite]").forEach((c) => {
        sprites.draw(c, c.dataset.sprite);
        const k = +c.dataset.scale || 4;
        if (!c.dataset.fluid) {
          c.style.width = c.width * k + "px";
          c.style.height = c.height * k + "px";
        }
        c.classList.add("spr");
        if (!c.hasAttribute("role")) c.setAttribute("role", "img");
      });
    },
    make(name, scale = 4, extra = {}) {
      const c = document.createElement("canvas");
      c.dataset.sprite = name;
      c.dataset.scale = scale;
      Object.assign(c.dataset, extra);
      sprites.mount({ querySelectorAll: () => [c] });
      return c;
    },
  };
  CB.sprites = sprites;

  /** Boss laugh: alternate laugh-a / laugh-b at ~6 fps with a bob, then back to `base`. */
  CB.laugh = function (canvas, fruit, ms = 1500, bubble) {
    if (!canvas || canvas._laughing) return;
    const base = canvas.dataset.frame || `boss-${fruit}`;
    if (reduced()) {
      sprites.draw(canvas, `boss-${fruit}-laugh-a`);
      if (bubble) bubble.classList.add("show");
      setTimeout(() => { sprites.draw(canvas, base); bubble && bubble.classList.remove("show"); }, 900);
      return;
    }
    canvas._laughing = true;
    if (bubble) bubble.classList.add("show");
    let i = 0;
    const t = setInterval(() => {
      sprites.draw(canvas, `boss-${fruit}-laugh-${i % 2 ? "b" : "a"}`);
      canvas.style.translate = `0 ${i % 2 ? -3 : 0}px`;
      i++;
    }, 166);
    setTimeout(() => {
      clearInterval(t);
      canvas.style.translate = "";
      sprites.draw(canvas, base);
      canvas._laughing = false;
      if (bubble) bubble.classList.remove("show");
    }, ms);
  };

  /** Topic → fruit, the bot's rule: sum of UTF-8 bytes of the lower-cased topic, mod 5. */
  CB.FRUITS = ["grape", "lime", "lemon", "tangerine", "kiwi"];
  CB.fruitFor = function (topic) {
    const bytes = new TextEncoder().encode(String(topic).toLowerCase());
    let s = 0;
    for (const b of bytes) s += b;
    return CB.FRUITS[s % 5];
  };
  CB.bossName = (topic) =>
    "The " + String(topic).trim().replace(/\s+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()) + " Boss";

  /* ---------------- toasts + copy ---------------- */
  let host;
  CB.toast = function (msg) {
    if (!host) {
      host = document.createElement("div");
      host.className = "toast-host";
      host.setAttribute("role", "status");
      host.setAttribute("aria-live", "polite");
      document.body.appendChild(host);
    }
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    host.appendChild(t);
    setTimeout(() => t.classList.add("out"), 1700);
    setTimeout(() => t.remove(), 2100);
  };
  CB.copy = async function (text) {
    try {
      await navigator.clipboard.writeText(text);
      CB.toast("Copied!");
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (err) { /* ignore */ }
      ta.remove();
      CB.toast(ok ? "Copied!" : "Select the text to copy it");
    }
  };
  CB.COPY_SVG =
    '<svg viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M5 1h9v1h1v9h-1v1h-2v-2h1V3H6v1H4V2h1zM2 5h8v1h1v8h-1v1H2v-1H1V6h1zm1 2v6h6V7z"/></svg>';
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-copy]");
    if (!b) return;
    e.preventDefault();
    const src = b.dataset.copy;
    const text = src.startsWith("#") ? (document.querySelector(src)?.innerText || "") : src;
    CB.copy(text.trim());
  });
  function fillCopyIcons(root = document) {
    root.querySelectorAll(".copy:empty").forEach((b) => {
      b.innerHTML = CB.COPY_SVG;
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "Copy");
    });
  }
  CB.fillCopyIcons = fillCopyIcons;

  /* ---------------- reveal on scroll ---------------- */
  function reveals(root = document) {
    const els = root.querySelectorAll(".reveal, .reveal-h, .pop");
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
    // A fully clipped heading (.reveal-h) never "intersects", so watch its parent instead.
    const proxy = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          (proxy.get(en.target) || [en.target]).forEach((t) => t.classList.add("in"));
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
    els.forEach((e) => {
      if (e.classList.contains("reveal-h") && e.parentElement) {
        const p = e.parentElement;
        if (!proxy.has(p)) { proxy.set(p, []); io.observe(p); }
        proxy.get(p).push(e);
      } else io.observe(e);
    });
  }
  CB.reveals = reveals;

  /** Run fn once when el first scrolls into view (used for laughing bosses). */
  CB.onView = function (el, fn, opts = { threshold: 0.45 }) {
    if (!el) return;
    if (!("IntersectionObserver" in window)) return fn();
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) { fn(); io.disconnect(); } });
    }, opts);
    io.observe(el);
  };

  /* ---------------- header: active section + mobile sheet ---------------- */
  function navActive() {
    const links = [...document.querySelectorAll(".nav a[href*='#']")];
    const map = new Map();
    links.forEach((a) => {
      const id = a.getAttribute("href").split("#")[1];
      const sec = document.getElementById(id);
      if (sec && a.getAttribute("href").split("#")[0].match(/^(index\.html)?$|^\.?\/?$/)) map.set(sec, a);
    });
    if (!map.size || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((l) => l.classList.remove("active"));
          map.get(en.target)?.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, sec) => io.observe(sec));
  }
  function sheet() {
    const s = document.getElementById("sheet");
    const open = document.querySelector(".burger");
    if (!s || !open) return;
    const close = s.querySelector(".sheet-close");
    const set = (on) => {
      s.classList.toggle("open", on);
      open.setAttribute("aria-expanded", on);
      document.body.style.overflow = on ? "hidden" : "";
      if (on) setTimeout(() => close.focus(), 50);
      else open.focus({ preventScroll: true });
    };
    open.addEventListener("click", () => set(true));
    close.addEventListener("click", () => set(false));
    s.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && s.classList.contains("open")) set(false); });
  }
  // smooth scroll respecting reduced motion
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href^='#'], a[href^='index.html#']");
    if (!a) return;
    const id = a.getAttribute("href").split("#")[1];
    const t = id && document.getElementById(id);
    if (!t || (a.getAttribute("href").startsWith("index.html") && !document.body.classList.contains("home"))) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: reduced() ? "instant" : "smooth", block: "start" });
    history.replaceState(null, "", "#" + id);
  });

  /* ---------------- intro: berry builds, word types, logo flies into the header (FLIP) ---------------- */
  function intro() {
    const el = document.getElementById("intro");
    if (!el) return Promise.resolve();
    const seen = store.get("cb-intro", sessionStorage);
    store.set("cb-intro", "1", sessionStorage);
    const target = document.querySelector(".site-header .logo");
    const finish = () => {
      el.classList.add("done");
      document.body.classList.remove("intro-on");
      setTimeout(() => el.remove(), 500);
    };
    if (reduced()) { finish(); return Promise.resolve(); }
    document.body.classList.add("intro-on");
    const berry = el.querySelector("canvas.ib");
    const word = el.querySelector(".intro-word");
    const peek = el.querySelector(".intro-peek");
    const logo = el.querySelector(".intro-logo");
    const fast = !!seen;
    const S = DATA.berry;
    berry.width = S.w; berry.height = S.h;
    const ctx = berry.getContext("2d");
    let skipped = false;
    const wait = (ms) => new Promise((r) => setTimeout(r, skipped ? 0 : ms));
    el.addEventListener("click", () => { skipped = true; });
    document.addEventListener("keydown", function k() { skipped = true; document.removeEventListener("keydown", k); });

    const drawRow = (y) => {
      const row = S.rows[y];
      for (let x = 0; x < S.w; x++) if (row[x] !== ".") { ctx.fillStyle = S.palette[parseInt(row[x], 16)]; ctx.fillRect(x, y, 1, 1); }
    };
    return (async () => {
      // body rows pop in from the bottom up, plume last (it "flips up")
      const order = [];
      for (let y = S.h - 1; y >= 5; y--) order.push(y);
      for (let y = 4; y >= 0; y--) order.push(y);
      for (const y of order) { drawRow(y); await wait(fast ? 8 : 34); }
      if (!fast) { peek.classList.add("up"); }
      const text = "Cramberry";
      word.innerHTML = '<span class="t"></span><span class="caret"></span>';
      const t = word.querySelector(".t");
      for (let i = 1; i <= text.length; i++) { t.textContent = text.slice(0, i); await wait(fast ? 18 : 70); }
      await wait(fast ? 60 : 360);
      peek.classList.remove("up");
      word.querySelector(".caret")?.remove();
      await wait(fast ? 40 : 240);
      // FLIP: move the intro logo onto the header logo
      if (target) {
        const a = logo.getBoundingClientRect();
        const b = target.getBoundingClientRect();
        const k = b.height / a.height;
        const dx = b.left - a.left, dy = b.top - a.top;
        logo.style.transition = `transform ${fast ? 0.45 : 0.7}s cubic-bezier(.65,0,.35,1)`;
        logo.style.transform = `translate(${dx}px, ${dy}px) scale(${Math.min(k, b.width / a.width)})`;
        el.style.background = "transparent";
        el.style.transition = `background-color .5s ease`;
        await wait(fast ? 420 : 680);
      }
      finish();
    })();
  }

  /* ---------------- grow-from-button arena overlay ---------------- */
  CB.growOpen = function (overlay, fromEl) {
    const r = fromEl.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const rad = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
    overlay.hidden = false;
    overlay._from = fromEl;
    document.body.style.overflow = "hidden";
    if (reduced()) { overlay.style.clipPath = "none"; overlay.style.opacity = 1; return; }
    overlay.style.transition = "none";
    overlay.style.clipPath = `circle(0px at ${cx}px ${cy}px)`;
    overlay.getBoundingClientRect();
    overlay.style.transition = "clip-path .7s cubic-bezier(.65,0,.35,1)";
    overlay.style.clipPath = `circle(${rad}px at ${cx}px ${cy}px)`;
  };
  CB.growClose = function (overlay) {
    const fromEl = overlay._from;
    const done = () => { overlay.hidden = true; document.body.style.overflow = ""; fromEl && fromEl.focus({ preventScroll: true }); };
    if (reduced() || !fromEl) return done();
    const r = fromEl.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    overlay.style.clipPath = `circle(0px at ${cx}px ${cy}px)`;
    setTimeout(done, 650);
  };

  /* ---------------- boot ---------------- */
  CB.ready = new Promise((res) => {
    const go = () => {
      sprites.mount();
      fillCopyIcons();
      reveals();
      navActive();
      sheet();
      intro().then(res);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
    else go();
  });
})();
