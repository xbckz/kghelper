(function () {
  "use strict";

  const STORAGE_PREFIX = "kghelper:vassal:";
  const vassals = window.KnightVassals.items;
  const math = window.VassalMath;

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
    return /^\d+$/.test(normalized) ? BigInt(normalized) : null;
  }

  function parseDecimal(value) {
    const normalized = String(value ?? "").replace(/[\s,]/g, "");
    return /^\d+(?:\.\d*)?$/.test(normalized) ? normalized : null;
  }

  function getOwned(vassal) {
    const saved = storageRead(ownedKey(vassal));
    if (saved === null) {
      storageWrite(ownedKey(vassal), vassal.defaultOwned);
      return BigInt(vassal.defaultOwned);
    }
    return parseInteger(saved) ?? BigInt(vassal.defaultOwned);
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
    return typeof value === "bigint" ? value.toLocaleString("en-US") : numberFormat.format(Number(value) || 0);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initializeDefaults() {
    vassals.forEach((vassal) => {
      getOwned(vassal);
      getAvailable(vassal);
    });
    const lastUnlocked = vassals.reduce((last, vassal, index) => getAvailable(vassal) ? index : last, -1);
    vassals.forEach((vassal, index) => storageWrite(availableKey(vassal), index <= lastUnlocked));
  }

  function setAvailabilityThrough(index, available) {
    vassals.forEach((vassal, position) => {
      if ((available && position <= index) || (!available && position >= index)) {
        storageWrite(availableKey(vassal), available);
      }
    });
    document.querySelectorAll("[data-available-id]").forEach((input) => {
      const vassal = vassals.find((item) => item.id === Number(input.dataset.availableId));
      input.checked = getAvailable(vassal);
    });
  }

  function currentIncome() {
    return vassals.reduce((total, vassal) => total + getOwned(vassal) * BigInt(vassal.income), 0n);
  }

  function nextPrice(vassal, owned) {
    return BigInt(vassal.initialPrice) + BigInt(vassal.priceIncrement) * owned;
  }

  function updateRowPrice(row, vassal, owned) {
    const price = format(nextPrice(vassal, owned));
    row.querySelectorAll("[data-next-price]").forEach((element) => {
      element.textContent = price;
    });
  }

  function calculatorCard(vassal, controls, attributes = "") {
    return `<li class="listViewItem calculator-vassal" ${attributes}>
      <div class="panelHeader"></div>
      <div class="panelTitle"><h4>${vassal.name}</h4></div>
      <div class="panelSpacer"></div>
      <div class="panelDetails"><div class="calculator-vassal-body">
        <div class="calculator-vassal-portrait"><img src="assets/images/game/source/mobilemiddleages/img/enhancement/${vassal.id}_2x.jpg" alt="${vassal.name}" width="125" height="150" loading="lazy"></div>
        <div class="calculator-vassal-income"><span class="silver-icon" aria-hidden="true"></span><span>Income: <strong>${format(vassal.income)}</strong></span></div>
        ${controls}
      </div></div>
      <div class="panelFooter"></div>
    </li>`;
  }

  function renderVassals() {
    const body = document.querySelector("[data-vassal-rows]");
    if (!body) return;

    body.innerHTML = vassals.map((vassal) => calculatorCard(vassal,
      `<label class="calculator-vassal-owned" for="owned-${vassal.id}"><span>Owned:</span><input id="owned-${vassal.id}" type="text" inputmode="numeric" autocomplete="off" class="owned-input" data-number-format data-owned-id="${vassal.id}" aria-label="Current number of ${vassal.name} owned" value="${format(getOwned(vassal))}"></label><label class="available-control"><span>Unlocked:</span><input type="checkbox" data-available-id="${vassal.id}" aria-label="Include ${vassal.name} in recommendations"${getAvailable(vassal) ? " checked" : ""}></label>`,
      `data-vassal-row="${vassal.id}"`
    )).join("");

    body.querySelectorAll("[data-owned-id]").forEach((input) => {
      const vassal = vassals.find((item) => item.id === Number(input.dataset.ownedId));
      const row = input.closest("[data-vassal-row]");
      if (!vassal || !row) return;
      input.addEventListener("input", () => {
        const owned = parseInteger(input.value);
        if (owned === null) return;
        storageWrite(ownedKey(vassal), owned);
        updateRowPrice(row, vassal, owned);
      });
      input.addEventListener("blur", () => {
        const owned = parseInteger(input.value);
        if (owned === null) {
          const saved = input.value.trim() === "" ? 0n : getOwned(vassal);
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
        setAvailabilityThrough(vassals.indexOf(vassal), input.checked);
      });
    });
  }

  function summaryRow(label, value) {
    return `<div class="income-summary-row"><span class="silver-icon" aria-hidden="true"></span><p><strong>${label}</strong> ${value}</p></div>`;
  }

  function planCards(items) {
    if (items.length === 0) return "";
    return `<div class="best-plan-results"><div class="best-plan-grid">
      ${items.map((item, index) => `<button type="button" class="best-plan-card" data-plan-index="${index}" aria-label="Show stats for ${escapeHtml(item.name)}" aria-expanded="false"><img src="assets/images/game/source/mobilemiddleages/img/enhancement/${item.id}_2x.jpg" alt="${escapeHtml(item.name)}" class="best-plan-image"><span class="best-plan-quantity">× ${format(item.bought)}</span></button>`).join("")}
      </div><div class="best-plan-detail" hidden aria-live="polite"></div></div>`;
  }

  function bindPlanCards(container, items) {
    const detail = container.querySelector(".best-plan-detail");
    if (!detail) return;
    const showDetails = card => {
      const item = items[Number(card.dataset.planIndex)];
      if (!item) return;
      detail.innerHTML = `<h5>${escapeHtml(item.name)}</h5><ul>
        <li>Income per vassal: ${format(item.income)}</li>
        <li>Next purchase price: ${format(item.nextPrice)}</li>
        <li>Quantity: ${format(item.bought)}x</li>
        <li>Total income added: ${format(item.bought * BigInt(item.income))}</li>
        <li>Total spent: ${format(item.totalSpent)}</li>
      </ul>`;
      detail.hidden = false;
      detail.setAttribute("aria-hidden", "false");
      container.querySelectorAll(".best-plan-card").forEach(other => {
        other.setAttribute("aria-pressed", other === card ? "true" : "false");
        other.setAttribute("aria-expanded", other === card ? "true" : "false");
      });
      const resultsRoot = detail.closest(".best-plan-results");
      const rootRect = resultsRoot.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const gap = 10;
      const detailWidth = detail.offsetWidth;
      const rootWidth = resultsRoot.clientWidth;
      const rightPosition = cardRect.right - rootRect.left + gap;
      const leftPosition = cardRect.left - rootRect.left - detailWidth - gap;
      let left = rightPosition;
      let top = cardRect.top - rootRect.top + 6;
      if (rightPosition + detailWidth > rootWidth && leftPosition >= 0) left = leftPosition;
      else if (rightPosition + detailWidth > rootWidth) {
        left = Math.max(0, Math.min(cardRect.left - rootRect.left, rootWidth - detailWidth));
        top = cardRect.bottom - rootRect.top + 8;
      }
      detail.style.left = `${Math.round(left)}px`;
      detail.style.top = `${Math.round(top)}px`;
    };
    container.querySelectorAll(".best-plan-card").forEach(card => {
      card.addEventListener("click", () => showDetails(card));
      card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          showDetails(card);
        }
      });
    });
  }

  function setResultMessage(target, message, kind) {
    target.innerHTML = `<p class="calculator-message${kind ? ` is-${kind}` : ""}">${escapeHtml(message)}</p>`;
  }

  function snapshot() {
    return vassals.map(vassal => ({ ...vassal, owned: getOwned(vassal), available: getAvailable(vassal) }));
  }

  function calculateBestValue(budget) {
    const calculation = math.bestValue(snapshot(), budget);
    const { working, before: initialIncome, incomeAdded } = calculation;
    const bought = working.filter(vassal => vassal.bought > 0n).map(vassal => ({ ...vassal, nextPrice: math.nextPrice(vassal) }));
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
          <div class="income-plan-cards">${planCards(bought)}</div>
          <div class="income-summary">
            ${summaryRow("Income added:", format(incomeAdded))}
            ${summaryRow("Total Income (Without Bonus):", `${format(finalIncome)} (+${math.percent(incomeAdded, initialIncome)}%)`)}
          </div>
        </div>`;
      bindPlanCards(result, bought);
    }

    working.forEach((vassal) => storageWrite(ownedKey(vassal), vassal.owned));
    document.querySelectorAll("[data-owned-id]").forEach((input) => {
      const vassal = working.find((item) => item.id === Number(input.dataset.ownedId));
      if (!vassal) return;
      input.value = format(vassal.owned);
      const row = input.closest("[data-vassal-row]");
      if (row) updateRowPrice(row, vassal, vassal.owned);
    });
  }

  function initializeBestValue() {
    renderVassals();
    const sheetToggle = document.getElementById("sheet-toggle");
    sheetToggle.addEventListener("click", () => {
      const expanded = sheetToggle.getAttribute("aria-expanded") === "true";
      sheetToggle.setAttribute("aria-expanded", String(!expanded));
      document.getElementById("vassal-sheet").hidden = expanded;
    });
    const form = document.querySelector("[data-best-value-form]");
    const budgetInput = document.getElementById("budget");
    const result = document.getElementById("best-plan-content");
    if (!form || !budgetInput || !result) return;
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
    const result = math.predict(snapshot(), targetIncome, bonusPercent);
    return {
      ...result, targetIncome, bonusPercent,
      bought: result.working.filter(vassal => vassal.bought > 0n).map(vassal => ({ ...vassal, nextPrice: math.nextPrice(vassal) })),
      currentWithBonus: math.decimal(result.before * result.ratio.numerator, result.ratio.denominator),
      finalIncome: result.before + result.incomeAdded
    };
  }

  function updateCurrentIncome(bonusPercent) {
    const line = document.querySelector("[data-current-income]");
    if (!line) return;
    const income = currentIncome();
    const ratio = math.bonusRatio(bonusPercent || "0");
    line.textContent = `Current vassal income: ${format(income)} silver without bonus (${math.decimal(income * ratio.numerator, ratio.denominator)} with ${bonusPercent || "0"}% bonus).`;
  }

  function renderPrediction(result) {
    const content = document.getElementById("best-plan-content");
    if (!content) return;
    if (result.unavailable) {
      setResultMessage(content, "Mark at least one vassal as recruitable in Best Value Vassals Calc before estimating a price.", "error");
      return;
    }
    if (result.achieved) {
      content.innerHTML = `<p class="calculator-message">Your current income of ${result.currentWithBonus} silver already meets the ${format(result.targetIncome)} silver target.</p>`;
      return;
    }

    const boughtWithBonus = math.decimal(result.incomeAdded * result.ratio.numerator, result.ratio.denominator);
    const finalWithBonus = math.decimal(result.finalIncome * result.ratio.numerator, result.ratio.denominator);
    content.innerHTML = `
      <div class="income-plan">
        <div class="income-plan-cards">${planCards(result.bought)}</div>
        <div class="income-summary income-summary-prediction">
          ${summaryRow(`Income added (with ${window.formatNumberInputValue(result.bonusPercent)}% bonus):`, boughtWithBonus)}
          ${summaryRow(`Final income (with ${window.formatNumberInputValue(result.bonusPercent)}% bonus):`, finalWithBonus)}
          ${summaryRow("Total Cost to Reach Target:", format(result.totalCost))}
        </div>
      </div>`;
    bindPlanCards(content, result.bought);
  }

  function initializePrediction() {
    const form = document.querySelector("[data-price-prediction-form]");
    const targetInput = document.getElementById("target-income");
    const bonusInput = document.getElementById("bonus");
    if (!form || !targetInput || !bonusInput) return;
    updateCurrentIncome(parseDecimal(bonusInput.value) || "0");
    bonusInput.addEventListener("input", () => updateCurrentIncome(parseDecimal(bonusInput.value) || "0"));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const target = parseInteger(targetInput.value);
      const bonus = bonusInput.value.trim() === "" ? "0" : parseDecimal(bonusInput.value);
      const content = document.getElementById("best-plan-content");
      if (target === null) {
        setResultMessage(content, "Enter a whole number income goal of zero or more.", "error");
        targetInput.focus();
        return;
      }
      if (bonus === null) {
        setResultMessage(content, "Enter a nonnegative bonus percentage.", "error");
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
