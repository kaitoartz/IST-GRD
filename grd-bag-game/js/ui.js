import { state, CONFIG } from './state.js';

// --- Sound System ---
const audio = {
  pop: document.getElementById('sfx-pop'),
  error: document.getElementById('sfx-error'),
  success: document.getElementById('sfx-success')
};

export function playSound(name) {
  if (audio[name]) {
    audio[name].currentTime = 0;
    audio[name].play().catch(e => console.log("Audio play blocked", e));
  }
}

// --- DOM Cache ---
const screens = {
  intro: document.getElementById('screen-intro'),
  game: document.getElementById('screen-game'),
  results: document.getElementById('screen-results'),
  briefing: document.getElementById('screen-briefing'),
  debrief: document.getElementById('screen-debrief'),
  pause: document.getElementById('screen-pause')
};

const toast = {
  el: document.getElementById('feedback-toast'),
  title: document.querySelector('.toast-title'),
  msg: document.querySelector('.toast-msg'),
  timeout: null
};

// --- Screen Transitions ---
export function showScreen(screenName) {
  Object.values(screens).forEach(s => {
    if(s && s.id !== `screen-${screenName}`) {
       // Pause is an overlay, don't hide game behind it?
       // Actually pause screen has opaque background, so it covers game.
       // Briefing covers game. Debrief covers game.
       // So we can hide others or stack them.
       // "Standard" way: Hide others.
       if(screenName === 'pause' && s.id === 'screen-game') return; // Don't hide game for pause

       s.classList.add('hidden');
       s.classList.remove('active');
    }
  });
  
  if (screens[screenName]) {
    screens[screenName].classList.remove('hidden');
    // Small delay for CSS transition
    setTimeout(() => screens[screenName].classList.add('active'), 10);
  }
}

export function hideOverlay(screenName) {
  if (screens[screenName]) {
    screens[screenName].classList.remove('active');
    setTimeout(() => screens[screenName].classList.add('hidden'), 300);
  }
}

// --- HUD Updates ---

export function updateBriefing(taskText, timeLeft) {
  const taskEl = document.getElementById('briefing-task');
  const timerEl = document.getElementById('briefing-timer');
  if(taskEl) taskEl.textContent = taskText;
  if(timerEl) timerEl.textContent = timeLeft;
}

export function updateDebrief(result) {
  const textEl = document.getElementById('debrief-text');
  const iconEl = document.getElementById('debrief-icon');
  const infoEl = document.getElementById('debrief-info');

  if(result.passed) {
    textEl.textContent = "¡MUY BIEN!";
    textEl.style.color = "var(--success)";
    iconEl.textContent = "✅";
    infoEl.textContent = `+${result.scoreAdded} Puntos`;
    playSound('success');
  } else {
    textEl.textContent = "¡CUIDADO!";
    textEl.style.color = "var(--danger)";
    iconEl.textContent = "⚠️";
    infoEl.textContent = result.message || "Faltan vitales";
    playSound('error');
  }
}

export function showFeedback(title, message, type = 'info') {
  if (toast.timeout) clearTimeout(toast.timeout);

  if (toast.el) {
    toast.el.className = `toast ${type}`;
    if(toast.title) toast.title.textContent = title;
    if(toast.msg) toast.msg.textContent = message;

    toast.el.classList.remove('hidden');

    toast.timeout = setTimeout(() => {
      toast.el.classList.add('hidden');
    }, 2000); // Shorter duration for fast pace
  }
}

export function updateHUD() {
  // Timer
  const timerVal = document.getElementById('time-val');
  if (timerVal) {
    timerVal.textContent = state.timeLeft;
    const timerBox = document.getElementById('timer-display');
    if (state.timeLeft <= 5) timerBox.classList.add('urgent');
    else timerBox.classList.remove('urgent');
  }

  // Lives (only in challenge)
  const livesContainer = document.getElementById('lives-container');
  if (state.mode === 'challenge') {
    livesContainer.classList.remove('hidden');
    const hearts = livesContainer.querySelectorAll('.life-heart');
    hearts.forEach((h, idx) => {
      if (idx < state.lives) h.classList.remove('lost');
      else h.classList.add('lost');
    });
  } else {
    livesContainer.classList.add('hidden');
  }
}

// --- Rendering ---

export function renderTray(items) {
  const trayList = document.getElementById('tray-list');
  trayList.innerHTML = '';
  
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'item-card';
    el.dataset.id = item.id;
    el.dataset.category = item.category; // For color coding logic in CSS
    
    // Ghost effect if in bag
    if (state.bag.includes(item.id)) {
      el.style.opacity = '0.4';
      el.style.filter = 'grayscale(1)';
      el.style.pointerEvents = 'none';
    }

    el.innerHTML = `
      <img src="${item.icon}" alt="${item.name}" class="item-icon">
      <div class="item-name">${item.name}</div>
    `;
    trayList.appendChild(el);
  });
}

export function renderBag(items) {
  const bagList = document.getElementById('bag-list');
  bagList.innerHTML = '';
  
  // Render filled
  state.bag.forEach(itemId => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const el = document.createElement('div');
    el.className = 'item-card in-bag';
    el.dataset.id = item.id;
    el.innerHTML = `
      <img src="${item.icon}" alt="${item.name}" class="item-icon">
    `;
    // Click to remove logic handled in dragdrop or main
    bagList.appendChild(el);
  });

  // Render empty slots
  const emptyCount = CONFIG.SLOTS_MAX - state.bag.length;
  for (let i = 0; i < emptyCount; i++) {
    const el = document.createElement('div');
    el.className = 'empty-slot';
    bagList.appendChild(el);
  }

  // Update Button State
  /*
  const count = state.bag.length;
  const max = CONFIG.SLOTS_MAX;
  const btnCheck = document.getElementById('btn-check');
  if (count >= CONFIG.MIN_ESSENTIALS_TO_PASS) {
     // Maybe enable check button if minimum reached?
     // WarioWare usually auto-submits or waits for time.
     // Prompt implies drag-drop mechanics.
  }
  */
}


// --- Results Visualization ---
export function renderFinalResults() {
  const scoreEl = document.getElementById('final-score');
  scoreEl.textContent = state.score;

  const emoji = document.getElementById('result-emoji');
  const title = document.getElementById('result-title');

  if (state.mode === 'tutorial') {
    title.textContent = "¡Entrenamiento Completo!";
    emoji.textContent = "🎓";
  } else {
    title.textContent = "Fin del Juego";
    emoji.textContent = "🏁";
  }
}
