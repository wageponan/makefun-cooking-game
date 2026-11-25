// Drawing for Warung Nusantara: builds the ingredient stations, the order
// board cards, the plate being assembled and the recipe progress steps.

import { INGREDIENTS, STATION_ORDER } from './recipes.js';
import { patienceFraction } from './orders.js';

export function makeElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function customerFace(hue) {
  const svg =
    '<svg viewBox="0 0 48 48" aria-hidden="true">' +
    '<circle cx="24" cy="17" r="10" fill="hsl(' + hue + ',55%,72%)"/>' +
    '<circle cx="20.5" cy="16" r="1.6" fill="#3a2a1a"/><circle cx="27.5" cy="16" r="1.6" fill="#3a2a1a"/>' +
    '<path d="M19 22 Q24 26 29 22" stroke="#3a2a1a" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
    '<path d="M8 46 Q10 31 24 31 Q38 31 40 46 Z" fill="hsl(' + hue + ',45%,45%)"/>' +
    '</svg>';
  const wrap = makeElement('span', 'face');
  wrap.innerHTML = svg;
  return wrap;
}

export function buildStations(container, onPick) {
  const buttons = new Map();
  STATION_ORDER.forEach((id, index) => {
    const ing = INGREDIENTS[id];
    const btn = makeElement('button', 'station');
    btn.type = 'button';
    btn.dataset.ingredient = id;
    const bowl = makeElement('span', 'bowl');
    bowl.style.setProperty('--fill', ing.color);
    bowl.style.setProperty('--edge', ing.edge);
    const label = makeElement('span', 'station-name', ing.name);
    const key = makeElement('span', 'station-key', String(index + 1));
    btn.append(bowl, label, key);
    btn.addEventListener('click', () => onPick(id));
    container.appendChild(btn);
    buttons.set(id, btn);
  });
  return buttons;
}

export function flashStation(buttons, id, className) {
  const btn = buttons.get(id);
  if (!btn) return;
  btn.classList.remove('flash-good', 'flash-bad');
  void btn.offsetWidth;
  btn.classList.add(className);
}

function stepChips(order, plate) {
  const wrap = makeElement('div', 'chips');
  order.recipe.steps.forEach((stepId, i) => {
    const done = plate && i < plate.length && plate[i] === stepId;
    const next = plate && i === plate.length;
    const chip = makeElement('span', 'chip' + (done ? ' done' : '') + (next ? ' next' : ''), INGREDIENTS[stepId].name);
    chip.style.setProperty('--fill', INGREDIENTS[stepId].color);
    chip.style.setProperty('--edge', INGREDIENTS[stepId].edge);
    wrap.appendChild(chip);
  });
  return wrap;
}

export function renderOrders(container, orders, activeOrderId, plate, onSelect) {
  container.textContent = '';
  if (orders.length === 0) {
    container.appendChild(makeElement('p', 'board-empty', 'Belum ada pesanan. Pelanggan sedang dalam perjalanan...'));
    return;
  }
  orders.forEach((order, idx) => {
    const isActive = order.id === activeOrderId;
    const card = makeElement('article', 'order-card' + (isActive ? ' active' : ''));
    const head = makeElement('div', 'order-head');
    head.appendChild(customerFace(18 + ((order.id * 47) % 320)));
    const title = makeElement('div', 'order-title');
    title.appendChild(makeElement('strong', '', order.recipe.name));
    title.appendChild(makeElement('small', '', order.recipe.en + ' - ' + order.recipe.price + ' koin'));
    head.appendChild(title);
    head.appendChild(makeElement('span', 'order-num', '#' + (idx + 1)));
    card.appendChild(head);
    card.appendChild(stepChips(order, isActive ? plate : null));
    const bar = makeElement('div', 'patience');
    const fill = makeElement('div', 'patience-fill');
    const frac = patienceFraction(order);
    fill.style.width = (frac * 100).toFixed(1) + '%';
    fill.style.background = frac > 0.5 ? '#57a639' : frac > 0.25 ? '#e9a13b' : '#d62828';
    bar.appendChild(fill);
    card.appendChild(bar);
    card.addEventListener('click', () => onSelect(order.id));
    container.appendChild(card);
  });
}

export function renderPlate(layersEl, nameEl, stepsEl, order, plate) {
  layersEl.textContent = '';
  stepsEl.textContent = '';
  if (!order) {
    nameEl.textContent = 'Pilih pesanan dulu';
    const empty = makeElement('p', 'plate-hint', 'Klik kartu pesanan, lalu susun bahannya di sini.');
    stepsEl.appendChild(empty);
    return;
  }
  nameEl.textContent = order.recipe.name;
  plate.forEach((stepId) => {
    const layer = makeElement('div', 'layer');
    layer.style.setProperty('--fill', INGREDIENTS[stepId].color);
    layer.style.setProperty('--edge', INGREDIENTS[stepId].edge);
    layer.appendChild(makeElement('span', '', INGREDIENTS[stepId].name));
    layersEl.appendChild(layer);
  });
  if (plate.length === 0) {
    layersEl.appendChild(makeElement('p', 'plate-hint', 'Piring masih kosong'));
  }
  order.recipe.steps.forEach((stepId, i) => {
    const state = i < plate.length ? ' done' : i === plate.length ? ' next' : '';
    const step = makeElement('span', 'step' + state, (i + 1) + '. ' + INGREDIENTS[stepId].name);
    stepsEl.appendChild(step);
  });
}
