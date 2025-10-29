import React, { useEffect, useMemo, useState } from 'react';
import { adminApi, GetCategoriesResponse, ListSchedulerTasksResponse, SchedulerPlatform, SchedulerResultStatus, SchedulerStatus, SchedulerTask, SchedulerTaskPayload, SchedulerTaskType } from '../../services/api';
import { Clock, Plus, RefreshCcw, Search, Eye, Edit, X, Calendar, Tag, Globe, FileText, CheckCircle, AlertCircle, XCircle, Play } from 'lucide-react';

const platforms: Array<{ value: SchedulerPlatform; label: string }> = [
  { value: 'flipkart', label: 'Flipkart' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'myntra', label: 'Myntra' },
  { value: '1mg', label: '1mg' },
  { value: 'nykaa', label: 'Nykaa' },
  { value: 'ajio', label: 'AJIO' },
  { value: 'meesho', label: 'Meesho' },
  { value: 'snapdeal', label: 'Snapdeal' },
  { value: 'paytm', label: 'Paytm' },
  { value: 'other', label: 'Other' },
];

const statuses: SchedulerStatus[] = ['scheduled', 'running', 'completed', 'cancelled'];
const resultStatuses: SchedulerResultStatus[] = ['pending', 'passed', 'failed'];

const Scheduler: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [categories, setCategories] = useState<GetCategoriesResponse['data']['categories']>([]);
  const [tasks, setTasks] = useState<SchedulerTask[]>([]);
  const [pagination, setPagination] = useState<ListSchedulerTasksResponse['data']['pagination'] | null>(null);
  const [selectedTask, setSelectedTask] = useState<SchedulerTask | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<SchedulerTask | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  const [filters, setFilters] = useState<{ search?: string; platform?: string; status?: string; resultStatus?: string; taskType?: string }>({});

  const [form, setForm] = useState<Required<Pick<SchedulerTaskPayload, 'taskName' | 'taskType' | 'platform'>> & Partial<SchedulerTaskPayload>>({
    taskName: '',
    taskType: 'category',
    platform: 'flipkart',
    url: '',
    mainCategoryId: '',
    subCategoryId: '',
    subSubCategoryId: '',
    startTime: '',
    endTime: '',
    status: 'scheduled',
    resultStatus: 'pending',
    notes: '',
  });

  const subcategories = useMemo(() => {
    const main = categories.find((c) => c.id === form.mainCategoryId);
    return main?.subcategory || [];
  }, [categories, form.mainCategoryId]);

  const subSubcategories = useMemo(() => {
    const sub = subcategories.find((c: any) => c.id === form.subCategoryId);
    return sub?.subcategory || [];
  }, [subcategories, form.subCategoryId]);

  const loadCategories = async () => {
    try {
      const res = await adminApi.getCategories();
      if (res.success) setCategories(res.data.categories);
    } catch (e) {
      // swallow for now
    }
  };

  const loadTasks = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.listSchedulerTasks({ page, limit: 10, ...filters });
      if (res.success) {
        setTasks(res.data.tasks);
        setPagination(res.data.pagination);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.taskName || !form.taskType || !form.platform) return;
    setCreating(true);
    try {
      const payload: SchedulerTaskPayload = {
        taskName: form.taskName,
        taskType: form.taskType as SchedulerTaskType,
        platform: form.platform as SchedulerPlatform,
        url: form.url || undefined,
        mainCategoryId: form.mainCategoryId || undefined,
        subCategoryId: form.subCategoryId || undefined,
        subSubCategoryId: form.subSubCategoryId || undefined,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        status: form.status as SchedulerStatus,
        resultStatus: form.resultStatus as SchedulerResultStatus,
        notes: form.notes || undefined,
      };
      const res = await adminApi.createSchedulerTask(payload);
      if (res.success) {
        await loadTasks(1);
        setForm({
          taskName: '',
          taskType: 'category',
          platform: 'flipkart',
          url: '',
          mainCategoryId: '',
          subCategoryId: '',
          subSubCategoryId: '',
          startTime: '',
          endTime: '',
          status: 'scheduled',
          resultStatus: 'pending',
          notes: '',
        });
      }
    } finally {
      setCreating(false);
    }
  };

  const handleViewDetails = (task: SchedulerTask) => {
    setSelectedTask(task);
    setShowDetailsModal(true);
  };

  const handleEdit = (task: SchedulerTask) => {
    setEditingTask(task);
    setForm({
      taskName: task.taskName,
      taskType: task.taskType,
      platform: task.platform,
      url: task.url || '',
      mainCategoryId: task.mainCategoryId?._id || '',
      subCategoryId: task.subCategoryId?._id || '',
      subSubCategoryId: task.subSubCategoryId?._id || '',
      startTime: task.schedule?.startTime || '',
      endTime: task.schedule?.endTime || '',
      status: task.status,
      resultStatus: task.resultStatus,
      notes: task.notes || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editingTask || !form.taskName || !form.taskType || !form.platform) return;
    setCreating(true);
    try {
      const payload: Partial<SchedulerTaskPayload> = {
        taskName: form.taskName,
        taskType: form.taskType as SchedulerTaskType,
        platform: form.platform as SchedulerPlatform,
        url: form.url || undefined,
        mainCategoryId: form.mainCategoryId || undefined,
        subCategoryId: form.subCategoryId || undefined,
        subSubCategoryId: form.subSubCategoryId || undefined,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        status: form.status as SchedulerStatus,
        resultStatus: form.resultStatus as SchedulerResultStatus,
        notes: form.notes || undefined,
      };
      const res = await adminApi.updateSchedulerTask(editingTask._id, payload);
      if (res.success) {
        await loadTasks(pagination?.currentPage || 1);
        setShowEditModal(false);
        setEditingTask(null);
      }
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: SchedulerStatus) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'running': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultStatusColor = (status: SchedulerResultStatus) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: SchedulerStatus) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'running': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    loadCategories();
    loadTasks(1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Scheduler Tasks</h1>
                <p className="text-sm text-gray-600">Manage and monitor your automated scraping tasks</p>
              </div>
            </div>
            <button 
              onClick={() => loadTasks(pagination?.currentPage || 1)} 
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              <RefreshCcw className="h-4 w-4" /> 
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Create Form Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-purple-600" />
                  Create New Task
                </h2>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task Name</label>
                  <input 
                    value={form.taskName} 
                    onChange={(e) => setForm({ ...form, taskName: e.target.value })} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                    placeholder="Flipkart Shoes Category Crawl" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
                    <select 
                      value={form.taskType} 
                      onChange={(e) => setForm({ ...form, taskType: e.target.value as any })} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="product">Product</option>
                      <option value="category">Category</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                    <select 
                      value={form.platform} 
                      onChange={(e) => setForm({ ...form, platform: e.target.value as any })} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {platforms.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL (optional)</label>
                  <input 
                    value={form.url || ''} 
                    onChange={(e) => setForm({ ...form, url: e.target.value })} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                    placeholder="https://www.flipkart.com/sports-shoes" 
                  />
                </div>

                {/* Category Hierarchy */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Category Selection</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Main Category</label>
                    <select 
                      value={form.mainCategoryId || ''} 
                      onChange={(e) => setForm({ ...form, mainCategoryId: e.target.value, subCategoryId: '', subSubCategoryId: '' })} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Select Main Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Sub Category</label>
                    <select 
                      value={form.subCategoryId || ''} 
                      onChange={(e) => setForm({ ...form, subCategoryId: e.target.value, subSubCategoryId: '' })} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50" 
                      disabled={!form.mainCategoryId}
                    >
                      <option value="">Select Sub Category</option>
                      {subcategories.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Sub-Sub Category</label>
                    <select 
                      value={form.subSubCategoryId || ''} 
                      onChange={(e) => setForm({ ...form, subSubCategoryId: e.target.value })} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50" 
                      disabled={!form.subCategoryId}
                    >
                      <option value="">Select Sub-Sub Category</option>
                      {subSubcategories.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input 
                      type="datetime-local" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                      value={form.startTime ? new Date(form.startTime).toISOString().slice(0,16) : ''} 
                      onChange={(e) => setForm({ ...form, startTime: e.target.value ? new Date(e.target.value).toISOString() : '' })} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <input 
                      type="datetime-local" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                      value={form.endTime ? new Date(form.endTime).toISOString().slice(0,16) : ''} 
                      onChange={(e) => setForm({ ...form, endTime: e.target.value ? new Date(e.target.value).toISOString() : '' })} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select 
                      value={form.status} 
                      onChange={(e) => setForm({ ...form, status: e.target.value as SchedulerStatus })} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Result Status</label>
                    <select 
                      value={form.resultStatus} 
                      onChange={(e) => setForm({ ...form, resultStatus: e.target.value as SchedulerResultStatus })} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {resultStatuses.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea 
                    value={form.notes || ''} 
                    onChange={(e) => setForm({ ...form, notes: e.target.value })} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                    rows={3} 
                    placeholder="Morning run for shoes category" 
                  />
                </div>

                <button 
                  disabled={creating || !form.taskName} 
                  onClick={handleCreate} 
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                >
                  <Plus className="h-5 w-5" />
                  {creating ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Scheduled Tasks</h2>
                  <div className="text-sm text-gray-500">
                    {pagination ? `${pagination.totalItems} total tasks` : ''}
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                      placeholder="Search by task name..." 
                      value={filters.search || ''} 
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })} 
                      onKeyDown={(e) => { if (e.key === 'Enter') loadTasks(1); }} 
                    />
                  </div>
                  <select 
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                    value={filters.platform || ''} 
                    onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
                  >
                    <option value="">All Platforms</option>
                    {platforms.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  <select 
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                    value={filters.taskType || ''} 
                    onChange={(e) => setFilters({ ...filters, taskType: e.target.value })}
                  >
                    <option value="">All Types</option>
                    <option value="product">Product</option>
                    <option value="category">Category</option>
                  </select>
                  <select 
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                    value={filters.status || ''} 
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">All Status</option>
                    {statuses.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                  <select 
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                    value={filters.resultStatus || ''} 
                    onChange={(e) => setFilters({ ...filters, resultStatus: e.target.value })}
                  >
                    <option value="">All Results</option>
                    {resultStatuses.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                  <button 
                    onClick={() => loadTasks(1)} 
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>

              {/* Tasks Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Details</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                          <div className="flex items-center justify-center">
                            <RefreshCcw className="h-5 w-5 animate-spin mr-2" />
                            Loading tasks...
                          </div>
                        </td>
                      </tr>
                    ) : tasks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                          <div className="flex flex-col items-center">
                            <Clock className="h-12 w-12 text-gray-300 mb-4" />
                            <p className="text-lg font-medium text-gray-900 mb-2">No tasks found</p>
                            <p className="text-gray-500">Create your first scheduler task to get started</p>
                          </div>
                        </td>
                      </tr>
                    ) : tasks.map((task) => (
                      <tr key={task._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-medium text-gray-900">{task.taskName}</h3>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {task.taskType}
                                </span>
                              </div>
                              {task.url && (
                                <p className="text-xs text-gray-500 truncate max-w-xs" title={task.url}>
                                  <Globe className="h-3 w-3 inline mr-1" />
                                  {task.url}
                                </p>
                              )}
                              {task.notes && (
                                <p className="text-xs text-gray-500 mt-1">
                                  <FileText className="h-3 w-3 inline mr-1" />
                                  {task.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-900 capitalize">{task.platform}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center gap-1 mb-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="font-medium">Start:</span>
                            </div>
                            <div className="text-xs text-gray-600 ml-4">
                              {task.schedule?.startTime ? new Date(task.schedule.startTime).toLocaleString() : 'Not set'}
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="font-medium">End:</span>
                            </div>
                            <div className="text-xs text-gray-600 ml-4">
                              {task.schedule?.endTime ? new Date(task.schedule.endTime).toLocaleString() : 'Not set'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(task.status)}
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Tag className="h-3 w-3 text-gray-400" />
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getResultStatusColor(task.resultStatus)}`}>
                                {task.resultStatus.charAt(0).toUpperCase() + task.resultStatus.slice(1)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(task)}
                              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(task)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Task"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total tasks)
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" 
                        disabled={!pagination.hasPrev} 
                        onClick={() => loadTasks(Math.max(1, (pagination.currentPage || 1) - 1))}
                      >
                        Previous
                      </button>
                      <button 
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" 
                        disabled={!pagination.hasNext} 
                        onClick={() => loadTasks((pagination.currentPage || 1) + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      {showDetailsModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Task Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task Name</label>
                  <p className="text-sm text-gray-900">{selectedTask.taskName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedTask.taskType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedTask.platform}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedTask.status)}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
                      {selectedTask.status.charAt(0).toUpperCase() + selectedTask.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Result Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getResultStatusColor(selectedTask.resultStatus)}`}>
                    {selectedTask.resultStatus.charAt(0).toUpperCase() + selectedTask.resultStatus.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                  <p className="text-sm text-gray-900">{new Date(selectedTask.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              {selectedTask.url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                  <p className="text-sm text-blue-600 break-all">{selectedTask.url}</p>
                </div>
              )}

              {(selectedTask.mainCategoryId || selectedTask.subCategoryId || selectedTask.subSubCategoryId) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                  <div className="space-y-2">
                    {selectedTask.mainCategoryId && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Main:</span>
                        <span className="text-sm text-gray-900">{selectedTask.mainCategoryId.name || selectedTask.mainCategoryId}</span>
                      </div>
                    )}
                    {selectedTask.subCategoryId && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Sub:</span>
                        <span className="text-sm text-gray-900">{selectedTask.subCategoryId.name || selectedTask.subCategoryId}</span>
                      </div>
                    )}
                    {selectedTask.subSubCategoryId && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Sub-Sub:</span>
                        <span className="text-sm text-gray-900">{selectedTask.subSubCategoryId.name || selectedTask.subSubCategoryId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(selectedTask.schedule?.startTime || selectedTask.schedule?.endTime) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                  <div className="space-y-2">
                    {selectedTask.schedule?.startTime && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">Start:</span>
                        <span className="text-sm text-gray-900">{new Date(selectedTask.schedule.startTime).toLocaleString()}</span>
                      </div>
                    )}
                    {selectedTask.schedule?.endTime && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">End:</span>
                        <span className="text-sm text-gray-900">{new Date(selectedTask.schedule.endTime).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedTask.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTask.notes}</p>
                </div>
              )}

              {selectedTask.createdBy && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
                  <div className="text-sm text-gray-900">
                    <p className="font-medium">{selectedTask.createdBy.name}</p>
                    <p className="text-gray-500">{selectedTask.createdBy.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Name</label>
                <input 
                  value={form.taskName} 
                  onChange={(e) => setForm({ ...form, taskName: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
                  <select 
                    value={form.taskType} 
                    onChange={(e) => setForm({ ...form, taskType: e.target.value as any })} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="product">Product</option>
                    <option value="category">Category</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                  <select 
                    value={form.platform} 
                    onChange={(e) => setForm({ ...form, platform: e.target.value as any })} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {platforms.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL (optional)</label>
                <input 
                  value={form.url || ''} 
                  onChange={(e) => setForm({ ...form, url: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select 
                    value={form.status} 
                    onChange={(e) => setForm({ ...form, status: e.target.value as SchedulerStatus })} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Result Status</label>
                  <select 
                    value={form.resultStatus} 
                    onChange={(e) => setForm({ ...form, resultStatus: e.target.value as SchedulerResultStatus })} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {resultStatuses.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea 
                  value={form.notes || ''} 
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" 
                  rows={3} 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={creating || !form.taskName}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {creating ? 'Updating...' : 'Update Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduler;


