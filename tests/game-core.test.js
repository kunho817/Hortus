const test = require('node:test');
const assert = require('node:assert/strict');

const Decimal = require('../break_eternity.js');
const core = require('../game-core.js');

test('harvest adds the current click gain as Decimal seeds', () => {
  const state = core.createInitialState(1000);

  core.harvest(state);

  assert.equal(state.seeds.toString(), '1.00');
});

test('buySprout spends seeds and increases passive production', () => {
  const state = core.createInitialState(1000);
  state.seeds = new Decimal(25);

  assert.equal(core.buySprout(state), true);
  assert.equal(state.sprouts.toString(), '1.00');
  assert.equal(state.seeds.toString(), '15.00');

  core.tick(state, 11000);

  assert.equal(state.seeds.toString(), '25.00');
});

test('buyUpgrade applies the click multiplier once', () => {
  const state = core.createInitialState(1000);
  state.seeds = new Decimal(100);

  assert.equal(core.buyUpgrade(state, 'cultivator'), true);
  assert.equal(state.seeds.toString(), '0');

  core.harvest(state);

  assert.equal(state.seeds.toString(), '5.00');
});

test('prestige grants spores and resets the seed layer', () => {
  const state = core.createInitialState(1000);
  state.seeds = new Decimal(1e6);
  state.sprouts = new Decimal(12);
  state.upgrades.cultivator = true;

  assert.equal(core.prestige(state), true);

  assert.equal(state.spores.toString(), '1.00');
  assert.equal(state.seeds.toString(), '0');
  assert.equal(state.sprouts.toString(), '0');
  assert.deepEqual(state.upgrades, {});
});

test('deserializeState restores Decimal values and keeps a valid timestamp', () => {
  const restored = core.deserializeState({
    seeds: { sign: 1, layer: 0, mag: 42 },
    sprouts: { sign: 1, layer: 0, mag: 3 },
    spores: { sign: 1, layer: 0, mag: 2 },
    upgrades: { cultivator: true },
    lastTick: 5000
  }, 9000);

  assert.equal(restored.seeds.toString(), '42.00');
  assert.equal(restored.sprouts.toString(), '3.00');
  assert.equal(restored.spores.toString(), '2.00');
  assert.equal(restored.upgrades.cultivator, true);
  assert.equal(restored.lastTick, 5000);
});
