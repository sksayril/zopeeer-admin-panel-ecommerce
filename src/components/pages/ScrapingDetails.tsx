import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Play, 
  Pause, 
  RefreshCw, 
  Trash2, 
  Eye, 
  Filter, 
  Search, 
  Plus,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  Calendar,
  Tag,
  Globe,
  Settings,
  Download,
  Upload
} from 'lucide-react';
import { scrapingApi, ScrapingOperation, ScrapingOperationStats, JobProcessorStatus } from '../../services/api';
import CreateOperationModal from '../modals/CreateOperationModal';
import OperationDetailsModal from '../modals/OperationDetailsModal';
import StatisticsModal from '../modals/StatisticsModal';
import toast from 'react-hot-toast';

const ScrapingDetails: React.FC = () => {
  const [operations, setOperations] = useState<ScrapingOperation[]>([]);
  const [stats, setStats] = useState<ScrapingOperationStats | null>(null);
  const [processorStatus, setProcessorStatus] = useState<JobProcessorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOperation, setSelectedOperation] = useState<ScrapingOperation | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    seller: '',
    type: '',
    search: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Auto-refresh interval
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Load operations
  const loadOperations = async () => {
    try {
      setLoading(true);
      const response = await scrapingApi.getScrapingOperations(filters);
      setOperations(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await scrapingApi.getScrapingOperationsStats();
      setStats(response.data);
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  };

  // Load processor status
  const loadProcessorStatus = async () => {
    try {
      const response = await scrapingApi.getJobProcessorStatus();
      setProcessorStatus(response.data);
    } catch (error: any) {
      console.error('Failed to load processor status:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadOperations();
    loadStats();
    loadProcessorStatus();
  }, [filters]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadOperations();
      loadStats();
      loadProcessorStatus();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, filters]);

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
      case 'failed': return 'text-red-600 bg-red-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'in_progress': return <Loader className="h-4 w-4 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Format duration
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scraping Operations</h1>
          <p className="text-gray-600 mt-1">Monitor and manage web scraping operations</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowStatsModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
            <span>Statistics</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>New Operation</span>
          </button>
        </div>
      </div>

      {/* Processor Status Card */}
      {processorStatus && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Job Processor Status</h2>
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${processorStatus.isProcessing ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {processorStatus.isProcessing ? 'Running' : 'Stopped'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{processorStatus.pendingOperations}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{processorStatus.inProgressOperations}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{processorStatus.processingIntervalMs}ms</div>
              <div className="text-sm text-gray-600">Interval</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">
                {processorStatus.stats.reduce((sum, stat) => sum + stat.count, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Operations</div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={async () => {
                try {
                  if (processorStatus.isProcessing) {
                    await scrapingApi.stopJobProcessor();
                    toast.success('Processor stopped');
                  } else {
                    await scrapingApi.startJobProcessor();
                    toast.success('Processor started');
                  }
                  loadProcessorStatus();
                } catch (error: any) {
                  toast.error(error.message);
                }
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                processorStatus.isProcessing
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {processorStatus.isProcessing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{processorStatus.isProcessing ? 'Stop' : 'Start'}</span>
            </button>
            
            <button
              onClick={async () => {
                try {
                  await scrapingApi.triggerJobProcessor();
                  toast.success('Processing triggered');
                  loadOperations();
                } catch (error: any) {
                  toast.error(error.message);
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Trigger</span>
            </button>

            <button
              onClick={async () => {
                try {
                  await scrapingApi.retryFailedOperations();
                  toast.success('Failed operations retried');
                  loadOperations();
                } catch (error: any) {
                  toast.error(error.message);
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Failed</span>
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search operations..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filters.seller}
            onChange={(e) => handleFilterChange('seller', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Sellers</option>
            <option value="amazon">Amazon</option>
            <option value="flipkart">Flipkart</option>
            <option value="myntra">Myntra</option>
            <option value="tatacliq">Tata CLiQ</option>
            <option value="jiomart">JioMart</option>
            <option value="ajio">Ajio</option>
            <option value="chroma">Chroma</option>
            <option value="vijaysales">Vijay Sales</option>
            <option value="nykaa">Nykaa</option>
            <option value="1mg">1mg</option>
            <option value="pharmeasy">PharmEasy</option>
            <option value="netmeds">Netmeds</option>
            <option value="blinkit">Blinkit</option>
            <option value="swiggy-instamart">Swiggy Instamart</option>
            <option value="zepto">Zepto</option>
            <option value="bigbasket">BigBasket</option>
            <option value="pepperfry">Pepperfry</option>
            <option value="homecentre">Home Centre</option>
            <option value="shoppersstop">Shoppers Stop</option>
            <option value="urbanic">Urbanic</option>
            <option value="ikea">IKEA</option>
            <option value="biba">BIBA</option>
            <option value="lifestylestores">Lifestyle Stores</option>
            <option value="medplusmart">MedPlus Mart</option>
            <option value="truemeds">TrueMeds</option>
            <option value="apollopharmacy">Apollo Pharmacy</option>
            <option value="wellnessforever">Wellness Forever</option>
            <option value="dmart">D-Mart</option>
            <option value="licious">Licious</option>
          </select>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="product">Product</option>
            <option value="category">Category</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">Auto-refresh</span>
            </label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value={5000}>5 seconds</option>
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
              <option value={60000}>1 minute</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {operations.length} of {pagination.totalItems} operations
          </div>
        </div>
      </div>

      {/* Operations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="ml-2 text-gray-600">Loading operations...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {operations.map((operation) => (
                    <tr key={operation._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <Globe className="h-5 w-5 text-indigo-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {operation.seller.charAt(0).toUpperCase() + operation.seller.slice(1)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {operation.type.charAt(0).toUpperCase() + operation.type.slice(1)}
                              {operation.category && ` • ${operation.category}`}
                            </div>
                            <div className="text-xs text-gray-400 truncate max-w-xs">
                              {operation.url}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(operation.status)}`}>
                          {getStatusIcon(operation.status)}
                          <span className="ml-1">{operation.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${operation.progress.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {operation.progress.current}/{operation.progress.total}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {operation.duration ? formatDuration(operation.duration) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(operation.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedOperation(operation);
                              setShowDetailsModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {operation.status === 'failed' && (
                            <button
                              onClick={async () => {
                                try {
                                  await scrapingApi.retryScrapingOperation(operation._id);
                                  toast.success('Operation queued for retry');
                                  loadOperations();
                                } catch (error: any) {
                                  toast.error(error.message);
                                }
                              }}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this operation?')) {
                                try {
                                  await scrapingApi.deleteScrapingOperation(operation._id);
                                  toast.success('Operation deleted');
                                  loadOperations();
                                } catch (error: any) {
                                  toast.error(error.message);
                                }
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{pagination.totalItems}</span>{' '}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pagination.currentPage
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <CreateOperationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadOperations();
          loadStats();
        }}
      />

      <OperationDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        operation={selectedOperation}
        onOperationUpdate={() => {
          loadOperations();
          loadStats();
        }}
      />

      <StatisticsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        stats={stats}
      />
    </div>
  );
};

export default ScrapingDetails;
