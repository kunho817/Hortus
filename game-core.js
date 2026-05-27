(function initHortusCore(root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./break_eternity.js'));
  } else {
    root.HortusCore = factory(root.Decimal);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildHortusCore(Decimal) {
  const PRESTIGE_REQUIREMENT = new Decimal(1e6);
  const UPGRADE_DEFINITIONS = {
    cultivator: {
      id: 'cultivator',
      name: 'Cultivator',
      description: 'Manual harvests produce 5x seeds.',
      cost: new Decimal(100)
    }
  };

  function createInitialState(now = Date.now()) {
    return {
      seeds: new Decimal(0),
      sprouts: new Decimal(0),
      spores: new Decimal(0),
      upgrades: {},
      lastTick: now
    };
  }

  function toDecimal(value) {
    if (value instanceof Decimal) {
      return value.clone();
    }

    if (value && typeof value === 'object' && 'mag' in value) {
      return Decimal.fromJSON(value);
    }

    return new Decimal(value || 0);
  }

  function subtractDecimal(left, right) {
    const a = toDecimal(left);
    const b = toDecimal(right);

    if (a.layer === 0 && b.layer === 0) {
      return new Decimal(Math.max(0, a.toNumber() - b.toNumber()));
    }

    if (a.lt(b)) {
      return new Decimal(0);
    }

    return a.clone();
  }

  function getSporeMultiplier(state) {
    return state.spores.add(1);
  }

  function getClickGain(state) {
    const upgradeMultiplier = state.upgrades.cultivator ? 5 : 1;
    return new Decimal(1).mul(getSporeMultiplier(state)).mul(upgradeMultiplier);
  }

  function getSproutCost(state) {
    return Decimal.pow(1.15, state.sprouts).mul(10);
  }

  function getProductionPerSecond(state) {
    return state.sprouts.mul(getSporeMultiplier(state));
  }

  function harvest(state) {
    state.seeds = state.seeds.add(getClickGain(state));
    return state;
  }

  function tick(state, now = Date.now()) {
    const elapsedSeconds = Math.max(0, (now - state.lastTick) / 1000);

    if (elapsedSeconds > 0) {
      state.seeds = state.seeds.add(getProductionPerSecond(state).mul(elapsedSeconds));
      state.lastTick = now;
    }

    return state;
  }

  function buySprout(state) {
    const cost = getSproutCost(state);

    if (!state.seeds.gte(cost)) {
      return false;
    }

    state.seeds = subtractDecimal(state.seeds, cost);
    state.sprouts = state.sprouts.add(1);
    return true;
  }

  function buyUpgrade(state, id) {
    const definition = UPGRADE_DEFINITIONS[id];

    if (!definition || state.upgrades[id] || !state.seeds.gte(definition.cost)) {
      return false;
    }

    state.seeds = subtractDecimal(state.seeds, definition.cost);
    state.upgrades[id] = true;
    return true;
  }

  function getPrestigeGain(state) {
    if (!state.seeds.gte(PRESTIGE_REQUIREMENT)) {
      return new Decimal(0);
    }

    if (state.seeds.layer === 0) {
      return new Decimal(Math.floor(Math.sqrt(state.seeds.toNumber() / 1e6)));
    }

    if (state.seeds.layer === 1) {
      return Decimal.pow(10, Math.max(0, (state.seeds.mag - 6) / 2));
    }

    return Decimal.pow(10, state.seeds.mag);
  }

  function prestige(state) {
    const gain = getPrestigeGain(state);

    if (gain.lte(0)) {
      return false;
    }

    state.spores = state.spores.add(gain);
    state.seeds = new Decimal(0);
    state.sprouts = new Decimal(0);
    state.upgrades = {};
    return true;
  }

  function serializeState(state) {
    return {
      seeds: state.seeds.toJSON(),
      sprouts: state.sprouts.toJSON(),
      spores: state.spores.toJSON(),
      upgrades: { ...state.upgrades },
      lastTick: state.lastTick
    };
  }

  function deserializeState(saved, now = Date.now()) {
    let data = saved;

    if (typeof saved === 'string') {
      data = JSON.parse(saved);
    }

    if (!data || typeof data !== 'object') {
      return createInitialState(now);
    }

    return {
      seeds: toDecimal(data.seeds),
      sprouts: toDecimal(data.sprouts),
      spores: toDecimal(data.spores),
      upgrades: data.upgrades && typeof data.upgrades === 'object' ? { ...data.upgrades } : {},
      lastTick: Number.isFinite(data.lastTick) ? data.lastTick : now
    };
  }

  function formatDecimal(value) {
    return toDecimal(value).toString();
  }

  return {
    UPGRADE_DEFINITIONS,
    PRESTIGE_REQUIREMENT,
    createInitialState,
    deserializeState,
    serializeState,
    formatDecimal,
    getClickGain,
    getPrestigeGain,
    getProductionPerSecond,
    getSproutCost,
    harvest,
    tick,
    buySprout,
    buyUpgrade,
    prestige
  };
});
