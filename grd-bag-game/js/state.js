// Constantes de configuración por defecto
export const CONFIG = {
  SLOTS_MAX: 8,
  MIN_ESSENTIALS_TO_PASS: 6,
  TIME_LIMIT_CHALLENGE: 75,
  POINTS: {
    E: 10,
    R: 5,
    N: -5,
    BONUS_PASS: 10,
    BONUS_PERFECT: 20
  }
};

// Estado mutable
export const state = {
  mode: 'practice', // 'practice' | 'challenge'
  items: [],        // Catálogo completo cargado desde JSON
  bag: [],          // Array de IDs de ítems en el bolso
  timeLeft: 0,
  timerInterval: null,
  isFinished: false,
  score: 0
};

// --- Acciones ---

export function initGame(mode, allItems) {
  state.mode = mode;
  state.items = allItems;
  state.bag = [];
  state.isFinished = false;
  state.score = 0;
  
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timeLeft = (mode === 'challenge') ? CONFIG.TIME_LIMIT_CHALLENGE : 0;
}

export function addToBag(itemId) {
  if (state.isFinished) return { success: false, reason: 'finished' };
  if (state.bag.length >= CONFIG.SLOTS_MAX) return { success: false, reason: 'full' };
  if (state.bag.includes(itemId)) return { success: false, reason: 'duplicate' };

  state.bag.push(itemId);
  return { success: true };
}

export function removeFromBag(itemId) {
  if (state.isFinished) return;
  state.bag = state.bag.filter(id => id !== itemId);
}

export function calculateScore() {
  let score = 0;
  let essentialsCount = 0;
  
  state.bag.forEach(id => {
    const item = state.items.find(i => i.id === id);
    if (!item) return;
    score += item.points;
    if (item.category === 'E') essentialsCount++;
  });

  // Bonos
  if (essentialsCount >= CONFIG.MIN_ESSENTIALS_TO_PASS) score += CONFIG.POINTS.BONUS_PASS;
  if (essentialsCount === CONFIG.SLOTS_MAX) score += CONFIG.POINTS.BONUS_PERFECT;

  state.score = score;
  return { score, essentialsCount };
}

export function getMissingEssentials() {
  const essentials = state.items.filter(i => i.category === 'E');
  const baggedEssentials = state.bag.map(id => state.items.find(i => i.id === id)).filter(i => i && i.category === 'E');
  
  // Retorna los que NO están en el bolso
  return essentials.filter(e => !state.bag.includes(e.id));
}

export function getBagAnalysis() {
  const baggedItems = state.bag.map(id => state.items.find(i => i.id === id));
  const notRecommended = baggedItems.filter(i => i.category === 'N');
  const recommended = baggedItems.filter(i => i.category === 'R');
  
  return {
    notRecommended,
    recommended
  };
}
