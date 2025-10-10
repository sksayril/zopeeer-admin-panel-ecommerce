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
  RotateCcw
} from 'lucide-react';
import { scrapingApi, ScrapeLog, CategoryStats, PlatformStats, UpdateScrapeLogRequest } from '../../services/api';
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
  const [logs, setLogs] = useState<ScrapeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [filters, setFilters] = useState({
    platform: '',
    type: '',
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    category: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });
  const [statistics, setStatistics] = useState<{
    categoryStats: CategoryStats[];
    platformStats: PlatformStats[];
  }>({
    categoryStats: [],
    platformStats: []
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [editingLog, setEditingLog] = useState<ScrapeLog | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);

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

  // Load scrape logs from API
  const loadScrapeLogs = async () => {
    try {
      setLogsLoading(true);
      const apiFilters = {
        page: filters.page,
        limit: filters.limit,
        platform: filters.platform || undefined,
        type: (filters.type as 'product' | 'category') || undefined,
        status: (filters.status as 'pending' | 'success' | 'failed') || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        search: filters.search || undefined,
        category: filters.category || undefined
      };
      const response = await scrapingApi.getScrapeLogs(apiFilters);
      setLogs(response.data);
      setPagination(response.pagination);
      if (response.statistics) {
        setStatistics(response.statistics);
      }
    } catch (error: any) {
      toast.error('Failed to load scrape logs');
    } finally {
      setLogsLoading(false);
    }
  };

  // Clear all recent scrapes
  const clearRecentScrapes = () => {
    localStorage.removeItem('recentScrapes');
    setRecentScrapes([]);
    toast.success('Recent scrapes cleared');
  };

  // Retry a scrape
  const retryScrape = (_scrape: RecentScrapeItem) => {
    // This would trigger a new scrape - for now just show a message
    toast('Retry functionality would be implemented here', { icon: 'ℹ️' });
  };

  // Update a scrape log
  const updateScrapeLog = async (logId: string, updateData: UpdateScrapeLogRequest) => {
    try {
      setUpdateLoading(true);
      try {
        await scrapingApi.updateScrapeLog(logId, updateData);
        toast.success('Scrape log updated successfully');
      } catch (error: any) {
        console.log('Primary update method failed, trying alternative...');
        await scrapingApi.updateScrapeLogAlternative(logId, updateData);
        toast.success('Scrape log updated successfully (using alternative method)');
      }
      loadScrapeLogs(); // Refresh the logs
      setEditingLog(null);
    } catch (error: any) {
      console.error('Update failed:', error);
      toast.error(error.message || 'Failed to update scrape log');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Bulk update scrape logs
  const bulkUpdateScrapeLogs = async (updateData: UpdateScrapeLogRequest) => {
    if (selectedLogs.length === 0) {
      toast.error('Please select logs to update');
      return;
    }

    try {
      setUpdateLoading(true);
      const updates = selectedLogs.map(id => ({ id, data: updateData }));
      await scrapingApi.bulkUpdateScrapeLogs(updates);
      toast.success(`Updated ${selectedLogs.length} scrape logs successfully`);
      setSelectedLogs([]);
      loadScrapeLogs(); // Refresh the logs
    } catch (error: any) {
      toast.error(error.message || 'Failed to bulk update scrape logs');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Toggle log selection
  const toggleLogSelection = (logId: string) => {
    setSelectedLogs(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  // Select all logs
  const selectAllLogs = () => {
    setSelectedLogs(logs.map(log => log._id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedLogs([]);
  };

  // Test API connection
  const testApiConnection = async () => {
    try {
      console.log('Testing API connection...');
      const response = await scrapingApi.getScrapeLogs({ page: 1, limit: 1 });
      console.log('API connection successful:', response);
      toast.success('API connection successful');
    } catch (error: any) {
      console.error('API connection failed:', error);
      toast.error(`API connection failed: ${error.message}`);
    }
  };

  // Initial load
  useEffect(() => {
    loadRecentScrapes();
    loadScrapeLogs();
    setLoading(false);
  }, [filters]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadRecentScrapes();
      loadScrapeLogs();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, filters]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

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

  // Format success rate
  const formatSuccessRate = (successful: number, total: number) => {
    if (total === 0) return '0%';
    return `${((successful / total) * 100).toFixed(1)}%`;
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
            onClick={testApiConnection}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center space-x-2"
          >
            <span>Test API</span>
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
              loadScrapeLogs();
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      {(statistics.categoryStats.length > 0 || statistics.platformStats.length > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Scraping Statistics
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Statistics */}
            {statistics.categoryStats.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Category Performance
                </h3>
                <div className="space-y-3">
                  {statistics.categoryStats.map((stat, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{stat.category}</span>
                        <span className={`text-sm font-medium ${getSuccessRateColor(stat.averageSuccessRate)}`}>
                          {stat.averageSuccessRate.toFixed(1)}% success rate
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">{stat.totalSessions}</span> sessions
                        </div>
                        <div>
                          <span className="font-medium text-green-600">{stat.successfulProducts}</span> successful
                        </div>
                        <div>
                          <span className="font-medium text-red-600">{stat.failedProducts}</span> failed
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stat.averageSuccessRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Platform Statistics */}
            {statistics.platformStats.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Platform Performance
                </h3>
                <div className="space-y-3">
                  {statistics.platformStats.map((stat, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPlatformColor(stat.platform)}`}>
                          {stat.platform.charAt(0).toUpperCase() + stat.platform.slice(1)}
                        </span>
                        <span className={`text-sm font-medium ${getSuccessRateColor((stat.successfulProducts / stat.totalProducts) * 100)}`}>
                          {formatSuccessRate(stat.successfulProducts, stat.totalProducts)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">{stat.totalSessions}</span> sessions
                        </div>
                        <div>
                          <span className="font-medium text-green-600">{stat.successfulProducts}</span> successful
                        </div>
                        <div>
                          <span className="font-medium text-red-600">{stat.failedProducts}</span> failed
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(stat.successfulProducts / stat.totalProducts) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Scrapes Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Scrapes</h2>
          <button
            onClick={clearRecentScrapes}
            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        </div>

        {recentScrapes.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recent scrapes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Recent scraping activities will appear here.
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

      {/* Scrape Logs Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Scrape Logs</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadScrapeLogs}
              disabled={logsLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2 disabled:opacity-50"
            >
              {logsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>Refresh Logs</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 mb-6">
          <input
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Search"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={filters.platform}
            onChange={(e) => handleFilterChange('platform', e.target.value)}
          >
            <option value="">All Platforms</option>
            <option value="flipkart">Flipkart</option>
            <option value="amazon">Amazon</option>
            <option value="myntra">Myntra</option>
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="product">Product</option>
            <option value="category">Category</option>
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
          <input
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Category"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          />
          <input
            type="date"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
          <input
            type="date"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />
        </div>

        {/* Bulk Update Controls */}
        {logs.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={selectAllLogs}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Select All ({logs.length})
                </button>
                <button
                  onClick={clearSelection}
                  className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                >
                  Clear Selection
                </button>
                {selectedLogs.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedLogs.length} selected
                  </span>
                )}
              </div>
              {selectedLogs.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => bulkUpdateScrapeLogs({ status: 'completed' })}
                    disabled={updateLoading}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Mark as Completed
                  </button>
                  <button
                    onClick={() => bulkUpdateScrapeLogs({ status: 'failed' })}
                    disabled={updateLoading}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Mark as Failed
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {logs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No scrape logs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Scraping logs will appear here when available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedLogs.length === logs.length && logs.length > 0}
                      onChange={(e) => e.target.checked ? selectAllLogs() : clearSelection()}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
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
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
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
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedLogs.includes(log._id)}
                        onChange={() => toggleLogSelection(log._id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.when || log.createdAt || '')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPlatformColor(log.platform)}`}>
                        {log.platform.charAt(0).toUpperCase() + log.platform.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {log.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-600 truncate max-w-xs" title={log.url}>
                          {log.url.replace(/^https?:\/\//, '').substring(0, 30)}...
                        </div>
                        <button
                          onClick={() => window.open(log.url, '_blank')}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.progress ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${log.progress.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">
                            {log.progress.current}/{log.progress.total}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <Timer className="h-3 w-3 text-gray-400" />
                        <span>{formatDuration(log.duration)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                          {getStatusIcon(log.status)}
                          <span className="ml-1 capitalize">{log.status}</span>
                        </span>
                        {log.retryCount && log.retryCount > 0 && (
                          <span className="inline-flex items-center px-1 py-0.5 rounded text-xs text-orange-600 bg-orange-100">
                            <RotateCcw className="h-2 w-2 mr-1" />
                            {log.retryCount} retries
                          </span>
                        )}
                        {log.errorMessage && (
                          <div className="text-xs text-red-600 truncate max-w-xs" title={log.errorMessage}>
                            {log.errorMessage}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => retryScrape({
                            id: log._id,
                            when: log.when || log.createdAt || '',
                            platform: log.platform,
                            type: log.type,
                            url: log.url,
                            category: log.category,
                            status: log.status,
                            error: log.errorMessage
                          })}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Retry</span>
                        </button>
                        <button
                          onClick={() => setEditingLog(log)}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                        >
                          <span>Edit</span>
                        </button>
                        {log.totalProducts && (
                          <span className="text-xs text-gray-500">
                            {log.scrapedProducts || 0}/{log.totalProducts} products
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total logs)
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Scrape Log</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const updateData: UpdateScrapeLogRequest = {
                totalProducts: parseInt(formData.get('totalProducts') as string) || undefined,
                scrapedProducts: parseInt(formData.get('scrapedProducts') as string) || undefined,
                failedProducts: parseInt(formData.get('failedProducts') as string) || undefined,
                status: formData.get('status') as any || undefined,
                duration: parseInt(formData.get('duration') as string) || undefined,
                errorMessage: formData.get('errorMessage') as string || undefined,
                retryCount: parseInt(formData.get('retryCount') as string) || undefined,
              };
              updateScrapeLog(editingLog._id, updateData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingLog.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="success">Success</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Products</label>
                  <input
                    type="number"
                    name="totalProducts"
                    defaultValue={editingLog.totalProducts || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scraped Products</label>
                  <input
                    type="number"
                    name="scrapedProducts"
                    defaultValue={editingLog.scrapedProducts || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Failed Products</label>
                  <input
                    type="number"
                    name="failedProducts"
                    defaultValue={editingLog.failedProducts || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (ms)</label>
                  <input
                    type="number"
                    name="duration"
                    defaultValue={editingLog.duration || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Retry Count</label>
                  <input
                    type="number"
                    name="retryCount"
                    defaultValue={editingLog.retryCount || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Error Message</label>
                  <textarea
                    name="errorMessage"
                    defaultValue={editingLog.errorMessage || ''}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updateLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrapingDetails;