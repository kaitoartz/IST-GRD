// Tips Album System
// Manages unlockable educational tips based on gameplay

export class TipsAlbum {
  static KEY_UNLOCKED = 'ist_grd_tips_unlocked';
  static KEY_STATS = 'ist_grd_tips_stats';
  
  static allTips = []; // Will be loaded from tips.json
  
  // Initialize tips from JSON
  static init(tipsData) {
    this.allTips = tipsData;
  }
  
  // Get unlocked tip IDs
  static getUnlockedTips() {
    const data = localStorage.getItem(this.KEY_UNLOCKED);
    return data ? JSON.parse(data) : [];
  }
  
  // Get gameplay stats for unlock conditions
  static getStats() {
    const data = localStorage.getItem(this.KEY_STATS);
    return data ? JSON.parse(data) : {
      gamesPlayed: 0,
      itemsSelected: 0,
      scenariosCompleted: 0,
      scenariosPlayed: {},
      highestScore: 0,
      overweightErrors: 0,
      overvolumeErrors: 0,
      perfectBags: 0,
      dailyStreak: 0
    };
  }
  
  // Save stats
  static saveStats(stats) {
    localStorage.setItem(this.KEY_STATS, JSON.stringify(stats));
  }
  
  // Update stats after gameplay
  static updateStats(updates) {
    const stats = this.getStats();
    
    // Merge updates
    Object.keys(updates).forEach(key => {
      if (key === 'scenariosPlayed') {
        // Special handling for scenarios played
        stats.scenariosPlayed = {
          ...stats.scenariosPlayed,
          ...updates.scenariosPlayed
        };
      } else if (typeof updates[key] === 'number') {
        stats[key] = (stats[key] || 0) + updates[key];
      } else {
        stats[key] = updates[key];
      }
    });
    
    this.saveStats(stats);
    
    // Check for newly unlocked tips
    return this.checkUnlocks(stats);
  }
  
  // Check which tips should be unlocked based on current stats
  static checkUnlocks(stats) {
    const unlocked = this.getUnlockedTips();
    const newlyUnlocked = [];
    
    this.allTips.forEach(tip => {
      // Skip if already unlocked
      if (unlocked.includes(tip.id)) return;
      
      let shouldUnlock = false;
      
      switch (tip.unlockCondition) {
        case 'games_played':
          shouldUnlock = stats.gamesPlayed >= tip.unlockValue;
          break;
        case 'items_selected':
          shouldUnlock = stats.itemsSelected >= tip.unlockValue;
          break;
        case 'scenarios_completed':
          shouldUnlock = stats.scenariosCompleted >= tip.unlockValue;
          break;
        case 'score_reached':
          shouldUnlock = stats.highestScore >= tip.unlockValue;
          break;
        case 'overweight_errors':
          shouldUnlock = stats.overweightErrors >= tip.unlockValue;
          break;
        case 'overvolume_errors':
          shouldUnlock = stats.overvolumeErrors >= tip.unlockValue;
          break;
        case 'perfect_bags':
          shouldUnlock = stats.perfectBags >= tip.unlockValue;
          break;
        case 'daily_streak':
          shouldUnlock = stats.dailyStreak >= tip.unlockValue;
          break;
        case 'scenario_played':
          shouldUnlock = stats.scenariosPlayed[tip.unlockValue] === true;
          break;
      }
      
      if (shouldUnlock) {
        unlocked.push(tip.id);
        newlyUnlocked.push(tip);
      }
    });
    
    // Save updated unlocked list
    localStorage.setItem(this.KEY_UNLOCKED, JSON.stringify(unlocked));
    
    return newlyUnlocked;
  }
  
  // Get all tips with unlock status
  static getAllTipsWithStatus() {
    const unlocked = this.getUnlockedTips();
    
    return this.allTips.map(tip => ({
      ...tip,
      isUnlocked: unlocked.includes(tip.id)
    }));
  }
  
  // Get tips by category
  static getTipsByCategory(category) {
    return this.getAllTipsWithStatus().filter(tip => tip.category === category);
  }
  
  // Get progress stats
  static getProgress() {
    const unlocked = this.getUnlockedTips();
    const total = this.allTips.length;
    const percentage = total > 0 ? Math.round((unlocked.length / total) * 100) : 0;
    
    return {
      unlocked: unlocked.length,
      total: total,
      percentage: percentage
    };
  }
  
  // Track an item selection
  static trackItemSelection() {
    this.updateStats({ itemsSelected: 1 });
  }
  
  // Track game completion
  static trackGameComplete(scenario, score, isPerfect) {
    const updates = {
      gamesPlayed: 1,
      scenariosCompleted: 1,
      scenariosPlayed: {
        [scenario]: true
      }
    };
    
    if (score > this.getStats().highestScore) {
      updates.highestScore = score;
    }
    
    if (isPerfect) {
      updates.perfectBags = 1;
    }
    
    return this.updateStats(updates);
  }
  
  // Track weight/volume errors
  static trackWeightError() {
    this.updateStats({ overweightErrors: 1 });
  }
  
  static trackVolumeError() {
    this.updateStats({ overvolumeErrors: 1 });
  }
  
  // Get categories for filtering
  static getCategories() {
    const categories = new Set();
    this.allTips.forEach(tip => categories.add(tip.category));
    return Array.from(categories);
  }
}
