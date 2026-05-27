# Hortus Seed Layer Design

## Goal

Build a small static incremental game sample in the style of The Modding Tree and Antimatter Dimensions, using `break_eternity.js` for all player-facing resource math.

## Scope

The first playable sample has one resource, one generator, one upgrade, one prestige layer, local save data, and offline progress. It runs from static files without a bundler or package install.

## Game Loop

Players harvest seeds manually, spend seeds on sprouts, and sprouts produce seeds over time. The cultivator upgrade increases manual harvest gain. At one million seeds, players can reset seeds, sprouts, and upgrades to gain spores. Spores multiply seed production and click gain.

## Architecture

`game-core.js` owns simulation, formulas, serialization, and save restoration. `game.js` owns browser timing, DOM events, localStorage, and rendering. `styles.css` owns the visual direction. `index.html` loads `break_eternity.js`, the core, and the browser adapter in order.

## Testing

Core formulas are tested with Node's built-in test runner. Browser behavior is manually verified from the static HTML file after implementation.
