import React, { useEffect, useState } from 'react';
// (icons removed)
import { scrapingApi, GetScrapeLogsStatsResponse, ScrapeLogsStatsData } from '../../services/api';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

const Dashboard: React.FC = () => {
  // Removed legacy cards data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Scrape Logs Overview</p>
      </div>

      <ScrapeLogsStatsWidget />
    </div>
  );
};

export default Dashboard;

// Scrape Logs Stats Widget
const STATUS_COLORS: Record<string, string> = {
  success: '#16a34a',
  failed: '#dc2626',
  pending: '#ca8a04',
  in_progress: '#2563eb',
  cancelled: '#6b7280',
};

const ScrapeLogsStatsWidget: React.FC = () => {
  const [stats, setStats] = useState<ScrapeLogsStatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const iso = (d: Date) => new Date(d).toISOString().slice(0, 10);
  const today = iso(new Date());
  const tomorrow = iso(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [filters, setFilters] = useState<{ startDate: string; endDate: string; platform?: string }>({
    startDate: today,
    endDate: tomorrow,
    platform: 'flipkart',
  });

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res: GetScrapeLogsStatsResponse = await scrapingApi.getScrapeLogsStats({
        startDate: filters.startDate,
        endDate: filters.endDate,
        platform: filters.platform,
      });
      setStats(res.data);
    } catch (e: any) {
      setError(e.message || 'Failed to load scrape logs stats');
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // auto-apply on filter changes (no button click needed)
  useEffect(() => {
    const id = setTimeout(() => {
      loadStats();
    }, 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate, filters.platform]);

  const pieData = stats
    ? [
        { name: 'Success', value: stats.counts.success, key: 'success' },
        { name: 'Failed', value: stats.counts.failed, key: 'failed' },
        { name: 'Pending', value: stats.counts.pending, key: 'pending' },
        { name: 'In Progress', value: stats.counts.in_progress, key: 'in_progress' },
        { name: 'Cancelled', value: stats.counts.cancelled, key: 'cancelled' },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Scrape Logs Overview</h3>
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
            className="px-2 py-1 border rounded text-sm"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
            className="px-2 py-1 border rounded text-sm"
          />
          <select
            value={filters.platform || ''}
            onChange={(e) => setFilters((f) => ({ ...f, platform: e.target.value || undefined }))}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="">All</option>
            <option value="flipkart">Flipkart</option>
            <option value="amazon">Amazon</option>
            <option value="myntra">Myntra</option>
          </select>
          <button onClick={loadStats} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Apply</button>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading stats...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cards */}
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700">Success</p>
              <p className="text-xl font-semibold text-green-700">{stats.counts.success}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-xs text-red-700">Failed</p>
              <p className="text-xl font-semibold text-red-700">{stats.counts.failed}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-700">Pending</p>
              <p className="text-xl font-semibold text-yellow-700">{stats.counts.pending}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">In Progress</p>
              <p className="text-xl font-semibold text-blue-700">{stats.counts.in_progress}</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-xs text-gray-700">Success Rate</p>
              <p className="text-xl font-semibold text-gray-900">{stats.successRate.toFixed(1)}%</p>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="col-span-1">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ReTooltip formatter={(value: any, name: any, props: any) => [`${value}`, `${props.payload.name}`]} />
                  <Legend />
                  <Pie
                    dataKey="value"
                    data={pieData}
                    innerRadius={50}
                    outerRadius={110}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={2}
                    labelLine={true}
                    label={(e: any) => `${e.name}: ${e.value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.key]} stroke="#ffffff" strokeWidth={1} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line Chart */}
          <div className="col-span-1 lg:col-span-1">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.chart} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Legend />
                  <ReTooltip />
                  <Line type="monotone" dataKey="total" stroke="#111827" name="Total" />
                  <Line type="monotone" dataKey="success" stroke={STATUS_COLORS.success} name="Success" />
                  <Line type="monotone" dataKey="failed" stroke={STATUS_COLORS.failed} name="Failed" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};