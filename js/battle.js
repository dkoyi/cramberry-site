/* Cramberry · in-browser demo battle. Same rules as cramberry/engine.py, with two simulated squadmates. */
(function () {
  "use strict";
  const CB = (window.CB = window.CB || {});

  const QUESTIONS = [
    { p: "A 2-way set-associative cache has 64 sets. How many index bits does an address use?",
      o: ["5", "6", "7", "64"], a: 1, e: "64 sets = 2^6, so 6 index bits pick the set." },
    { p: "Which miss happens the very first time a block is ever accessed?",
      o: ["Conflict", "Capacity", "Compulsory", "Coherence"], a: 2, e: "Compulsory (cold) misses happen on first access no matter the cache size." },
    { p: "Block size is 16 bytes. How many offset bits are in each address?",
      o: ["2", "4", "8", "16"], a: 1, e: "16 = 2^4, so 4 offset bits select the byte inside the block." },
    { p: "Raising associativity from direct-mapped to 4-way mostly reduces which misses?",
      o: ["Compulsory", "Conflict", "Capacity", "All of them equally"], a: 1, e: "More ways means fewer blocks fighting over one set: fewer conflict misses." },
    { p: "Hit time 1 cycle, miss rate 5%, miss penalty 100 cycles. What is the AMAT?",
      o: ["5 cycles", "6 cycles", "100 cycles", "105 cycles"], a: 1, e: "AMAT = 1 + 0.05 x 100 = 6 cycles." },
  ];
  // rules (cramberry/engine.py)
  const SPEED_BONUS = [50, 30, 10], CRIT_STREAK = 3, CRIT_BONUS = 50, VICTORY_HP = 30, BOSS_HIT = 35, IDLE_HIT = 10;
  const SECONDS = 20, WAGER_SECONDS = 12;
  const LETTERS = "ABCD";
  const LEVELS = [[0, "🐣 Freshman"], [100, "📗 Sophomore"], [300, "📘 Junior"], [600, "📙 Senior"],
    [1000, "🎓 Grad Student"], [1500, "🧑‍🏫 TA"], [2200, "🧪 Researcher"], [3000, "👑 Professor"]];
  const BADGES = {
    slayer: ["🗡️", "Boss Slayer", "Beat a boss"], perfect: ["🎯", "Perfect Round", "Every answer right in a battle"],
    onfire: ["🔥", "On Fire", "5 right answers in a row"], highroller: ["💰", "High Roller", "Won an all-in wager"],
  };
  const MATES = [
    { id: "sunny", name: "Sunny", acc: 0.6, color: "#ec4c58" },
    { id: "malaika", name: "Malaika", acc: 0.75, color: "#3a8cef" },
  ];
  const FRUIT_LABEL = { grape: "Grape", lime: "Lime", lemon: "Lemon", tangerine: "Tangerine", kiwi: "Kiwi" };

  const levelFor = (xp) => { let i = 0; LEVELS.forEach(([n], k) => { if (xp >= n) i = k; }); return LEVELS[i][1]; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const rnd = (a, b) => a + Math.random() * (b - a);

  function mount(root, opts = {}) {
    const S = CB.sprites;
    let st, timers = [];
    const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
    const clearAll = () => { timers.forEach(clearTimeout); timers = []; clearInterval(st && st.tick); };

    root.classList.add("arena");
    root.innerHTML = `
      <div class="ar-top">
        <span class="demo-label">Demo · the real game runs in Discord</span>
        ${opts.closable ? '<button class="btn btn-2 btn-sm ar-close" type="button">Close <span aria-hidden="true">✕</span></button>' : ""}
      </div>
      <div class="ar-stage">
        <div class="ar-side ar-hero">
          <div class="ar-sprite"><canvas class="ar-cram" data-sprite="cramberry" data-scale="6" aria-label="Cramberry"></canvas></div>
          <div class="ar-hp"><div class="hplabel"><span>SQUAD HP</span><b class="sq-num">100%</b></div><div class="hpbar squad"><i class="sq-bar"></i></div></div>
        </div>
        <div class="ar-vs" aria-hidden="true">VS</div>
        <div class="ar-side ar-boss">
          <div class="ar-sprite">
            <div class="bubble" aria-hidden="true">HA HA HA!</div>
            <canvas class="ar-bossc" data-sprite="boss-grape" data-box="22" data-scale="7" aria-label="Boss"></canvas>
            <div class="dmg-host" aria-hidden="true"></div>
          </div>
          <div class="ar-hp"><div class="hplabel"><span class="boss-name">BOSS HP</span><b class="hp-num">100%</b></div><div class="hpbar"><i class="hp-bar"></i></div></div>
        </div>
      </div>
      <div class="ar-panel" aria-live="polite"></div>`;
    S.mount(root);
    const $ = (s) => root.querySelector(s);
    const panel = $(".ar-panel"), bossC = $(".ar-bossc"), cram = $(".ar-cram"), bubble = $(".bubble");
    if (opts.closable) $(".ar-close").addEventListener("click", () => { clearAll(); opts.onClose && opts.onClose(); });

    function setHP() {
      $(".hp-bar").style.setProperty("--v", st.hp + "%");
      $(".hp-num").textContent = Math.round(st.hp) + "%";
      $(".sq-bar").style.setProperty("--v", st.sq + "%");
      $(".sq-num").textContent = Math.round(st.sq) + "%";
    }
    function bossFrame() {
      if (st.hp <= 0) return `boss-defeated`;
      return st.hp < 40 ? `boss-${st.fruit}-hurt` : `boss-${st.fruit}`;
    }
    function hitBoss(dmg, crit) {
      const host = $(".dmg-host");
      const n = document.createElement("span");
      n.className = "dmg" + (crit ? " crit" : "");
      n.textContent = (crit ? "CRIT -" : "-") + Math.round(dmg);
      host.appendChild(n);
      setTimeout(() => n.remove(), 1200);
      bossC.classList.remove("flash", "shake");
      void bossC.offsetWidth;
      bossC.classList.add("flash", "shake");
      setTimeout(() => S.draw(bossC, bossFrame()), 260);
    }

    /* ---- start screen ---- */
    function start() {
      clearAll();
      st = { fruit: st ? st.fruit : (opts.fruit || "grape"), qi: 0, hp: 100, sq: 100, fifty: false, removed: [],
        players: { you: { name: "You", pts: 0, streak: 0, best: 0, right: 0 }, sunny: { name: "Sunny", pts: 0, streak: 0, best: 0, right: 0 },
          malaika: { name: "Malaika", pts: 0, streak: 0, best: 0, right: 0 } }, wager: {}, log: [] };
      S.draw(bossC, `boss-${st.fruit}`);
      S.draw(cram, "cramberry");
      cram.classList.remove("raise");
      setHP();
      panel.innerHTML = `
        <div class="ar-intro">
          <p class="kicker">Boss battle · caches · 5 questions</p>
          <h2 class="h3">The Caches Boss wants a fight.</h2>
          <p class="muted">You play with two simulated squadmates, Sunny and Malaika. Right answers drain the boss's HP; wrong ones let it hit the squad back.
            Three in a row is a ⚡ crit. Keys: <kbd>1</kbd>–<kbd>4</kbd> or <kbd>A</kbd>–<kbd>D</kbd> to answer, <kbd>F</kbd> for 🎲 50/50.</p>
          <fieldset class="fruit-pick"><legend>Pick your boss</legend>
            ${CB.FRUITS.map((f) => `<label class="fp${f === st.fruit ? " on" : ""}"><input type="radio" name="fruit" value="${f}" ${f === st.fruit ? "checked" : ""}>
              <canvas data-sprite="boss-${f}" data-scale="3" aria-hidden="true"></canvas><span>${FRUIT_LABEL[f]}</span></label>`).join("")}
          </fieldset>
          <div class="btn-row"><button class="btn ar-go" type="button">⚔️ Start the battle</button></div>
        </div>`;
      S.mount(panel);
      panel.querySelectorAll("input[name=fruit]").forEach((r) => r.addEventListener("change", () => {
        st.fruit = r.value;
        panel.querySelectorAll(".fp").forEach((l) => l.classList.toggle("on", l.contains(r)));
        S.draw(bossC, `boss-${st.fruit}`);
      }));
      $(".ar-go").addEventListener("click", () => ask());
      if (opts.autofocus !== false) setTimeout(() => $(".ar-go").focus({ preventScroll: true }), 60);
    }

    /* ---- one question ---- */
    function ask() {
      clearAll();
      const q = QUESTIONS[st.qi];
      st.removed = [];
      st.answers = {};       // id -> {c, t}
      st.t0 = performance.now();
      st.left = SECONDS;
      st.open = true;
      const final = st.qi === QUESTIONS.length - 1;
      panel.innerHTML = `
        <div class="ar-q">
          <div class="ar-qhead">
            <div><p class="kicker">${final ? "💰 Final strike" : "Boss battle"} · question ${st.qi + 1} of ${QUESTIONS.length}</p>
              <h2 class="ar-prompt">${esc(q.p)}</h2></div>
            <div class="timer" style="--p:1" role="timer" aria-label="Time left"><span>${SECONDS}</span></div>
          </div>
          <div class="ar-opts">${q.o.map((o, i) => `<button class="opt" type="button" data-i="${i}"><b>${LETTERS[i]}</b><span>${esc(o)}</span></button>`).join("")}</div>
          <div class="ar-foot">
            <button class="btn btn-2 btn-sm fifty" type="button" ${st.fifty ? "disabled" : ""}>🎲 50/50 ${st.fifty ? "(used)" : "· once"}</button>
            <ul class="squad-status">${["you", ...MATES.map((m) => m.id)].map((id) =>
              `<li data-id="${id}"><i></i>${id === "you" ? "You" : st.players[id].name}<em>thinking…</em></li>`).join("")}</ul>
          </div>
        </div>`;
      panel.querySelectorAll(".opt").forEach((b) => b.addEventListener("click", () => choose("you", +b.dataset.i)));
      panel.querySelector(".fifty").addEventListener("click", useFifty);
      // squadmates answer at random times
      MATES.forEach((m) => later(() => mateAnswer(m), rnd(4, 15) * 1000));
      st.tick = setInterval(() => {
        st.left -= 1;
        const tm = panel.querySelector(".timer");
        if (tm) { tm.style.setProperty("--p", Math.max(0, st.left / SECONDS)); tm.querySelector("span").textContent = Math.max(0, st.left); tm.classList.toggle("low", st.left <= 5); }
        if (st.left <= 0) close();
      }, 1000);
      setTimeout(() => panel.querySelector(".opt")?.focus({ preventScroll: true }), 50);
    }
    function mateAnswer(m) {
      if (!st.open || st.answers[m.id]) return;
      const q = QUESTIONS[st.qi];
      const live = [0, 1, 2, 3].filter((i) => !st.removed.includes(i));
      const right = Math.random() < m.acc + (st.removed.length ? 0.15 : 0);
      const wrong = live.filter((i) => i !== q.a);
      choose(m.id, right || !wrong.length ? q.a : wrong[Math.floor(Math.random() * wrong.length)]);
    }
    function choose(id, i) {
      if (!st.open || st.removed.includes(i)) return;
      const t = (performance.now() - st.t0) / 1000;
      st.answers[id] = { c: i, t };
      const li = panel.querySelector(`.squad-status li[data-id="${id}"]`);
      if (li) { li.classList.add("in"); li.querySelector("em").textContent = "locked in"; }
      if (id === "you") {
        panel.querySelectorAll(".opt").forEach((b) => { b.classList.toggle("picked", +b.dataset.i === i); });
        // everyone else hurries up, then reveal
        MATES.forEach((m) => { if (!st.answers[m.id]) later(() => mateAnswer(m), rnd(0.5, 1.6) * 1000); });
        later(() => { if (st.open) close(); }, 1900);
      }
      if (Object.keys(st.answers).length === 3) later(() => { if (st.open) close(); }, 450);
    }
    function useFifty() {
      if (st.fifty || !st.open) return;
      const q = QUESTIONS[st.qi];
      const wrong = [0, 1, 2, 3].filter((i) => i !== q.a);
      st.removed = wrong.sort(() => Math.random() - 0.5).slice(0, 2).sort();
      st.fifty = true;
      // anyone who picked a removed option answers again (engine.use_fifty)
      Object.keys(st.answers).forEach((id) => {
        if (st.removed.includes(st.answers[id].c)) {
          delete st.answers[id];
          const li = panel.querySelector(`.squad-status li[data-id="${id}"]`);
          if (li) { li.classList.remove("in"); li.querySelector("em").textContent = "thinking…"; }
          const m = MATES.find((x) => x.id === id);
          if (m) later(() => mateAnswer(m), rnd(1, 3) * 1000);
        }
      });
      panel.querySelectorAll(".opt").forEach((b) => { if (st.removed.includes(+b.dataset.i)) { b.disabled = true; b.classList.add("gone"); b.classList.remove("picked"); } });
      const f = panel.querySelector(".fifty"); f.disabled = true; f.textContent = "🎲 50/50 (used)";
    }

    /* ---- score the question exactly like engine.close_question ---- */
    function close() {
      if (!st.open) return;
      st.open = false;
      clearInterval(st.tick);
      const q = QUESTIONS[st.qi];
      const ids = Object.keys(st.answers);
      const correct = ids.filter((id) => st.answers[id].c === q.a).sort((a, b) => st.answers[a].t - st.answers[b].t);
      const wrong = ids.filter((id) => !correct.includes(id));
      const before = {}; Object.keys(st.players).forEach((id) => (before[id] = st.players[id].pts));
      const crits = [], gained = {};
      correct.forEach((id, rank) => {
        const p = st.players[id];
        p.streak += 1; p.best = Math.max(p.best, p.streak); p.right += 1;
        let pts = 100 + (SPEED_BONUS[rank] || 0);
        if (p.streak >= CRIT_STREAK) { pts += CRIT_BONUS; crits.push(id); }
        p.pts += pts; gained[id] = pts;
      });
      Object.keys(st.players).forEach((id) => { if (!correct.includes(id)) st.players[id].streak = 0; });
      // final-strike wagers: a share of the points held before this question
      const wagerLines = [];
      if (st.qi === QUESTIONS.length - 1) {
        Object.entries(st.wager).forEach(([id, frac]) => {
          const stake = Math.round(frac * before[id]);
          if (!stake) return;
          const d = correct.includes(id) ? stake : -stake;
          st.players[id].pts = Math.max(0, st.players[id].pts + d);
          wagerLines.push(`${st.players[id].name} ${frac >= 1 ? "went ALL IN" : "bet half"}: ${d > 0 ? "+" : ""}${d}`);
        });
      }
      const fraction = ids.length ? correct.length / ids.length : 0;
      const dmg = (100 / QUESTIONS.length) * fraction * (crits.length ? 1.5 : 1);
      st.hp = Math.max(0, Math.round((st.hp - dmg) * 10) / 10);
      let hit = 0;
      if (!ids.length) hit = IDLE_HIT; else if (wrong.length) hit = Math.round(BOSS_HIT * wrong.length / ids.length);
      st.sq = Math.max(0, st.sq - hit);
      st.qi += 1;
      const last = st.qi >= QUESTIONS.length;
      let outcome = "";
      if (st.hp <= 0) outcome = "victory";
      else if (st.sq <= 0) outcome = "wiped";
      else if (last) outcome = st.hp <= VICTORY_HP ? "victory" : "survived";

      // show it
      panel.querySelectorAll(".opt").forEach((b) => {
        const i = +b.dataset.i; b.disabled = true;
        if (i === q.a) b.classList.add("right");
        else if (st.answers.you && st.answers.you.c === i) b.classList.add("wrong");
      });
      const you = st.answers.you;
      const youRight = you && you.c === q.a;
      if (dmg > 0) hitBoss(dmg, crits.length > 0);
      else setTimeout(() => S.draw(bossC, bossFrame()), 100);
      if (hit > 0 || (you && !youRight)) {
        setTimeout(() => CB.laugh(bossC, st.fruit, 1500, bubble), dmg > 0 ? 500 : 50);
        if (hit) root.classList.add("hurt-flash"), setTimeout(() => root.classList.remove("hurt-flash"), 400);
        setTimeout(() => S.draw(bossC, bossFrame()), 2100);
      }
      setHP();
      const youCrit = crits.includes("you");
      const names = (arr) => arr.map((id) => (id === "you" ? "you" : st.players[id].name)).join(", ");
      const verdict = !you ? "⏰ Time's up for you." : youRight ? (youCrit ? "⚡ Critical hit! Three in a row." : "✅ Right!") : "❌ Not this time.";
      const res = document.createElement("div");
      res.className = "ar-reveal " + (youRight ? "good" : "bad");
      res.innerHTML = `
        <p class="verdict">${verdict}${gained.you ? ` <span class="plus">+${gained.you}</span>` : ""}</p>
        <p class="why"><b>${LETTERS[q.a]}) ${esc(q.o[q.a])}.</b> ${esc(q.e)}</p>
        <p class="tally">${correct.length ? `Right: ${names(correct)}.` : "Nobody got it."} ${wrong.length ? `Missed: ${names(wrong)}.` : ""}
          Boss ${dmg > 0 ? `took ${Math.round(dmg)}${crits.length ? " (crit ×1.5)" : ""}` : "took nothing"}${hit ? ` · it hit the squad for ${hit}` : ""}.</p>
        ${wagerLines.length ? `<p class="tally">💰 ${esc(wagerLines.join(" · "))}</p>` : ""}
        <button class="btn btn-sm ar-next" type="button">${outcome ? "See the results" : st.qi === QUESTIONS.length - 1 ? "To the final strike" : "Next question"} →</button>`;
      panel.querySelector(".ar-foot").replaceWith(res);
      const nextFn = () => (outcome ? results(outcome) : st.qi === QUESTIONS.length - 1 ? wagerPhase() : ask());
      res.querySelector(".ar-next").addEventListener("click", nextFn);
      res.querySelector(".ar-next").focus({ preventScroll: true });
    }

    /* ---- final strike wager (Play safe / Bet half / ALL IN) ---- */
    function wagerPhase() {
      clearAll();
      st.wager = {};
      let left = WAGER_SECONDS;
      const mine = st.players.you.pts;
      panel.innerHTML = `
        <div class="ar-wager">
          <p class="kicker">💰 Final strike</p>
          <h2 class="h3">Wager before the last question?</h2>
          <p class="muted">You have <b>${mine}</b> points. Get it right and the stake doubles; get it wrong and you lose it.</p>
          <div class="btn-row">
            <button class="btn btn-2" data-w="0" type="button">🛡️ Play safe</button>
            <button class="btn" data-w="0.5" type="button">💸 Bet half</button>
            <button class="btn btn-red" data-w="1" type="button">🔥 ALL IN</button>
          </div>
          <p class="muted small wtimer">Closes in <b>${left}</b> s</p>
        </div>`;
      const pick = (f) => {
        if (f) st.wager.you = f;
        MATES.forEach((m) => { const r = Math.random(); if (r > 0.45) st.wager[m.id] = r > 0.8 ? 1 : 0.5; });
        ask();
      };
      panel.querySelectorAll("[data-w]").forEach((b) => b.addEventListener("click", () => pick(+b.dataset.w)));
      st.tick = setInterval(() => { left -= 1; const w = panel.querySelector(".wtimer b"); if (w) w.textContent = left; if (left <= 0) pick(0); }, 1000);
      panel.querySelector("[data-w='0.5']").focus({ preventScroll: true });
    }

    /* ---- results podium ---- */
    function results(outcome) {
      clearAll();
      const board = Object.entries(st.players).map(([id, p]) => ({ id, ...p })).sort((a, b) => b.pts - a.pts);
      const me = st.players.you;
      const win = outcome === "victory";
      const badges = [];
      if (win) badges.push("slayer");
      if (me.right === QUESTIONS.length) badges.push("perfect");
      if (me.best >= 5) badges.push("onfire");
      if (st.wager.you >= 1 && me.right && st.answers.you && st.answers.you.c === QUESTIONS[QUESTIONS.length - 1].a && me.pts > 0) badges.push("highroller");
      const xp = 10 + Math.floor(me.pts / 5) + (win ? 25 : 0);
      if (win) { S.draw(bossC, "boss-defeated"); cram.classList.add("raise"); }
      else { CB.laugh(bossC, st.fruit, 2200, bubble); }
      const title = win ? "VICTORY!" : outcome === "wiped" ? "SQUAD WIPED" : "THE BOSS GOT AWAY";
      const sub = win ? "The Caches Boss defeated" : `The Caches Boss kept ${Math.round(st.hp)}% HP`;
      const pod = [board[1], board[0], board[2]];
      panel.innerHTML = `
        <div class="ar-results ${win ? "win" : "lose"}">
          <h2 class="res-title">${title}</h2>
          <p class="muted">${sub}</p>
          <div class="podium">${pod.map((p, k) => p ? `
            <div class="pod pod-${[2, 1, 3][k]}${p.id === "you" ? " me" : ""}">
              <span class="pname">${esc(p.name)}</span><span class="medal">${[2, 1, 3][k]}</span>
              <span class="ppts">${p.pts}</span><span class="plab">points</span></div>` : "").join("")}
          </div>
          <div class="res-stats">
            <div><b>${me.pts}</b><span>your points</span></div>
            <div><b>+${xp}</b><span>XP earned</span></div>
            <div><b>${me.right}/${QUESTIONS.length}</b><span>right</span></div>
            <div><b>${levelFor(xp)}</b><span>level</span></div>
          </div>
          <div class="res-badges">${badges.length ? badges.map((b) => `<span class="badge-pill" title="${BADGES[b][2]}">${BADGES[b][0]} ${BADGES[b][1]}</span>`).join("")
            : '<span class="muted">No badges this time. Win the fight for 🗡️ Boss Slayer.</span>'}</div>
          <p class="muted small">In Discord the results card also names the squad's weak spot, and each linked Cubbie texts its student what they missed.</p>
          <div class="btn-row">
            <button class="btn btn-gold ar-again" type="button">🔁 Play again</button>
            <a class="btn" href="https://discord.com/oauth2/authorize?client_id=1563704377833689098&scope=bot+applications.commands&permissions=117760" target="_blank" rel="noopener">Add Cramberry to your server</a>
          </div>
        </div>`;
      panel.querySelector(".ar-again").addEventListener("click", start);
      panel.querySelector(".ar-again").focus({ preventScroll: true });
    }

    function onKey(e) {
      if (!root.isConnected || root.closest("[hidden]") || !st || !st.open) return;
      if (e.target.matches("input, textarea")) return;
      const k = e.key.toUpperCase();
      const i = "1234".indexOf(k) >= 0 ? "1234".indexOf(k) : LETTERS.indexOf(k);
      if (i >= 0 && k.length === 1) { e.preventDefault(); choose("you", i); }
      else if (k === "F") useFifty();
    }
    document.addEventListener("keydown", onKey);
    start();
    return { restart: start, stop: clearAll };
  }

  CB.Battle = { mount, QUESTIONS };
})();
