/**
 * Scraping Manager Service
 * 
 * This service manages the complete scraping workflow including:
 * - Category URL processing
 * - Product selection tracking
 * - Progress updates
 * - History management
 */

import { scrapingApi } from './api';
import { scrapingHistoryService, ScrapingHistoryItem, ScrapingProgress } from './scrapingHistory';

export interface ProductSelection {
  url: string;
  title: string;
  selected: boolean;
}

export interface CategoryScrapingConfig {
  platform: string;
  category: string;
  categoryUrl: string;
  selectedProducts: ProductSelection[];
  operationId?: string;
}

export interface ScrapingSession {
  id: string;
  scrapeLogId: string;
  config: CategoryScrapingConfig;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  progress: ScrapingProgress;
  startedAt: string;
  completedAt?: string;
}

class ScrapingManagerService {
  private activeSessions: Map<string, ScrapingSession> = new Map();

  // Start category scraping session
  async startCategoryScraping(config: CategoryScrapingConfig): Promise<string> {
    try {
      console.log('🚀 Starting category scraping session...', config);
      
      // Step 1: Create scrape log
      const createResponse = await scrapingApi.createScrapeLog({
        when: new Date().toISOString(),
        platform: config.platform,
        type: 'category',
        url: config.categoryUrl,
        category: config.category,
        status: 'pending',
        action: 'start_category_scraping',
        operationId: config.operationId
      });

      const scrapeLogId = createResponse.data._id;
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Step 2: Create scraping session
      const session: ScrapingSession = {
        id: sessionId,
        scrapeLogId,
        config,
        status: 'pending',
        progress: {
          scrapeLogId,
          category: config.category,
          totalProducts: config.selectedProducts.filter(p => p.selected).length,
          scrapedProducts: 0,
          failedProducts: 0,
          progress: {
            current: 0,
            total: config.selectedProducts.filter(p => p.selected).length,
            percentage: 0
          },
          status: 'in_progress',
          startedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        },
        startedAt: new Date().toISOString()
      };

      // Step 3: Store in history
      const historyItem: Omit<ScrapingHistoryItem, 'id' | 'startedAt' | 'duration'> = {
        scrapeLogId,
        platform: config.platform,
        category: config.category,
        categoryUrl: config.categoryUrl,
        selectedProducts: config.selectedProducts
          .filter(p => p.selected)
          .map(p => ({
            url: p.url,
            title: p.title,
            status: 'pending' as const
          })),
        totalProducts: config.selectedProducts.filter(p => p.selected).length,
        scrapedProducts: 0,
        failedProducts: 0,
        successRate: 0,
        status: 'in_progress'
      };

      const historyId = scrapingHistoryService.addScrapingSession(historyItem);
      
      // Step 4: Update scrape log with initial statistics
      await scrapingApi.updateScrapeLog(scrapeLogId, {
        when: new Date().toISOString(),
        platform: config.platform,
        type: 'category',
        category: config.category,
        status: 'in_progress',
        action: 'scrape_category_products',
        operationId: config.operationId,
        totalProducts: session.progress.totalProducts,
        scrapedProducts: 0,
        failedProducts: 0,
        progress: session.progress.progress,
        duration: 0,
        retryCount: 0
      });

      // Step 5: Store active session
      this.activeSessions.set(sessionId, session);
      scrapingHistoryService.setCurrentProgress(session.progress);

      console.log('✅ Category scraping session started:', {
        sessionId,
        scrapeLogId,
        totalProducts: session.progress.totalProducts
      });

      return sessionId;
    } catch (error) {
      console.error('❌ Failed to start category scraping:', error);
      throw error;
    }
  }

  // Update product scraping progress
  async updateProductProgress(sessionId: string, productUrl: string, status: 'success' | 'failed', errorMessage?: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Update product status in history
      scrapingHistoryService.updateProductStatus(sessionId, productUrl, status, errorMessage);

      // Update session progress
      if (status === 'success') {
        session.progress.scrapedProducts++;
      } else {
        session.progress.failedProducts++;
      }

      // Calculate new progress
      const totalProcessed = session.progress.scrapedProducts + session.progress.failedProducts;
      const isCompleted = totalProcessed >= session.progress.totalProducts;

      session.progress.progress = {
        current: session.progress.scrapedProducts,
        total: session.progress.totalProducts,
        percentage: Math.round((session.progress.scrapedProducts / session.progress.totalProducts) * 100)
      };

      session.progress.status = isCompleted ? 'completed' : 'in_progress';
      session.progress.lastUpdated = new Date().toISOString();

      if (isCompleted) {
        session.status = 'completed';
        session.completedAt = new Date().toISOString();
      }

      // Update scrape log
      await scrapingApi.updateScrapeLog(session.scrapeLogId, {
        when: new Date().toISOString(),
        platform: session.config.platform,
        type: 'category',
        category: session.config.category,
        status: session.progress.status,
        action: 'scrape_category_products',
        totalProducts: session.progress.totalProducts,
        scrapedProducts: session.progress.scrapedProducts,
        failedProducts: session.progress.failedProducts,
        progress: session.progress.progress,
        duration: new Date().getTime() - new Date(session.startedAt).getTime(),
        retryCount: 0
      });

      // Update current progress
      scrapingHistoryService.setCurrentProgress(session.progress);

      console.log(`📊 Progress updated for ${sessionId}:`, {
        scraped: session.progress.scrapedProducts,
        failed: session.progress.failedProducts,
        total: session.progress.totalProducts,
        percentage: session.progress.progress.percentage,
        status: session.progress.status
      });

      // Clean up completed session
      if (isCompleted) {
        this.activeSessions.delete(sessionId);
        scrapingHistoryService.clearCurrentProgress();
        console.log('✅ Session completed and cleaned up:', sessionId);
      }
    } catch (error) {
      console.error('❌ Failed to update product progress:', error);
      throw error;
    }
  }

  // Get current session
  getSession(sessionId: string): ScrapingSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  // Get all active sessions
  getActiveSessions(): ScrapingSession[] {
    return Array.from(this.activeSessions.values());
  }

  // Cancel session
  async cancelSession(sessionId: string, reason?: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      session.status = 'cancelled';
      session.completedAt = new Date().toISOString();

      // Update scrape log
      await scrapingApi.updateScrapeLog(session.scrapeLogId, {
        when: new Date().toISOString(),
        platform: session.config.platform,
        type: 'category',
        category: session.config.category,
        status: 'cancelled',
        action: 'cancel_scraping',
        totalProducts: session.progress.totalProducts,
        scrapedProducts: session.progress.scrapedProducts,
        failedProducts: session.progress.failedProducts,
        progress: session.progress.progress,
        duration: new Date().getTime() - new Date(session.startedAt).getTime(),
        errorMessage: reason || 'Session cancelled by user',
        retryCount: 0
      });

      // Update history
      scrapingHistoryService.updateScrapingSession(sessionId, {
        status: 'cancelled',
        completedAt: session.completedAt,
        duration: new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime(),
        errorMessage: reason || 'Session cancelled by user'
      });

      // Clean up
      this.activeSessions.delete(sessionId);
      scrapingHistoryService.clearCurrentProgress();

      console.log('❌ Session cancelled:', sessionId);
    } catch (error) {
      console.error('❌ Failed to cancel session:', error);
      throw error;
    }
  }

  // Get current progress
  getCurrentProgress(): ScrapingProgress | null {
    return scrapingHistoryService.getCurrentProgress();
  }

  // Simulate product scraping (for testing)
  async simulateProductScraping(sessionId: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const selectedProducts = session.config.selectedProducts.filter(p => p.selected);
      
      for (let i = 0; i < selectedProducts.length; i++) {
        const product = selectedProducts[i];
        
        // Simulate scraping delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate success/failure (80% success rate)
        const isSuccess = Math.random() > 0.2;
        
        await this.updateProductProgress(
          sessionId,
          product.url,
          isSuccess ? 'success' : 'failed',
          isSuccess ? undefined : 'Simulated scraping error'
        );
        
        console.log(`🔄 Product ${i + 1}/${selectedProducts.length} processed:`, {
          url: product.url,
          success: isSuccess
        });
      }
    } catch (error) {
      console.error('❌ Failed to simulate product scraping:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const scrapingManagerService = new ScrapingManagerService();
export default scrapingManagerService;
