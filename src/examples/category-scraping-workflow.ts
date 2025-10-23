/**
 * Category-Based Scraping Workflow
 * 
 * This file demonstrates the complete workflow for category-based product scraping:
 * 1. Create category scrape log using POST API
 * 2. Store the _id temporarily
 * 3. Update scrape log with product statistics using PUT API
 */

import { scrapingApi } from '../services/api';

// Temporary storage for scrape log IDs
let activeScrapeLogs: string[] = [];

// Step 1: Create Category Scrape Log
export const createCategoryScrapeLog = async (categoryData: {
  platform: string;
  category: string;
  url?: string;
  operationId?: string;
}): Promise<string> => {
  try {
    console.log(`Creating scrape log for category: ${categoryData.category}`);
    
    const payload = {
      when: new Date().toISOString(),
      platform: categoryData.platform,
      type: 'category' as const,
      url: categoryData.url || `https://${categoryData.platform}.com/category/${categoryData.category}`,
      category: categoryData.category,
      status: 'pending' as const,
      action: 'start_category_scraping',
      operationId: categoryData.operationId
    };
    
    const response = await scrapingApi.createScrapeLog(payload);
    const scrapeLogId = response.data._id;
    
    // Store the _id in temporary array
    activeScrapeLogs.push(scrapeLogId);
    
    console.log('Category scrape log created:', {
      id: scrapeLogId,
      category: categoryData.category,
      platform: categoryData.platform,
      totalActiveLogs: activeScrapeLogs.length
    });
    
    return scrapeLogId;
  } catch (error) {
    console.error('Failed to create category scrape log:', error);
    throw error;
  }
};

// Step 2: Start Category Scraping with Initial Statistics
export const startCategoryScraping = async (scrapeLogId: string, initialStats: {
  platform: string;
  category: string;
  totalProducts: number;
  operationId?: string;
}): Promise<any> => {
  try {
    console.log(`Starting category scraping for log: ${scrapeLogId}`);
    
    const payload = {
      when: new Date().toISOString(),
      platform: initialStats.platform,
      type: 'category' as const,
      category: initialStats.category,
      status: 'in_progress' as const,
      action: 'scrape_category_products',
      operationId: initialStats.operationId,
      totalProducts: initialStats.totalProducts,
      scrapedProducts: 0,
      failedProducts: 0,
      progress: {
        current: 0,
        total: initialStats.totalProducts,
        percentage: 0
      },
      duration: 0,
      retryCount: 0
    };
    
    const response = await scrapingApi.updateScrapeLog(scrapeLogId, payload);
    
    console.log('Category scraping started:', {
      id: scrapeLogId,
      totalProducts: initialStats.totalProducts,
      progress: response.data.progress
    });
    
    return response;
  } catch (error) {
    console.error('Failed to start category scraping:', error);
    throw error;
  }
};

// Step 3: Update Progress During Scraping
export const updateScrapingProgress = async (scrapeLogId: string, progressData: {
  platform: string;
  category: string;
  totalProducts: number;
  scrapedProducts: number;
  failedProducts: number;
  currentProductUrl?: string;
  duration?: number;
}): Promise<any> => {
  try {
    const isCompleted = progressData.scrapedProducts + progressData.failedProducts >= progressData.totalProducts;
    const successRate = progressData.totalProducts > 0 ? 
      (progressData.scrapedProducts / progressData.totalProducts) * 100 : 0;
    
    const payload = {
      when: new Date().toISOString(),
      platform: progressData.platform,
      type: 'category' as const,
      category: progressData.category,
      status: isCompleted ? 'completed' : 'in_progress' as const,
      action: 'scrape_category_products',
      totalProducts: progressData.totalProducts,
      scrapedProducts: progressData.scrapedProducts,
      failedProducts: progressData.failedProducts,
      progress: {
        current: progressData.scrapedProducts,
        total: progressData.totalProducts,
        percentage: Math.round(successRate)
      },
      duration: progressData.duration || 0,
      retryCount: 0
    };
    
    const response = await scrapingApi.updateScrapeLog(scrapeLogId, payload);
    
    console.log(`Progress updated for ${scrapeLogId}:`, {
      scraped: progressData.scrapedProducts,
      failed: progressData.failedProducts,
      total: progressData.totalProducts,
      successRate: Math.round(successRate),
      status: isCompleted ? 'completed' : 'in_progress'
    });
    
    return response;
  } catch (error) {
    console.error('Failed to update scraping progress:', error);
    throw error;
  }
};

// Step 4: Complete Category Scraping
export const completeCategoryScraping = async (scrapeLogId: string, finalStats: {
  platform: string;
  category: string;
  totalProducts: number;
  scrapedProducts: number;
  failedProducts: number;
  duration: number;
}): Promise<any> => {
  try {
    const successRate = finalStats.totalProducts > 0 ? 
      (finalStats.scrapedProducts / finalStats.totalProducts) * 100 : 0;
    
    const payload = {
      when: new Date().toISOString(),
      platform: finalStats.platform,
      type: 'category' as const,
      category: finalStats.category,
      status: 'completed' as const,
      action: 'complete_category_scraping',
      totalProducts: finalStats.totalProducts,
      scrapedProducts: finalStats.scrapedProducts,
      failedProducts: finalStats.failedProducts,
      progress: {
        current: finalStats.scrapedProducts,
        total: finalStats.totalProducts,
        percentage: Math.round(successRate)
      },
      duration: finalStats.duration,
      retryCount: 0
    };
    
    const response = await scrapingApi.updateScrapeLog(scrapeLogId, payload);
    
    // Remove from active logs
    activeScrapeLogs = activeScrapeLogs.filter(id => id !== scrapeLogId);
    
    console.log('Category scraping completed:', {
      id: scrapeLogId,
      total: finalStats.totalProducts,
      successful: finalStats.scrapedProducts,
      failed: finalStats.failedProducts,
      successRate: Math.round(successRate),
      duration: finalStats.duration
    });
    
    return response;
  } catch (error) {
    console.error('Failed to complete category scraping:', error);
    throw error;
  }
};

// Step 5: Handle Scraping Errors
export const handleScrapingError = async (scrapeLogId: string, errorData: {
  platform: string;
  category: string;
  errorMessage: string;
  retryCount?: number;
}): Promise<any> => {
  try {
    const payload = {
      when: new Date().toISOString(),
      platform: errorData.platform,
      type: 'category' as const,
      category: errorData.category,
      status: 'failed' as const,
      action: 'scraping_error',
      totalProducts: 0,
      scrapedProducts: 0,
      failedProducts: 0,
      progress: {
        current: 0,
        total: 0,
        percentage: 0
      },
      duration: 0,
      errorMessage: errorData.errorMessage,
      retryCount: errorData.retryCount || 0
    };
    
    const response = await scrapingApi.updateScrapeLog(scrapeLogId, payload);
    
    // Remove from active logs
    activeScrapeLogs = activeScrapeLogs.filter(id => id !== scrapeLogId);
    
    console.log('Scraping error handled:', {
      id: scrapeLogId,
      error: errorData.errorMessage,
      retryCount: errorData.retryCount
    });
    
    return response;
  } catch (error) {
    console.error('Failed to handle scraping error:', error);
    throw error;
  }
};

// Complete Workflow Example
export const executeCategoryScrapingWorkflow = async (categoryData: {
  platform: string;
  category: string;
  totalProducts: number;
  operationId?: string;
}) => {
  try {
    console.log('🚀 Starting complete category scraping workflow...');
    
    // Step 1: Create scrape log
    const scrapeLogId = await createCategoryScrapeLog({
      platform: categoryData.platform,
      category: categoryData.category,
      operationId: categoryData.operationId
    });
    
    // Step 2: Start scraping
    await startCategoryScraping(scrapeLogId, {
      platform: categoryData.platform,
      category: categoryData.category,
      totalProducts: categoryData.totalProducts,
      operationId: categoryData.operationId
    });
    
    // Step 3: Simulate product scraping
    const products = Array.from({ length: categoryData.totalProducts }, (_, i) => ({
      url: `https://${categoryData.platform}.com/product/${i + 1}`,
      success: Math.random() > 0.2 // 80% success rate
    }));
    
    let scrapedProducts = 0;
    let failedProducts = 0;
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Simulate scraping delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (product.success) {
        scrapedProducts++;
      } else {
        failedProducts++;
      }
      
      // Update progress every 10 products or at the end
      if ((i + 1) % 10 === 0 || i === products.length - 1) {
        await updateScrapingProgress(scrapeLogId, {
          platform: categoryData.platform,
          category: categoryData.category,
          totalProducts: categoryData.totalProducts,
          scrapedProducts,
          failedProducts,
          currentProductUrl: product.url,
          duration: (i + 1) * 100
        });
      }
    }
    
    // Step 4: Complete scraping
    const finalResponse = await completeCategoryScraping(scrapeLogId, {
      platform: categoryData.platform,
      category: categoryData.category,
      totalProducts: categoryData.totalProducts,
      scrapedProducts,
      failedProducts,
      duration: products.length * 100
    });
    
    console.log('✅ Category scraping workflow completed successfully!');
    return finalResponse;
    
  } catch (error) {
    console.error('❌ Category scraping workflow failed:', error);
    throw error;
  }
};

// Utility Functions
export const getActiveScrapeLogs = (): string[] => {
  return [...activeScrapeLogs];
};

export const clearActiveScrapeLogs = (): void => {
  activeScrapeLogs = [];
};

export const removeScrapeLog = (scrapeLogId: string): void => {
  activeScrapeLogs = activeScrapeLogs.filter(id => id !== scrapeLogId);
};

// React Hook for Category Scraping
export const useCategoryScraping = () => {
  const startScraping = async (categoryData: {
    platform: string;
    category: string;
    totalProducts: number;
    operationId?: string;
  }) => {
    return await executeCategoryScrapingWorkflow(categoryData);
  };
  
  const getActiveLogs = () => {
    return getActiveScrapeLogs();
  };
  
  const clearLogs = () => {
    clearActiveScrapeLogs();
  };
  
  return {
    startScraping,
    getActiveLogs,
    clearLogs
  };
};
