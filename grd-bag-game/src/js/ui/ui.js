import { state, CONFIG, Leaderboard } from "../core/state.js";

// --- Sound System ---
const audio = {
  pop: document.getElementById("sfx-pop"),
  error: document.getElementById("sfx-error"),
  success: document.getElementById("sfx-success"),
  tick: document.getElementById("sfx-tick"),
};

export function playSound(name) {
  if (audio[name]) {
    audio[name].currentTime = 0;
    audio[name].play().catch((e) => console.log("Audio play blocked", e));
  }
}

// --- DOM Cache ---
const screens = {
  intro: document.getElementById("screen-intro"),
  game: document.getElementById("screen-game"),
  results: document.getElementById("screen-results"),
  briefing: document.getElementById("screen-briefing"),
  debrief: document.getElementById("screen-debrief"),
  pause: document.getElementById("screen-pause"),
  dailyChallenge: document.getElementById("screen-daily-challenge"),
  tipsAlbum: document.getElementById("screen-tips-album"),
  stats: document.getElementById("screen-stats"),
};

const toast = {
  el: document.getElementById("feedback-toast"),
  title: document.querySelector(".toast-title"),
  msg: document.querySelector(".toast-msg"),
  timeout: null,
};

// --- Screen Transitions ---
export function showScreen(screenName) {
  Object.values(screens).forEach((s) => {
    if (s && s.id !== `screen-${screenName}`) {
      // Pause is an overlay, don't hide game behind it?
      // Actually pause screen has opaque background, so it covers game.
      // Briefing covers game. Debrief covers game.
      // So we can hide others or stack them.
      // "Standard" way: Hide others.
      if (screenName === "pause" && s.id === "screen-game") return; // Don't hide game for pause

      s.classList.add("hidden");
      s.classList.remove("active");
    }
  });

  if (screens[screenName]) {
    screens[screenName].classList.remove("hidden");
    // Small delay for CSS transition
    setTimeout(() => screens[screenName].classList.add("active"), 10);
  }

  // Handle dynamic themes based on scenario
  if (screenName === "game" && state.currentScenario) {
    // Remove previous scenario classes
    document.body.className = document.body.className
      .replace(/sc-\w+/g, "")
      .trim();
    document.body.classList.add(`sc-${state.currentScenario.id}`);
  } else if (screenName === "intro" || screenName === "results") {
    document.body.className = document.body.className
      .replace(/sc-\w+/g, "")
      .trim();
  }

  // Auto-render leaderboard when going to intro
  if (screenName === "intro") {
    renderLeaderboard();
  }
}

export function hideOverlay(screenName) {
  if (screens[screenName]) {
    screens[screenName].classList.remove("active");
    setTimeout(() => screens[screenName].classList.add("hidden"), 300);
  }
}

// --- HUD Updates ---

export function updateBriefing(taskText, timeLeft) {
  const taskEl = document.getElementById("briefing-task");
  const timerEl = document.getElementById("briefing-timer");
  const scenario = state.currentScenario;
  if (taskEl) {
    if (scenario) {
      let briefingHTML = `${scenario.icon} PREPÁRATE PARA:<br><span style="color:var(--primary); font-size: 2.5rem;">${scenario.name.toUpperCase()}</span>`;

      // Add context narrative
      if (scenario.contextNarrative) {
        briefingHTML += `<br><div style="font-size: 1rem; margin-top: 1rem; opacity: 0.9; max-width: 600px; margin-left: auto; margin-right: auto;">${scenario.contextNarrative}</div>`;
      }

      taskEl.innerHTML = briefingHTML;
    } else {
      taskEl.textContent = taskText || "¡PREPÁRATE!";
    }
  }
  if (timerEl) timerEl.textContent = timeLeft;
}

export function updateDebrief(result) {
  const textEl = document.getElementById("debrief-text");
  const iconEl = document.getElementById("debrief-icon");
  const infoEl = document.getElementById("debrief-info");

  if (result.passed) {
    textEl.textContent = result.message || "¡MUY BIEN!";
    textEl.style.color = "var(--success)";
    iconEl.textContent = result.essentialsCount === 8 ? "🏆" : "✅";

    let infoHTML = `+${result.scoreAdded} Puntos`;

    // Add balanced bag bonus message
    if (result.balancedBonus) {
      infoHTML += `<br><span style="color: var(--accent-light); font-size: 0.9rem;">🎯 ¡Bolso Equilibrado! +${CONFIG.POINTS.BALANCED_BAG_BONUS} pts</span>`;
    }

    infoEl.innerHTML = infoHTML;
    playSound("success");
  } else {
    textEl.textContent = "¡CUIDADO!";
    textEl.style.color = "var(--danger)";
    iconEl.textContent = "⚠️";
    infoEl.textContent = `Necesitabas ${result.minToPass} vitales (tuviste ${result.essentialsCount})`;
    playSound("error");
  }
}

// --- Timer FX ---
export function pulseTimer() {
  const timerBox = document.getElementById("timer-display");
  if (!timerBox) return;
  timerBox.classList.add("timer-boost");
  setTimeout(() => timerBox.classList.remove("timer-boost"), 700);
}

export function shakeTimer() {
  const timerBox = document.getElementById("timer-display");
  if (!timerBox) return;
  timerBox.classList.add("timer-shake");
  setTimeout(() => timerBox.classList.remove("timer-shake"), 600);
}

export function showFeedback(title, message, type = "info") {
  if (toast.timeout) clearTimeout(toast.timeout);

  if (toast.el) {
    toast.el.className = `toast ${type}`;
    if (toast.title) toast.title.textContent = title;
    if (toast.msg) toast.msg.textContent = message;

    toast.el.classList.remove("hidden");

    toast.timeout = setTimeout(() => {
      toast.el.classList.add("hidden");
    }, 4000); // 4s to read feedback
  }
}

export function updateHUD() {
  // Scenario
  const scenarioPill = document.getElementById("scenario-pill");
  if (scenarioPill && state.currentScenario) {
    scenarioPill.textContent = state.currentScenario.name.toUpperCase();
  }

  // Context Narrative
  const contextNarrative = document.getElementById("context-narrative");
  if (
    contextNarrative &&
    state.currentScenario &&
    state.currentScenario.contextNarrative
  ) {
    contextNarrative.textContent = state.currentScenario.contextNarrative;
    contextNarrative.style.display = "block";
  } else if (contextNarrative) {
    contextNarrative.style.display = "none";
  }

  // Level
  const levelVal = document.getElementById("level-val");
  if (levelVal) levelVal.textContent = state.level;

  // Timer
  const timerVal = document.getElementById("time-val");
  const timerBox = document.getElementById("timer-display");

  // Hide timer in learning mode
  if (state.mode === "learning") {
    if (timerBox) {
      timerBox.style.display = "none";
    }
  } else {
    if (timerBox) {
      timerBox.style.display = "flex";
    }
    if (timerVal) {
      timerVal.textContent = state.timeLeft;
      if (state.timeLeft <= 5) {
        timerBox.classList.add("urgent");
        // Efecto de vibración si es muy poco tiempo
        if (state.timeLeft <= 3) {
          timerBox.style.transform = `translate(${(Math.random() - 0.5) * 5}px, ${(Math.random() - 0.5) * 5}px)`;
        } else {
          timerBox.style.transform = "none";
        }
      } else {
        timerBox.classList.remove("urgent");
        timerBox.style.transform = "none";
      }
    }
  }

  // Lives (only in challenge)
  const livesContainer = document.getElementById("lives-container");
  if (state.mode === "challenge") {
    livesContainer.classList.remove("hidden");
    const hearts = livesContainer.querySelectorAll(".life-heart");
    hearts.forEach((h, idx) => {
      if (idx < state.lives) h.classList.remove("lost");
      else h.classList.add("lost");
    });
  } else {
    livesContainer.classList.add("hidden");
  }

  // Show learning mode indicator
  const levelPill = document.getElementById("level-pill");
  if (levelPill && state.mode === "learning") {
    levelPill.innerHTML = `<span style="color: var(--accent-light);">📚 APRENDIZAJE</span> NIVEL <span id="level-val">${state.level}</span>`;
  } else if (levelPill) {
    levelPill.innerHTML = `NIVEL <span id="level-val">${state.level}</span>`;
  }
  
  // Update bag weight and volume displays
  updateBagStats();
}

export function updateBagStats() {
  const bagWeight = state.bag.reduce((total, itemId) => {
    const item = state.items.find(i => i.id === itemId);
    return total + (item?.weight || 0);
  }, 0);
  
  const bagVolume = state.bag.reduce((total, itemId) => {
    const item = state.items.find(i => i.id === itemId);
    return total + (item?.volume || 0);
  }, 0);
  
  const weightEl = document.getElementById("bag-weight");
  const volumeEl = document.getElementById("bag-volume");
  
  if (weightEl) {
    weightEl.textContent = bagWeight.toFixed(1);
    // Highlight if approaching limit
    const statsContainer = weightEl.closest('.stat-item');
    if (statsContainer) {
      if (bagWeight > CONFIG.MAX_WEIGHT * 0.9) {
        statsContainer.style.color = 'var(--danger)';
      } else if (bagWeight > CONFIG.MAX_WEIGHT * 0.75) {
        statsContainer.style.color = 'var(--warning)';
      } else {
        statsContainer.style.color = '';
      }
    }
  }
  
  if (volumeEl) {
    volumeEl.textContent = bagVolume.toFixed(1);
    // Highlight if approaching limit
    const statsContainer = volumeEl.closest('.stat-item');
    if (statsContainer) {
      if (bagVolume > CONFIG.MAX_VOLUME * 0.9) {
        statsContainer.style.color = 'var(--danger)';
      } else if (bagVolume > CONFIG.MAX_VOLUME * 0.75) {
        statsContainer.style.color = 'var(--warning)';
      } else {
        statsContainer.style.color = '';
      }
    }
  }
}

// --- Rendering ---

export function renderTray(items) {
  const trayList = document.getElementById("tray-list");
  trayList.innerHTML = "";

  const scenario = state.currentScenario;

  items.forEach((item) => {
    const el = document.createElement("div");
    el.className = "item-card";
    el.dataset.id = item.id;

    // Dynamic category based on scenario for color coding
    let category = "N";
    if (scenario) {
      if (
        scenario.essentialItems &&
        scenario.essentialItems.includes(item.id)
      ) {
        category = "E";
      } else if (
        scenario.recommendedItems &&
        scenario.recommendedItems.includes(item.id)
      ) {
        category = "R";
      } else if (
        scenario.forbiddenItems &&
        scenario.forbiddenItems.includes(item.id)
      ) {
        category = "N";
      }
    }

    el.dataset.category = category;

    el.tabIndex = 0;
    el.role = "button";
    el.ariaLabel = `Añadir ${item.name} a la mochila`;

    // Ghost effect if in bag
    if (state.bag.includes(item.id)) {
      el.style.opacity = "0.4";
      el.style.filter = "grayscale(1)";
      el.style.pointerEvents = "none";
      el.tabIndex = -1;
      el.ariaDisabled = "true";
    }

    // Special styling for time bonus item
    const isTimeBonus = item.id === "time_extra";
    if (isTimeBonus) {
      el.classList.add("item-time-bonus");
      el.dataset.category = "T";
    }

    el.innerHTML = `
      <img src="${item.icon}" alt="" class="item-icon" aria-hidden="true" loading="lazy">
      <div class="item-name">${item.name}</div>
      ${isTimeBonus ? '<span class="item-tag">+TIEMPO</span>' : ""}
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
    document.getElementById("leaderboard-intro"),
    document.getElementById("leaderboard-results"),
  ];

  lists.forEach((list) => {
    if (!list) return;
    list.innerHTML =
      scores.length > 0
        ? scores
            .map(
              (s, i) => `
          <li class="score-item">
            <span class="name">${i + 1}. ${s.name}</span>
            <span class="value">${s.score}</span>
          </li>
        `,
            )
            .join("")
        : '<li class="score-item" style="justify-content: center;">Sin puntajes aún</li>';
  });
}

// --- Results Visualization ---
export function renderFinalResults() {
  const scoreEl = document.getElementById("final-score");
  scoreEl.textContent = state.score;

  const emoji = document.getElementById("result-emoji");
  const title = document.getElementById("result-title");

  if (state.mode === "tutorial") {
    title.textContent = "¡Entrenamiento Completo!";
    emoji.textContent = "🎓";
  } else {
    title.textContent = "Fin del Juego";
    emoji.textContent = "🏁";
  }

  // High score logic
  const form = document.getElementById("high-score-form");
  if (state.mode === "challenge" && Leaderboard.isHighScore(state.score)) {
    form.classList.remove("hidden");
  } else {
    form.classList.add("hidden");
  }

  renderLeaderboard();
}

// --- Micro feedback ---
function createFloatingFeedback(message, variant = "score-pos", originRect) {
  const el = document.createElement("div");
  el.className = `floating-feedback ${variant}`;
  el.textContent = message;
  document.body.appendChild(el);

  const startX = originRect
    ? originRect.left + originRect.width / 2
    : window.innerWidth / 2;
  const startY = originRect
    ? originRect.top + originRect.height / 2
    : window.innerHeight / 2;

  el.style.left = `${startX}px`;
  el.style.top = `${startY}px`;

  if (typeof anime !== "undefined") {
    anime({
      targets: el,
      translateY: -40,
      opacity: [1, 0],
      scale: [0.95, 1.1],
      easing: "easeOutCubic",
      duration: 900,
      complete: () => el.remove(),
    });
  } else {
    setTimeout(() => el.remove(), 900);
  }
}

export function showScorePopup(delta, originRect, category) {
  const sign = delta > 0 ? "+" : "";
  const variant = delta < 0 ? "score-neg" : "score-pos";
  const label =
    category === "E" ? "VITAL" : category === "R" ? "EXTRA" : "LUJO";
  createFloatingFeedback(`${sign}${delta} ${label}`, variant, originRect);
}

export function showTimeBonus(seconds, originRect) {
  createFloatingFeedback(`+${seconds}s`, "time-bonus", originRect);
}

// --- Time Bonus HUD Logic ---
export function setTimeBonusState(active) {
  const btn = document.getElementById("time-bonus-btn");
  if (!btn) return;

  if (active) {
    btn.classList.remove("inactive");
    btn.classList.add("active");
  } else {
    btn.classList.add("inactive");
    btn.classList.remove("active");
  }
}

export function animateTimeBonusClick() {
  const btn = document.getElementById("time-bonus-btn");
  if (!btn) return;

  btn.classList.add("bubble-pop");
  setTimeout(() => btn.classList.remove("bubble-pop"), 400);
}

// --- Daily Challenge UI ---
export function renderDailyChallengeScreen(challenge, stats) {
  const dateEl = document.getElementById("daily-date");
  const scenarioEl = document.getElementById("daily-scenario-info");
  const streakEl = document.getElementById("daily-streak");
  const totalEl = document.getElementById("daily-total");
  const leaderboardEl = document.getElementById("daily-leaderboard-list");
  
  if (dateEl) {
    dateEl.textContent = challenge.description;
  }
  
  if (scenarioEl && challenge.scenario) {
    // Use textContent to prevent XSS
    scenarioEl.innerHTML = ''; // Clear first
    const iconDiv = document.createElement('div');
    iconDiv.style.fontSize = '2rem';
    iconDiv.style.marginBottom = 'var(--space-2)';
    iconDiv.textContent = challenge.scenario.icon;
    
    const nameHeading = document.createElement('h3');
    nameHeading.textContent = challenge.scenario.name;
    
    const descPara = document.createElement('p');
    descPara.style.marginTop = 'var(--space-2)';
    descPara.textContent = challenge.scenario.contextNarrative || challenge.scenario.description;
    
    scenarioEl.appendChild(iconDiv);
    scenarioEl.appendChild(nameHeading);
    scenarioEl.appendChild(descPara);
  }
  
  if (streakEl) {
    streakEl.textContent = stats.currentStreak;
  }
  
  if (totalEl) {
    totalEl.textContent = stats.totalDaysPlayed;
  }
  
  if (leaderboardEl) {
    renderDailyLeaderboard(leaderboardEl, challenge.date);
  }
}

export function renderDailyLeaderboard(listEl, date = null) {
  // This will be imported from dailyChallenge in main.js
  // For now, just render an empty state
  listEl.innerHTML = '<li style="text-align: center; padding: var(--space-4); opacity: 0.6;">Sé el primero en jugar hoy</li>';
}

// --- Tips Album UI ---
export function renderTipsAlbum(tips, progress) {
  const progressBar = document.getElementById('tips-progress-bar');
  const progressText = document.getElementById('tips-progress-text');
  const tipsGrid = document.getElementById('tips-grid');
  
  // Update progress
  if (progressBar) {
    progressBar.style.width = `${progress.percentage}%`;
  }
  
  if (progressText) {
    progressText.textContent = `${progress.unlocked}/${progress.total} Desbloqueados (${progress.percentage}%)`;
  }
  
  // Render tips grid
  if (tipsGrid) {
    renderTipsGrid(tips, 'all');
  }
  
  // Setup filter buttons
  setupTipsFilters(tips);
}

function renderTipsGrid(tips, filterCategory = 'all') {
  const tipsGrid = document.getElementById('tips-grid');
  if (!tipsGrid) return;
  
  const filteredTips = filterCategory === 'all' 
    ? tips 
    : tips.filter(tip => tip.category === filterCategory);
  
  tipsGrid.innerHTML = filteredTips.map(tip => `
    <div class="tip-card ${tip.isUnlocked ? '' : 'locked'}">
      <div class="tip-icon">${tip.icon}</div>
      <div class="tip-title">${tip.title}</div>
      <div class="tip-content">${tip.isUnlocked ? tip.content : 'Sigue jugando para desbloquear este tip'}</div>
    </div>
  `).join('');
}

function setupTipsFilters(tips) {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterButtons.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      btn.classList.add('active');
      
      // Filter tips
      const category = btn.dataset.category;
      renderTipsGrid(tips, category);
    });
  });
}

export function showTipUnlockedNotification(tip) {
  showFeedback('🎉 Nuevo Tip Desbloqueado!', tip.title, 'success');
}

// --- Statistics UI ---
export function renderStats(overallStats, topItems, scenarioStats, scoreDistribution, itemsMap) {
  // Update overview
  document.getElementById('stat-total-games').textContent = overallStats.totalGames || 0;
  document.getElementById('stat-completion-rate').textContent = `${overallStats.overallCompletionRate || 0}%`;
  document.getElementById('stat-items-selected').textContent = overallStats.totalItemSelections || 0;
  
  // Render top items
  const topItemsList = document.getElementById('top-items-list');
  if (topItemsList && topItems.length > 0) {
    topItemsList.innerHTML = topItems.map((item, idx) => {
      const itemData = itemsMap[item.itemId];
      const itemName = itemData ? itemData.name : item.itemId;
      return `
        <div class="stats-item">
          <span class="stats-item-name">#${idx + 1} ${itemName}</span>
          <span class="stats-item-value">${item.totalSelections}</span>
        </div>
      `;
    }).join('');
  } else if (topItemsList) {
    topItemsList.innerHTML = '<p style="text-align: center; opacity: 0.6;">No hay datos todavía</p>';
  }
  
  // Render scenario stats
  const scenarioStatsList = document.getElementById('scenario-stats-list');
  if (scenarioStatsList && Object.keys(scenarioStats).length > 0) {
    scenarioStatsList.innerHTML = Object.entries(scenarioStats).map(([id, stats]) => {
      const completionRate = stats.totalAttempts > 0 
        ? Math.round((stats.completions / stats.totalAttempts) * 100)
        : 0;
      return `
        <div class="stats-item">
          <div>
            <div class="stats-item-name">${id.charAt(0).toUpperCase() + id.slice(1)}</div>
            <div style="font-size: var(--text-xs); color: var(--text-light);">
              ${stats.completions}/${stats.totalAttempts} completados
            </div>
          </div>
          <span class="stats-item-value">${completionRate}%</span>
        </div>
      `;
    }).join('');
  } else if (scenarioStatsList) {
    scenarioStatsList.innerHTML = '<p style="text-align: center; opacity: 0.6;">No hay datos todavía</p>';
  }
  
  // Render score distribution
  const scoreChart = document.getElementById('score-distribution-chart');
  if (scoreChart && Object.keys(scoreDistribution).length > 0) {
    const maxCount = Math.max(...Object.values(scoreDistribution).map(d => d.count));
    scoreChart.innerHTML = Object.entries(scoreDistribution)
      .sort((a, b) => {
        const order = ['negative', '0-99', '100-299', '300-499', '500-999', '1000-1999', '2000-2999', '3000+'];
        return order.indexOf(a[0]) - order.indexOf(b[0]);
      })
      .map(([range, data]) => {
        const percentage = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
        return `
          <div class="chart-bar">
            <div class="chart-label">${range}</div>
            <div class="chart-bar-fill" style="width: ${percentage}%;">
              ${data.count} partidas
            </div>
          </div>
        `;
      }).join('');
  } else if (scoreChart) {
    scoreChart.innerHTML = '<p style="text-align: center; opacity: 0.6;">No hay datos todavía</p>';
  }
}


