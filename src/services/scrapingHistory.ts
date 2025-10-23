/**
 * Enhanced Scraping History Service
 * 
 * This service manages scraping history with localStorage integration,
 * tracking detailed progress, statistics, and session data.
 */

export interface ScrapingSession {
  id: string;
  when: string; // ISO date string
  platform: string;
  type: 'product' | 'category';
  url: string;
  category?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  action: string;
  operationId?: string;
  // Enhanced Product Statistics
  totalProducts?: number;
  scrapedProducts?: number;
  failedProducts?: number;
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
  duration?: number; // milliseconds
  errorMessage?: string;
  retryCount?: number;
  // Additional metadata
  startedAt: string;
  completedAt?: string;
  successRate?: number;
  productData?: any[]; // Store actual scraped product data
  categoryProducts?: {
    [categoryUrl: string]: {
      total: number;
      scraped: number;
      failed: number;
      products: any[];
    };
  };
}

export interface ScrapingStatistics {
  totalSessions: number;
  completedSessions: number;
  failedSessions: number;
  totalProducts: number;
  successfulProducts: number;
  failedProducts: number;
  averageSuccessRate: number;
  totalDuration: number;
  platformStats: {
    [platform: string]: {
      sessions: number;
      products: number;
      successRate: number;
    };
  };
  categoryStats: {
    [category: string]: {
      sessions: number;
      products: number;
      successRate: number;
    };
  };
}

class ScrapingHistoryService {
  private readonly STORAGE_KEY = 'scraping_history';
  private readonly MAX_HISTORY_ITEMS = 1000; // Limit to prevent localStorage overflow

  /**
   * Get all scraping history from localStorage
   */
  getHistory(): ScrapingSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const history = JSON.parse(stored);
      return Array.isArray(history) ? history : [];
    } catch (error) {
      console.error('Error loading scraping history:', error);
      return [];
    }
  }

  /**
   * Save scraping history to localStorage
   */
  private saveHistory(history: ScrapingSession[]): void {
    try {
      // Keep only the most recent items to prevent localStorage overflow
      const limitedHistory = history
        .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
        .slice(0, this.MAX_HISTORY_ITEMS);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving scraping history:', error);
    }
  }

  /**
   * Add a new scraping session
   */
  addSession(sessionData: Partial<ScrapingSession>): string {
    const session: ScrapingSession = {
      id: this.generateId(),
      when: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      status: 'pending',
      action: 'scrape_started',
      retryCount: 0,
      ...sessionData,
    };

    const history = this.getHistory();
    history.unshift(session);
    this.saveHistory(history);
    
    return session.id;
  }

  /**
   * Update an existing scraping session
   */
  updateSession(sessionId: string, updates: Partial<ScrapingSession>): boolean {
    const history = this.getHistory();
    const sessionIndex = history.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) return false;

    const session = history[sessionIndex];
    const updatedSession = {
      ...session,
      ...updates,
      when: updates.when || session.when,
    };

    // Calculate success rate if we have the data
    if (updatedSession.totalProducts && updatedSession.scrapedProducts !== undefined) {
      updatedSession.successRate = updatedSession.totalProducts > 0 
        ? (updatedSession.scrapedProducts / updatedSession.totalProducts) * 100 
        : 0;
    }

    // Calculate duration if session is completed
    if (updatedSession.status === 'completed' || updatedSession.status === 'failed') {
      if (!updatedSession.completedAt) {
        updatedSession.completedAt = new Date().toISOString();
      }
      if (updatedSession.startedAt) {
        updatedSession.duration = new Date(updatedSession.completedAt).getTime() - 
                                 new Date(updatedSession.startedAt).getTime();
      }
    }

    history[sessionIndex] = updatedSession;
    this.saveHistory(history);
    return true;
  }

  /**
   * Update session progress for category-based scraping
   */
  updateCategoryProgress(sessionId: string, categoryUrl: string, progress: {
    total: number;
    scraped: number;
    failed: number;
    products: any[];
  }): boolean {
    const history = this.getHistory();
    const sessionIndex = history.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) return false;

    const session = history[sessionIndex];
    
    // Initialize categoryProducts if not exists
    if (!session.categoryProducts) {
      session.categoryProducts = {};
    }

    // Update category progress
    session.categoryProducts[categoryUrl] = progress;

    // Calculate overall progress
    const totalProducts = Object.values(session.categoryProducts)
      .reduce((sum, cat) => sum + cat.total, 0);
    const scrapedProducts = Object.values(session.categoryProducts)
      .reduce((sum, cat) => sum + cat.scraped, 0);
    const failedProducts = Object.values(session.categoryProducts)
      .reduce((sum, cat) => sum + cat.failed, 0);

    session.totalProducts = totalProducts;
    session.scrapedProducts = scrapedProducts;
    session.failedProducts = failedProducts;
    session.progress = {
      current: scrapedProducts,
      total: totalProducts,
      percentage: totalProducts > 0 ? Math.round((scrapedProducts / totalProducts) * 100) : 0,
    };

    // Update status based on progress
    if (scrapedProducts + failedProducts >= totalProducts) {
      session.status = 'completed';
      session.completedAt = new Date().toISOString();
      if (session.startedAt) {
        session.duration = new Date(session.completedAt).getTime() - 
                          new Date(session.startedAt).getTime();
      }
    } else {
      session.status = 'in_progress';
    }

    history[sessionIndex] = session;
    this.saveHistory(history);
    return true;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): ScrapingSession | null {
    const history = this.getHistory();
    return history.find(s => s.id === sessionId) || null;
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId: string): boolean {
    const history = this.getHistory();
    const filteredHistory = history.filter(s => s.id !== sessionId);
    
    if (filteredHistory.length === history.length) return false;
    
    this.saveHistory(filteredHistory);
    return true;
  }

  /**
   * Clear all history
   */
  clearAllHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get comprehensive statistics
   */
  getStatistics(): ScrapingStatistics {
    const history = this.getHistory();
    
    const stats: ScrapingStatistics = {
      totalSessions: history.length,
      completedSessions: history.filter(s => s.status === 'completed').length,
      failedSessions: history.filter(s => s.status === 'failed').length,
      totalProducts: history.reduce((sum, s) => sum + (s.totalProducts || 0), 0),
      successfulProducts: history.reduce((sum, s) => sum + (s.scrapedProducts || 0), 0),
      failedProducts: history.reduce((sum, s) => sum + (s.failedProducts || 0), 0),
      averageSuccessRate: 0,
      totalDuration: history.reduce((sum, s) => sum + (s.duration || 0), 0),
      platformStats: {},
      categoryStats: {},
    };

    // Calculate average success rate
    if (stats.totalProducts > 0) {
      stats.averageSuccessRate = (stats.successfulProducts / stats.totalProducts) * 100;
    }

    // Calculate platform statistics
    const platformGroups = history.reduce((acc, session) => {
      if (!acc[session.platform]) {
        acc[session.platform] = { sessions: 0, products: 0, successRate: 0 };
      }
      acc[session.platform].sessions++;
      acc[session.platform].products += session.totalProducts || 0;
      return acc;
    }, {} as { [platform: string]: { sessions: number; products: number; successRate: number } });

    Object.keys(platformGroups).forEach(platform => {
      const platformSessions = history.filter(s => s.platform === platform);
      const totalProducts = platformSessions.reduce((sum, s) => sum + (s.totalProducts || 0), 0);
      const successfulProducts = platformSessions.reduce((sum, s) => sum + (s.scrapedProducts || 0), 0);
      
      platformGroups[platform].successRate = totalProducts > 0 
        ? (successfulProducts / totalProducts) * 100 
        : 0;
    });

    stats.platformStats = platformGroups;

    // Calculate category statistics
    const categoryGroups = history.reduce((acc, session) => {
      if (session.category) {
        if (!acc[session.category]) {
          acc[session.category] = { sessions: 0, products: 0, successRate: 0 };
        }
        acc[session.category].sessions++;
        acc[session.category].products += session.totalProducts || 0;
      }
      return acc;
    }, {} as { [category: string]: { sessions: number; products: number; successRate: number } });

    Object.keys(categoryGroups).forEach(category => {
      const categorySessions = history.filter(s => s.category === category);
      const totalProducts = categorySessions.reduce((sum, s) => sum + (s.totalProducts || 0), 0);
      const successfulProducts = categorySessions.reduce((sum, s) => sum + (s.scrapedProducts || 0), 0);
      
      categoryGroups[category].successRate = totalProducts > 0 
        ? (successfulProducts / totalProducts) * 100 
        : 0;
    });

    stats.categoryStats = categoryGroups;

    return stats;
  }

  /**
   * Export history as JSON
   */
  exportHistory(): string {
    const history = this.getHistory();
    return JSON.stringify(history, null, 2);
  }

  /**
   * Import history from JSON
   */
  importHistory(jsonData: string): boolean {
    try {
      const importedHistory = JSON.parse(jsonData);
      if (Array.isArray(importedHistory)) {
        this.saveHistory(importedHistory);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing scraping history:', error);
      return false;
    }
  }

  /**
   * Get sessions by date range
   */
  getSessionsByDateRange(startDate: Date, endDate: Date): ScrapingSession[] {
    const history = this.getHistory();
    return history.filter(session => {
      const sessionDate = new Date(session.when);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  }

  /**
   * Get sessions by platform
   */
  getSessionsByPlatform(platform: string): ScrapingSession[] {
    const history = this.getHistory();
    return history.filter(session => 
      session.platform.toLowerCase() === platform.toLowerCase()
    );
  }

  /**
   * Get sessions by category
   */
  getSessionsByCategory(category: string): ScrapingSession[] {
    const history = this.getHistory();
    return history.filter(session => 
      session.category?.toLowerCase().includes(category.toLowerCase())
    );
  }

  /**
   * Get sessions by status
   */
  getSessionsByStatus(status: string): ScrapingSession[] {
    const history = this.getHistory();
    return history.filter(session => session.status === status);
  }

  /**
   * Generate unique ID for sessions
   */
  private generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format duration in human-readable format
   */
  formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Format date in human-readable format
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  }

  /**
   * Get recent sessions (last N sessions)
   */
  getRecentSessions(count: number = 10): ScrapingSession[] {
    const history = this.getHistory();
    return history
      .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
      .slice(0, count);
  }

  /**
   * Get sessions with errors
   */
  getFailedSessions(): ScrapingSession[] {
    const history = this.getHistory();
    return history.filter(session => 
      session.status === 'failed' || session.errorMessage
    );
  }

  /**
   * Get active sessions (in progress)
   */
  getActiveSessions(): ScrapingSession[] {
    const history = this.getHistory();
    return history.filter(session => 
      session.status === 'in_progress' || session.status === 'pending'
    );
  }
}

// Export singleton instance
export const scrapingHistoryService = new ScrapingHistoryService();