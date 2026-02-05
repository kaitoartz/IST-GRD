import { state, CONFIG, initGame, calculateScore } from './state.js';
import * as UI from './ui.js';
import { initDragDrop, setupClickHandlers } from './dragdrop.js';

// Cargar Datos
let ALL_ITEMS = [];

async function loadData() {
  try {
    const response = await fetch('data/items.json');
    ALL_ITEMS = await response.json();
    console.log('Items loaded:', ALL_ITEMS.length);
  } catch (e) {
    console.error('Error loading items:', e);
    UI.showFeedback('Error cargando datos del juego.', 'error');
  }
}

// Timer Logic
function startTimer() {
  if (state.mode !== 'challenge') return;
  
  const timerDisplay = document.getElementById('timer-display');
  timerDisplay.classList.remove('hidden');
  
  UI.updateTimerUI(state.timeLeft);

  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    UI.updateTimerUI(state.timeLeft);

    if (state.timeLeft <= 0) {
      clearInterval(state.timerInterval);
      finishGame('time_up');
    }
  }, 1000);
}

// Game Flow
function startGame() {
  // Get selected mode
  const modeInputs = document.getElementsByName('gameMode');
  let selectedMode = 'practice';
  for(const input of modeInputs) {
    if(input.checked) selectedMode = input.value;
  }

  initGame(selectedMode, ALL_ITEMS);
  
  // Update UI
  UI.showScreen('game');
  UI.renderTray(state.items);
  UI.renderBag(state.items);
  
  document.getElementById('slots-max').textContent = CONFIG.SLOTS_MAX;
  
  // Timer
  const timerDisplay = document.getElementById('timer-display');
  if (selectedMode === 'challenge') {
    timerDisplay.classList.remove('hidden');
    startTimer();
  } else {
    timerDisplay.classList.add('hidden');
  }

  UI.showFeedback(
    selectedMode === 'challenge' 
      ? '¡Corre! Tienes 75 segundos.' 
      : 'Arrastra los elementos esenciales al bolso.', 
    'info'
  );
}

function finishGame(reason) {
  state.isFinished = true;
  if (state.timerInterval) clearInterval(state.timerInterval);
  
  const { score, essentialsCount } = calculateScore();
  
  // Delay for UX
  UI.showFeedback(reason === 'time_up' ? '¡Tiempo agotado!' : 'Analizando tu bolso...', 'warning');
  
  setTimeout(() => {
    UI.renderResults(score, essentialsCount);
    UI.showScreen('results');
  }, 1500);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  
  // Initialize Drag & Drop libs
  initDragDrop();
  setupClickHandlers();

  // Button Events
  document.getElementById('btn-start').addEventListener('click', startGame);
  
  document.getElementById('btn-finish').addEventListener('click', () => {
    finishGame('manual');
  });
  
  document.getElementById('btn-retry').addEventListener('click', () => {
    UI.showScreen('intro');
  });
});
