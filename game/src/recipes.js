// Warung Nusantara menu data: every ingredient on the counter and every dish
// the stall serves, with the exact order its ingredients go on the plate.

export const INGREDIENTS = {
  nasi:   { name: 'Nasi',           en: 'steamed rice',   color: '#f7f2df', edge: '#d5c9a3' },
  mie:    { name: 'Mie',            en: 'yellow noodles', color: '#f2c14e', edge: '#c1912a' },
  ayam:   { name: 'Ayam',           en: 'chicken',        color: '#e8a94b', edge: '#b97c22' },
  daging: { name: 'Daging',         en: 'beef',           color: '#a03d2d', edge: '#6f271b' },
  bakso:  { name: 'Bakso',          en: 'meatballs',      color: '#b08968', edge: '#7f5a3c' },
  telur:  { name: 'Telur',          en: 'egg',            color: '#ffb703', edge: '#dd8f00' },
  sayur:  { name: 'Sayur',          en: 'greens',         color: '#57a639', edge: '#38691f' },
  sambal: { name: 'Sambal',         en: 'chili sauce',    color: '#d62828', edge: '#9c1a1a' },
  kecap:  { name: 'Kecap',          en: 'sweet soy',      color: '#4a2c14', edge: '#2c190a' },
  kacang: { name: 'Bumbu Kacang',   en: 'peanut sauce',   color: '#d98e4a', edge: '#a86424' },
  kuah:   { name: 'Kuah',           en: 'broth',          color: '#e9c46a', edge: '#bd9436' },
  bawang: { name: 'Bawang Goreng',  en: 'fried shallot',  color: '#e5b25d', edge: '#b9822f' },
  teh:    { name: 'Teh',            en: 'tea',            color: '#c97b2d', edge: '#96571a' },
  es:     { name: 'Es Batu',        en: 'ice',            color: '#bfe8f5', edge: '#7fbcd4' },
};

export const STATION_ORDER = [
  'nasi', 'mie', 'ayam', 'daging', 'bakso', 'telur', 'sayur',
  'sambal', 'kecap', 'kacang', 'kuah', 'bawang', 'teh', 'es',
];

// unlockAt: seconds into the day before the dish can be ordered.
export const RECIPES = {
  'nasi-goreng': { name: 'Nasi Goreng',  en: 'fried rice',     price: 15, unlockAt: 0,  steps: ['nasi', 'kecap', 'telur', 'ayam', 'bawang'] },
  'mie-goreng':  { name: 'Mie Goreng',   en: 'fried noodles',  price: 14, unlockAt: 0,  steps: ['mie', 'kecap', 'sayur', 'telur', 'bawang'] },
  'sate-ayam':   { name: 'Sate Ayam',    en: 'chicken satay',  price: 18, unlockAt: 0,  steps: ['ayam', 'kacang', 'sambal', 'bawang'] },
  'bakso':       { name: 'Bakso Sapi',   en: 'meatball soup',  price: 14, unlockAt: 0,  steps: ['bakso', 'mie', 'kuah', 'sayur', 'bawang'] },
  'es-teh':      { name: 'Es Teh Manis', en: 'sweet iced tea', price: 6,  unlockAt: 0,  steps: ['teh', 'es'] },
  'rendang':     { name: 'Rendang Sapi', en: 'beef rendang',   price: 25, unlockAt: 55, steps: ['nasi', 'daging', 'sambal', 'sayur', 'bawang'] },
};

export function unlockedRecipeIds(elapsedSeconds) {
  return Object.keys(RECIPES).filter((id) => elapsedSeconds >= RECIPES[id].unlockAt);
}

export function recipeStepName(stepId) {
  return INGREDIENTS[stepId].name;
}
