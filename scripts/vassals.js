(function () {
  "use strict";

  const list = document.querySelector("[data-vassal-list]");
  if (!list) return;

  const vassals = [
    { id: 10001, name: "Beggar", income: "100", attack: "3", defence: "3" },
    { id: 10002, name: "Peasant", income: "1,000", attack: "6", defence: "4" },
    { id: 10003, name: "Fool", income: "5,000", attack: "9", defence: "11" },
    { id: 10004, name: "Torturer", income: "25,000", attack: "16", defence: "14" },
    { id: 10005, name: "Friar", income: "100,000", attack: "25", defence: "25" },
    { id: 10006, name: "Alchemist", income: "250,000", attack: "45", defence: "42" },
    { id: 10007, name: "Squire", income: "375,000", attack: "60", defence: "66" },
    { id: 10008, name: "Merchant", income: "450,000", attack: "120", defence: "110" },
    { id: 10009, name: "Knight", income: "600,000", attack: "175", defence: "180" },
    { id: 10010, name: "Bishop", income: "900,000", attack: "220", defence: "235" },
    { id: 10011, name: "Lord", income: "1,500,000", attack: "320", defence: "310" },
    { id: 10012, name: "Blacksmith", income: "1,800,000", attack: "600", defence: "600" },
    { id: 10013, name: "Shipbuilder", income: "2,300,000", attack: "750", defence: "750" },
    { id: 10014, name: "Warden of the Sea", income: "35,000", attack: "2,600", defence: "2,600" }
  ];

  const stat = (type, label, value) =>
    `<li class="${type}"><em>${label}:</em> <strong>${value}</strong></li>`;

  list.innerHTML = vassals
    .slice()
    .sort((a, b) => Number(a.attack.replace(/,/g, "")) - Number(b.attack.replace(/,/g, "")))
    .map((vassal) => `
      <li class="listViewItem">
        <div class="panelHeader"></div>
        <div class="panelTitle"><h4>${vassal.name}</h4></div>
        <div class="panelSpacer"></div>
        <div class="panelDetails">
          <dl class="listViewItemDetails clearfix">
            <dt><div class="itemIcon enhancement_item${vassal.id}" role="img" aria-label="${vassal.name}"></div></dt>
            <dd>
              <ul class="collapse">
                ${stat("slaveItemValue slaveItemValue_income", "Income", vassal.income)}
                ${stat("enhanceItemValue enhanceItemValue_attack", "Attack", vassal.attack)}
                ${stat("enhanceItemValue enhanceItemValue_defence", "Defence", vassal.defence)}
                ${stat("unlockLevelValue", "Unlock lvl", vassal.unlockLevel ?? "???")}
              </ul>
            </dd>
          </dl>
        </div>
        <div class="panelFooter"></div>
      </li>`)
    .join("");
})();
