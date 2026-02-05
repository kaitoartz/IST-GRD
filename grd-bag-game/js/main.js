import {
  state,
  CONFIG,
  initGame,
  startRound,
  calculateRoundScore,
  getRoundTime,
  loseLife
} from './state.js';
import * as UI from './ui.js';
import { initDragDrop, setupClickHandlers } from './dragdrop.js';

let ALL_ITEMS = [];
let gameLoopInterval = null;

// --- Initialization ---

async function loadData() {
  try {
    const response = await fetch('data/items.json');
    ALL_ITEMS = await response.json();
    console.log('Items loaded:', ALL_ITEMS.length);
  } catch (e) {
    console.error('Error loading items:', e);
    // Fallback UI error?
  }
}

// --- Game Loop Control ---

function startGame() {
  const modeInputs = document.getElementsByName('gameMode');
  let selectedMode = 'calm';
  for(const input of modeInputs) {
    if(input.checked) selectedMode = input.value;
  }

  initGame(selectedMode, ALL_ITEMS);
  
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
  UI.updateBriefing("¡EMPACA LO VITAL!", state.timeLeft);
  UI.playSound('pop');

  // Prepare Round Data
  startRound();
  
  // Randomize Items for the Tray (Simple shuffle for now)
  const shuffled = [...state.items].sort(() => 0.5 - Math.random());
  // Pick subset? No, show all or subset. Let's show all for now as per original.
  // Or maybe a random subset to make it harder/easier?
  // Original showed all. Let's stick to all but maybe re-ordered.
  state.roundItems = shuffled;
  UI.renderTray(state.roundItems);
  UI.renderBag(state.items); // Reset Bag UI
}

function setupAction() {
  UI.showScreen('game');
  state.timeLeft = getRoundTime();
  UI.updateHUD();
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
  if (state.mode === 'challenge' && state.lives <= 0) {
    runPhase('results');
    return;
  }
  
  if (state.mode === 'tutorial') {
    if (state.level >= CONFIG.MODES.tutorial.times.length) {
      runPhase('results'); // Completed all tutorial levels
      return;
    }
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
  
  initDragDrop();
  setupClickHandlers();

  // Navigation
  document.getElementById('btn-start').addEventListener('click', startGame);
  document.getElementById('btn-retry').addEventListener('click', () => {
    UI.showScreen('intro');
  });
  document.getElementById('btn-home').addEventListener('click', () => {
    UI.showScreen('intro');
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
