/* Cramberry · play page */
(function () {
  "use strict";
  window.CB.ready.then(() => {
    const root = document.getElementById("play-root");
    const fruit = new URLSearchParams(location.search).get("boss");
    window.CB.Battle.mount(root, { fruit: window.CB.FRUITS.includes(fruit) ? fruit : "grape", autofocus: false });
  });
})();
