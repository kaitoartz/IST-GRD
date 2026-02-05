// Constantes de configuración
export const CONFIG = {
  SLOTS_MAX: 8,
  MIN_ESSENTIALS_TO_PASS: 6, // Condición de victoria de la ronda

  // Tiempos en segundos
  BRIEFING_TIME: 3,
  DEBRIEF_TIME: 2,

  MODES: {
    calm: {
      timeMin: 18,
      timeMax: 22,
      lives: Infinity,
      ramp: false
    },
    challenge: {
      timeMin: 12,
      timeMax: 15, // Empieza en 15, baja a 12
      lives: 3,
      ramp: true,
      rampStep: 0.5 // Segundos menos por cada X niveles
    },
    tutorial: {
      times: [30, 25, 20, 18, 15] // 5 Rondas
    }
  },

  POINTS: {
    E: 10,
    R: 5,
    N: -5,
    ROUND_PASS: 100,
    ROUND_PERFECT: 200
  }
};

// Estado mutable
export const state = {
  mode: 'calm',     // 'calm' | 'challenge' | 'tutorial'
  phase: 'idle',    // 'intro', 'briefing', 'action', 'debrief', 'results'

  items: [],        // Catálogo completo
  bag: [],          // Array de IDs en el bolso (ronda actual)

  // Progresión
  score: 0,
  lives: 3,
  level: 1,         // Número de ronda actual

  // Timer
  timeLeft: 0,
  timerInterval: null,
  isPaused: false,

  // Resultado de última ronda
  lastRoundResult: {
    passed: false,
    score: 0,
    message: ''
  }
};

// --- Acciones de Estado ---

export function initGame(mode, allItems) {
  state.mode = mode;
  state.items = allItems;
  state.score = 0;
  state.level = 1;
  state.isPaused = false;
  
  if (mode === 'challenge') {
    state.lives = CONFIG.MODES.challenge.lives;
  } else {
    state.lives = Infinity;
  }
}

export function startRound() {
  state.bag = []; // Reset bag for new round
  state.lastRoundResult = { passed: false, score: 0, message: '' };
}

export function addToBag(itemId) {
  if (state.phase !== 'action') return { success: false, reason: 'wrong_phase' };
  if (state.isPaused) return { success: false, reason: 'paused' };

  if (state.bag.length >= CONFIG.SLOTS_MAX) return { success: false, reason: 'full' };
  if (state.bag.includes(itemId)) return { success: false, reason: 'duplicate' };

  state.bag.push(itemId);
  return { success: true };
}

export function removeFromBag(itemId) {
  if (state.phase !== 'action' || state.isPaused) return;
  state.bag = state.bag.filter(id => id !== itemId);
}

export function calculateRoundScore() {
  let score = 0;
  let essentialsCount = 0;
  let forbiddenCount = 0;
  
  state.bag.forEach(id => {
    const item = state.items.find(i => i.id === id);
    if (!item) return;
    score += item.points;
    if (item.category === 'E') essentialsCount++;
    if (item.category === 'N') forbiddenCount++;
  });

  // Determine Pass/Fail
  // Criterio: Al menos 6 esenciales (o máximo posible) y pocos errores?
  // Simplificado para juego rápido:
  // Pass si essentialsCount >= MIN_ESSENTIALS_TO_PASS
  // OJO: Si la ronda tiene items aleatorios, hay que asegurar que HAYA suficientes esenciales.
  // Por ahora asumimos que el pool siempre tiene suficientes (hay 8 esenciales en total).

  const passed = essentialsCount >= CONFIG.MIN_ESSENTIALS_TO_PASS;

  if (passed) score += CONFIG.POINTS.ROUND_PASS;
  if (essentialsCount === CONFIG.SLOTS_MAX && forbiddenCount === 0) score += CONFIG.POINTS.ROUND_PERFECT;

  state.score += score; // Acumular al total
  
  state.lastRoundResult = {
    passed,
    scoreAdded: score,
    essentialsCount,
    message: passed ? '¡BIEN HECHO!' : 'FALTÓ LO VITAL'
  };

  return state.lastRoundResult;
}

export function getRoundTime() {
  const { mode, level } = state;
  const conf = CONFIG.MODES[mode];
  
  if (mode === 'tutorial') {
    const idx = Math.min(level - 1, conf.times.length - 1);
    return conf.times[idx];
  }

  if (mode === 'calm') {
    // Random entre min y max
    return Math.floor(Math.random() * (conf.timeMax - conf.timeMin + 1)) + conf.timeMin;
  }

  if (mode === 'challenge') {
    // Speed ramp: Reduce tiempo cada nivel
    let time = conf.timeMax - ((level - 1) * conf.rampStep);
    return Math.max(time, conf.timeMin); // No bajar del mínimo (12s)
  }

  return 20; // fallback
}

export function loseLife() {
  if (state.lives > 0) {
    state.lives--;
  }
  return state.lives;
}

export function getMissingEssentials() {
  const essentials = state.items.filter(i => i.category === 'E');
  return essentials.filter(e => !state.bag.includes(e.id));
}
