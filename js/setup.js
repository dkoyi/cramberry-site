/* Cramberry · setup checklist: OS tabs, ticks remembered in localStorage. */
(function () {
  "use strict";
  const CB = window.CB;
  CB.ready.then(() => {
    const sec = document.querySelector(".setup");
    const steps = [...document.querySelectorAll(".st")];
    const KEY = "cb-setup-done", OS = "cb-setup-os";
    let done = [];
    try { done = JSON.parse(CB.store.get(KEY) || "[]"); } catch (e) { done = []; }
    const total = steps.length;
    function paint() {
      steps.forEach((s) => {
        const on = done.includes(s.dataset.step);
        s.classList.toggle("done", on);
        s.querySelector("input").checked = on;
      });
      document.getElementById("pfill").style.width = (done.length / total) * 100 + "%";
      document.getElementById("ptext").textContent = done.length === total ? "All done. Go fight a boss! ⚔️" : `${done.length} of ${total} done`;
    }
    steps.forEach((s) => s.querySelector("input").addEventListener("change", (e) => {
      const id = s.dataset.step;
      done = e.target.checked ? [...new Set([...done, id])] : done.filter((x) => x !== id);
      CB.store.set(KEY, JSON.stringify(done));
      paint();
      if (e.target.checked && done.length === total) CB.toast("All 7 steps done!");
    }));
    paint();

    const tabs = [...document.querySelectorAll(".os-tabs [role=tab]")];
    const setOS = (os) => {
      sec.dataset.os = os;
      tabs.forEach((t) => t.setAttribute("aria-selected", t.dataset.os === os));
      CB.store.set(OS, os);
    };
    tabs.forEach((t) => t.addEventListener("click", () => setOS(t.dataset.os)));
    tabs.forEach((t, i) => t.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const n = tabs[(i + 1) % tabs.length]; n.focus(); setOS(n.dataset.os); }
    }));
    const saved = CB.store.get(OS);
    setOS(saved || (/Mac|Linux|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? "mac" : "win"));

    const peek = document.querySelector(".setup-peek");
    CB.onView(peek, () => peek.classList.add("up"), { threshold: 0.2 });
  });
})();
