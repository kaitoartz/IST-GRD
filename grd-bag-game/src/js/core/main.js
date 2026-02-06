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
import { setupClickHandlers } from '../interaction/dragdrop.js';
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
  
  // Default to challenge mode
  const selectedMode = 'challenge';
  
  initGame(selectedMode, ALL_ITEMS, ALL_SCENARIOS);
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

  // Manejo de tiempos según la fase
  if (state.phase === 'action') {
    // Solo disminuye el tiempo global durante la fase de acción
    if (state.mode !== 'learning') {
      state.timeLeft--;
      
      // Feature: Random Time Bonus Activation (approx 8% chance per second)
      if (Math.random() < 0.08 && !state.timeBonusCollected) {
        UI.setTimeBonusState(true);
      }

      // Audiovisual feedback: Tick sound on last 5 seconds
      if (state.timeLeft <= 5 && state.timeLeft > 0) {
        UI.playSound('tick');
      }

      if (state.timeLeft <= 0) {
        finishRound(true); // Time Up
      }
    }
    UI.updateHUD();
  } else {
    // En briefing o debrief, disminuye el temporizador de fase
    state.phaseTime--;
    
    if (state.phase === 'briefing') {
      UI.updateBriefing("¡EMPACA LO VITAL!", state.phaseTime);
      if (state.phaseTime <= 0) {
        runPhase('action');
      }
    } else if (state.phase === 'debrief') {
      if (state.phaseTime <= 0) {
        nextRound();
      }
    }
  }
}

// --- Phase Setup Functions ---

function setupBriefing() {
  UI.showScreen('briefing');
  state.phaseTime = CONFIG.BRIEFING_TIME;
  UI.playSound('pop');

  // Prepare Round Data (Scenarios are chosen here)
  startRound();
  
  const scenarioText = state.currentScenario 
    ? `${state.currentScenario.icon} ${state.currentScenario.briefingText || state.currentScenario.name}`
    : "¡PREPÁRATE!";
  
  UI.updateBriefing(scenarioText, state.phaseTime);
  bagAnimator.clearBag();
  UI.setTimeBonusState(false); 
  
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
  
  // ELIMINADO: state.timeLeft = getRoundTime(); 
  // Ahora el tiempo es persistente desde la inicialización o ronda anterior
  
  UI.updateHUD();
  
  // Initialize interaction handlers for this round
  setupClickHandlers();
}

function setupDebrief() {
  UI.showScreen('debrief');
  state.phaseTime = CONFIG.DEBRIEF_TIME;
  
  // Logic is handled in finishRound before calling this,
  // so we just show the result stored in state.
  UI.updateDebrief(state.lastRoundResult);
}

// --- Round Logic ---

function finishRound(timeUp = false) {
  clearInterval(gameLoopInterval);
  
  const result = calculateRoundScore();

  // Condition: Lose life if time up OR failed essentials
  const isLoss = timeUp || !result.passed;

if (isLoss) {
    UI.shakeTimer?.();
    bagAnimator.animateBackpack('shake');
    
    // Customize message if time up
    if (timeUp) {
      result.message = "¡TIEMPO AGOTADO!";
      result.passed = false;
    }

    if (state.mode === 'challenge') {
      const livesLeft = loseLife();
      // Si tiene vidas disponibles, reinicia el tiempo a 20 segundos
      if (livesLeft > 0 && timeUp) {
        state.timeLeft = 20;
        UI.updateHUD();
        UI.showFeedback('¡Vida perdida!', `Tiempo reiniciado a 20 segundos. Vidas restantes: ${livesLeft}`, 'error');
      }
      if (livesLeft <= 0) {
        state.phase = 'results';
        setTimeout(() => runPhase('results'), 2000); 
      }
    }
  } else {
    // Success!
    bagAnimator.celebrateSuccess();
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

  // Time Bonus HUD Action
  document.getElementById('time-bonus-btn').addEventListener('click', () => {
    if (state.phase === 'action' && !state.isPaused && !state.timeBonusCollected) {
      const btn = document.getElementById('time-bonus-btn');
      if (btn.classList.contains('active')) {
        state.timeLeft += 10;
        state.timeBonusCollected = true;
        
        UI.animateTimeBonusClick();
        UI.showTimeBonus(10, btn.getBoundingClientRect());
        UI.playSound('success');
        UI.pulseTimer?.();
        UI.setTimeBonusState(false);
      }
    }
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
