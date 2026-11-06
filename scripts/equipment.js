(function () {
  "use strict";

  const page = document.body.dataset.page;
  const root = document.body.dataset.root || "../../";
  const catalog = document.querySelector("[data-equipment-catalog]");
  const categories = {
    weapons: { itemStart: 1, itemEnd: 30, premiumStart: 501, premiumEnd: 505 },
    shields: { itemStart: 1001, itemEnd: 1030, premiumStart: 1501, premiumEnd: 1505 },
    armour: { itemStart: 2001, itemEnd: 2030, premiumStart: 2501, premiumEnd: 2505 },
    premium: { itemIds: [3001, 3002, 3003, 3005] }
  };
  const category = categories[page];
  const categoryData = window.KNIGHT_EQUIPMENT_DATA?.[page] || {};
  if (!catalog || !category) return;

  const categoryName = page === "premium" ? "Premiums" : page[0].toUpperCase() + page.slice(1);
  const imageRoot = `${root}assets/images/game/source/mobilemiddleages/img/enhancement/`;
  const stats = [["attack", "Attack"], ["defence", "Defence"]];

  function createStatRow(stat, label, itemData) {
    const row = document.createElement("li");
    row.className = stat === "unlockLevel"
      ? "unlockLevelValue"
      : `enhanceItemValue enhanceItemValue_${stat}`;

    const name = document.createElement("em");
    name.textContent = `${label}:`;

    const value = document.createElement("strong");
    value.textContent = itemData && itemData[stat] !== undefined ? String(itemData[stat]) : "—";

    row.append(name, value);
    return row;
  }

  function createAbilityRow(itemData) {
    const row = document.createElement("div");
    row.className = "premium-ability";

    const icon = document.createElement("span");
    icon.className = `premium-ability-icon premium-ability-icon--${itemData.abilityIcon}`;
    icon.setAttribute("aria-hidden", "true");

    const description = document.createElement("p");
    description.className = "premium-ability-copy";
    description.textContent = itemData.ability;

    row.append(icon, description);
    return row;
  }

  function createItem(id, premium) {
    const itemData = categoryData[id];
    const item = document.createElement("li");
    item.className = `listViewItem equipment-item${premium ? " premium" : ""}`;
    item.dataset.itemId = id;

    const header = document.createElement("div");
    header.className = "panelHeader";

    const panelTitle = document.createElement("div");
    panelTitle.className = "panelTitle";
    const title = document.createElement("h4");
    title.textContent = itemData?.name || `Missing item ${id}`;
    panelTitle.append(title);

    const spacer = document.createElement("div");
    spacer.className = "panelSpacer";

    const details = document.createElement("div");
    details.className = "panelDetails";

    const itemDetails = document.createElement("dl");
    itemDetails.className = "listViewItemDetails clearfix";

    const imageFrame = document.createElement("dt");
    const image = document.createElement("div");
    image.className = "itemIcon";
    image.setAttribute("role", "img");
    image.setAttribute("aria-label", itemData?.name ? `${itemData.name}, ${categoryName}` : `${categoryName} item ${id}`);
    image.style.backgroundImage = `url("${imageRoot}${id}_2x.jpg")`;
    imageFrame.append(image);

    const statsColumn = document.createElement("dd");
    const statsList = document.createElement("ul");
    statsList.className = "collapse";
    if (itemData?.ability && itemData?.abilityIcon) {
      statsColumn.append(createAbilityRow(itemData));
    } else {
      for (const [stat, label] of stats) statsList.append(createStatRow(stat, label, itemData));
      statsList.append(createStatRow("unlockLevel", "Unlock lvl", {
        unlockLevel: itemData?.unlockLevel ?? "???"
      }));
      statsColumn.append(statsList);
    }

    itemDetails.append(imageFrame, statsColumn);
    details.append(itemDetails);

    const footer = document.createElement("div");
    footer.className = "panelFooter";

    item.append(header, panelTitle, spacer, details, footer);
    return item;
  }

  function createList(start, end, premium, label) {
    const list = document.createElement("ul");
    list.className = "listView panelView equipment-list";
    list.setAttribute("aria-label", label || `${premium ? "Premium " : ""}${categoryName}`);

    for (let id = start; id <= end; id += 1) list.append(createItem(id, premium));
    return list;
  }

  function createListFromIds(ids, premium) {
    const list = document.createElement("ul");
    list.className = "listView panelView equipment-list";
    list.setAttribute("aria-label", categoryName);

    for (const id of ids) list.append(createItem(id, premium));
    return list;
  }

  if (category.itemIds) {
    catalog.append(createListFromIds(category.itemIds, true));
    return;
  }

  catalog.append(createList(category.itemStart, category.itemEnd, false));

  const premiumHeading = document.createElement("div");
  premiumHeading.className = "equipment-premium-heading page-description";
  premiumHeading.id = "premiums";
  const premiumTitle = document.createElement("h2");
  premiumTitle.textContent = `Premium ${categoryName}`;
  premiumHeading.append(premiumTitle);
  catalog.append(premiumHeading, createList(category.premiumStart, category.premiumEnd, false, `Premium ${categoryName}`));
})();
