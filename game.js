(function startHortusGame() {
  const core = window.HortusCore;
  const SAVE_KEY = 'hortus-save-v1';
  const SAVE_INTERVAL_MS = 5000;

  const elements = {
    seeds: document.getElementById('seeds'),
    sprouts: document.getElementById('sprouts'),
    spores: document.getElementById('spores'),
    perSecond: document.getElementById('per-second'),
    clickGain: document.getElementById('click-gain'),
    sproutCost: document.getElementById('sprout-cost'),
    cultivatorCost: document.getElementById('cultivator-cost'),
    prestigeGain: document.getElementById('prestige-gain'),
    prestigeProgress: document.getElementById('prestige-progress'),
    status: document.getElementById('status'),
    harvest: document.getElementById('harvest'),
    buySprout: document.getElementById('buy-sprout'),
    buyCultivator: document.getElementById('buy-cultivator'),
    prestige: document.getElementById('prestige'),
    resetSave: document.getElementById('reset-save')
  };

  let state = loadState();
  let lastSaveAt = 0;
  let lastStatus = elements.status.textContent;

  function loadState() {
    const now = Date.now();
    const rawSave = window.localStorage.getItem(SAVE_KEY);

    if (!rawSave) {
      return core.createInitialState(now);
    }

    try {
      const loaded = core.deserializeState(rawSave, now);
      const offlineSeconds = Math.max(0, Math.floor((now - loaded.lastTick) / 1000));
      core.tick(loaded, now);

      if (offlineSeconds > 3) {
        setTimeout(() => {
          setStatus(`Recovered ${offlineSeconds}s of growth.`);
        }, 0);
      }

      return loaded;
    } catch (error) {
      console.warn('Failed to load Hortus save.', error);
      return core.createInitialState(now);
    }
  }

  function saveState() {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(core.serializeState(state)));
    lastSaveAt = Date.now();
  }

  function setStatus(message) {
    lastStatus = message;
    elements.status.textContent = message;
  }

  function render() {
    const sproutCost = core.getSproutCost(state);
    const cultivator = core.UPGRADE_DEFINITIONS.cultivator;
    const prestigeGain = core.getPrestigeGain(state);
    const canBuySprout = state.seeds.gte(sproutCost);
    const canBuyCultivator = !state.upgrades.cultivator && state.seeds.gte(cultivator.cost);
    const canPrestige = prestigeGain.gt(0);

    elements.seeds.textContent = core.formatDecimal(state.seeds);
    elements.sprouts.textContent = core.formatDecimal(state.sprouts);
    elements.spores.textContent = core.formatDecimal(state.spores);
    elements.perSecond.textContent = core.formatDecimal(core.getProductionPerSecond(state));
    elements.clickGain.textContent = core.formatDecimal(core.getClickGain(state));
    elements.sproutCost.textContent = core.formatDecimal(sproutCost);
    elements.cultivatorCost.textContent = state.upgrades.cultivator ? 'Owned' : core.formatDecimal(cultivator.cost);
    elements.prestigeGain.textContent = core.formatDecimal(prestigeGain);

    elements.buySprout.disabled = !canBuySprout;
    elements.buyCultivator.disabled = !canBuyCultivator;
    elements.prestige.disabled = !canPrestige;

    const progress = getPrestigeProgress();
    elements.prestigeProgress.style.width = `${progress}%`;

    if (state.upgrades.cultivator) {
      elements.buyCultivator.querySelector('span').textContent = 'Cultivator active';
    }
  }

  function getPrestigeProgress() {
    if (state.seeds.gte(core.PRESTIGE_REQUIREMENT)) {
      return 100;
    }

    if (state.seeds.layer > 0) {
      return 100;
    }

    return Math.max(0, Math.min(100, (state.seeds.toNumber() / 1e6) * 100));
  }

  function frame() {
    const now = Date.now();
    core.tick(state, now);
    render();

    if (now - lastSaveAt >= SAVE_INTERVAL_MS) {
      saveState();
    }

    window.requestAnimationFrame(frame);
  }

  elements.harvest.addEventListener('click', () => {
    core.harvest(state);
    setStatus(`Harvested ${core.formatDecimal(core.getClickGain(state))} seeds.`);
    render();
  });

  elements.buySprout.addEventListener('click', () => {
    if (core.buySprout(state)) {
      setStatus('A sprout joined the plot.');
      saveState();
      render();
    }
  });

  elements.buyCultivator.addEventListener('click', () => {
    if (core.buyUpgrade(state, 'cultivator')) {
      setStatus('Cultivator is active.');
      saveState();
      render();
    }
  });

  elements.prestige.addEventListener('click', () => {
    const gain = core.getPrestigeGain(state);

    if (core.prestige(state)) {
      setStatus(`Released ${core.formatDecimal(gain)} spores.`);
      saveState();
      render();
    }
  });

  elements.resetSave.addEventListener('click', () => {
    const confirmed = window.confirm('Reset this Hortus save?');

    if (!confirmed) {
      return;
    }

    window.localStorage.removeItem(SAVE_KEY);
    state = core.createInitialState(Date.now());
    setStatus('Save reset.');
    saveState();
    render();
  });

  window.addEventListener('beforeunload', saveState);

  setStatus(lastStatus);
  render();
  window.requestAnimationFrame(frame);
})();
