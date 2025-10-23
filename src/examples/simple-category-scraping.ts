/**
 * Simple Category Scraping Example
 * 
 * This shows exactly how to use the category scraping workflow:
 * 1. POST API to create scrape log
 * 2. Store _id temporarily
 * 3. PUT API to update with product statistics
 */

import { scrapingApi } from '../services/api';

// Example: Complete Category Scraping Process
export const scrapeCategoryProducts = async () => {
  try {
    console.log('🚀 Starting category scraping process...');
    
    // Step 1: Create category scrape log using POST API
    console.log('📝 Step 1: Creating scrape log...');
    const createResponse = await scrapingApi.createScrapeLog({
      when: new Date().toISOString(),
      platform: 'flipkart',
      type: 'category',
      url: 'https://flipkart.com/electronics',
      category: 'Electronics',
      status: 'pending',
      action: 'start_category_scraping',
      operationId: 'op_123'
    });
    
    // Step 2: Store the _id temporarily
    const scrapeLogId = createResponse.data._id;
    console.log('✅ Scrape log created with ID:', scrapeLogId);
    
    // Step 3: Start scraping with initial statistics
    console.log('🔄 Step 2: Starting category scraping...');
    await scrapingApi.updateScrapeLog(scrapeLogId, {
      when: new Date().toISOString(),
      platform: 'flipkart',
      type: 'category',
      category: 'Electronics',
      status: 'in_progress',
      action: 'scrape_category_products',
      operationId: 'op_123',
      totalProducts: 100,
      scrapedProducts: 0,
      failedProducts: 0,
      progress: {
        current: 0,
        total: 100,
        percentage: 0
      },
      duration: 0,
      retryCount: 0
    });
    
    // Step 4: Simulate scraping products and updating progress
    console.log('📊 Step 3: Simulating product scraping...');
    const totalProducts = 100;
    let scrapedProducts = 0;
    let failedProducts = 0;
    
    for (let i = 0; i < totalProducts; i++) {
      // Simulate scraping delay
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Simulate success/failure (80% success rate)
      const isSuccess = Math.random() > 0.2;
      
      if (isSuccess) {
        scrapedProducts++;
      } else {
        failedProducts++;
      }
      
      // Update progress every 20 products
      if ((i + 1) % 20 === 0 || i === totalProducts - 1) {
        const successRate = (scrapedProducts / totalProducts) * 100;
        
        await scrapingApi.updateScrapeLog(scrapeLogId, {
          when: new Date().toISOString(),
          platform: 'flipkart',
          type: 'category',
          category: 'Electronics',
          status: i === totalProducts - 1 ? 'completed' : 'in_progress',
          action: 'scrape_category_products',
          totalProducts,
          scrapedProducts,
          failedProducts,
          progress: {
            current: scrapedProducts,
            total: totalProducts,
            percentage: Math.round(successRate)
          },
          duration: (i + 1) * 50,
          retryCount: 0
        });
        
        console.log(`📈 Progress: ${i + 1}/${totalProducts} (${Math.round(successRate)}% success)`);
      }
    }
    
    // Step 5: Final completion update
    console.log('✅ Step 4: Completing scraping...');
    const finalResponse = await scrapingApi.updateScrapeLog(scrapeLogId, {
      when: new Date().toISOString(),
      platform: 'flipkart',
      type: 'category',
      category: 'Electronics',
      status: 'completed',
      action: 'complete_category_scraping',
      totalProducts,
      scrapedProducts,
      failedProducts,
      progress: {
        current: scrapedProducts,
        total: totalProducts,
        percentage: Math.round((scrapedProducts / totalProducts) * 100)
      },
      duration: totalProducts * 50,
      retryCount: 0
    });
    
    console.log('🎉 Category scraping completed successfully!');
    console.log('📊 Final Statistics:', {
      total: totalProducts,
      successful: scrapedProducts,
      failed: failedProducts,
      successRate: Math.round((scrapedProducts / totalProducts) * 100)
    });
    
    return finalResponse;
    
  } catch (error) {
    console.error('❌ Category scraping failed:', error);
    throw error;
  }
};

// Example: Handle specific scrape log ID
export const updateSpecificScrapeLog = async (scrapeLogId: string) => {
  try {
    console.log(`🔄 Updating scrape log: ${scrapeLogId}`);
    
    // Update with product statistics
    const response = await scrapingApi.updateScrapeLog(scrapeLogId, {
      when: new Date().toISOString(),
      platform: 'flipkart',
      type: 'category',
      category: 'Electronics',
      status: 'in_progress',
      action: 'scrape_category_products',
      totalProducts: 50,
      scrapedProducts: 25,
      failedProducts: 5,
      progress: {
        current: 25,
        total: 50,
        percentage: 50
      },
      duration: 30000,
      retryCount: 0
    });
    
    console.log('✅ Scrape log updated successfully:', response.data);
    return response;
    
  } catch (error) {
    console.error('❌ Failed to update scrape log:', error);
    throw error;
  }
};

// Example: Error handling
export const handleScrapingError = async (scrapeLogId: string, errorMessage: string) => {
  try {
    console.log(`❌ Handling scraping error for log: ${scrapeLogId}`);
    
    const response = await scrapingApi.updateScrapeLog(scrapeLogId, {
      when: new Date().toISOString(),
      platform: 'flipkart',
      type: 'category',
      category: 'Electronics',
      status: 'failed',
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
      errorMessage: errorMessage,
      retryCount: 1
    });
    
    console.log('✅ Error handled successfully:', response.data);
    return response;
    
  } catch (error) {
    console.error('❌ Failed to handle error:', error);
    throw error;
  }
};
