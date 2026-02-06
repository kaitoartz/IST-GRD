// Constantes de configuración
export const CONFIG = {
  SLOTS_MAX: 8,
  MIN_ESSENTIALS_TO_PASS: 6, // Condición de victoria de la ronda

  // Tiempos en segundos
  BRIEFING_TIME: 6,
  DEBRIEF_TIME: 5,

  // Dinámicas de tiempo
  TIME: {
    BONUS_ITEM_SECONDS: 5,          // Segundos que otorga el ítem especial
    CARRY_OVER_MAX_SECONDS: 8,      // Límite superior de tiempo que se arrastra a la siguiente ronda
    CARRY_OVER_MIN_SECONDS: 0,      // No arrastrar negativos
    MIN_ROUND_TIME: 5,              // Nunca menos de 5s por ronda
    MAX_ROUND_TIME: 30,             // Evita exceder tiempos absurdos
    FORCE_BONUS_SPAWN: true         // Asegura que el ítem de tiempo aparezca cada ronda
  },

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
    learning: {
      timeLimit: null, // Sin temporizador
      lives: Infinity,
      ramp: false
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
    ROUND_PERFECT: 200,
    BALANCED_BAG_BONUS: 50
  }
};

// Estado mutable
export const state = {
  mode: 'challenge',     // challenge, calm, learning
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
  phaseTime: 0,     // Temporizador para fases de transición (briefing/debrief)
  timerInterval: null,
  isPaused: false,
  timeBonusCollected: false,

  // Resultado de última ronda
  lastRoundResult: {
    passed: false,
    score: 0,
    message: '',
    balancedBonus: false
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
  state.mode = mode; 
  state.items = allItems;
  state.scenarios = scenarios || [];
  state.score = 0;
  state.level = 1;
  state.lives = mode === 'learning' ? Infinity : CONFIG.MODES[mode]?.lives || CONFIG.MODES.challenge.lives;
  state.isPaused = false;
  
  // Inicialización de tiempo global persistente
  state.timeLeft = 20; // Empezamos con 20 segundos de base
}

export function startRound() {
  state.bag = []; 
  state.lastRoundResult = { passed: false, score: 0, message: '', balancedBonus: false };
  state.timeBonusCollected = false;
  
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
  
  if (!state.currentScenario) return state.lastRoundResult;

  const scenario = state.currentScenario;
  
  // Apply dynamic priority boosts from scenario
  let essentialIds = [...(scenario.essentialItems || [])];
  const recommendedIds = [...(scenario.recommendedItems || [])];
  const forbiddenIds = scenario.forbiddenItems || [];
  
  // Apply priority boosts (e.g., mask becomes essential in fire)
  if (scenario.priorityBoosts) {
    Object.entries(scenario.priorityBoosts).forEach(([itemId, newPriority]) => {
      if (newPriority === 'E' && !essentialIds.includes(itemId)) {
        essentialIds.push(itemId);
        // Remove from recommended if it was there
        const recIdx = recommendedIds.indexOf(itemId);
        if (recIdx > -1) recommendedIds.splice(recIdx, 1);
      }
    });
  }

  // Track categories covered for balanced bag bonus
  const categoriesCovered = new Set();

  state.bag.forEach(id => {
    const item = state.items.find(i => i.id === id);
    if (!item) return;
    
    // Track category
    if (item.category && item.category !== 'none') {
      categoriesCovered.add(item.category);
    }

    // Classify item based on scenario lists (with boosts applied)
    if (essentialIds.includes(id)) {
      score += CONFIG.POINTS.E;
      essentialsCount++;
    } else if (recommendedIds.includes(id)) {
      score += CONFIG.POINTS.R;
    } else if (forbiddenIds.includes(id)) {
      score += CONFIG.POINTS.N;
    }
  });
  
  // Check for balanced bag bonus (all 5 categories covered)
  const requiredCategories = ['water', 'energy', 'health', 'communication', 'shelter'];
  const isBalanced = requiredCategories.every(cat => categoriesCovered.has(cat));
  let balancedBonus = false;
  
  if (isBalanced) {
    score += CONFIG.POINTS.BALANCED_BAG_BONUS;
    balancedBonus = true;
  }
  
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
    balancedBonus,
    categoriesCovered: Array.from(categoriesCovered)
  };

  return state.lastRoundResult;
}

export function getRoundTime() {
  // Learning mode has no timer - return a very large number instead of Infinity
  // to avoid potential arithmetic edge cases
  if (state.mode === 'learning') {
    return 999999;
  }
  
  const { level } = state;
  // WarioWare style speed ramp
  // Start at timeMax (15s) and reduce by rampStep (0.5s) per level
  const challenge = CONFIG.MODES.challenge;
  const start = challenge.timeMax || 15;
  const step = challenge.rampStep || 0.5;

  let time = start - ((level - 1) * step);

  // Clamp to sensible bounds
  time = Math.max(time, CONFIG.TIME.MIN_ROUND_TIME);
  time = Math.min(time, CONFIG.TIME.MAX_ROUND_TIME);

  return time; 
}

export function addTime(seconds) {
  const capped = Math.max(0, Math.min(state.timeLeft + seconds, CONFIG.TIME.MAX_ROUND_TIME));
  state.timeLeft = capped;
  return capped;
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
