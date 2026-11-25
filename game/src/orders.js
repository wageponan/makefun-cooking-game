// Customer orders for Warung Nusantara: how they arrive, how long their
// patience lasts, and how the day's rush tightens both as it goes on.

import { RECIPES, unlockedRecipeIds } from './recipes.js';

let nextOrderId = 1;

export const DAY_LENGTH_SECONDS = 150;
export const MAX_OPEN_ORDERS = 3;

// Patience shrinks from about 48 seconds early in the day to about 27 late.
export function patienceFor(elapsedSeconds) {
  return Math.max(26, 48 - elapsedSeconds * 0.14);
}

// New customers arrive every 9 seconds at opening, every 4.5 near closing.
export function spawnIntervalFor(elapsedSeconds) {
  return Math.max(4.4, 9 - elapsedSeconds * 0.032);
}

export function makeOrder(elapsedSeconds, random) {
  const pool = unlockedRecipeIds(elapsedSeconds);
  const dishId = pool[Math.floor(random() * pool.length)];
  const patience = patienceFor(elapsedSeconds) * (0.9 + random() * 0.25);
  return {
    id: nextOrderId++,
    dishId,
    recipe: RECIPES[dishId],
    patienceMax: patience,
    patienceLeft: patience,
  };
}

// A fast serve earns a tip scaled by the patience left on the order.
export function tipFor(order) {
  return Math.round(order.recipe.price * 0.5 * (order.patienceLeft / order.patienceMax));
}

export function patienceFraction(order) {
  return Math.max(0, order.patienceLeft / order.patienceMax);
}
