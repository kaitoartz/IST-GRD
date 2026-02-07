// Daily Challenge System
// Generates a consistent daily scenario based on the current date

export class DailyChallenge {
  static KEY_LEADERBOARD = 'ist_grd_daily_leaderboard';
  static KEY_HISTORY = 'ist_grd_daily_history';
  
  // Get today's date string (YYYY-MM-DD)
  static getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  
  // Simple hash function for seed generation
  static hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  // Seeded random number generator (0-1)
  static seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }
  
  // Get today's challenge configuration
  static getTodayChallenge(scenarios) {
    const today = this.getTodayString();
    const seed = this.hashString(today);
    
    // Use seed to select scenario
    const scenarioIndex = Math.floor(this.seededRandom(seed) * scenarios.length);
    const scenario = scenarios[scenarioIndex];
    
    // Generate a unique challenge variant
    return {
      date: today,
      scenario: scenario,
      seed: seed,
      description: `Desafío del ${this.formatDate(today)}`
    };
  }
  
  // Format date for display (DD/MM/YYYY)
  static formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }
  
  // Get daily leaderboard for a specific date
  static getDailyLeaderboard(date = null) {
    const targetDate = date || this.getTodayString();
    const allData = this.getAllLeaderboards();
    return allData[targetDate] || [];
  }
  
  // Get all daily leaderboards
  static getAllLeaderboards() {
    const data = localStorage.getItem(this.KEY_LEADERBOARD);
    return data ? JSON.parse(data) : {};
  }
  
  // Save score to today's leaderboard
  static saveDailyScore(name, score) {
    const today = this.getTodayString();
    const allData = this.getAllLeaderboards();
    
    if (!allData[today]) {
      allData[today] = [];
    }
    
    allData[today].push({
      name: name.trim() || 'Anónimo',
      score: score,
      timestamp: new Date().toISOString()
    });
    
    // Sort by score descending and keep top 10
    allData[today].sort((a, b) => b.score - a.score);
    allData[today] = allData[today].slice(0, 10);
    
    // Clean old data (keep last 30 days)
    this.cleanOldData(allData);
    
    localStorage.setItem(this.KEY_LEADERBOARD, JSON.stringify(allData));
    return allData[today];
  }
  
  // Check if score is a top 10 for today
  static isTopScore(score) {
    if (score <= 0) return false;
    const todayBoard = this.getDailyLeaderboard();
    if (todayBoard.length < 10) return true;
    return score > todayBoard[todayBoard.length - 1].score;
  }
  
  // Track daily participation
  static markDayPlayed() {
    const today = this.getTodayString();
    const history = this.getHistory();
    
    if (!history.includes(today)) {
      history.push(today);
      // Keep last 60 days
      if (history.length > 60) {
        history.shift();
      }
      localStorage.setItem(this.KEY_HISTORY, JSON.stringify(history));
    }
  }
  
  // Get play history
  static getHistory() {
    const data = localStorage.getItem(this.KEY_HISTORY);
    return data ? JSON.parse(data) : [];
  }
  
  // Get current streak
  static getStreak() {
    const history = this.getHistory();
    if (history.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    // Check from today backwards
    for (let daysAgo = 0; daysAgo <= 60; daysAgo++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - daysAgo);
      const dateStr = this.formatDateString(checkDate);
      
      if (history.includes(dateStr)) {
        streak++;
      } else if (daysAgo > 0) {
        // Break streak if we find a missed day (skip today itself)
        break;
      }
    }
    
    return streak;
  }
  
  // Helper to format date string consistently
  static formatDateString(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  
  // Clean data older than 30 days
  static cleanOldData(allData) {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const cutoffDate = this.formatDateString(thirtyDaysAgo);
    
    Object.keys(allData).forEach(date => {
      if (date < cutoffDate) {
        delete allData[date];
      }
    });
  }
  
  // Get stats summary
  static getStats() {
    const history = this.getHistory();
    const today = this.getTodayString();
    const todayBoard = this.getDailyLeaderboard();
    
    return {
      totalDaysPlayed: history.length,
      currentStreak: this.getStreak(),
      playedToday: history.includes(today),
      todayRank: this.getTodayRank(),
      todayTopScore: todayBoard.length > 0 ? todayBoard[0].score : 0
    };
  }
  
  // Get user's rank for today (if they played)
  static getTodayRank() {
    // This would need the user's score to be stored
    // For now, return null
    return null;
  }
}
