# Hortus Seed Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, testable incremental game sample using `break_eternity.js`.

**Architecture:** Keep simulation formulas in `game-core.js` and browser UI in `game.js`. Load everything from `index.html` without a build step.

**Tech Stack:** Plain HTML, CSS, JavaScript, Node's built-in test runner, `break_eternity.js`.

---

### Task 1: Core Simulation

**Files:**
- Create: `game-core.js`
- Test: `tests/game-core.test.js`

- [ ] Write failing tests for harvest, sprout purchases, upgrades, prestige, and save restoration.
- [ ] Run `node --test tests/game-core.test.js` and confirm it fails because `game-core.js` is missing.
- [ ] Implement the smallest simulation API needed by the tests.
- [ ] Run `node --test tests/game-core.test.js` and confirm it passes.

### Task 2: Browser Shell

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `game.js`

- [ ] Build the static page structure with resource readouts, action buttons, and status text.
- [ ] Wire DOM actions to the simulation API.
- [ ] Add a requestAnimationFrame loop, autosave, and offline progress restoration.
- [ ] Open the local page and verify the UI renders and buttons update resources.

### Task 3: Repository Publish

**Files:**
- Modify: git metadata only

- [ ] Keep the old remote `main` commit available as `legacy`.
- [ ] Commit the new local sample on `main`.
- [ ] Force-push local `main` to `origin/main` after `legacy` exists.
