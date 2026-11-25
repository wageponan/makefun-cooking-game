// Warung Nusantara game flow: one day of service at an Indonesian street
// food stall. Pick an order, click its ingredients in recipe order to build
// the dish on the plate, serve it before the customer's patience runs out.

import { INGREDIENTS, RECIPES } from './recipes.js';
import { DAY_LENGTH_SECONDS, MAX_OPEN_ORDERS, makeOrder, spawnIntervalFor, tipFor } from './orders.js';
import { buildStations, flashStation, renderOrders, renderPlate } from './render.js';
import { sounds } from './audio.js';

const els = {
  orders: document.getElementById('orders'),
  stations: document.getElementById('stations'),
  layers: document.getElementById('plate-layers'),
  plateName: document.getElementById('plate-name'),
  steps: document.getElementById('recipe-steps'),
  serveBtn: document.getElementById('serve-btn'),
  trashBtn: document.getElementById('trash-btn'),
  dayTime: document.getElementById('day-time'),
  dayBar: document.getElementById('day-bar'),
  score: document.getElementById('score'),
  coins: document.getElementById('coins'),
  served: document.getElementById('served'),
  hearts: document.getElementById('hearts'),
  combo: document.getElementById('combo'),
  toast: document.getElementById('toast'),
  startScreen: document.getElementById('start-screen'),
  pauseScreen: document.getElementById('pause-screen'),
  overScreen: document.getElementById('over-screen'),
  finalStats: document.getElementById('final-stats'),
};

const state = {
  mode: 'start', // start | playing | paused | over
  elapsed: 0,
  spawnIn: 1.2,
  orders: [],
  activeOrderId: null,
  plate: [],
  score: 0,
  coins: 0,
  servedCount: 0,
  lostCount: 0,
  hearts: 3,
  combo: 0,
  bestCombo: 0,
  lastStamp: 0,
};

const stationButtons = buildStations(els.stations, pickIngredient);

function activeOrder() {
  return state.orders.find((o) => o.id === state.activeOrderId) || null;
}

function showToast(text, kind) {
  els.toast.textContent = text;
  els.toast.className = 'toast show ' + (kind || '');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { els.toast.className = 'toast'; }, 1400);
}

function selectOrder(orderId) {
  if (state.activeOrderId === orderId) return;
  state.activeOrderId = orderId;
  state.plate = [];
  sounds.pick();
  refresh();
}

function pickIngredient(ingredientId) {
  if (state.mode !== 'playing') return;
  const order = activeOrder();
  if (!order) {
    showToast('Pilih pesanan di papan dulu', 'warn');
    flashStation(stationButtons, ingredientId, 'flash-bad');
    return;
  }
  const expected = order.recipe.steps[state.plate.length];
  if (ingredientId !== expected) {
    state.combo = 0;
    sounds.mistake();
    flashStation(stationButtons, ingredientId, 'flash-bad');
    showToast('Bukan itu. Berikutnya: ' + INGREDIENTS[expected].name, 'warn');
    refresh();
    return;
  }
  state.plate.push(ingredientId);
  sounds.layer();
  flashStation(stationButtons, ingredientId, 'flash-good');
  refresh();
}

function plateIsComplete() {
  const order = activeOrder();
  return !!order && state.plate.length === order.recipe.steps.length;
}

function servePlate() {
  if (state.mode !== 'playing' || !plateIsComplete()) return;
  const order = activeOrder();
  const tip = tipFor(order);
  const comboBonus = state.combo >= 3 ? Math.floor(order.recipe.price * 0.25) : 0;
  const earned = order.recipe.price + tip + comboBonus;
  state.coins += earned;
  state.score += 100 + tip * 2 + state.combo * 10;
  state.servedCount += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.orders = state.orders.filter((o) => o.id !== order.id);
  state.activeOrderId = state.orders.length ? state.orders[0].id : null;
  state.plate = [];
  sounds.serve();
  showToast(order.recipe.name + ' terjual: +' + earned + ' koin' + (tip ? ' (tip ' + tip + ')' : ''), 'good');
  refresh();
}

function trashPlate() {
  if (state.mode !== 'playing' || state.plate.length === 0) return;
  state.plate = [];
  sounds.trash();
  refresh();
}

function loseOrder(order) {
  state.orders = state.orders.filter((o) => o.id !== order.id);
  state.lostCount += 1;
  state.hearts -= 1;
  state.combo = 0;
  if (state.activeOrderId === order.id) {
    state.activeOrderId = state.orders.length ? state.orders[0].id : null;
    state.plate = [];
  }
  sounds.angry();
  showToast('Pelanggan pergi: ' + order.recipe.name, 'bad');
  if (state.hearts <= 0) endDay('Reputasi habis: tiga pelanggan pergi kecewa.');
}

function spawnOrder() {
  if (state.orders.length >= MAX_OPEN_ORDERS) return;
  const order = makeOrder(state.elapsed, Math.random);
  state.orders.push(order);
  if (!state.activeOrderId) state.activeOrderId = order.id;
  sounds.bell();
}

function tick(now) {
  requestAnimationFrame(tick);
  if (state.mode !== 'playing') { state.lastStamp = now; return; }
  const dt = Math.min(0.05, (now - state.lastStamp) / 1000 || 0);
  state.lastStamp = now;
  state.elapsed += dt;

  state.spawnIn -= dt;
  if (state.spawnIn <= 0) {
    spawnOrder();
    state.spawnIn = spawnIntervalFor(state.elapsed);
  }

  for (const order of [...state.orders]) {
    order.patienceLeft -= dt;
    if (order.patienceLeft <= 0) loseOrder(order);
  }

  if (state.elapsed >= DAY_LENGTH_SECONDS) {
    endDay('Hari selesai. Warung tutup, waktunya hitung laci.');
    return;
  }
  refresh();
}

function refresh() {
  renderOrders(els.orders, state.orders, state.activeOrderId, state.plate, selectOrder);
  renderPlate(els.layers, els.plateName, els.steps, activeOrder(), state.plate);
  els.serveBtn.disabled = !plateIsComplete();
  els.trashBtn.disabled = state.plate.length === 0;
  const left = Math.max(0, Math.ceil(DAY_LENGTH_SECONDS - state.elapsed));
  els.dayTime.textContent = left + ' detik';
  els.dayBar.style.width = (100 * (1 - state.elapsed / DAY_LENGTH_SECONDS)).toFixed(1) + '%';
  els.score.textContent = String(state.score);
  els.coins.textContent = String(state.coins);
  els.served.textContent = String(state.servedCount);
  els.hearts.textContent = '';
  for (let i = 0; i < 3; i++) {
    const h = document.createElement('span');
    h.className = 'heart' + (i < state.hearts ? '' : ' lost');
    els.hearts.appendChild(h);
  }
  els.combo.textContent = state.combo >= 2 ? 'Kombo x' + state.combo : '';
}

function startDay() {
  Object.assign(state, {
    mode: 'playing', elapsed: 0, spawnIn: 0.8, orders: [], activeOrderId: null,
    plate: [], score: 0, coins: 0, servedCount: 0, lostCount: 0, hearts: 3,
    combo: 0, bestCombo: 0,
  });
  els.startScreen.classList.add('hidden');
  els.overScreen.classList.add('hidden');
  els.pauseScreen.classList.add('hidden');
  spawnOrder();
  spawnOrder();
  refresh();
}

function pauseDay() {
  if (state.mode !== 'playing') return;
  state.mode = 'paused';
  els.pauseScreen.classList.remove('hidden');
}

function resumeDay() {
  if (state.mode !== 'paused') return;
  state.mode = 'playing';
  els.pauseScreen.classList.add('hidden');
}

function endDay(reason) {
  if (state.mode === 'over') return;
  state.mode = 'over';
  els.finalStats.textContent =
    reason + ' Skor ' + state.score + ' - ' + state.coins + ' koin - ' +
    state.servedCount + ' porsi terjual - ' + state.lostCount + ' pelanggan pergi - kombo terbaik x' + state.bestCombo + '.';
  els.overScreen.classList.remove('hidden');
  refresh();
}

// Posed scenes so the maker can screenshot the real game in a browser:
// ?shot=play (dish mid-assembly), ?shot=serve (plate ready), ?shot=end.
function poseShotScene(kind) {
  startDay();
  const picks = ['nasi-goreng', 'sate-ayam', 'es-teh'];
  state.orders = picks.map((dishId, i) => ({
    id: 900 + i, dishId, recipe: RECIPES[dishId],
    patienceMax: 45, patienceLeft: 45 - i * 9,
  }));
  state.activeOrderId = state.orders[0].id;
  state.elapsed = 42;
  state.score = 340; state.coins = 47; state.servedCount = 3; state.combo = 2;
  if (kind === 'play') state.plate = ['nasi', 'kecap'];
  if (kind === 'serve') state.plate = [...RECIPES['nasi-goreng'].steps];
  if (kind === 'end') { endDay('Hari selesai. Warung tutup, waktunya hitung laci.'); return; }
  state.mode = 'playing';
  refresh();
}

document.getElementById('start-btn').addEventListener('click', () => { sounds.unlock(); startDay(); });
document.getElementById('restart-btn').addEventListener('click', () => { sounds.unlock(); startDay(); });
document.getElementById('resume-btn').addEventListener('click', resumeDay);
document.getElementById('pause-btn').addEventListener('click', () => {
  if (state.mode === 'playing') pauseDay(); else if (state.mode === 'paused') resumeDay();
});
els.serveBtn.addEventListener('click', servePlate);
els.trashBtn.addEventListener('click', trashPlate);
els.layers.addEventListener('click', servePlate);

document.addEventListener('keydown', (event) => {
  if (event.key === 'p' || event.key === 'P' || event.key === 'Escape') {
    if (state.mode === 'playing') pauseDay(); else if (state.mode === 'paused') resumeDay();
    return;
  }
  if (state.mode === 'start' && event.key === 'Enter') { sounds.unlock(); startDay(); return; }
  if (state.mode === 'over' && event.key === 'Enter') { sounds.unlock(); startDay(); return; }
  if (state.mode !== 'playing') return;
  if (event.key === ' ') { event.preventDefault(); servePlate(); return; }
  if (event.key === 'Backspace' || event.key === 'Delete') { trashPlate(); return; }
  const num = Number(event.key);
  if (num >= 1 && num <= 14) {
    const ids = Object.keys(INGREDIENTS);
    pickIngredient(ids[num - 1]);
  }
});

const shotKind = new URLSearchParams(location.search).get('shot');
if (shotKind === 'play' || shotKind === 'serve' || shotKind === 'end') poseShotScene(shotKind);
else refresh();

requestAnimationFrame(tick);
