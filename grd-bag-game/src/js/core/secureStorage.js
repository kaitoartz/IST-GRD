// Secure Storage Module
// Provides safe localStorage operations with validation and error handling

export class SecureStorage {
  // Maximum size for any single storage item (5MB)
  static MAX_ITEM_SIZE = 5 * 1024 * 1024;
  
  // Check if localStorage is available
  static isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  // Safely set item with validation
  static setItem(key, value) {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available');
      return false;
    }
    
    try {
      // Validate key
      if (!key || typeof key !== 'string') {
        throw new Error('Invalid key');
      }
      
      // Convert value to JSON string
      const serialized = JSON.stringify(value);
      
      // Check size
      if (serialized.length > this.MAX_ITEM_SIZE) {
        throw new Error('Data exceeds maximum size');
      }
      
      // Add checksum for integrity
      const data = {
        value: value,
        checksum: this.generateChecksum(serialized),
        timestamp: Date.now()
      };
      
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      return false;
    }
  }
  
  // Safely get item with validation
  static getItem(key, defaultValue = null) {
    if (!this.isAvailable()) {
      return defaultValue;
    }
    
    try {
      const raw = localStorage.getItem(key);
      
      if (!raw) {
        return defaultValue;
      }
      
      const data = JSON.parse(raw);
      
      // Validate structure
      if (!data || typeof data !== 'object' || !('value' in data)) {
        // Old format without checksum - migrate it
        return JSON.parse(raw);
      }
      
      // Verify checksum if present
      if (data.checksum) {
        const expectedChecksum = this.generateChecksum(JSON.stringify(data.value));
        if (data.checksum !== expectedChecksum) {
          console.warn('Data integrity check failed for:', key);
          return defaultValue;
        }
      }
      
      return data.value;
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return defaultValue;
    }
  }
  
  // Remove item
  static removeItem(key) {
    if (!this.isAvailable()) {
      return false;
    }
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Error removing from localStorage:', e);
      return false;
    }
  }
  
  // Clear all items with a prefix
  static clearByPrefix(prefix) {
    if (!this.isAvailable()) {
      return false;
    }
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (e) {
      console.error('Error clearing localStorage:', e);
      return false;
    }
  }
  
  // Get storage usage information
  static getUsageInfo() {
    if (!this.isAvailable()) {
      return { used: 0, available: 0, percentage: 0 };
    }
    
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }
      
      // Approximate available space (most browsers have 5-10MB limit)
      const available = 10 * 1024 * 1024;
      const percentage = Math.round((used / available) * 100);
      
      return {
        used: used,
        available: available,
        percentage: percentage
      };
    } catch (e) {
      console.error('Error calculating storage usage:', e);
      return { used: 0, available: 0, percentage: 0 };
    }
  }
  
  // Generate simple checksum for data integrity
  static generateChecksum(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }
  
  // Backup all data
  static exportBackup() {
    if (!this.isAvailable()) {
      return null;
    }
    
    try {
      const backup = {};
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith('ist_grd_')) {
          backup[key] = this.getItem(key);
        }
      });
      
      return {
        version: '1.0',
        timestamp: Date.now(),
        data: backup
      };
    } catch (e) {
      console.error('Error creating backup:', e);
      return null;
    }
  }
  
  // Restore from backup
  static importBackup(backup) {
    if (!this.isAvailable() || !backup || !backup.data) {
      return false;
    }
    
    try {
      Object.entries(backup.data).forEach(([key, value]) => {
        this.setItem(key, value);
      });
      return true;
    } catch (e) {
      console.error('Error restoring backup:', e);
      return false;
    }
  }
  
  // Sanitize score input
  static sanitizeScore(score) {
    const num = parseInt(score, 10);
    if (isNaN(num) || num < 0) {
      return 0;
    }
    // Cap at reasonable maximum
    return Math.min(num, 999999);
  }
  
  // Sanitize name input - comprehensive XSS protection
  static sanitizeName(name) {
    if (!name || typeof name !== 'string') {
      return 'Anónimo';
    }
    
    // Create a temporary element to leverage browser's HTML parsing
    const temp = document.createElement('div');
    temp.textContent = name; // This escapes HTML entities automatically
    const safe = temp.innerHTML;
    
    // Additional cleanup: remove any remaining special characters
    const cleaned = safe
      .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
      .trim()
      .substring(0, 20);
    
    return cleaned || 'Anónimo';
  }
  
  // Validate date string
  static validateDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}
