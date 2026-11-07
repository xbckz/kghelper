const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const math = require('../scripts/vassal-math.js');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(require.resolve('../scripts/vassal-cards.js'), 'utf8'), context);
// Keep the supplied example position independent of new-user defaults.
const exampleOwned = [43150, 17614, 1300, 1500, 500, 587, 250, 298, 202, 125, 200, 200, 200, 0];
const data = Array.from(context.window.KnightVassals.items, (item, i) => ({ ...item, owned: BigInt(exampleOwned[i]), available: true }));
const price = item => BigInt(item.initialPrice) + BigInt(item.priceIncrement) * item.owned;
const income = items => items.reduce((sum, item) => sum + BigInt(item.income) * item.owned, 0n);
function reference(items, budget, target, bonus = '0') {
  const working = items.map(item => ({...item, owned: BigInt(item.owned), bought: 0n, totalSpent: 0n}));
  const ratio = math.bonusRatio(bonus);
  const before = income(working);
  let remaining = budget;
  while (target === undefined || income(working) * ratio.numerator < target * ratio.denominator) {
    let best = null;
    for (const item of working) {
      if (!item.available || (budget !== undefined && price(item) > remaining)) continue;
      if (!best || BigInt(item.income) * price(best) >= BigInt(best.income) * price(item)) best = item;
    }
    if (!best) break;
    const cost = price(best);
    if (budget !== undefined) remaining -= cost;
    best.totalSpent += cost;
    best.owned++;
    best.bought++;
  }
  return {working, before, remaining, totalCost: working.reduce((sum, item) => sum + item.totalSpent, 0n), incomeAdded: income(working) - before};
}
function equalPlan(actual, expected) {
  for (const key of ['totalCost', 'incomeAdded', 'before']) assert.equal(actual[key], expected[key], key);
  assert.deepEqual(actual.working.map(item => [item.owned, item.bought, item.totalSpent]), expected.working.map(item => [item.owned, item.bought, item.totalSpent]));
  if (expected.remaining !== undefined) assert.equal(actual.remaining, expected.remaining);
}
let seed = 123456789;
const random = max => { seed = (1664525 * seed + 1013904223) >>> 0; return seed % max; };
test('table and pricing regression', () => {
  assert.equal(data.length, 14);
  assert.ok(context.window.KnightVassals.items.every(item => item.defaultOwned === 0));
  assert.equal(income(data), 1844229000n);
  assert.equal(price(data[0]), 45318000n);
  assert.equal(price(data[13]), 1000000n);
  assert.equal(math.bestValue(data.map((item, i) => ({...item, available:i<13})),1000000000n).totalCost,976387500n);
});
test('500 budget and 500 target plans match single-purchase reference', () => {
  for (let run=0; run<500; run++) {
    const items = Array.from({length:1+random(8)},(_,id)=>({id,income:1+random(1000),initialPrice:1+random(10000),priceIncrement:1+random(100),owned:BigInt(random(30)),available:random(4)!==0}));
    items[0].available=true;
    const budget=BigInt(random(1000000));
    equalPlan(math.bestValue(items,budget),reference(items,budget));
    const bonus=['0','10','12.5','0.001','10.12345'][random(5)];
    const ratio=math.bonusRatio(bonus);
    const target=income(items)*ratio.numerator/ratio.denominator+BigInt(random(100000));
    equalPlan(math.predict(items,target,bonus),reference(items,undefined,target,bonus));
  }
});
test('exact ties prefer later source entry, including unaffordable efficient entries', () => {
  const items=[{id:1,income:10,initialPrice:10,priceIncrement:10,owned:0n,available:true},{id:2,income:100,initialPrice:100,priceIncrement:10,owned:0n,available:true}];
  equalPlan(math.bestValue(items,105n),reference(items,105n));
  equalPlan(math.predict(items,1n),reference(items,undefined,1n));
  assert.equal(math.predict(items,1n).working[1].bought,1n);
});
test('target above old 100,000 cap reaches target and matches reference', () => {
  const result=math.predict(data,50000000000n,'10');
  assert.ok(result.working.reduce((sum,item)=>sum+item.bought,0n)>100000n);
  assert.ok((result.before+result.incomeAdded)*result.ratio.numerator>=50000000000n*result.ratio.denominator);
  equalPlan(result,reference(data,undefined,50000000000n,'10'));
});
test('huge target and exact cost beyond Number.MAX_SAFE_INTEGER', () => {
  const single=[{income:100,initialPrice:10500,priceIncrement:1050,owned:43150n,available:true}];
  const result=math.predict(single,100000000000000000000n,'10.125');
  const needed=(100000000000000000000n*result.ratio.denominator+result.ratio.numerator-1n)/result.ratio.numerator-result.before;
  const count=(needed+99n)/100n;
  assert.equal(result.working[0].bought,count);
  assert.equal(result.totalCost,count*price(single[0])+1050n*count*(count-1n)/2n);
  assert.ok(result.totalCost>BigInt(Number.MAX_SAFE_INTEGER));
});
test('budget conservation, locked vassals, zero and already achieved targets', () => {
  const items=data.map((item,i)=>({...item,available:i<4}));
  const result=math.bestValue(items,100000000000000000000000n);
  assert.equal(result.totalCost+result.remaining,100000000000000000000000n);
  assert.ok(result.working.slice(4).every(item=>item.bought===0n));
  assert.ok(result.working.filter(item=>item.available).every(item=>price(item)>result.remaining));
  equalPlan(math.bestValue(items,0n),reference(items,0n));
  assert.equal(math.predict(items,0n).achieved,true);
  assert.equal(math.predict(items.map(item=>({...item,available:false})),100000000000n).unavailable,true);
});
test('decimal bonus boundary and exact decimal presentation', () => {
  const items=[{income:100,initialPrice:10,priceIncrement:1,owned:10n,available:true}];
  assert.equal(math.predict(items,1101n,'10').working[0].bought,1n);
  assert.equal(math.predict(items,1100n,'10').achieved,true);
  assert.equal(math.decimal(123456789012345678901n), '123,456,789,012,345,678,901');
  assert.equal(math.decimal(12345n,1000n),'12.345');
  assert.equal(math.percent(1n,32n),'3.13');
});

test('prediction leaves input counts unchanged and large decimal bonuses stay exact', () => {
  const items=data.map(item=>({...item}));
  const original=items.map(item=>item.owned);
  math.predict(items,100000000000000000000000000000000n,'0.00000000000000000001');
  assert.deepEqual(items.map(item=>item.owned),original);
  assert.equal(math.bonusRatio('12.').numerator,112n);
  assert.equal(math.bonusRatio('1000000.5').numerator,10001005n);
});
