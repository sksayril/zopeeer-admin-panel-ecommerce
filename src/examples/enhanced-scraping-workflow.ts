/**
 * Enhanced Scraping Workflow Examples
 * 
 * This file demonstrates how to properly use the enhanced scrape log API
 * for different scraping scenarios with proper product statistics tracking.
 */

import { scrapingApi } from '../services/api';

// Example 1: Single Product Scraping
export const scrapeSingleProduct = async (logId: string, productUrl: string) => {
  try {
    console.log('Starting single product scraping...');
    
    // Start scraping
    const startResponse = await scrapingApi.updateSingleProductScrape(logId, {
      platform: 'flipkart',
      url: productUrl,
      category: 'Electronics',
      status: 'success',
      action: 'scrape_single_product'
    });
    
    console.log('Single product scraping completed:', startResponse.data);
    return startResponse;
  } catch (error) {
    console.error('Single product scraping failed:', error);
    throw error;
  }
};

// Example 2: Category-based Product Scraping Workflow
export const scrapeCategoryProducts = async (logId: string, categoryData: {
  platform: string;
  category: string;
  totalProducts: number;
  operationId?: string;
}) => {
  try {
    console.log(`Starting category scraping for ${categoryData.category}...`);
    
    // Step 1: Start category scraping
    const startResponse = await scrapingApi.startCategoryScraping(logId, categoryData);
    console.log('Category scraping started:', startResponse.data);
    
    // Step 2: Simulate scraping individual products
    const products = [
      { url: 'https://flipkart.com/product1', success: true },
      { url: 'https://flipkart.com/product2', success: true },
      { url: 'https://flipkart.com/product3', success: false },
      { url: 'https://flipkart.com/product4', success: true },
      { url: 'https://flipkart.com/product5', success: true }
    ];
    
    let scrapedProducts = 0;
    let failedProducts = 0;
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Simulate scraping delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (product.success) {
        scrapedProducts++;
      } else {
        failedProducts++;
      }
      
      // Update progress after each product
      const progressResponse = await scrapingApi.updateProductProgressInCategory(logId, {
        platform: categoryData.platform,
        category: categoryData.category,
        totalProducts: categoryData.totalProducts,
        scrapedProducts,
        failedProducts,
        currentProductUrl: product.url,
        duration: (i + 1) * 1000 // Simulate duration
      });
      
      console.log(`Product ${i + 1}/${products.length} processed:`, {
        scraped: scrapedProducts,
        failed: failedProducts,
        progress: progressResponse.data.progress
      });
    }
    
    // Step 3: Complete category scraping
    const finalResponse = await scrapingApi.updateCategoryScrapingProgress(logId, {
      platform: categoryData.platform,
      category: categoryData.category,
      totalProducts: categoryData.totalProducts,
      scrapedProducts,
      failedProducts,
      status: 'completed',
      action: 'complete_category_scraping',
      duration: products.length * 1000
    });
    
    console.log('Category scraping completed:', finalResponse.data);
    return finalResponse;
  } catch (error) {
    console.error('Category scraping failed:', error);
    
    // Mark as failed if error occurs
    await scrapingApi.updateCategoryScrapingProgress(logId, {
      platform: categoryData.platform,
      category: categoryData.category,
      totalProducts: categoryData.totalProducts,
      scrapedProducts: 0,
      failedProducts: 0,
      status: 'failed',
      action: 'category_scraping_failed',
      errorMessage: error.message,
      duration: 0
    });
    
    throw error;
  }
};

// Example 3: Real-time Progress Tracking
export const trackScrapingProgress = async (logId: string, progressData: {
  platform: string;
  category: string;
  totalProducts: number;
  currentProduct: number;
  isSuccess: boolean;
  errorMessage?: string;
}) => {
  try {
    const scrapedProducts = progressData.isSuccess ? 1 : 0;
    const failedProducts = progressData.isSuccess ? 0 : 1;
    
    const response = await scrapingApi.updateProductProgressInCategory(logId, {
      platform: progressData.platform,
      category: progressData.category,
      totalProducts: progressData.totalProducts,
      scrapedProducts: progressData.currentProduct,
      failedProducts: progressData.currentProduct - scrapedProducts,
      duration: progressData.currentProduct * 1000
    });
    
    console.log(`Progress: ${progressData.currentProduct}/${progressData.totalProducts}`, {
      success: progressData.isSuccess,
      progress: response.data.progress
    });
    
    return response;
  } catch (error) {
    console.error('Progress tracking failed:', error);
    throw error;
  }
};

// Example 4: Handle Scraping Errors
export const handleScrapingError = async (logId: string, errorData: {
  platform: string;
  category: string;
  errorMessage: string;
  retryCount: number;
}) => {
  try {
    const response = await scrapingApi.updateCategoryScrapingProgress(logId, {
      platform: errorData.platform,
      category: errorData.category,
      totalProducts: 0,
      scrapedProducts: 0,
      failedProducts: 0,
      status: 'failed',
      action: 'scraping_error',
      errorMessage: errorData.errorMessage,
      duration: 0
    });
    
    console.log('Error handled:', response.data);
    return response;
  } catch (error) {
    console.error('Error handling failed:', error);
    throw error;
  }
};

// Example 5: Complete Scraping Session with Statistics
export const completeScrapingSession = async (logId: string, sessionData: {
  platform: string;
  category: string;
  totalProducts: number;
  scrapedProducts: number;
  failedProducts: number;
  duration: number;
}) => {
  try {
    const successRate = (sessionData.scrapedProducts / sessionData.totalProducts) * 100;
    
    const response = await scrapingApi.updateCategoryScrapingProgress(logId, {
      platform: sessionData.platform,
      category: sessionData.category,
      totalProducts: sessionData.totalProducts,
      scrapedProducts: sessionData.scrapedProducts,
      failedProducts: sessionData.failedProducts,
      status: 'completed',
      action: 'complete_scraping_session',
      duration: sessionData.duration
    });
    
    console.log('Scraping session completed:', {
      total: sessionData.totalProducts,
      successful: sessionData.scrapedProducts,
      failed: sessionData.failedProducts,
      successRate: Math.round(successRate),
      duration: sessionData.duration
    });
    
    return response;
  } catch (error) {
    console.error('Session completion failed:', error);
    throw error;
  }
};

// Example 6: React Hook for Scraping Management
export const useScrapingManager = () => {
  const startScraping = async (logId: string, config: {
    platform: string;
    category: string;
    totalProducts: number;
    operationId?: string;
  }) => {
    return await scrapingApi.startCategoryScraping(logId, config);
  };
  
  const updateProgress = async (logId: string, progress: {
    platform: string;
    category: string;
    totalProducts: number;
    scrapedProducts: number;
    failedProducts: number;
    currentProductUrl?: string;
    duration?: number;
  }) => {
    return await scrapingApi.updateProductProgressInCategory(logId, progress);
  };
  
  const completeScraping = async (logId: string, finalStats: {
    platform: string;
    category: string;
    totalProducts: number;
    scrapedProducts: number;
    failedProducts: number;
    duration: number;
  }) => {
    return await scrapingApi.updateCategoryScrapingProgress(logId, {
      ...finalStats,
      status: 'completed',
      action: 'scraping_completed'
    });
  };
  
  const handleError = async (logId: string, error: {
    platform: string;
    category: string;
    errorMessage: string;
  }) => {
    return await scrapingApi.updateCategoryScrapingProgress(logId, {
      platform: error.platform,
      category: error.category,
      totalProducts: 0,
      scrapedProducts: 0,
      failedProducts: 0,
      status: 'failed',
      action: 'scraping_error',
      errorMessage: error.errorMessage,
      duration: 0
    });
  };
  
  return {
    startScraping,
    updateProgress,
    completeScraping,
    handleError
  };
};

// Example 7: Batch Product Scraping
export const batchProductScraping = async (logId: string, batchData: {
  platform: string;
  category: string;
  products: Array<{
    url: string;
    success: boolean;
    errorMessage?: string;
  }>;
}) => {
  try {
    console.log(`Starting batch scraping for ${batchData.products.length} products...`);
    
    let scrapedProducts = 0;
    let failedProducts = 0;
    
    for (let i = 0; i < batchData.products.length; i++) {
      const product = batchData.products[i];
      
      if (product.success) {
        scrapedProducts++;
      } else {
        failedProducts++;
      }
      
      // Update progress every 5 products or at the end
      if ((i + 1) % 5 === 0 || i === batchData.products.length - 1) {
        await scrapingApi.updateProductProgressInCategory(logId, {
          platform: batchData.platform,
          category: batchData.category,
          totalProducts: batchData.products.length,
          scrapedProducts,
          failedProducts,
          duration: (i + 1) * 1000
        });
        
        console.log(`Batch progress: ${i + 1}/${batchData.products.length}`, {
          scraped: scrapedProducts,
          failed: failedProducts
        });
      }
    }
    
    // Final update
    const finalResponse = await scrapingApi.updateCategoryScrapingProgress(logId, {
      platform: batchData.platform,
      category: batchData.category,
      totalProducts: batchData.products.length,
      scrapedProducts,
      failedProducts,
      status: 'completed',
      action: 'batch_scraping_completed',
      duration: batchData.products.length * 1000
    });
    
    console.log('Batch scraping completed:', finalResponse.data);
    return finalResponse;
  } catch (error) {
    console.error('Batch scraping failed:', error);
    throw error;
  }
};
