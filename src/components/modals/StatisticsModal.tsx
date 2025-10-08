import React from 'react';
import { X, BarChart3, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ScrapingOperationStats } from '../../services/api';

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: ScrapingOperationStats | null;
}

const StatisticsModal: React.FC<StatisticsModalProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen || !stats) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Scraping Statistics
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.summary.totalOperations}</div>
              <div className="text-sm text-gray-600">Total Operations</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.summary.totalProducts}</div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">
                {(() => {
                  const total = stats.statusStats.reduce((s, i) => s + i.count, 0) || 1;
                  const success = (stats.statusStats.find(s => s._id === 'success')?.count) || 0;
                  return Math.round((success / total) * 100);
                })()}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>

          {/* Status Stats */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              By Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.statusStats.map((s) => (
                <div key={s._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">{s._id.replace('_', ' ')}</span>
                    {s._id === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {s._id === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                    {s._id === 'pending' && <Clock className="h-4 w-4 text-yellow-600" />}
                  </div>
                  <div className="mt-2 text-2xl font-bold text-gray-900">{s.count}</div>
                  <div className="mt-1 text-sm text-gray-600">Products: {s.totalProducts}</div>
                  <div className="mt-1 text-xs text-gray-500">Avg Duration: {Math.round(s.avgDuration / 1000)}s</div>
                </div>
              ))}
            </div>
          </div>

          {/* Seller Stats */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">By Seller</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Ops</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.sellerStats.map((s) => (
                    <tr key={s._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{s._id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.totalOperations}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">{s.successCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-700">{s.failedCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-700">{s.pendingCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.totalProducts}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.successRate.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent operations */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Operations</h3>
            <div className="bg-white border rounded-lg divide-y">
              {stats.recentOperations.map((op) => (
                <div key={op._id} className="p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{op.url}</div>
                    <div className="text-xs text-gray-500">
                      {op.seller} • {op.type} • {new Date(op.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 capitalize">{op.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

export default StatisticsModal;


