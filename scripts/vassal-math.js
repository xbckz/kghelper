(function (root) {
  "use strict";
  const integer = value => BigInt(value);
  function bonusRatio(value = "0") {
    const raw = String(value).replace(/[\s,]/g, "");
    if (!/^\d+(?:\.\d*)?$/.test(raw)) throw new Error("Enter a nonnegative bonus percentage.");
    const [whole, fraction = ""] = raw.split(".");
    const scale = 10n ** BigInt(fraction.length);
    return { numerator: (100n + BigInt(whole)) * scale + BigInt(fraction || "0"), denominator: 100n * scale };
  }
  const ceil = (a, b) => (a + b - 1n) / b;
  function prepare(items) {
    return items.map((item, index) => ({ ...item, index, income: integer(item.income), initialPrice: integer(item.initialPrice), priceIncrement: integer(item.priceIncrement), owned: integer(item.owned), bought: 0n, totalSpent: 0n })).map(item => {
      if (item.income <= 0n || item.initialPrice <= 0n || item.priceIncrement <= 0n || item.owned < 0n) throw new Error("Invalid vassal data.");
      return item;
    });
  }
  const nextPrice = item => item.initialPrice + item.priceIncrement * item.owned;
  function scaleFor(items) {
    const maxIncome = items.reduce((max, item) => item.income > max ? item.income : max, 1n);
    // Distinct price/income fractions differ by at least 1 / maxIncome².
    // This scale preserves their exact order; equal keys are genuine ties.
    return maxIncome * maxIncome + 1n;
  }
  function countsAt(items, key, scale) {
    if (key < 0n) return items.map(() => 0n);
    return items.map(item => {
      const price = ((key + 1n) * item.income - 1n) / scale;
      const first = nextPrice(item);
      return price < first ? 0n : (price - first) / item.priceIncrement + 1n;
    });
  }
  const batchCost = (item, count) => count * nextPrice(item) + item.priceIncrement * count * (count - 1n) / 2n;
  function aggregate(items, counts, kind) {
    return items.reduce((sum, item, i) => sum + (kind === "cost" ? batchCost(item, counts[i]) : item.income * counts[i]), 0n);
  }
  function boundary(items, goal, kind, scale) {
    let low = -1n;
    let high = items.reduce((min, item) => {
      const key = nextPrice(item) * scale / item.income;
      return min === null || key < min ? key : min;
    }, null);
    while (aggregate(items, countsAt(items, high, scale), kind) < goal) high = high * 2n + 1n;
    while (high - low > 1n) {
      const mid = (low + high) / 2n;
      if (aggregate(items, countsAt(items, mid, scale), kind) >= goal) high = mid;
      else low = mid;
    }
    return high;
  }
  function buy(item, count) {
    item.totalSpent += batchCost(item, count);
    item.owned += count;
    item.bought += count;
  }
  const incomeOf = items => items.reduce((sum, item) => sum + item.income * item.owned, 0n);
  function bestValue(items, budget) {
    const working = prepare(items);
    let remaining = integer(budget);
    if (remaining < 0n) throw new Error("Budget must be nonnegative.");
    const before = incomeOf(working);
    const scale = scaleFor(working);
    while (true) {
      const active = working.filter(item => item.available && nextPrice(item) <= remaining);
      if (!active.length) break;
      const key = boundary(active, remaining + 1n, "cost", scale);
      const counts = countsAt(active, key - 1n, scale);
      remaining -= aggregate(active, counts, "cost");
      active.forEach((item, index) => buy(item, counts[index]));
      // Finish the boundary one purchase at a time, excluding anything the
      // remaining budget cannot afford, exactly as WGHelp's greedy loop does.
      let best = null;
      for (const item of active) {
        const price = nextPrice(item);
        if (price > remaining) continue;
        if (!best || item.income * nextPrice(best) >= best.income * price) best = item;
      }
      if (!best) break;
      remaining -= nextPrice(best);
      buy(best, 1n);
    }
    return { working, before, remaining, totalCost: integer(budget) - remaining, incomeAdded: incomeOf(working) - before };
  }
  function predict(items, target, bonus = "0") {
    const working = prepare(items);
    const before = incomeOf(working);
    const ratio = bonusRatio(bonus);
    const goal = integer(target);
    if (goal < 0n) throw new Error("Target must be nonnegative.");
    const needed = ceil(goal * ratio.denominator, ratio.numerator) - before;
    if (needed <= 0n) return { working, before, achieved: true, ratio, incomeAdded: 0n, totalCost: 0n };
    const active = working.filter(item => item.available);
    if (!active.length) return { working, before, unavailable: true, ratio, incomeAdded: 0n, totalCost: 0n };
    const scale = scaleFor(active);
    const key = boundary(active, needed, "income", scale);
    const counts = countsAt(active, key - 1n, scale);
    active.forEach((item, index) => buy(item, counts[index]));
    let added = aggregate(active, counts, "income");
    // Reverse source order breaks exact ties in the same way as WGHelp.
    for (let i = active.length - 1; i >= 0 && added < needed; i--) {
      const item = active[i];
      if (nextPrice(item) * scale / item.income !== key) continue;
      buy(item, 1n);
      added += item.income;
    }
    if (added < needed) throw new Error("Income target was not reached.");
    return { working, before, ratio, incomeAdded: added, totalCost: working.reduce((sum, item) => sum + item.totalSpent, 0n) };
  }
  function decimal(numerator, denominator = 1n) {
    const whole = numerator / denominator;
    let remainder = numerator % denominator;
    if (remainder === 0n) return whole.toLocaleString("en-US");
    let fraction = "";
    while (remainder !== 0n) {
      remainder *= 10n;
      fraction += String(remainder / denominator);
      remainder %= denominator;
    }
    return whole.toLocaleString("en-US") + "." + fraction;
  }
  function percent(added, before) {
    const hundredths = before > 0n ? (added * 10000n + before / 2n) / before : 0n;
    return `${hundredths / 100n}.${String(hundredths % 100n).padStart(2, "0")}`;
  }
  const api = Object.freeze({ bestValue, predict, bonusRatio, nextPrice, decimal, percent });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.VassalMath = api;
})(typeof window === "undefined" ? globalThis : window);
