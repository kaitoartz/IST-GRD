// Basic Telemetry System
// Tracks gameplay statistics for balancing and analytics

export class Telemetry {
  static KEY_ITEM_STATS = 'ist_grd_telemetry_items';
  static KEY_SCENARIO_STATS = 'ist_grd_telemetry_scenarios';
  static KEY_SCORE_DISTRIBUTION = 'ist_grd_telemetry_scores';
  static KEY_SESSION_DATA = 'ist_grd_telemetry_session';
  
  // Track item selection
  static trackItemSelection(itemId, scenario, isEssential, wasSuccessful) {
    const stats = this.getItemStats();
    
    if (!stats[itemId]) {
      stats[itemId] = {
        totalSelections: 0,
        successfulSelections: 0,
        essentialSelections: 0,
        byScenario: {}
      };
    }
    
    stats[itemId].totalSelections++;
    if (wasSuccessful) stats[itemId].successfulSelections++;
    if (isEssential) stats[itemId].essentialSelections++;
    
    // Track per scenario
    if (scenario) {
      if (!stats[itemId].byScenario[scenario]) {
        stats[itemId].byScenario[scenario] = 0;
      }
      stats[itemId].byScenario[scenario]++;
    }
    
    localStorage.setItem(this.KEY_ITEM_STATS, JSON.stringify(stats));
  }
  
  // Get item statistics
  static getItemStats() {
    const data = localStorage.getItem(this.KEY_ITEM_STATS);
    return data ? JSON.parse(data) : {};
  }
  
  // Get most selected items
  static getMostSelectedItems(limit = 10) {
    const stats = this.getItemStats();
    return Object.entries(stats)
      .map(([id, data]) => ({ itemId: id, ...data }))
      .sort((a, b) => b.totalSelections - a.totalSelections)
      .slice(0, limit);
  }
  
  // Track scenario completion
  static trackScenarioCompletion(scenarioId, passed, score, essentialsCollected, totalTime) {
    const stats = this.getScenarioStats();
    
    if (!stats[scenarioId]) {
      stats[scenarioId] = {
        totalAttempts: 0,
        completions: 0,
        failures: 0,
        totalScore: 0,
        averageScore: 0,
        averageEssentials: 0,
        averageTime: 0,
        bestScore: 0
      };
    }
    
    const scenario = stats[scenarioId];
    scenario.totalAttempts++;
    
    if (passed) {
      scenario.completions++;
    } else {
      scenario.failures++;
    }
    
    scenario.totalScore += score;
    scenario.averageScore = Math.round(scenario.totalScore / scenario.totalAttempts);
    
    // Update averages
    const prevAvgEss = scenario.averageEssentials || 0;
    scenario.averageEssentials = ((prevAvgEss * (scenario.totalAttempts - 1)) + essentialsCollected) / scenario.totalAttempts;
    
    const prevAvgTime = scenario.averageTime || 0;
    scenario.averageTime = ((prevAvgTime * (scenario.totalAttempts - 1)) + totalTime) / scenario.totalAttempts;
    
    if (score > scenario.bestScore) {
      scenario.bestScore = score;
    }
    
    localStorage.setItem(this.KEY_SCENARIO_STATS, JSON.stringify(stats));
  }
  
  // Get scenario statistics
  static getScenarioStats() {
    const data = localStorage.getItem(this.KEY_SCENARIO_STATS);
    return data ? JSON.parse(data) : {};
  }
  
  // Get completion rate for a scenario
  static getCompletionRate(scenarioId) {
    const stats = this.getScenarioStats();
    const scenario = stats[scenarioId];
    
    if (!scenario || scenario.totalAttempts === 0) return 0;
    
    return Math.round((scenario.completions / scenario.totalAttempts) * 100);
  }
  
  // Track score for distribution analysis
  static trackScore(score, mode, level) {
    const distribution = this.getScoreDistribution();
    
    // Group scores in ranges
    const range = this.getScoreRange(score);
    
    if (!distribution[range]) {
      distribution[range] = {
        count: 0,
        totalScore: 0,
        averageScore: 0,
        modes: {},
        levels: {}
      };
    }
    
    const rangeData = distribution[range];
    rangeData.count++;
    rangeData.totalScore += score;
    rangeData.averageScore = Math.round(rangeData.totalScore / rangeData.count);
    
    // Track by mode
    rangeData.modes[mode] = (rangeData.modes[mode] || 0) + 1;
    
    // Track by level
    const levelGroup = this.getLevelGroup(level);
    rangeData.levels[levelGroup] = (rangeData.levels[levelGroup] || 0) + 1;
    
    localStorage.setItem(this.KEY_SCORE_DISTRIBUTION, JSON.stringify(distribution));
  }
  
  // Get score distribution
  static getScoreDistribution() {
    const data = localStorage.getItem(this.KEY_SCORE_DISTRIBUTION);
    return data ? JSON.parse(data) : {};
  }
  
  // Helper: Get score range
  static getScoreRange(score) {
    if (score < 0) return 'negative';
    if (score < 100) return '0-99';
    if (score < 300) return '100-299';
    if (score < 500) return '300-499';
    if (score < 1000) return '500-999';
    if (score < 2000) return '1000-1999';
    if (score < 3000) return '2000-2999';
    return '3000+';
  }
  
  // Helper: Get level group
  static getLevelGroup(level) {
    if (level <= 3) return '1-3';
    if (level <= 6) return '4-6';
    if (level <= 10) return '7-10';
    if (level <= 15) return '11-15';
    return '16+';
  }
  
  // Track session data
  static startSession() {
    const session = {
      startTime: Date.now(),
      gamesPlayed: 0,
      totalScore: 0,
      itemsSelected: 0
    };
    localStorage.setItem(this.KEY_SESSION_DATA, JSON.stringify(session));
  }
  
  static updateSession(updates) {
    const session = this.getSession();
    Object.assign(session, updates);
    localStorage.setItem(this.KEY_SESSION_DATA, JSON.stringify(session));
  }
  
  static getSession() {
    const data = localStorage.getItem(this.KEY_SESSION_DATA);
    return data ? JSON.parse(data) : null;
  }
  
  // Get overall statistics summary
  static getOverallStats() {
    const itemStats = this.getItemStats();
    const scenarioStats = this.getScenarioStats();
    const scoreDistribution = this.getScoreDistribution();
    
    const totalItemSelections = Object.values(itemStats)
      .reduce((sum, item) => sum + item.totalSelections, 0);
    
    const totalAttempts = Object.values(scenarioStats)
      .reduce((sum, scenario) => sum + scenario.totalAttempts, 0);
    
    const totalCompletions = Object.values(scenarioStats)
      .reduce((sum, scenario) => sum + scenario.completions, 0);
    
    const totalGames = Object.values(scoreDistribution)
      .reduce((sum, range) => sum + range.count, 0);
    
    const overallCompletionRate = totalAttempts > 0 
      ? Math.round((totalCompletions / totalAttempts) * 100)
      : 0;
    
    return {
      totalItemSelections,
      totalAttempts,
      totalCompletions,
      totalGames,
      overallCompletionRate,
      uniqueItemsSelected: Object.keys(itemStats).length,
      scenariosPlayed: Object.keys(scenarioStats).length
    };
  }
  
  // Export all data (for debugging or backup)
  static exportAllData() {
    return {
      itemStats: this.getItemStats(),
      scenarioStats: this.getScenarioStats(),
      scoreDistribution: this.getScoreDistribution(),
      session: this.getSession()
    };
  }
  
  // Clear all telemetry data
  static clearAllData() {
    localStorage.removeItem(this.KEY_ITEM_STATS);
    localStorage.removeItem(this.KEY_SCENARIO_STATS);
    localStorage.removeItem(this.KEY_SCORE_DISTRIBUTION);
    localStorage.removeItem(this.KEY_SESSION_DATA);
  }
}
