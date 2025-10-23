/**
 * Enhanced Scrape Log Update Examples
 * 
 * This file demonstrates how to use the enhanced PUT /api/scrape-logs/:id endpoint
 * with product statistics support.
 */

import { scrapingApi } from '../services/api';

// Example 1: Basic update with product statistics
export const updateScrapeLogWithStats = async (logId: string) => {
  try {
    const payload = {
      when: new Date().toISOString(),
      platform: 'amazon',
      type: 'product' as const,
      url: 'https://amazon.com/product/123',
      category: 'Electronics',
      status: 'in_progress' as const,
      action: 'scrape_product_details',
      operationId: 'operation_123',
      totalProducts: 100,
      scrapedProducts: 75,
      failedProducts: 5,
      duration: 45000, // 45 seconds in milliseconds
      retryCount: 0
    };

    const response = await scrapingApi.updateScrapeLogEnhanced(logId, payload);
    console.log('Update successful:', response);
    return response;
  } catch (error) {
    console.error('Failed to update scrape log:', error);
    throw error;
  }
};

// Example 2: Using the helper function to create payload
export const updateScrapeLogWithHelper = async (logId: string) => {
  try {
    const payload = scrapingApi.createEnhancedUpdatePayload({
      when: '2024-01-15T10:30:00.000Z',
      platform: 'flipkart',
      type: 'product',
      url: 'https://flipkart.com/product/456',
      category: 'Electronics',
      status: 'in_progress',
      action: 'scrape_product_details',
      operationId: 'operation_456',
      totalProducts: 150,
      scrapedProducts: 120,
      failedProducts: 10,
      duration: 60000, // 1 minute
      retryCount: 1
    });

    const response = await scrapingApi.updateScrapeLogEnhanced(logId, payload);
    console.log('Enhanced update successful:', response);
    return response;
  } catch (error) {
    console.error('Failed to update scrape log with helper:', error);
    throw error;
  }
};

// Example 3: Update with progress tracking
export const updateScrapeLogWithProgress = async (logId: string, current: number, total: number) => {
  try {
    const percentage = Math.round((current / total) * 100);
    
    const payload = {
      status: current === total ? 'completed' : 'in_progress',
      scrapedProducts: current,
      totalProducts: total,
      progress: {
        current,
        total,
        percentage
      },
      duration: Date.now() - new Date().getTime() // Calculate duration
    };

    const response = await scrapingApi.updateScrapeLogEnhanced(logId, payload);
    console.log(`Progress update: ${percentage}% (${current}/${total})`);
    return response;
  } catch (error) {
    console.error('Failed to update progress:', error);
    throw error;
  }
};

// Example 4: Error handling update
export const updateScrapeLogWithError = async (logId: string, errorMessage: string) => {
  try {
    const payload = {
      status: 'failed' as const,
      errorMessage,
      retryCount: 1,
      failedProducts: 1
    };

    const response = await scrapingApi.updateScrapeLogEnhanced(logId, payload);
    console.log('Error update successful:', response);
    return response;
  } catch (error) {
    console.error('Failed to update with error:', error);
    throw error;
  }
};

// Example 5: Complete scraping session update
export const completeScrapingSession = async (logId: string, stats: {
  totalProducts: number;
  scrapedProducts: number;
  failedProducts: number;
  duration: number;
}) => {
  try {
    const successRate = (stats.scrapedProducts / stats.totalProducts) * 100;
    
    const payload = {
      status: 'completed' as const,
      action: 'scrape_product_details',
      totalProducts: stats.totalProducts,
      scrapedProducts: stats.scrapedProducts,
      failedProducts: stats.failedProducts,
      duration: stats.duration,
      progress: {
        current: stats.scrapedProducts,
        total: stats.totalProducts,
        percentage: Math.round(successRate)
      },
      errorMessage: null,
      retryCount: 0
    };

    const response = await scrapingApi.updateScrapeLogEnhanced(logId, payload);
    console.log(`Scraping completed: ${stats.scrapedProducts}/${stats.totalProducts} products (${Math.round(successRate)}% success rate)`);
    return response;
  } catch (error) {
    console.error('Failed to complete scraping session:', error);
    throw error;
  }
};

// Example 6: Real-time progress update during scraping
export const updateScrapingProgress = async (logId: string, currentProgress: {
  current: number;
  total: number;
  successful: number;
  failed: number;
}) => {
  try {
    const payload = scrapingApi.createEnhancedUpdatePayload({
      status: 'in_progress',
      totalProducts: currentProgress.total,
      scrapedProducts: currentProgress.current,
      failedProducts: currentProgress.failed,
      action: 'scrape_product_details'
    });

    const response = await scrapingApi.updateScrapeLogEnhanced(logId, payload);
    console.log(`Progress: ${currentProgress.current}/${currentProgress.total} (${currentProgress.successful} successful, ${currentProgress.failed} failed)`);
    return response;
  } catch (error) {
    console.error('Failed to update scraping progress:', error);
    throw error;
  }
};

// Example usage in a React component
export const useScrapeLogUpdate = () => {
  const updateLog = async (logId: string, updateData: any) => {
    try {
      const response = await scrapingApi.updateScrapeLogEnhanced(logId, updateData);
      return response;
    } catch (error) {
      console.error('Scrape log update failed:', error);
      throw error;
    }
  };

  const updateProgress = async (logId: string, progress: { current: number; total: number }) => {
    return updateScrapingProgress(logId, {
      current: progress.current,
      total: progress.total,
      successful: progress.current,
      failed: 0
    });
  };

  const markAsCompleted = async (logId: string, finalStats: any) => {
    return completeScrapingSession(logId, finalStats);
  };

  const markAsFailed = async (logId: string, errorMessage: string) => {
    return updateScrapeLogWithError(logId, errorMessage);
  };

  return {
    updateLog,
    updateProgress,
    markAsCompleted,
    markAsFailed
  };
};
