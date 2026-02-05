import { state, CONFIG, getMissingEssentials, getBagAnalysis } from './state.js';

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
  results: document.getElementById('screen-results')
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
    s.classList.add('hidden');
    s.classList.remove('active');
  });
  
  if (screens[screenName]) {
    screens[screenName].classList.remove('hidden');
    // Small delay to allow CSS transition to play
    setTimeout(() => screens[screenName].classList.add('active'), 50);
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
    
    // Ghost effect if in bag
    if (state.bag.includes(item.id)) {
      el.style.opacity = '0.4';
      el.style.filter = 'grayscale(1)';
      el.style.pointerEvents = 'none'; // Lock it
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
    el.className = 'item-card in-bag'; // Add animation class here if needed
    el.dataset.id = item.id;
    el.innerHTML = `
      <img src="${item.icon}" alt="${item.name}" class="item-icon">
    `;
    bagList.appendChild(el);
  });

  // Render empty slots
  const emptyCount = CONFIG.SLOTS_MAX - state.bag.length;
  for (let i = 0; i < emptyCount; i++) {
    const el = document.createElement('div');
    el.className = 'empty-slot';
    bagList.appendChild(el);
  }

  // Update Stats & Progress Bar
  const count = state.bag.length;
  const max = CONFIG.SLOTS_MAX;
  const pct = (count / max) * 100;
  
  document.getElementById('slots-val').textContent = count;
  document.getElementById('slot-progress').style.width = `${pct}%`;

  // Progress Color Logic
  const progEl = document.getElementById('slot-progress');
  if(pct < 50) progEl.style.backgroundColor = 'var(--success)';
  else if(pct < 100) progEl.style.backgroundColor = 'var(--info)';
  else progEl.style.backgroundColor = 'var(--warning)';
  
  // Finish Button
  const btnFinish = document.getElementById('btn-finish');
  if (count === max) {
    btnFinish.disabled = false;
    btnFinish.classList.add('pulse-anim');
  } else {
    btnFinish.disabled = true;
    btnFinish.classList.remove('pulse-anim');
  }
}

export function updateTimerUI(seconds) {
  const el = document.getElementById('time-val');
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  el.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  
  const timerBox = document.getElementById('timer-display');
  if (seconds <= 10) timerBox.classList.add('danger');
  else timerBox.classList.remove('danger');
}

// --- Enhanced Feedback (Toast) ---
export function showFeedback(title, message, type = 'info') {
  if (toast.timeout) clearTimeout(toast.timeout);
  
  toast.el.className = `toast ${type}`; // reset
  toast.title.textContent = title;
  toast.msg.textContent = message;

  toast.el.classList.remove('hidden');

  // Play sound based on type
  if (type === 'error') playSound('error');
  // success sound is handled mostly in game logic for big events

  toast.timeout = setTimeout(() => {
    toast.el.classList.add('hidden');
  }, 4000);
}

// --- Results Visualization ---
export function renderResults(finalScore, essentialsCount) {
  // Animate Score
  const scoreEl = document.getElementById('final-score');
  const pathEl = document.getElementById('score-circle-path');
  
  // Reset for animation
  scoreEl.textContent = 0;
  
  // Determine success
  const passed = essentialsCount >= CONFIG.MIN_ESSENTIALS_TO_PASS;
  
  // Colors & Circle Stroke
  const maxScore = 100; // estimated max
  const dashVal = Math.min((finalScore / maxScore) * 100, 100);
  
  setTimeout(() => {
    pathEl.setAttribute('stroke-dasharray', `${dashVal}, 100`);
    if(passed) pathEl.parentNode.classList.add('success');
    else pathEl.parentNode.classList.add('warning');
  }, 100);

  // Counter Animation
  let start = 0;
  const dur = 1000;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / dur, 1);
    scoreEl.textContent = Math.floor(progress * finalScore);
    if (progress < 1) window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);

  // Texts
  const title = document.getElementById('result-title');
  const emoji = document.getElementById('result-emoji');
  
  if (passed) {
    title.textContent = "¡Estás Preparado/a!";
    emoji.textContent = "🏆";
    playSound('success');
    
    // Confetti Explosion!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
  } else {
    title.textContent = "Sigue Practicando";
    emoji.textContent = "🎒";
  }

  // Details
  const posBlock = document.getElementById('feedback-positive');
  const impBlock = document.getElementById('feedback-improvements');
  posBlock.innerHTML = '';
  impBlock.innerHTML = '';

  const missing = getMissingEssentials();
  if (missing.length > 0) {
    impBlock.innerHTML = `<h4>⚠️ Te faltó lo vital:</h4><ul>${missing.map(m => `<li>${m.name}</li>`).join('')}</ul>`;
  } else {
    posBlock.innerHTML = `<h4>✅ ¡Excelente criterio!</h4><p>Llevaste todo lo indispensable.</p>`;
  }
}