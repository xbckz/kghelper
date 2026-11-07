(function () {
  "use strict";
  const list = document.querySelector("[data-vassal-list]");
  if (list) list.innerHTML = window.KnightVassals.items.map(vassal => window.KnightVassals.card(vassal)).join("");
})();
