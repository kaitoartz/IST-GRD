// Constantes de configuración
export const CONFIG = {
  SLOTS_MAX: 8,
  MIN_ESSENTIALS_TO_PASS: 6, // Condición de victoria de la ronda

  // Tiempos en segundos
  BRIEFING_TIME: 4,
  DEBRIEF_TIME: 3,

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
    E: 15,
    R: 5,
    N: -10,
    ROUND_PASS: 100,
    ROUND_PERFECT: 200
  }
};

// Estado mutable
export const state = {
  mode: 'challenge',     // WarioWare style is inherently a challenge
  phase: 'idle',

  items: [],        // Catálogo completo
  scenarios: [],    // Escenarios disponibles
  roundItems: [],   // Items mostrados en la ronda actual
  bag: [],          // Array de IDs en el bolso (ronda actual)

  // Progresión
  score: 0,
  lives: 3,
  level: 1,         // Número de ronda actual
  currentScenario: null,

  // Timer
  timeLeft: 0,
  timerInterval: null,
  isPaused: false,

  // Resultado de última ronda
  lastRoundResult: {
    passed: false,
    score: 0,
    message: '',
    itemBreakdown: []
  }
};

// --- Leaderboard System ---
export class Leaderboard {
  static KEY = 'ist_grd_leaderboard';

  static getScores() {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : [];
  }

  static saveScore(name, score) {
    const scores = this.getScores();
    scores.push({ name: name.trim() || 'Anónimo', score, date: new Date().toISOString() });
    // Sort descending and keep top 5
    scores.sort((a, b) => b.score - a.score);
    const top5 = scores.slice(0, 5);
    localStorage.setItem(this.KEY, JSON.stringify(top5));
    return top5;
  }

  static isHighScore(score) {
    if (score <= 0) return false;
    const scores = this.getScores();
    if (scores.length < 5) return true;
    return score > scores[scores.length - 1].score;
  }
}

// --- Acciones de Estado ---

export function initGame(mode, allItems, scenarios) {
  state.mode = 'challenge'; 
  state.items = allItems;
  state.scenarios = scenarios || [];
  state.score = 0;
  state.level = 1;
  state.lives = CONFIG.MODES.challenge.lives;
  state.isPaused = false;
}

export function startRound() {
  state.bag = []; 
  state.lastRoundResult = { passed: false, score: 0, message: '', itemBreakdown: [] };
  
  // Choose random scenario different from previous if possible
  if (state.scenarios.length > 0) {
    const otherScenarios = state.scenarios.filter(s => s.id !== state.currentScenario?.id);
    state.currentScenario = otherScenarios.length > 0 
      ? otherScenarios[Math.floor(Math.random() * otherScenarios.length)]
      : state.scenarios[0];
  }
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
  const itemBreakdown = [];
  
  if (!state.currentScenario) return state.lastRoundResult;

  const scenario = state.currentScenario;
  const essentialIds = scenario.essentialItems || [];
  const recommendedIds = scenario.recommendedItems || [];
  const forbiddenIds = scenario.forbiddenItems || [];

  const categoryMeta = {
    E: { icon: '✅', label: 'Vital' },
    R: { icon: '⚠️', label: 'Extra' },
    N: { icon: '❌', label: 'Lujo' }
  };

  state.bag.forEach(id => {
    const item = state.items.find(i => i.id === id);
    if (!item) return;

    let category = 'N';
    // Classify item based on scenario lists
    if (essentialIds.includes(id)) {
      category = 'E';
      score += CONFIG.POINTS.E;
      essentialsCount++;
    } else if (recommendedIds.includes(id)) {
      category = 'R';
      score += CONFIG.POINTS.R;
    } else if (forbiddenIds.includes(id)) {
      category = 'N';
      score += CONFIG.POINTS.N;
    }

    const meta = categoryMeta[category] || categoryMeta.N;
    const fallback = category === 'E'
      ? 'Vital para este escenario.'
      : category === 'R'
        ? 'Útil, pero no esencial aquí.'
        : 'No aporta en este escenario y ocupa espacio.';

    itemBreakdown.push({
      id,
      name: item.name,
      category,
      statusIcon: meta.icon,
      statusLabel: meta.label,
      justification: item.feedback || fallback
    });
  });

  // WarioWare style: High requirement
  // Require at least 4 essentials for the current scenario to survive
  const minToPass = 4;

  const passed = essentialsCount >= minToPass;

  if (passed) score += CONFIG.POINTS.ROUND_PASS;
  
  state.score += score; 
  
  state.lastRoundResult = {
    passed,
    scoreAdded: score,
    essentialsCount,
    minToPass,
    message: passed ? '¡SOBREVIVISTE!' : 'NO ESTABAS PREPARADO',
    itemBreakdown
  };

  return state.lastRoundResult;
}

export function getRoundTime() {
  const { level } = state;
  // WarioWare style speed ramp
  // Start at 12s and reduce by 0.5s per level down to 5s
  let time = 12 - ((level - 1) * 0.5);
  return Math.max(time, 5); 
}

export function loseLife() {
  if (state.lives > 0) {
    state.lives--;
  }
  return state.lives;
}

export function getMissingEssentials() {
  if (!state.currentScenario) return [];
  const essentialIds = state.currentScenario.essentialItems || [];
  const essentials = state.items.filter(i => essentialIds.includes(i.id));
  return essentials.filter(e => !state.bag.includes(e.id));
}

export function getItemsForScenario(scenario) {
  if (!scenario) return state.items;
  
  const essentialIds = scenario.essentialItems || [];
  const recommendedIds = scenario.recommendedItems || [];
  const forbiddenIds = scenario.forbiddenItems || [];
  
  // Combinar todos los IDs relevantes al escenario
  const allRelevantIds = [...essentialIds, ...recommendedIds, ...forbiddenIds];
  
  return state.items.filter(item => allRelevantIds.includes(item.id));
}

export function getItemCategory(itemId, scenario) {
  if (!scenario) return 'N';
  
  if (scenario.essentialItems && scenario.essentialItems.includes(itemId)) {
    return 'E';
  } else if (scenario.recommendedItems && scenario.recommendedItems.includes(itemId)) {
    return 'R';
  } else if (scenario.forbiddenItems && scenario.forbiddenItems.includes(itemId)) {
    return 'N';
  }
  return 'N';
}
