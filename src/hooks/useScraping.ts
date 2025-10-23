/**
 * Custom Hook for Scraping Management
 * 
 * This hook provides a simple interface for managing scraping operations
 * with history tracking and progress monitoring.
 */

import { useState, useEffect, useCallback } from 'react';
import { scrapingManagerService } from '../services/scrapingManager';
import { scrapingHistoryService } from '../services/scrapingHistory';
import { ScrapingSession, ProductSelection, CategoryScrapingConfig } from '../services/scrapingManager';
import { ScrapingProgress } from '../services/scrapingHistory';

export const useScraping = () => {
  const [activeSessions, setActiveSessions] = useState<ScrapingSession[]>([]);
  const [currentProgress, setCurrentProgress] = useState<ScrapingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load active sessions and current progress
  useEffect(() => {
    const loadData = () => {
      const sessions = scrapingManagerService.getActiveSessions();
      const progress = scrapingManagerService.getCurrentProgress();
      
      setActiveSessions(sessions);
      setCurrentProgress(progress);
    };

    loadData();
    
    // Update every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Start category scraping
  const startScraping = useCallback(async (config: CategoryScrapingConfig): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const sessionId = await scrapingManagerService.startCategoryScraping(config);
      
      // Refresh data
      const sessions = scrapingManagerService.getActiveSessions();
      const progress = scrapingManagerService.getCurrentProgress();
      
      setActiveSessions(sessions);
      setCurrentProgress(progress);
      
      return sessionId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update product progress
  const updateProgress = useCallback(async (sessionId: string, productUrl: string, status: 'success' | 'failed', errorMessage?: string) => {
    try {
      await scrapingManagerService.updateProductProgress(sessionId, productUrl, status, errorMessage);
      
      // Refresh data
      const sessions = scrapingManagerService.getActiveSessions();
      const progress = scrapingManagerService.getCurrentProgress();
      
      setActiveSessions(sessions);
      setCurrentProgress(progress);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Cancel session
  const cancelSession = useCallback(async (sessionId: string, reason?: string) => {
    try {
      setIsLoading(true);
      await scrapingManagerService.cancelSession(sessionId, reason);
      
      // Refresh data
      const sessions = scrapingManagerService.getActiveSessions();
      const progress = scrapingManagerService.getCurrentProgress();
      
      setActiveSessions(sessions);
      setCurrentProgress(progress);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Simulate scraping (for testing)
  const simulateScraping = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      await scrapingManagerService.simulateProductScraping(sessionId);
      
      // Refresh data
      const sessions = scrapingManagerService.getActiveSessions();
      const progress = scrapingManagerService.getCurrentProgress();
      
      setActiveSessions(sessions);
      setCurrentProgress(progress);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get session by ID
  const getSession = useCallback((sessionId: string): ScrapingSession | null => {
    return scrapingManagerService.getSession(sessionId);
  }, []);

  // Get scraping history
  const getHistory = useCallback(() => {
    return scrapingHistoryService.getHistory();
  }, []);

  // Get statistics
  const getStatistics = useCallback(() => {
    return scrapingHistoryService.getStatistics();
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    activeSessions,
    currentProgress,
    isLoading,
    error,
    
    // Actions
    startScraping,
    updateProgress,
    cancelSession,
    simulateScraping,
    getSession,
    getHistory,
    getStatistics,
    clearError
  };
};

export default useScraping;
