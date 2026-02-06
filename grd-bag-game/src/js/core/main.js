import {
  state,
  CONFIG,
  initGame,
  startRound,
  calculateRoundScore,
  getRoundTime,
  loseLife,
  Leaderboard,
  getItemsForScenario,
  saveCarryOverTime
} from './state.js';
import * as UI from '../ui/ui.js';
import { setupClickHandlers } from '../interaction/dragdrop.js';
import { bagAnimator } from '../ui/bagAnimation.js';

let ALL_ITEMS = [];
let ALL_SCENARIOS = [];
let ALL_PROFILES = [];
let gameLoopInterval = null;

// --- Initialization ---

async function loadData() {
  try {
    const [itemsRes, scenariosRes, profilesRes] = await Promise.all([
      fetch('grd-bag-game/src/data/items.json'),
      fetch('grd-bag-game/src/data/scenarios.json'),
      fetch('grd-bag-game/src/data/profiles.json')
    ]);
    ALL_ITEMS = await itemsRes.json();
    ALL_SCENARIOS = await scenariosRes.json();
    ALL_PROFILES = await profilesRes.json();
    console.log('Items loaded:', ALL_ITEMS.length);
    console.log('Scenarios loaded:', ALL_SCENARIOS.length);
    console.log('Profiles loaded:', ALL_PROFILES.length);
  } catch (e) {
    console.error('Error loading data:', e);
    // Fallback UI error?
  }
}

// --- Game Loop Control ---

function showTutorial() {
  const tutorial = document.getElementById('tutorial-popup');
  if (tutorial) {
    tutorial.classList.remove('hidden');
    // Ensure button inside tutorial also has its listener (redundant but safe)
    const btn = document.getElementById('btn-close-tutorial');
    if (btn && !btn.dataset.listenerAttached) {
      btn.addEventListener('click', proceedToGame);
      btn.dataset.listenerAttached = "true";
    }
  }
}

function startGame() {
  showTutorial();
}

function proceedToGame() {
  console.log('Proceeding to game...');
  const tutorial = document.getElementById('tutorial-popup');
  if (tutorial) {
    tutorial.classList.add('hidden');
  }
  
  // Get selected mode from UI (default to challenge)
  const modeSelect = document.querySelector('input[name="game-mode"]:checked');
  const selectedMode = modeSelect ? modeSelect.value : 'challenge';
  
  initGame(selectedMode, ALL_ITEMS, ALL_SCENARIOS, ALL_PROFILES);
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

  // Learning mode doesn't have a countdown
  if (state.mode !== 'learning') {
    state.timeLeft--;
  }

  if (state.phase === 'briefing') {
    UI.updateBriefing("¡EMPACA LO VITAL!", state.timeLeft);
    if (state.timeLeft <= 0) {
      runPhase('action');
    }
  } else if (state.phase === 'action') {
    UI.updateHUD();

    // Only handle timer countdown in non-learning mode
    if (state.mode !== 'learning') {
      // Audiovisual feedback: Tick sound on last 5 seconds
      if (state.timeLeft <= 5 && state.timeLeft > 0) {
        UI.playSound('tick');
      }

      if (state.timeLeft <= 0) {
        finishRound(true); // Time Up
      }
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
  
  // Feature: Extra Time Item Injection (25% chance)
  if (Math.random() < 0.25) {
    const timeItem = state.items.find(i => i.id === 'time_extra');
    if (timeItem) {
       state.roundItems.push(timeItem);
    }
  }

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
  
  // Initialize interaction handlers for this round
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
  } else {
    // Round Passed: Carry over time
    if (!timeUp && state.timeLeft > 0) {
      saveCarryOverTime(state.timeLeft);
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
  const btnStart = document.getElementById('btn-start');
  const btnCloseTutorial = document.getElementById('btn-close-tutorial');
  const btnRetry = document.getElementById('btn-retry');

  if (btnStart) btnStart.addEventListener('click', startGame);
  if (btnCloseTutorial) btnCloseTutorial.addEventListener('click', proceedToGame);
  
  if (btnRetry) {
    btnRetry.addEventListener('click', () => {
      startGame();
    });
  }
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

  const pauseBtn = document.getElementById('btn-pause');
  if (pauseBtn) pauseBtn.addEventListener('click', togglePause);

  const resumeBtn = document.getElementById('btn-resume');
  if (resumeBtn) resumeBtn.addEventListener('click', togglePause);
  
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
