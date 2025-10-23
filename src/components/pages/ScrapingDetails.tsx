import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  RefreshCw, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink,
  Clock,
  TrendingUp,
  BarChart3,
  Target,
  Timer,
  RotateCcw,
  History,
  Tag
} from 'lucide-react';
import { scrapingApi } from '../../services/api';
import { scrapingHistoryService, ScrapingSession, ScrapingStatistics } from '../../services/scrapingHistory';
import ScrapingHistory from '../ScrapingHistory';
import toast from 'react-hot-toast';

// Types for recent scraping data
interface RecentScrapeItem {
  id: string;
  when: string;
  platform: string;
  type: 'product' | 'category';
  url: string;
  category?: string;
  status: 'pending' | 'success' | 'failed' | 'completed';
  page?: number;
  error?: string;
  scrapedData?: any;
}

// Remove the duplicate ScrapeLog interface since we're importing it from api.ts

const ScrapingDetails: React.FC = () => {
  const [recentScrapes, setRecentScrapes] = useState<RecentScrapeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    platform: '',
    type: '',
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    category: ''
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyStatistics, setHistoryStatistics] = useState<ScrapingStatistics>({
    totalSessions: 0,
    completedSessions: 0,
    failedSessions: 0,
    totalProducts: 0,
    successfulProducts: 0,
    failedProducts: 0,
    averageSuccessRate: 0,
    totalDuration: 0,
    platformStats: {},
    categoryStats: {}
  });

  // Load recent scrapes from localStorage
  const loadRecentScrapes = () => {
    try {
      const stored = localStorage.getItem('recentScrapes');
      if (stored) {
        const scrapes = JSON.parse(stored);
        setRecentScrapes(scrapes.slice(0, 10)); // Show last 10
      }
    } catch (error) {
      console.error('Failed to load recent scrapes:', error);
    }
  };

  // Load history statistics
  const loadHistoryStatistics = () => {
    try {
      const stats = scrapingHistoryService.getStatistics();
      setHistoryStatistics(stats);
    } catch (error) {
      console.error('Failed to load history statistics:', error);
    }
  };

  // Load localStorage scraping sessions
  const loadScrapingSessions = () => {
    try {
      const sessions = scrapingHistoryService.getHistory();
      // Convert sessions to recent scrapes format for display
      const convertedSessions = sessions.map(session => ({
        id: session.id,
        when: session.when,
        platform: session.platform,
        type: session.type,
        url: session.url,
        category: session.category,
        status: session.status,
        error: session.errorMessage,
        scrapedData: session.scrapedData
      }));
      setRecentScrapes(convertedSessions);
    } catch (error) {
      console.error('Failed to load scraping sessions:', error);
    }
  };

  // Clear all scraping sessions
  const clearAllSessions = () => {
    if (window.confirm('Are you sure you want to clear all scraping sessions?')) {
      scrapingHistoryService.clearAllHistory();
      loadScrapingSessions();
      loadHistoryStatistics();
      toast.success('All scraping sessions cleared');
    }
  };

  // Retry a scrape
  const retryScrape = (scrape: RecentScrapeItem) => {
    // This would trigger a new scrape - for now just show a message
    toast('Retry functionality would be implemented here', { icon: 'ℹ️' });
  };

  // Initial load
  useEffect(() => {
    loadRecentScrapes();
    loadScrapingSessions();
    loadHistoryStatistics();
    setLoading(false);
  }, [filters]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadRecentScrapes();
      loadScrapingSessions();
      loadHistoryStatistics();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, filters]);


  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Get platform color
  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'flipkart': return 'bg-blue-100 text-blue-800';
      case 'amazon': return 'bg-orange-100 text-orange-800';
      case 'myntra': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format duration
  const formatDuration = (duration?: number) => {
    if (!duration) return '-';
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
    return `${(duration / 60000).toFixed(1)}m`;
  };

  // Get success rate color
  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading scraping details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scraping Details</h1>
          <p className="text-gray-600 mt-1">View recent scraping activities and logs</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowHistory(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <History className="h-4 w-4" />
            <span>View History</span>
          </button>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              autoRefresh 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>{autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}</span>
          </button>
          <button
            onClick={() => {
              loadRecentScrapes();
              loadScrapingSessions();
              loadHistoryStatistics();
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* History Statistics Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <History className="h-5 w-5 mr-2" />
            Scraping History Overview
            </h2>
          <button
            onClick={() => setShowHistory(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <History className="h-4 w-4" />
            <span>View Full History</span>
          </button>
          </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium text-gray-600">Total Sessions</span>
                      </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{historyStatistics.totalSessions}</p>
                        </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Completed</span>
                        </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{historyStatistics.completedSessions}</p>
                        </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-gray-600">Failed</span>
                      </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{historyStatistics.failedSessions}</p>
                        </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Success Rate</span>
                      </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {Math.round(historyStatistics.averageSuccessRate)}%
            </p>
                    </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Total Products</span>
                </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{historyStatistics.totalProducts}</p>
              </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Duration</span>
                      </div>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {formatDuration(historyStatistics.totalDuration)}
            </p>
          </div>
        </div>
      </div>


      {/* Recent Scrapes Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Scraping Sessions</h2>
          <button
            onClick={clearAllSessions}
            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All Sessions</span>
          </button>
        </div>

        {recentScrapes.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No scraping sessions</h3>
            <p className="mt-1 text-sm text-gray-500">
              Scraping sessions will appear here when available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    When
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentScrapes.map((scrape) => (
                  <tr key={scrape.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(scrape.when)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPlatformColor(scrape.platform)}`}>
                        {scrape.platform.charAt(0).toUpperCase() + scrape.platform.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {scrape.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-600 truncate max-w-xs" title={scrape.url}>
                          {scrape.url.replace(/^https?:\/\//, '').substring(0, 30)}...
                        </div>
                        <button
                          onClick={() => window.open(scrape.url, '_blank')}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {scrape.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scrape.status)}`}>
                        {getStatusIcon(scrape.status)}
                        <span className="ml-1 capitalize">{scrape.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => retryScrape(scrape)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* Scraping History Modal */}
      <ScrapingHistory 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
      />
    </div>
  );
};

export default ScrapingDetails;