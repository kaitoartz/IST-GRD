import { state, CONFIG, Leaderboard } from '../core/state.js';

// --- Sound System ---
const audio = {
  pop: document.getElementById('sfx-pop'),
  error: document.getElementById('sfx-error'),
  success: document.getElementById('sfx-success'),
  tick: document.getElementById('sfx-tick')
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

  // Handle dynamic themes based on scenario
  if (screenName === 'game' && state.currentScenario) {
    // Remove previous scenario classes
    document.body.className = document.body.className.replace(/sc-\w+/g, '').trim();
    document.body.classList.add(`sc-${state.currentScenario.id}`);
  } else if (screenName === 'intro' || screenName === 'results') {
    document.body.className = document.body.className.replace(/sc-\w+/g, '').trim();
  }

  // Auto-render leaderboard when going to intro
  if (screenName === 'intro') {
    renderLeaderboard();
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
  const scenario = state.currentScenario;
  
  if(taskEl) {
    if (scenario) {
      taskEl.innerHTML = `${scenario.icon} PREPÁRATE PARA:<br><span style="color:var(--primary); font-size: 2.5rem;">${scenario.name.toUpperCase()}</span>`;
    } else {
      taskEl.textContent = taskText || '¡PREPÁRATE!';
    }
  }
  if(timerEl) timerEl.textContent = timeLeft;
}

export function updateDebrief(result) {
  const textEl = document.getElementById('debrief-text');
  const iconEl = document.getElementById('debrief-icon');
  const infoEl = document.getElementById('debrief-info');
  const listEl = document.getElementById('debrief-items');

  if(result.passed) {
    textEl.textContent = result.message || "¡MUY BIEN!";
    textEl.style.color = "var(--success)";
    iconEl.textContent = result.essentialsCount === 8 ? "🏆" : "✅";
    infoEl.textContent = `+${result.scoreAdded} Puntos`;
    playSound('success');
  } else {
    textEl.textContent = "¡CUIDADO!";
    textEl.style.color = "var(--danger)";
    iconEl.textContent = "⚠️";
    infoEl.textContent = `Necesitabas ${result.minToPass} vitales (tuviste ${result.essentialsCount})`;
    playSound('error');
    triggerScreenShake();
  }

  if (listEl) {
    const items = result.itemBreakdown || [];
    if (!items.length) {
      listEl.innerHTML = '<li class="debrief-empty">No seleccionaste ítems.</li>';
    } else {
      listEl.innerHTML = items.map(item => `
        <li class="debrief-item" data-category="${item.category}">
          <div class="debrief-item-header">
            <span class="debrief-status" aria-hidden="true">${item.statusIcon}</span>
            <span class="debrief-label">${item.statusLabel}</span>
            <span class="debrief-item-name">${item.name}</span>
          </div>
          <div class="debrief-justification">${item.justification}</div>
        </li>
      `).join('');
    }
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
    }, 4000); // 4s to read feedback
  }
}

export function triggerScreenShake() {
  document.body.classList.add('screen-shake');
  setTimeout(() => document.body.classList.remove('screen-shake'), 450);
}

export function updateHUD() {
  // Scenario
  const scenarioPill = document.getElementById('scenario-pill');
  if (scenarioPill && state.currentScenario) {
    scenarioPill.textContent = state.currentScenario.name.toUpperCase();
  }

  // Level
  const levelVal = document.getElementById('level-val');
  if (levelVal) levelVal.textContent = state.level;

  // Timer
  const timerVal = document.getElementById('time-val');
  if (timerVal) {
    timerVal.textContent = state.timeLeft;
    const timerBox = document.getElementById('timer-display');
    if (state.timeLeft <= 5) {
      timerBox.classList.add('urgent');
      // Efecto de vibración si es muy poco tiempo
      if (state.timeLeft <= 3) {
        timerBox.style.transform = `translate(${(Math.random()-0.5)*5}px, ${(Math.random()-0.5)*5}px)`;
      } else {
        timerBox.style.transform = 'none';
      }
    } else {
      timerBox.classList.remove('urgent');
      timerBox.style.transform = 'none';
    }
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
  
  const scenario = state.currentScenario;

  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'item-card';
    el.dataset.id = item.id;
    
    // Dynamic category based on scenario for color coding
    let category = 'N';
    if (scenario) {
      if (scenario.essentialItems && scenario.essentialItems.includes(item.id)) {
        category = 'E';
      } else if (scenario.recommendedItems && scenario.recommendedItems.includes(item.id)) {
        category = 'R';
      } else if (scenario.forbiddenItems && scenario.forbiddenItems.includes(item.id)) {
        category = 'N';
      }
    }
    
    el.dataset.category = category; 
    const categoryLabel = category === 'E' ? 'Vital' : category === 'R' ? 'Extra' : 'Lujo';

    el.tabIndex = 0;
    el.role = 'button';
    el.ariaLabel = `Añadir ${item.name} (${categoryLabel}) a la mochila`;
    
    // Ghost effect if in bag
    if (state.bag.includes(item.id)) {
      el.style.opacity = '0.4';
      el.style.filter = 'grayscale(1)';
      el.style.pointerEvents = 'none';
      el.tabIndex = -1;
      el.ariaDisabled = 'true';
    }

    el.innerHTML = `
      <img src="${item.icon}" alt="" class="item-icon" aria-hidden="true" loading="lazy">
      <div class="item-name">${item.name}</div>
    `;
    trayList.appendChild(el);
  });
}

export function renderBag(items) {
  // La mochila se renderiza ahora a través de bagAnimator
  // Esta función se mantiene para compatibilidad pero no hace nada
  // ya que los thumbnails se actualizan automáticamente en la animación
  return;
}

export function renderLeaderboard() {
  const scores = Leaderboard.getScores();
  const lists = [
    document.getElementById('leaderboard-intro'),
    document.getElementById('leaderboard-results')
  ];

  lists.forEach(list => {
    if (!list) return;
    list.innerHTML = scores.length > 0 
      ? scores.map((s, i) => `
          <li class="score-item">
            <span class="name">${i+1}. ${s.name}</span>
            <span class="value">${s.score}</span>
          </li>
        `).join('')
      : '<li class="score-item" style="justify-content: center; opacity: 0.5;">Sin puntajes aún</li>';
  });
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

  // High score logic
  const form = document.getElementById('high-score-form');
  if (state.mode === 'challenge' && Leaderboard.isHighScore(state.score)) {
    form.classList.remove('hidden');
  } else {
    form.classList.add('hidden');
  }

  renderLeaderboard();
}
