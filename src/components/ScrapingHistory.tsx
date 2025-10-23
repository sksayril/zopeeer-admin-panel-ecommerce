/**
 * Enhanced Scraping History Component
 * 
 * This component displays comprehensive scraping history with filtering, statistics,
 * and detailed session information stored in localStorage.
 */

import React, { useState, useEffect } from 'react';
import { 
  History, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  BarChart3,
  Calendar,
  Tag,
  ExternalLink,
  RefreshCw,
  Search,
  X,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Activity
} from 'lucide-react';
import { scrapingHistoryService, ScrapingSession, ScrapingStatistics } from '../services/scrapingHistory';

interface ScrapingHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScrapingHistory: React.FC<ScrapingHistoryProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<ScrapingSession[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ScrapingSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ScrapingSession | null>(null);
  const [statistics, setStatistics] = useState<ScrapingStatistics>({
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
  const [filters, setFilters] = useState({
    platform: '',
    category: '',
    status: '',
    dateRange: '',
    search: ''
  });
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  // Subscribe to scraping history updates
  useEffect(() => {
    const handleStorageChange = () => {
      loadHistory();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      const refreshInterval = setInterval(loadHistory, 5000); // Refresh every 5 seconds
      return () => clearInterval(refreshInterval);
    }
  }, [isOpen]);

  useEffect(() => {
    applyFilters();
  }, [history, filters]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const historyData = scrapingHistoryService.getHistory();
      const stats = scrapingHistoryService.getStatistics();
      
      setHistory(historyData);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading scraping history:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...history];

    if (filters.platform) {
      filtered = filtered.filter(session => 
        session.platform.toLowerCase().includes(filters.platform.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter(session => 
        session.category?.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(session => session.status === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(session => 
        session.url.toLowerCase().includes(searchLower) ||
        session.platform.toLowerCase().includes(searchLower) ||
        session.category?.toLowerCase().includes(searchLower) ||
        session.action.toLowerCase().includes(searchLower)
      );
    }

    if (filters.dateRange) {
      const now = new Date();
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
      
      filtered = filtered.filter(session => 
        new Date(session.when) >= cutoffDate
      );
    }

    setFilteredHistory(filtered);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      platform: '',
      category: '',
      status: '',
      dateRange: '',
      search: ''
    });
  };

  const exportHistory = () => {
    const data = scrapingHistoryService.exportHistory();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraping-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all scraping history?')) {
      scrapingHistoryService.clearAllHistory();
      loadHistory();
    }
  };

  const deleteSession = (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      scrapingHistoryService.deleteSession(sessionId);
      loadHistory();
    }
  };

  const retrySession = (session: ScrapingSession) => {
    // Create a new session based on the failed one
    const newSessionId = scrapingHistoryService.addSession({
      platform: session.platform,
      type: session.type,
      url: session.url,
      category: session.category,
      action: 'retry_scraping',
      status: 'pending'
    });
    
    // Update the original session to mark it as retried
    scrapingHistoryService.updateSession(session.id, {
      action: 'retried',
      retryCount: (session.retryCount || 0) + 1
    });
    
    loadHistory();
  };

  const formatDuration = (ms: number): string => {
    return scrapingHistoryService.formatDuration(ms);
  };

  const formatDate = (dateString: string): string => {
    return scrapingHistoryService.formatDate(dateString);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const viewSessionDetails = (session: ScrapingSession) => {
    setSelectedSession(session);
    setShowSessionDetails(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <History className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Scraping History</h2>
            {loading && <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadHistory}
              className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Enhanced Statistics */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium text-gray-600">Total Sessions</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.totalSessions}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Completed</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.completedSessions}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-gray-600">Failed</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.failedSessions}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2">
                <Tag className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Success Rate</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Math.round(statistics.averageSuccessRate)}%
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Total Products</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.totalProducts}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-600">Duration</span>
              </div>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {formatDuration(statistics.totalDuration)}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search sessions..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
              <select
                value={filters.platform}
                onChange={(e) => handleFilterChange('platform', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Platforms</option>
                <option value="flipkart">Flipkart</option>
                <option value="amazon">Amazon</option>
                <option value="myntra">Myntra</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                placeholder="Search category..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="in_progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Time</option>
                <option value="1">Last 24 Hours</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Clear Filters</span>
            </button>
            <button
              onClick={exportHistory}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={clearAllHistory}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {/* Enhanced History List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No scraping history found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((session) => (
                <div
                  key={session.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(session.status)}
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {session.platform.charAt(0).toUpperCase() + session.platform.slice(1)} - {session.type}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {session.category && `${session.category} • `}
                          {formatDate(session.when)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                        {session.status.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => viewSessionDetails(session)}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {session.status === 'failed' && (
                        <button
                          onClick={() => retrySession(session)}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Retry Session"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Session"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total Products:</span>
                      <span className="ml-2 font-medium">{session.totalProducts || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Scraped:</span>
                      <span className="ml-2 font-medium text-green-600">{session.scrapedProducts || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Failed:</span>
                      <span className="ml-2 font-medium text-red-600">{session.failedProducts || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Success Rate:</span>
                      <span className="ml-2 font-medium">{Math.round(session.successRate || 0)}%</span>
                    </div>
                  </div>
                  
                  {session.duration && session.duration > 0 && (
                    <div className="mt-3 text-sm text-gray-500">
                      <span>Duration: {formatDuration(session.duration)}</span>
                    </div>
                  )}

                  {session.progress && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{session.progress.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${session.progress.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {session.errorMessage && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Error:</strong> {session.errorMessage}
                      </p>
                    </div>
                  )}

                  {session.url && (
                    <div className="mt-3">
                      <button
                        onClick={() => window.open(session.url, '_blank')}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>View URL</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Session Details Modal */}
        {showSessionDetails && selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Session Details</h3>
                <button
                  onClick={() => setShowSessionDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Session Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Session Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">ID:</span>
                          <span className="font-mono">{selectedSession.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Platform:</span>
                          <span className="capitalize">{selectedSession.platform}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="capitalize">{selectedSession.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSession.status)}`}>
                            {selectedSession.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Action:</span>
                          <span>{selectedSession.action}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Timing</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Started:</span>
                          <span>{formatDate(selectedSession.startedAt)}</span>
                        </div>
                        {selectedSession.completedAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Completed:</span>
                            <span>{formatDate(selectedSession.completedAt)}</span>
                          </div>
                        )}
                        {selectedSession.duration && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duration:</span>
                            <span>{formatDuration(selectedSession.duration)}</span>
                          </div>
                        )}
                        {selectedSession.retryCount && selectedSession.retryCount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Retry Count:</span>
                            <span>{selectedSession.retryCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Statistics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">Total Products</div>
                        <div className="text-lg font-semibold">{selectedSession.totalProducts || 0}</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">Scraped</div>
                        <div className="text-lg font-semibold text-green-600">{selectedSession.scrapedProducts || 0}</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">Failed</div>
                        <div className="text-lg font-semibold text-red-600">{selectedSession.failedProducts || 0}</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">Success Rate</div>
                        <div className="text-lg font-semibold text-blue-600">{Math.round(selectedSession.successRate || 0)}%</div>
                      </div>
                    </div>
                  </div>

                  {/* URL */}
                  {selectedSession.url && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">URL</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <button
                          onClick={() => window.open(selectedSession.url, '_blank')}
                          className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="break-all">{selectedSession.url}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {selectedSession.errorMessage && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Error Details</h4>
                      <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                        <p className="text-sm text-red-800">{selectedSession.errorMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Category Products */}
                  {selectedSession.categoryProducts && Object.keys(selectedSession.categoryProducts).length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Category Breakdown</h4>
                      <div className="space-y-3">
                        {Object.entries(selectedSession.categoryProducts).map(([categoryUrl, data]) => (
                          <div key={categoryUrl} className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm font-medium text-gray-900 mb-2">
                              {categoryUrl}
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Total:</span>
                                <span className="ml-2 font-medium">{data.total}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Scraped:</span>
                                <span className="ml-2 font-medium text-green-600">{data.scraped}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Failed:</span>
                                <span className="ml-2 font-medium text-red-600">{data.failed}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrapingHistory;