/* Cramberry · home page interactions. */
(function () {
  "use strict";
  const CB = window.CB;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  CB.ready.then(() => {
    heroBattle();
    loop();
    phone();
    games();
    carousel();
    cooked();
    tools();
  });

  /* ---------- games: a live battle on the stage, looping through the bot's built-in caches questions ---------- */
  // p = prompt, a = index of the right answer (same questions and answers as the bot's offline question bank)
  const QS = [
    { p: "A 2-way set-associative cache has 64 sets. How many index bits does an address use?", a: 1 },
    { p: "Which miss happens the very first time a block is ever accessed?", a: 2 },
    { p: "Block size is 16 bytes. How many offset bits are in each address?", a: 1 },
    { p: "Raising associativity from direct-mapped to 4-way mostly reduces which misses?", a: 1 },
    { p: "Hit time 1 cycle, miss rate 5%, miss penalty 100 cycles. What is the AMAT?", a: 1 },
  ];
  function heroBattle() {
    const boss = $("#mc-boss"), hero = $(".mc-hero"), bubble = $(".mc-boss .bubble"), host = $(".mc-boss .dmg-host");
    if (!boss) return;
    const keys = $$(".mc-abcd span");
    const prompt = $("#mc-q");
    let hp = 100, sq = 100, q = 1;
    const set = () => {
      $("#mc-hp").style.setProperty("--v", hp + "%"); $("#mc-hpn").textContent = hp + "%";
      $("#mc-sq").style.setProperty("--v", sq + "%"); $("#mc-sqn").textContent = sq + "%";
      $("#mc-tag").textContent = hp <= 0 ? "Defeated" : `Q${q} of 5`;
    };
    const showQ = (n) => {
      const Q = QS[n - 1];
      if (!prompt || !Q) return;
      prompt.classList.add("swap");
      setTimeout(() => { prompt.textContent = Q.p; prompt.classList.remove("swap"); }, 250);
    };
    // a scripted fight: right, wrong, crit, right, crit (the pressed key is the real right or a real wrong answer)
    const script = [{ ok: true, d: 20 }, { ok: false, d: 7, hit: 12 }, { ok: true, d: 30, crit: true }, { ok: true, d: 20 }, { ok: true, d: 23, crit: true }];
    const keyFor = (n, ok) => { const a = QS[n - 1] ? QS[n - 1].a : 1; return ok ? a : (a + 1) % 4; };
    let i = 0, visible = true;
    if ("IntersectionObserver" in window) new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(boss);
    set();
    const frame = () => (hp <= 0 ? "boss-defeated" : hp < 40 ? "boss-grape-hurt" : "boss-grape");
    let busy = false;
    async function round() {
      if (busy || !visible || document.hidden || CB.reduced()) return;
      const s = script[i];
      if (!s) { i = 0; return; }
      busy = true;
      const key = keys[keyFor(q, s.ok)];
      key.classList.add("press");
      key.classList.toggle("miss", !s.ok);
      await sleep(420);
      key.classList.remove("press", "miss");
      hp = Math.max(0, hp - s.d);
      const n = document.createElement("span");
      n.className = "dmg" + (s.crit ? " crit" : "");
      n.textContent = (s.crit ? "CRIT -" : "-") + s.d;
      n.style.fontSize = "26px";
      host.appendChild(n); setTimeout(() => n.remove(), 1100);
      boss.classList.remove("flash"); void boss.offsetWidth; boss.classList.add("flash");
      if (!s.ok) { sq = Math.max(0, sq - s.hit); setTimeout(() => CB.laugh(boss, "grape", 1300, bubble), 300); }
      setTimeout(() => CB.sprites.draw(boss, frame()), s.ok ? 300 : 1700);
      q = Math.min(5, q + 1);
      set();
      i += 1;
      if (hp > 0) showQ(q);
      if (hp <= 0) {
        hero.classList.add("raise");
        await sleep(3200);
        hero.classList.remove("raise");
        hp = 100; sq = 100; q = 1; i = 0;
        CB.sprites.draw(boss, "boss-grape");
        showQ(1);
        set();
      }
      busy = false;
    }
    setInterval(round, 2400);
  }

  /* ---------- 3. the Cubbie loop ---------- */
  function loop() {
    const L = $("#loop");
    if (!L) return;
    const STEPS = {
      1: { link: 1, dir: "fwd", on: ["canvas", "cubbies"], t: "Your Cubbie checks your Canvas: topics and due dates. Never grades." },
      2: { link: 2, dir: "fwd", on: ["cubbies", "cram"], t: "It writes a quiz from your notes and asks you before sending it." },
      3: { link: 3, dir: "fwd", on: ["cram", "chat"], t: "Cramberry posts the quiz in your Discord group chat." },
      4: { link: 3, dir: "back", on: ["chat", "cram"], t: "Everyone answers with A–D buttons." },
      5: { link: 2, dir: "back", on: ["cram", "cubbies"], t: "Your results go only to your Cubbie: your rank and what you missed." },
    };
    let cur = 1, playing = false, timer;
    const cap = $("#loop-cap");
    function show(n) {
      cur = n;
      const s = STEPS[n];
      $$(".step-b", L).forEach((b) => b.setAttribute("aria-selected", +b.dataset.step === n));
      $$(".lp", L).forEach((p) => p.classList.toggle("on", s.on.includes(p.dataset.p)));
      $$(".lane", L).forEach((l) => l.classList.remove("go"));
      const lane = $(`.lp-link[data-link="${s.link}"] .lane.${s.dir}`, L);
      if (lane && !CB.reduced()) lane.classList.add("go");
      cap.innerHTML = `<b>${n}</b><span>${esc(s.t)}</span>`;
    }
    function auto(on) {
      playing = on;
      const b = $(".loop-play", L);
      b.setAttribute("aria-pressed", on);
      b.textContent = on ? "❚❚ Pause" : "▶ Play";
      clearInterval(timer);
      if (on) timer = setInterval(() => show((cur % 5) + 1), 3400);
    }
    $$(".step-b", L).forEach((b) => b.addEventListener("click", () => { auto(false); show(+b.dataset.step); }));
    $(".loop-play", L).addEventListener("click", () => auto(!playing));
    $$("input[name=scope]", L).forEach((r) => r.addEventListener("change", () => { L.dataset.show = r.value; }));
    show(1);
    auto(false);
    if (!CB.reduced()) CB.onView(L, () => auto(true), { threshold: 0.25 });
  }

  /* ---------- 4. phone: real Cubbie replies ---------- */
  function phone() {
    const body = $("#ph-body"), list = $("#phrases");
    if (!body) return;
    const SKILL = "https://github.com/MalaikaKamranKhan/Track3/blob/main/cubbie-skill/squad-link/SKILL.md";
    const CUBBIE = "assets/cubbie/cubbie-official.svg";
    const P = [
      { say: "hi cubbie", r: ["Hey! What can I help with?"] },
      { say: `install ${SKILL}`, label: "install …/squad-link/SKILL.md", r: ['Installed squad-link. Text "link my study squad" to connect your Discord study group.'] },
      { say: "link my study squad", r: ["Checking it now.", "Type /link in your group, then enter the key on the private page I'm sending.", { link: true },
        "Linked as Dhanush to wildberry squad's #general on Discord. Share your course progress with the squad: course codes, topic names, assignment titles, due dates and submission status, but no grades or files?"] },
      { say: "check my squad and share my course snapshot", r: ["On it, give me a moment.", "Shared your course snapshot with wildberry squad #general. Nothing new from the squad."] },
      { say: "check my squad", r: ["Taking a look.", "Nothing new from your squad right now."] },
      { say: "challenge my squad on caches from my CSE 230 notes", r: ["On it.",
        "5 questions on caches from your CSE 230 notes. First one: a 2-way set-associative cache has 64 sets. How many index bits does an address use?\nPost this battle to your squad?",
        { me: "yes" }, "It's live in wildberry squad #general. Go play too!"] },
      { say: "how did the squad battle go?", r: ["Squad beat the Caches Boss, you were #2 🥈",
        "Missed: AMAT with a 5% miss rate and a 100-cycle penalty. Right answer: 6 cycles (1 + 0.05 × 100). Want a 3-question practice round?"] },
      { say: "update squad-link", r: ["Updated squad-link from the repository…"] },
    ];
    list.innerHTML = P.map((p, i) => `<li class="phrase"><button class="send" type="button" data-i="${i}">${esc(p.label || p.say)}</button><button class="copy" type="button" data-copy="${esc(p.say)}" aria-label="Copy: ${esc(p.label || p.say)}"></button></li>`).join("");
    CB.fillCopyIcons(list);
    let busy = false;
    const add = (html, cls) => { const d = document.createElement("div"); d.className = "bub " + cls; d.innerHTML = html; body.appendChild(d); body.scrollTop = body.scrollHeight; return d; };
    list.addEventListener("click", async (e) => {
      const b = e.target.closest(".send");
      if (!b || busy) return;
      busy = true;
      list.setAttribute("aria-busy", "true");
      const p = P[+b.dataset.i];
      add(esc(p.say), "me");
      for (const r of p.r) {
        const obj = typeof r === "object";
        if (obj && r.me) { await sleep(700); add(esc(r.me), "me"); continue; }
        const t = add("<i></i><i></i><i></i>", "them typing");
        t.setAttribute("aria-label", "Cubbie is typing");
        await sleep(CB.reduced() ? 150 : 650 + Math.min(900, (obj ? 30 : r.length) * 8));
        t.remove();
        if (obj && r.link) add(`<img src="${CUBBIE}" alt=""><div><b>Provide details · Cubbie</b><span>cubbie.ai · private page</span></div>`, "them link");
        else add(esc(r), "them");
      }
      busy = false;
      list.removeAttribute("aria-busy");
    });
  }

  /* ---------- 4. games: laughing boss, fruit bosses ---------- */
  function games() {
    const peek = $("#games-boss");
    if (peek) {
      const c = $("canvas", peek), bub = $(".bubble", peek);
      CB.onView($("#games .games-grid"), () => { peek.classList.add("up"); setTimeout(() => CB.laugh(c, "grape", 1500, bub), 450); }, { threshold: 0.3 });
      peek.addEventListener("mouseenter", () => CB.laugh(c, "grape", 1500, bub));
    }
    $$("#bestiary button").forEach((b) => {
      const f = b.dataset.fruit, c = $("canvas", b);
      b.addEventListener("mouseenter", () => { if (!c._laughing) CB.sprites.draw(c, `boss-${f}-hurt`); });
      b.addEventListener("mouseleave", () => { if (!c._laughing) CB.sprites.draw(c, `boss-${f}`); });
      b.addEventListener("click", () => { CB.sprites.draw(c, `boss-${f}`); CB.laugh(c, f, 1500); });
      b.setAttribute("aria-label", `The ${$("b", b).textContent} boss. Press to make it laugh.`);
    });
  }

  /* ---------- 6. card carousel + lightbox ---------- */
  function carousel() {
    const car = $("#carousel"), dlg = $("#lightbox");
    if (!car) return;
    const step = () => car.querySelector("figure").getBoundingClientRect().width + 22;
    $(".car-prev").addEventListener("click", () => car.scrollBy({ left: -step(), behavior: CB.reduced() ? "instant" : "smooth" }));
    $(".car-next").addEventListener("click", () => car.scrollBy({ left: step(), behavior: CB.reduced() ? "instant" : "smooth" }));
    car.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); car.scrollBy({ left: step() }); }
      if (e.key === "ArrowLeft") { e.preventDefault(); car.scrollBy({ left: -step() }); }
    });
    car.addEventListener("click", (e) => {
      const b = e.target.closest("[data-full]");
      if (!b || !dlg || !dlg.showModal) return;
      const img = $("img", dlg);
      img.src = b.dataset.full;
      img.alt = $("img", b).alt;
      dlg.showModal();
    });
    dlg && $(".lb-close", dlg).addEventListener("click", () => dlg.close());
    dlg && dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  }

  /* ---------- 7. "im cooked" ---------- */
  function cooked() {
    const feed = $("#dc-feed"), form = $("#dc-in"), input = $("#dc-text"), hint = $("#dc-hint");
    if (!feed) return;
    // same pattern as cramberry/engine.py PANIC (falls back to a simpler test on very old browsers)
    let PANIC;
    try {
      PANIC = new RegExp("(?<!\\bi )(?<!\\bhe )(?<!\\bshe )(?<!\\bwe )(?<!\\byou )(?<!\\bthey )\\bcooked\\b" +
        "|\\b(?:doomed|so screwed|so lost|so behind|send help|cramming|panicking|(?:gonna|going to|finna|about to) fail)\\b", "i");
    } catch (e) {
      PANIC = { test: (t) => /\bcooked\b|send help|gonna fail|doomed/i.test(t) && !/\b(i|he|she|we|you|they) cooked\b/i.test(t) };
    }
    const boss = $("#cooked-boss canvas"), bub = $("#cooked-boss .bubble");
    CB.onView($("#cooked .dc"), () => boss && CB.laugh(boss, "grape", 1500, bub), { threshold: 0.4 });
    let rallied = false;
    const now = () => "Today at " + new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    function msg(text) {
      const d = document.createElement("div");
      d.className = "dcm";
      d.innerHTML = `<span class="av" style="background:#ec4c58"></span><div><b style="color:#f3a6b8">Sunny</b> <span class="you-tag">you</span> <time>${now()}</time><p>${esc(text)}</p></div>`;
      feed.appendChild(d);
      feed.scrollTop = feed.scrollHeight;
    }
    function rally() {
      const d = document.createElement("div");
      d.className = "dcm";
      d.innerHTML = `<span class="av cb"><canvas data-sprite="cramberry" data-scale="1" aria-hidden="true"></canvas></span>
        <div><b style="color:#8fb5ff">Cramberry</b><span class="app-tag">APP</span> <time>${now()}</time>
        <div class="rally">
          <div>
            <h4>🆘 Sunny is cooked. Squad, assemble!</h4>
            <p class="r-sub">Nobody gets cooked alone 🫐 Here's the game plan:</p>
            <p class="r-h">What to do next</p>
            <ol>
              <li><span class="n">1</span><code>/battle</code><span>· type the topic you're cooked on, 2-min boss battle together</span></li>
              <li><span class="n">2</span><code>/explain</code><span>· teach a topic back, the AI grades it</span></li>
              <li><span class="n">3</span><code>/plan</code><span>· pick a time to study together</span></li>
              <li><span class="n">4</span><code>/focus</code><span>· group Pomodoro right now</span></li>
              <li><span class="n">5</span><code>/radar</code><span>· everything due this week</span></li>
            </ol>
          </div>
          <canvas class="rb" data-sprite="boss-grape" data-box="22" data-scale="4" aria-hidden="true"></canvas>
          <p class="r-foot">Start typing / in the chat to pick a command · /quiet if you'd rather I stay out of the chat</p>
        </div></div>`;
      feed.appendChild(d);
      CB.sprites.mount(d);
      const c = $(".av.cb canvas", d); c.style.width = "40px"; c.style.height = "34px";
      feed.scrollTop = feed.scrollHeight;
      setTimeout(() => CB.laugh($(".rb", d), "grape", 1500), 500);
      boss && setTimeout(() => CB.laugh(boss, "grape", 1500, bub), 300);
    }
    function send(text) {
      text = text.trim();
      if (!text) return;
      msg(text);
      if (PANIC.test(text)) {
        if (rallied) { hint.textContent = "In Discord, Cramberry rallies at most once every 5 minutes per chat, so it stays quiet now."; return; }
        rallied = true;
        hint.textContent = "";
        setTimeout(rally, 700);
      } else {
        hint.textContent = "Cramberry stays quiet: that doesn't sound like someone who's cooked. Try \"im cooked\", \"gonna fail\" or \"send help\".";
      }
    }
    form.addEventListener("submit", (e) => { e.preventDefault(); send(input.value); input.value = ""; });
    $("#dc-try").addEventListener("click", () => send("midterm thursday and im so cooked on caches"));
  }

  /* ---------- 7. study tools: the commands people actually type ---------- */
  function tools() {
    const CMDS = [
      ["/plan", "pick a study time"], ["/focus", "group Pomodoro"], ["/radar", "what's due this week"],
      ["/notes", "upload your slides"], ["/profile", "your level and streak"], ["/leaderboard", "who's on top"],
      ["/link", "connect your Cubbie"], ["/quiet", "stop reading the chat"],
    ];
    const ul = $("#cmds");
    if (!ul) return;
    ul.innerHTML = CMDS.map(([c, d]) => `<li class="cmd-item"><code>${esc(c)}</code><span>${esc(d)}</span><button class="copy" type="button" data-copy="${esc(c)}" aria-label="Copy ${esc(c)}"></button></li>`).join("");
    CB.fillCopyIcons(ul);
  }
})();
