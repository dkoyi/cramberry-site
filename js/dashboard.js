/* Cramberry · demo squad dashboard (sample data, clearly labelled on the page). */
(function () {
  "use strict";
  const CB = window.CB;
  const LV = [[0, "🐣 Freshman"], [100, "📗 Sophomore"], [300, "📘 Junior"], [600, "📙 Senior"], [1000, "🎓 Grad Student"], [1500, "🧑‍🏫 TA"], [2200, "🧪 Researcher"], [3000, "👑 Professor"]];
  const level = (xp) => { let i = 0; LV.forEach(([n], k) => { if (xp >= n) i = k; }); return { i, title: LV[i][1], start: LV[i][0], next: LV[i + 1] ? LV[i + 1][0] : 0 }; };

  const PLAYERS = [
    { name: "Malaika", xp: 1240, acc: 86, tint: "grape", badges: "🗡️🎯🔥📅" },
    { name: "Sunny", xp: 760, acc: 74, tint: "tangerine", badges: "🗡️💰📅" },
    { name: "Dhanush", xp: 420, acc: 78, tint: "", badges: "🗡️🧠📅" },
  ];
  const BATTLES = [
    { topic: "Floating point", fruit: "tangerine", out: "Victory", weak: "rounding", when: "Today" },
    { topic: "Caches", fruit: "grape", out: "Squad wiped", weak: "associativity", when: "Yesterday" },
    { topic: "Caches", fruit: "lie", out: "Two Truths · 3/3 lies", weak: "write-back policy", when: "Yesterday" },
    { topic: "Sorting", fruit: "kiwi", out: "Victory", weak: "quicksort pivots", when: "Tue" },
    { topic: "Recursion", fruit: "lime", out: "Victory", weak: "base cases", when: "Mon" },
    { topic: "TCP", fruit: "lemon", out: "Boss got away", weak: "the 3-way handshake", when: "Sun" },
  ];
  const RADAR = [
    { course: "CSE 230", what: "Lab 4: cache simulator", days: 1, done: ["Malaika"] },
    { course: "CSE 230", what: "Midterm 2", days: 3, done: [] , note: "3 of you" },
    { course: "MAT 343", what: "Quiz 6", days: 4, done: [] },
    { course: "CSE 230", what: "PSET 5", days: 5, done: ["Malaika", "Sunny"] },
    { course: "CSE 240", what: "Project 2 milestone", days: 6, done: [] },
  ];
  const WEAK = [["associativity", 7], ["write-back policy", 5], ["rounding", 4], ["base cases", 3], ["3-way handshake", 2]];
  const SQUAD_BADGES = [["🗡️", "Boss Slayer", 3], ["📅", "Habit Builder", 3], ["🎯", "Perfect Round", 1], ["🔥", "On Fire", 1], ["💰", "High Roller", 1], ["🧠", "Big Brain", 1], ["🕵️", "Lie Detector", 0], ["🍅", "Deep Work", 0]];

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  CB.ready.then(() => {
    const board = document.getElementById("board");
    board.innerHTML = PLAYERS.map((p, k) => {
      const L = level(p.xp);
      const pct = L.next ? Math.round(((p.xp - L.start) / (L.next - L.start)) * 100) : 100;
      return `<li>
        <span class="rank r${k + 1}">${k + 1}</span>
        <canvas data-sprite="berry" data-scale="2" ${p.tint ? `data-tint="${p.tint}"` : ""} aria-hidden="true"></canvas>
        <div class="who"><b>${p.name}</b><span>${L.title} · ${p.acc}% accuracy · ${p.badges}</span>
          <div class="lvbar" role="img" aria-label="${p.xp - L.start} of ${L.next - L.start} XP to the next level"><i style="width:${pct}%"></i></div></div>
        <span class="xp">${p.xp}<small>XP</small></span></li>`;
    }).join("");

    document.getElementById("battles").innerHTML = BATTLES.map((b) => {
      const win = /Victory|lies/.test(b.out);
      return `<li><canvas data-sprite="${win && b.fruit !== "lie" ? "boss-defeated" : "boss-" + b.fruit}" data-box="22" data-scale="2" aria-hidden="true"></canvas>
        <div><b>${esc(CB.bossName(b.topic))}</b><span class="muted">${b.when} · weak spot: ${esc(b.weak)}</span></div>
        <span class="out ${win ? "win" : "lose"}">${esc(b.out)}</span></li>`;
    }).join("");

    document.getElementById("radar").innerHTML = RADAR.map((r) => `<li class="${r.days <= 1 ? "soon" : r.days <= 3 ? "near" : ""}">
      <span class="days"><b>${r.days}</b>${r.days === 1 ? "day" : "days"}</span>
      <div><b>${esc(r.course)} · ${esc(r.what)}</b><span class="muted">${r.note ? esc(r.note) + " · " : ""}${r.done.length ? "submitted: " + r.done.join(", ") : "nobody has submitted yet"}</span></div></li>`).join("");

    const max = Math.max(...WEAK.map((w) => w[1]));
    document.getElementById("weak").innerHTML = WEAK.map(([t, n]) => `<li><span>${esc(t)}</span><div class="wbar"><i style="width:${(n / max) * 100}%"></i></div><b>${n}</b></li>`).join("");

    document.getElementById("dshelf").innerHTML = SQUAD_BADGES.map(([e, n, c]) => `<li class="${c ? "" : "locked"}"><span class="e" aria-hidden="true">${e}</span><b>${n}</b><span>${c ? `${c} of 3` : "not yet"}</span></li>`).join("");
    CB.sprites.mount(document.querySelector(".dash"));
  });
})();
