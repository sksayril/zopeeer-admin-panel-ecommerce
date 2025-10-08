import React, { useState, useEffect } from 'react';
import { X, Globe, Clock, CheckCircle, XCircle, AlertCircle, Loader, Download, RefreshCw, Trash2, Tag, FileText, Settings } from 'lucide-react';
import { scrapingApi, ScrapingOperation } from '../../services/api';
import toast from 'react-hot-toast';

interface OperationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: ScrapingOperation | null;
  onOperationUpdate: () => void;
}

const OperationDetailsModal: React.FC<OperationDetailsModalProps> = ({
  isOpen,
  onClose,
  operation,
  onOperationUpdate
}) => {
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  useEffect(() => {
    if (operation && operation.status === 'success' && operation._id) {
      loadScrapedData();
    }
  }, [operation]);

  const loadScrapedData = async () => {
    if (!operation?._id) return;

    try {
      setLoadingData(true);
      const response = await scrapingApi.getScrapedData(operation._id);
      setScrapedData(response.data);
    } catch (error: any) {
      console.error('Failed to load scraped data:', error);
    } finally {
      setLoadingData(false);
    }
  };

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

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleRetry = async () => {
    if (!operation?._id) return;

    try {
      await scrapingApi.retryScrapingOperation(operation._id);
      toast.success('Operation queued for retry');
      onOperationUpdate();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (!operation?._id) return;

    if (window.confirm('Are you sure you want to delete this operation?')) {
      try {
        await scrapingApi.deleteScrapingOperation(operation._id);
        toast.success('Operation deleted');
        onOperationUpdate();
        onClose();
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  if (!isOpen || !operation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Operation Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(operation.status)}`}>
                  {getStatusIcon(operation.status)}
                  <span className="ml-2">{operation.status}</span>
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seller</label>
                <p className="text-sm text-gray-900">{operation.seller.charAt(0).toUpperCase() + operation.seller.slice(1)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <p className="text-sm text-gray-900">{operation.type.charAt(0).toUpperCase() + operation.type.slice(1)}</p>
              </div>

              {operation.category && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="text-sm text-gray-900">{operation.category}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p className="text-sm text-gray-900">{formatDate(operation.createdAt)}</p>
              </div>

              {operation.startTime && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Started</label>
                  <p className="text-sm text-gray-900">{formatDate(operation.startTime)}</p>
                </div>
              )}

              {operation.endTime && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Completed</label>
                  <p className="text-sm text-gray-900">{formatDate(operation.endTime)}</p>
                </div>
              )}

              {operation.duration && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <p className="text-sm text-gray-900">{formatDuration(operation.duration)}</p>
                </div>
              )}
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Globe className="inline h-4 w-4 mr-1" />
              URL
            </label>
            <p className="text-sm text-gray-900 break-all bg-gray-50 p-3 rounded-lg">{operation.url}</p>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Progress</label>
            <div className="flex items-center space-x-4">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${operation.progress.percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 min-w-0">
                {operation.progress.current}/{operation.progress.total} ({operation.progress.percentage}%)
              </span>
            </div>
          </div>

          {/* Statistics */}
          {(operation.totalProducts || operation.scrapedProducts || operation.failedProducts) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {operation.totalProducts && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{operation.totalProducts}</div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
              )}
              {operation.scrapedProducts && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{operation.scrapedProducts}</div>
                  <div className="text-sm text-gray-600">Scraped</div>
                </div>
              )}
              {operation.failedProducts && (
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">{operation.failedProducts}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
              )}
            </div>
          )}

          {/* Configuration */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Use Puppeteer</label>
                <p className="text-sm text-gray-900">{operation.config.usePuppeteer ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeout</label>
                <p className="text-sm text-gray-900">{operation.config.timeout}ms</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wait Time</label>
                <p className="text-sm text-gray-900">{operation.config.waitTime}ms</p>
              </div>
            </div>
          </div>

          {/* Retry Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Retry Count</label>
              <p className="text-sm text-gray-900">{operation.retryCount}/{operation.maxRetries}</p>
            </div>
            {operation.userAgent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Agent</label>
                <p className="text-sm text-gray-900 truncate">{operation.userAgent}</p>
              </div>
            )}
          </div>

          {/* Error Information */}
          {operation.errorMessage && (
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h3 className="text-lg font-medium text-red-900 mb-2">Error Details</h3>
              <p className="text-sm text-red-800 mb-2">{operation.errorMessage}</p>
              {operation.errorDetails && (
                <details className="mt-2">
                  <summary className="text-sm text-red-700 cursor-pointer">View Error Details</summary>
                  <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">
                    {JSON.stringify(operation.errorDetails, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Tags */}
          {operation.tags && operation.tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="inline h-4 w-4 mr-1" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {operation.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {operation.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="inline h-4 w-4 mr-1" />
                Notes
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{operation.notes}</p>
            </div>
          )}

          {/* Scraped Data */}
          {operation.status === 'success' && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Scraped Data
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowRawData(!showRawData)}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    {showRawData ? 'Hide Raw' : 'Show Raw'}
                  </button>
                  {loadingData && <Loader className="h-4 w-4 animate-spin text-gray-400" />}
                </div>
              </div>

              {scrapedData ? (
                <div className="space-y-4">
                  {showRawData ? (
                    <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                      {JSON.stringify(scrapedData, null, 2)}
                    </pre>
                  ) : (
                    <div className="space-y-4">
                      {scrapedData.product && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Product Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {scrapedData.product.title && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <p className="text-sm text-gray-900">{scrapedData.product.title}</p>
                              </div>
                            )}
                            {scrapedData.product.price && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                <p className="text-sm text-gray-900">₹{scrapedData.product.price}</p>
                              </div>
                            )}
                            {scrapedData.product.brand && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                <p className="text-sm text-gray-900">{scrapedData.product.brand}</p>
                              </div>
                            )}
                            {scrapedData.product.rating && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                <p className="text-sm text-gray-900">{scrapedData.product.rating}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Download className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No scraped data available</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            {operation.status === 'failed' && (
              <button
                onClick={handleRetry}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry</span>
              </button>
            )}
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationDetailsModal;
