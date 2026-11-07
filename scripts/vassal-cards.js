(function () {
  "use strict";
  const items = [
    { id: 10001, name: "Beggar", attack: 3, defence: 3, income: 100, initialPrice: 10500, priceIncrement: 1050, defaultOwned: 43150 },
    { id: 10002, name: "Peasant", attack: 6, defence: 4, income: 1000, initialPrice: 120000, priceIncrement: 12000, defaultOwned: 17614 },
    { id: 10003, name: "Fool", attack: 9, defence: 11, income: 5000, initialPrice: 675000, priceIncrement: 67500, defaultOwned: 1300 },
    { id: 10004, name: "Torturer", attack: 16, defence: 14, income: 25000, initialPrice: 3750000, priceIncrement: 375000, defaultOwned: 1500 },
    { id: 10005, name: "Friar", attack: 25, defence: 25, income: 100000, initialPrice: 24000000, priceIncrement: 2400000, defaultOwned: 500 },
    { id: 10006, name: "Alchemist", attack: 45, defence: 42, income: 250000, initialPrice: 67500000, priceIncrement: 6750000, defaultOwned: 587 },
    { id: 10007, name: "Squire", attack: 60, defence: 66, income: 375000, initialPrice: 112500000, priceIncrement: 11250000, defaultOwned: 250 },
    { id: 10008, name: "Merchant", attack: 120, defence: 110, income: 450000, initialPrice: 202500000, priceIncrement: 20250000, defaultOwned: 298 },
    { id: 10009, name: "Knight", attack: 175, defence: 180, income: 600000, initialPrice: 306000000, priceIncrement: 30600000, defaultOwned: 202 },
    { id: 10010, name: "Bishop", attack: 220, defence: 235, income: 900000, initialPrice: 540000000, priceIncrement: 54000000, defaultOwned: 125 },
    { id: 10011, name: "Lord", attack: 320, defence: 310, income: 1500000, initialPrice: 990000000, priceIncrement: 99000000, defaultOwned: 200 },
    { id: 10012, name: "Blacksmith", attack: 600, defence: 600, income: 1800000, initialPrice: 1296000000, priceIncrement: 129600000, defaultOwned: 200 },
    { id: 10013, name: "Shipbuilder", attack: 750, defence: 750, income: 2300000, initialPrice: 1828500000, priceIncrement: 182850000, defaultOwned: 200 },
    { id: 10014, name: "Warden of the Sea", attack: 2600, defence: 2600, income: 35000, initialPrice: 1000000, priceIncrement: 1000000, defaultOwned: 0 }
  ];
  const number = value => Number(value).toLocaleString("en-US");
  const stat = (type, label, value) => `<li class="${type}"><em>${label}:</em> <strong>${value}</strong></li>`;
  function card(vassal, options = {}) {
    return `<li class="listViewItem" ${options.attributes || ""}>
      <div class="panelHeader"></div>
      <div class="panelTitle"><h4>${vassal.name}</h4></div>
      <div class="panelSpacer"></div>
      <div class="panelDetails">
        <dl class="listViewItemDetails clearfix">
          <dt><div class="itemIcon enhancement_item${vassal.id}" role="img" aria-label="${vassal.name}"></div></dt>
          <dd><ul class="collapse">
            ${stat("slaveItemValue slaveItemValue_income", "Income", number(vassal.income))}
            ${stat("enhanceItemValue enhanceItemValue_attack", "Attack", number(vassal.attack))}
            ${stat("enhanceItemValue enhanceItemValue_defence", "Defence", number(vassal.defence))}
            ${stat("unlockLevelValue", "Unlock lvl", "???")}
          </ul></dd>
          ${options.controls ? `<dd class="vassal-card-controls">${options.controls}</dd>` : ""}
        </dl>
      </div>
      <div class="panelFooter"></div>
    </li>`;
  }
  window.KnightVassals = Object.freeze({items, card});
})();
