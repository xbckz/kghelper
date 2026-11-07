(function () {
  "use strict";

  const STORAGE_PREFIX = "kghelper:vassal:";
  const MAX_PLAN_PURCHASES = 100000;
  const vassals = [
    { id: 10001, name: "Beggar", income: 100, initialPrice: 10500, priceIncrement: 1050, defaultOwned: 43150 },
    { id: 10002, name: "Peasant", income: 1000, initialPrice: 120000, priceIncrement: 12000, defaultOwned: 17614 },
    { id: 10003, name: "Fool", income: 5000, initialPrice: 675000, priceIncrement: 67500, defaultOwned: 1300 },
    { id: 10004, name: "Torturer", income: 25000, initialPrice: 3750000, priceIncrement: 375000, defaultOwned: 1500 },
    { id: 10005, name: "Friar", income: 100000, initialPrice: 24000000, priceIncrement: 2400000, defaultOwned: 500 },
    { id: 10006, name: "Alchemist", income: 250000, initialPrice: 67500000, priceIncrement: 6750000, defaultOwned: 587 },
    { id: 10007, name: "Squire", income: 375000, initialPrice: 112500000, priceIncrement: 11250000, defaultOwned: 250 },
    { id: 10008, name: "Merchant", income: 450000, initialPrice: 202500000, priceIncrement: 20250000, defaultOwned: 298 },
    { id: 10009, name: "Knight", income: 600000, initialPrice: 306000000, priceIncrement: 30600000, defaultOwned: 202 },
    { id: 10010, name: "Bishop", income: 900000, initialPrice: 540000000, priceIncrement: 54000000, defaultOwned: 125 },
    { id: 10011, name: "Lord", income: 1500000, initialPrice: 990000000, priceIncrement: 99000000, defaultOwned: 200 },
    { id: 10012, name: "Blacksmith", income: 1800000, initialPrice: 1296000000, priceIncrement: 129600000, defaultOwned: 200 },
    { id: 10013, name: "Shipbuilder", income: 2300000, initialPrice: 1828500000, priceIncrement: 182850000, defaultOwned: 200 },
    { id: 10014, name: "Warden of the Sea", income: 35000, initialPrice: 1000000, priceIncrement: 1000000, defaultOwned: 0 }
  ];

  const page = document.body.dataset.page;
  const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

  function storageRead(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }

  function storageWrite(key, value) {
    try {
      window.localStorage.setItem(key, String(value));
    } catch (_) {
      // Calculators remain usable if browser storage is unavailable.
    }
  }

  function ownedKey(vassal) {
    return `${STORAGE_PREFIX}owned:${vassal.id}`;
  }

  function availableKey(vassal) {
    return `${STORAGE_PREFIX}available:${vassal.id}`;
  }

  function parseInteger(value) {
    const normalized = String(value ?? "").replace(/[\s,]/g, "");
    if (!/^\d+$/.test(normalized)) return null;
    const parsed = Number(normalized);
    return Number.isSafeInteger(parsed) ? parsed : null;
  }

  function parseDecimal(value) {
    const normalized = String(value ?? "").replace(/[\s,]/g, "");
    if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function getOwned(vassal) {
    const saved = storageRead(ownedKey(vassal));
    if (saved === null) {
      storageWrite(ownedKey(vassal), vassal.defaultOwned);
      return vassal.defaultOwned;
    }
    return parseInteger(saved) ?? vassal.defaultOwned;
  }

  function getAvailable(vassal) {
    const saved = storageRead(availableKey(vassal));
    if (saved === null) {
      const initial = getOwned(vassal) > 0;
      storageWrite(availableKey(vassal), initial);
      return initial;
    }
    return saved === "true";
  }

  function format(value) {
    return numberFormat.format(Number(value) || 0);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function bindGroupedDisplay(input, parser, formatter) {
    input.addEventListener("focus", () => {
      input.value = input.value.replace(/,/g, "");
    });
    input.addEventListener("blur", () => {
      const value = parser(input.value);
      if (value !== null) input.value = formatter(value);
    });
  }

  function initializeDefaults() {
    vassals.forEach((vassal) => {
      getOwned(vassal);
      getAvailable(vassal);
    });
  }

  function currentIncome() {
    return vassals.reduce((total, vassal) => total + getOwned(vassal) * vassal.income, 0);
  }

  function nextPrice(vassal, owned) {
    return vassal.initialPrice + vassal.priceIncrement * owned;
  }

  function updateRowPrice(row, vassal, owned) {
    const price = format(nextPrice(vassal, owned));
    row.querySelectorAll("[data-next-price]").forEach((element) => {
      element.textContent = price;
    });
  }

  function renderVassals() {
    const body = document.querySelector("[data-vassal-rows]");
    if (!body) return;

    body.innerHTML = vassals.map((vassal) => {
      const owned = getOwned(vassal);
      const available = getAvailable(vassal);
      const image = `assets/images/game/source/mobilemiddleages/img/enhancement/${vassal.id}_2x.jpg`;
      return `
        <tr data-vassal-row="${vassal.id}"${available ? "" : " class=\"vassal-unavailable\""}>
          <td class="vassal-name-cell">
            <div class="vassal-name"><img src="${image}" alt="" width="36" height="36" loading="lazy"><span>${vassal.name}</span></div>
            <div class="mobile-vassal-meta"><span>Income <strong>${format(vassal.income)}</strong></span><span>Next price <strong data-next-price>${format(nextPrice(vassal, owned))}</strong></span></div>
          </td>
          <td class="income-column numeric-cell">${format(vassal.income)}</td>
          <td class="price-column numeric-cell"><span data-next-price>${format(nextPrice(vassal, owned))}</span> silver</td>
          <td class="owned-column"><input type="text" inputmode="numeric" autocomplete="off" class="owned-input" data-owned-id="${vassal.id}" aria-label="Current number of ${vassal.name} owned" value="${format(owned)}"></td>
          <td class="available-column"><label class="available-control"><input type="checkbox" data-available-id="${vassal.id}" aria-label="Include ${vassal.name} in recommendations"${available ? " checked" : ""}><span class="visually-hidden">Include ${vassal.name} in recommendations</span></label></td>
        </tr>`;
    }).join("");

    body.querySelectorAll("[data-owned-id]").forEach((input) => {
      const vassal = vassals.find((item) => item.id === Number(input.dataset.ownedId));
      const row = input.closest("tr");
      if (!vassal || !row) return;
      input.addEventListener("focus", () => {
        input.value = input.value.replace(/,/g, "");
      });
      input.addEventListener("input", () => {
        const owned = parseInteger(input.value);
        if (owned === null) return;
        storageWrite(ownedKey(vassal), owned);
        updateRowPrice(row, vassal, owned);
      });
      input.addEventListener("blur", () => {
        const owned = parseInteger(input.value);
        if (owned === null) {
          const saved = input.value.trim() === "" ? 0 : getOwned(vassal);
          input.value = format(saved);
          storageWrite(ownedKey(vassal), saved);
          updateRowPrice(row, vassal, saved);
          return;
        }
        input.value = format(owned);
      });
    });

    body.querySelectorAll("[data-available-id]").forEach((input) => {
      const vassal = vassals.find((item) => item.id === Number(input.dataset.availableId));
      if (!vassal) return;
      input.addEventListener("change", () => {
        storageWrite(availableKey(vassal), input.checked);
        const row = input.closest("tr");
        if (row) row.classList.toggle("vassal-unavailable", !input.checked);
      });
    });
  }

  function planCards(items) {
    if (items.length === 0) return "";
    return `
      <div class="income-plan-grid">
        ${items.map((item, index) => {
          const image = `assets/images/game/source/mobilemiddleages/img/enhancement/${item.id}_2x.jpg`;
          return `<button type="button" class="income-plan-card" data-plan-index="${index}" aria-label="Show purchase details for ${escapeHtml(item.name)}" aria-expanded="false"><img src="${image}" alt="" width="64" height="64" loading="lazy"><span class="income-plan-name">${escapeHtml(item.name)}</span><span class="income-plan-quantity">× ${format(item.bought)}</span></button>`;
        }).join("")}
      </div>
      <div class="income-plan-detail" hidden aria-live="polite"></div>`;
  }

  function bindPlanCards(container, items) {
    const detail = container.querySelector(".income-plan-detail");
    if (!detail) return;

    container.querySelectorAll("[data-plan-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const wasOpen = button.getAttribute("aria-expanded") === "true";
        container.querySelectorAll("[data-plan-index]").forEach((other) => {
          other.setAttribute("aria-expanded", "false");
        });
        if (wasOpen) {
          detail.hidden = true;
          return;
        }

        const item = items[Number(button.dataset.planIndex)];
        if (!item) return;
        detail.innerHTML = `
          <h3>${escapeHtml(item.name)}</h3>
          <dl>
            <div><dt>Income each</dt><dd>${format(item.income)} silver</dd></div>
            <div><dt>Next price after plan</dt><dd>${format(item.nextPrice)} silver</dd></div>
            <div><dt>Quantity bought</dt><dd>${format(item.bought)}</dd></div>
            <div><dt>Income added</dt><dd>${format(item.bought * item.income)} silver</dd></div>
            <div><dt>Total spent</dt><dd>${format(item.totalSpent)} silver</dd></div>
          </dl>`;
        detail.hidden = false;
        button.setAttribute("aria-expanded", "true");
      });
    });
  }

  function setResultMessage(target, message, kind) {
    target.innerHTML = `<p class="calculator-message${kind ? ` is-${kind}` : ""}">${escapeHtml(message)}</p>`;
  }

  function calculateBestValue(budget) {
    const working = vassals.map((vassal) => ({
      ...vassal,
      owned: getOwned(vassal),
      available: getAvailable(vassal),
      bought: 0,
      totalSpent: 0
    }));
    const initialIncome = working.reduce((total, vassal) => total + vassal.income * vassal.owned, 0);
    let remaining = budget;
    let purchaseCount = 0;

    while (purchaseCount < MAX_PLAN_PURCHASES) {
      let best = null;
      for (const vassal of working) {
        if (!vassal.available) continue;
        const price = nextPrice(vassal, vassal.owned);
        if (!Number.isFinite(price) || price > remaining) continue;
        const value = vassal.income / price;
        if (!best || value > best.value) best = { vassal, price, value };
      }
      if (!best) break;
      remaining -= best.price;
      best.vassal.owned += 1;
      best.vassal.bought += 1;
      best.vassal.totalSpent += best.price;
      purchaseCount += 1;
    }

    const bought = working.filter((vassal) => vassal.bought > 0).map((vassal) => ({
      ...vassal,
      nextPrice: nextPrice(vassal, vassal.owned)
    }));
    const incomeAdded = bought.reduce((total, vassal) => total + vassal.bought * vassal.income, 0);
    const finalIncome = initialIncome + incomeAdded;
    const result = document.getElementById("best-plan-content");
    if (!result) return;

    if (bought.length === 0) {
      const message = working.some((vassal) => vassal.available)
        ? "No vassals can be bought with this budget."
        : "Mark at least one vassal as recruitable to build a plan.";
      setResultMessage(result, message);
    } else {
      result.innerHTML = `
        <div class="income-plan">
          <div class="income-plan-cards"><h3>Recommended purchases</h3>${planCards(bought)}</div>
          <div class="income-summary">
            <p><strong>Income added:</strong> ${format(incomeAdded)} silver</p>
            <p><strong>Total income after plan:</strong> ${format(finalIncome)} silver <span>(${initialIncome > 0 ? `+${numberFormat.format((incomeAdded / initialIncome) * 100)}%` : "new income"})</span></p>
            <p><strong>Budget left:</strong> ${format(remaining)} silver</p>
          </div>
          ${purchaseCount === MAX_PLAN_PURCHASES ? '<p class="calculator-message is-note">The plan reached 100,000 purchases. Use a smaller budget to see the rest of the plan.</p>' : ""}
        </div>`;
      bindPlanCards(result, bought);
    }

    working.forEach((vassal) => storageWrite(ownedKey(vassal), vassal.owned));
    document.querySelectorAll("[data-owned-id]").forEach((input) => {
      const vassal = working.find((item) => item.id === Number(input.dataset.ownedId));
      if (!vassal) return;
      input.value = format(vassal.owned);
      const row = input.closest("tr");
      if (row) updateRowPrice(row, vassal, vassal.owned);
    });
  }

  function initializeBestValue() {
    renderVassals();
    const form = document.querySelector("[data-best-value-form]");
    const budgetInput = document.getElementById("budget");
    const result = document.getElementById("best-plan-content");
    if (!form || !budgetInput || !result) return;
    bindGroupedDisplay(budgetInput, parseInteger, format);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const budget = parseInteger(budgetInput.value);
      if (budget === null) {
        setResultMessage(result, "Enter a whole number budget of zero or more silver.", "error");
        budgetInput.focus();
        return;
      }
      calculateBestValue(budget);
    });
  }

  function simulatePrediction(targetIncome, bonusPercent) {
    const bonusMultiplier = 1 + bonusPercent / 100;
    const before = currentIncome();
    const currentWithBonus = before * bonusMultiplier;
    if (targetIncome <= currentWithBonus) {
      return { achieved: true, before, currentWithBonus, targetIncome, bonusPercent, bonusMultiplier };
    }

    const working = vassals.filter(getAvailable).map((vassal) => ({
      ...vassal,
      owned: getOwned(vassal),
      bought: 0,
      totalSpent: 0
    }));
    if (working.length === 0) return { unavailable: true, before, currentWithBonus, targetIncome, bonusPercent };

    let needed = targetIncome - currentWithBonus;
    let totalCost = 0;
    let purchaseCount = 0;
    while (needed > 0 && purchaseCount < MAX_PLAN_PURCHASES) {
      let best = null;
      for (const vassal of working) {
        const price = nextPrice(vassal, vassal.owned);
        if (!Number.isFinite(price)) continue;
        const value = (vassal.income * bonusMultiplier) / price;
        if (!best || value > best.value) best = { vassal, price, value };
      }
      if (!best) break;
      totalCost += best.price;
      best.vassal.owned += 1;
      best.vassal.bought += 1;
      best.vassal.totalSpent += best.price;
      needed -= best.vassal.income * bonusMultiplier;
      purchaseCount += 1;
    }

    const bought = working.filter((vassal) => vassal.bought > 0).map((vassal) => ({
      ...vassal,
      nextPrice: nextPrice(vassal, vassal.owned)
    }));
    const incomeAdded = bought.reduce((total, vassal) => total + vassal.bought * vassal.income, 0);
    return {
      before,
      currentWithBonus,
      targetIncome,
      bonusPercent,
      bonusMultiplier,
      bought,
      totalCost,
      incomeAdded,
      finalIncome: before + incomeAdded,
      totalWithBonus: (before + incomeAdded) * bonusMultiplier,
      capped: purchaseCount === MAX_PLAN_PURCHASES
    };
  }

  function updateCurrentIncome(bonusPercent) {
    const line = document.querySelector("[data-current-income]");
    if (!line) return;
    const income = currentIncome();
    const multiplier = 1 + (Number(bonusPercent) || 0) / 100;
    line.textContent = `Current vassal income: ${format(income)} silver without bonus (${format(income * multiplier)} with ${numberFormat.format(Number(bonusPercent) || 0)}% bonus).`;
  }

  function renderPrediction(result) {
    const content = document.getElementById("best-plan-content");
    if (!content) return;
    if (result.unavailable) {
      setResultMessage(content, "Mark at least one vassal as recruitable in Best Value Vassals Calc before estimating a price.", "error");
      return;
    }
    if (result.achieved) {
      content.innerHTML = `<p class="calculator-message">Your current income of ${format(result.currentWithBonus)} silver already meets the ${format(result.targetIncome)} silver target.</p>`;
      return;
    }

    const boughtWithBonus = result.incomeAdded * result.bonusMultiplier;
    const percent = result.before > 0 ? numberFormat.format((result.incomeAdded / result.before) * 100) : "new income";
    const priceLabel = result.capped ? "Price after 100,000 purchases" : "Total price to reach target";
    content.innerHTML = `
      <div class="income-plan">
        <div class="income-plan-cards"><h3>Recommended purchases</h3>${planCards(result.bought)}</div>
        <div class="income-summary">
          <p><strong>Income added with ${numberFormat.format(result.bonusPercent)}% bonus:</strong> ${format(boughtWithBonus)} silver</p>
          <p><strong>Final income with bonus:</strong> ${format(result.totalWithBonus)} silver <span>(${percent === "new income" ? percent : `+${percent}%`})</span></p>
          <p><strong>${priceLabel}:</strong> ${format(result.totalCost)} silver</p>
        </div>
        ${result.capped ? '<p class="calculator-message is-note">The estimate reached 100,000 purchases before reaching the target. Set a closer target to see the rest of the plan.</p>' : ""}
      </div>`;
    bindPlanCards(content, result.bought);
  }

  function initializePrediction() {
    const form = document.querySelector("[data-price-prediction-form]");
    const targetInput = document.getElementById("target-income");
    const bonusInput = document.getElementById("bonus");
    if (!form || !targetInput || !bonusInput) return;
    bindGroupedDisplay(targetInput, parseInteger, format);
    bindGroupedDisplay(bonusInput, parseDecimal, format);
    updateCurrentIncome(parseDecimal(bonusInput.value) || 0);
    bonusInput.addEventListener("input", () => updateCurrentIncome(parseDecimal(bonusInput.value) || 0));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const target = parseInteger(targetInput.value);
      const bonus = parseDecimal(bonusInput.value);
      const content = document.getElementById("best-plan-content");
      if (target === null) {
        setResultMessage(content, "Enter a whole number income goal of zero or more.", "error");
        targetInput.focus();
        return;
      }
      if (bonus === null || bonus > 100000) {
        setResultMessage(content, "Enter a bonus percentage from zero to 100,000.", "error");
        bonusInput.focus();
        return;
      }
      updateCurrentIncome(bonus);
      renderPrediction(simulatePrediction(target, bonus));
    });
  }

  initializeDefaults();
  if (page === "bestValueIncome") initializeBestValue();
  if (page === "priceIncome") initializePrediction();
})();
