import {
  state,
  CONFIG,
  initGame,
  startRound,
  calculateRoundScore,
  getRoundTime,
  loseLife,
  Leaderboard,
  getItemsForScenario
} from './state.js';
import * as UI from '../ui/ui.js';
import { initDragDrop, setupClickHandlers } from '../interaction/dragdrop.js';
import { bagAnimator } from '../ui/bagAnimation.js';

let ALL_ITEMS = [];
let ALL_SCENARIOS = [];
let gameLoopInterval = null;

// --- Initialization ---

async function loadData() {
  try {
    const [itemsRes, scenariosRes] = await Promise.all([
      fetch('grd-bag-game/src/data/items.json'),
      fetch('grd-bag-game/src/data/scenarios.json')
    ]);
    ALL_ITEMS = await itemsRes.json();
    ALL_SCENARIOS = await scenariosRes.json();
    console.log('Items loaded:', ALL_ITEMS.length);
    console.log('Scenarios loaded:', ALL_SCENARIOS.length);
  } catch (e) {
    console.error('Error loading data:', e);
    // Fallback UI error?
  }
}

// --- Game Loop Control ---

function startGame() {
  initGame('challenge', ALL_ITEMS, ALL_SCENARIOS);
  
  // Start First Round
  runPhase('briefing');
}

function runPhase(phaseName) {
  state.phase = phaseName;
  clearInterval(gameLoopInterval);
  
  if (phaseName === 'briefing') {
    setupBriefing();
  } else if (phaseName === 'action') {
    setupAction();
  } else if (phaseName === 'debrief') {
    setupDebrief();
  } else if (phaseName === 'results') {
    UI.renderFinalResults();
    UI.showScreen('results');
    return; // End loop
  }

  // Start Ticker
  gameLoopInterval = setInterval(gameTick, 1000);
  gameTick(); // Immediate update
}

function gameTick() {
  if (state.isPaused) return;

  state.timeLeft--;

  if (state.phase === 'briefing') {
    UI.updateBriefing("¡EMPACA LO VITAL!", state.timeLeft);
    if (state.timeLeft <= 0) {
      runPhase('action');
    }
  } else if (state.phase === 'action') {
    UI.updateHUD();
    if (state.timeLeft <= 0) {
      finishRound(true); // Time Up
    }
  } else if (state.phase === 'debrief') {
    // Debrief is just a delay to show result
    if (state.timeLeft <= 0) {
      nextRound();
    }
  }
}

// --- Phase Setup Functions ---

function setupBriefing() {
  UI.showScreen('briefing');
  state.timeLeft = CONFIG.BRIEFING_TIME;
  UI.playSound('pop');

  // Prepare Round Data (Scenarios are chosen here)
  startRound();
  
  const scenarioText = state.currentScenario 
    ? `${state.currentScenario.icon} ${state.currentScenario.briefingText || state.currentScenario.name}`
    : "¡PREPÁRATE!";
  
  UI.updateBriefing(scenarioText, state.timeLeft);
  bagAnimator.clearBag();
  
  // Filtrar items relevantes al escenario actual
  const scenarioItems = state.currentScenario 
    ? getItemsForScenario(state.currentScenario)
    : state.items;
  
  // Randomize Items for the Tray: WarioWare style (Subset of items)
  // Show 10-12 items from scenario-relevant items
  const shuffled = [...scenarioItems].sort(() => 0.5 - Math.random());
  state.roundItems = shuffled.slice(0, Math.min(12, scenarioItems.length)); 
  
  UI.renderTray(state.roundItems);
  UI.renderBag(state.items); // Reset Bag UI
}

function setupAction() {
  UI.showScreen('game');
  
  // Renderizar contenido del juego
  UI.renderTray(state.roundItems);
  UI.renderBag(state.items);
  
  state.timeLeft = getRoundTime();
  UI.updateHUD();
  
  // Initialize drag-drop handlers for this round (después de renderizar)
  initDragDrop();
  setupClickHandlers();
}

function setupDebrief() {
  UI.showScreen('debrief');
  state.timeLeft = CONFIG.DEBRIEF_TIME;
  
  // Logic is handled in finishRound before calling this,
  // so we just show the result stored in state.
  UI.updateDebrief(state.lastRoundResult);
}

// --- Round Logic ---

function finishRound(timeUp = false) {
  clearInterval(gameLoopInterval);
  
  const result = calculateRoundScore();

  // Check Win/Loss conditions
  if (!result.passed) {
    if (state.mode === 'challenge') {
      const livesLeft = loseLife();
      if (livesLeft <= 0) {
        state.phase = 'results';
        setTimeout(() => runPhase('results'), 2000); // Show debrief then results
        // Actually, let's show debrief first
      }
    }
  }

  runPhase('debrief');
}

function nextRound() {
  // Check End Game Conditions
  if (state.lives <= 0) {
    runPhase('results');
    return;
  }
  
  // Advance Level
  state.level++;
  runPhase('briefing');
}

// --- Pause Logic ---

function togglePause() {
  state.isPaused = !state.isPaused;
  if (state.isPaused) {
    UI.showScreen('pause');
  } else {
    UI.hideOverlay('pause');
  }
}

// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  UI.renderLeaderboard();
  
  // Navigation
  document.getElementById('btn-start').addEventListener('click', startGame);
  document.getElementById('btn-retry').addEventListener('click', () => {
    UI.showScreen('intro');
  });
  document.getElementById('btn-home').addEventListener('click', () => {
    UI.showScreen('intro');
  });

  // Leaderboard save
  document.getElementById('btn-save-score').addEventListener('click', () => {
    const nameInput = document.getElementById('player-name');
    if (nameInput) {
      Leaderboard.saveScore(nameInput.value, state.score);
      document.getElementById('high-score-form').classList.add('hidden');
      UI.renderLeaderboard();
      UI.showFeedback('¡Guardado!', 'Tu puntaje está en el Top 5', 'success');
    }
  });

  // Game Controls
  document.getElementById('btn-check').addEventListener('click', () => {
    if (state.phase === 'action' && !state.isPaused) {
      finishRound(false);
    }
  });

  document.getElementById('btn-pause').addEventListener('click', togglePause);
  document.getElementById('btn-resume').addEventListener('click', togglePause);
  
  document.getElementById('btn-quit').addEventListener('click', () => {
    togglePause();
    UI.showScreen('intro');
    clearInterval(gameLoopInterval);
  });

  document.getElementById('btn-practice-round').addEventListener('click', () => {
    // Restart current round
    togglePause();
    // Decrement level so it increments back to current in 'nextRound' logic?
    // Or just runPhase('briefing') with same level.
    runPhase('briefing');
  });
});
