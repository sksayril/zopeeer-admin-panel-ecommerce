import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Package, Grid3X3, List, Loader2, ExternalLink, Upload, Download, FileText, X, CheckCircle, AlertCircle, Eye as PreviewIcon, Calendar, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi, Product, BulkUploadResponse } from '../../services/api';
import toast from 'react-hot-toast';
import ViewDataModal from '../ViewDataModal';
import EditProductForm from '../forms/EditProductForm';

// Remove the local Product interface since we're importing it from api.ts

const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNext: false,
    hasPrev: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(12);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Date filtering states
  const [dateFilters, setDateFilters] = useState({
    createdFrom: '',
    createdTo: '',
    updatedFrom: '',
    updatedTo: ''
  });
  const [showAdvancedDatePicker, setShowAdvancedDatePicker] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  
  // Bulk upload states
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // CSV Preview states
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);


  // Date preset options
  const datePresets = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 days', value: 'last7days' },
    { label: 'Last 14 days', value: 'last14days' },
    { label: 'Last 30 days', value: 'last30days' },
    { label: 'This week', value: 'thisweek' },
    { label: 'Last week', value: 'lastweek' },
    { label: 'This month', value: 'thismonth' },
    { label: 'Last month', value: 'lastmonth' },
    { label: 'This year', value: 'thisyear' },
    { label: 'Last year', value: 'lastyear' }
  ];

  // Helper function to get date range from preset
  const getDateRangeFromPreset = (preset: string) => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    switch (preset) {
      case 'today':
        return {
          start: startOfDay.toISOString().split('T')[0],
          end: endOfDay.toISOString().split('T')[0]
        };
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          start: yesterday.toISOString().split('T')[0],
          end: yesterday.toISOString().split('T')[0]
        };
      case 'last7days':
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);
        return {
          start: last7Days.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case 'last14days':
        const last14Days = new Date(today);
        last14Days.setDate(last14Days.getDate() - 14);
        return {
          start: last14Days.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case 'last30days':
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);
        return {
          start: last30Days.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case 'thisweek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return {
          start: startOfWeek.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case 'lastweek':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        return {
          start: lastWeekStart.toISOString().split('T')[0],
          end: lastWeekEnd.toISOString().split('T')[0]
        };
      case 'thismonth':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          start: startOfMonth.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case 'lastmonth':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          start: lastMonthStart.toISOString().split('T')[0],
          end: lastMonthEnd.toISOString().split('T')[0]
        };
      case 'thisyear':
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        return {
          start: startOfYear.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case 'lastyear':
        const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
        return {
          start: lastYearStart.toISOString().split('T')[0],
          end: lastYearEnd.toISOString().split('T')[0]
        };
      default:
        return { start: '', end: '' };
    }
  };

  // Helper function to format date for display
  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to get calendar days
  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const fetchProducts = async (page: number = 1, search: string = '', filters?: typeof dateFilters) => {
    try {
      setLoading(true);
      const response = await adminApi.getProducts({
        page,
        limit,
        search: search || undefined,
        createdFrom: filters?.createdFrom || undefined,
        createdTo: filters?.createdTo || undefined,
        updatedFrom: filters?.updatedFrom || undefined,
        updatedTo: filters?.updatedTo || undefined
      });
      
      setProducts(response.data.products);
      setPagination(response.data.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, searchTerm, dateFilters);
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchProducts(1, value, dateFilters);
  };

  const handlePageChange = (page: number) => {
    fetchProducts(page, searchTerm, dateFilters);
  };

  const handleDateFilterChange = (field: keyof typeof dateFilters, value: string) => {
    setDateFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyDateFilters = () => {
    fetchProducts(1, searchTerm, dateFilters);
  };

  const clearDateFilters = () => {
    setDateFilters({
      createdFrom: '',
      createdTo: '',
      updatedFrom: '',
      updatedTo: ''
    });
    setSelectedPreset('');
    setSelectedDates({ start: null, end: null });
    fetchProducts(1, searchTerm, {
      createdFrom: '',
      createdTo: '',
      updatedFrom: '',
      updatedTo: ''
    });
  };

  const handlePresetSelect = (preset: string) => {
    setSelectedPreset(preset);
    const dateRange = getDateRangeFromPreset(preset);
    setDateFilters(prev => ({
      ...prev,
      createdFrom: dateRange.start,
      createdTo: dateRange.end
    }));
  };

  const handleCustomDateSelect = (date: Date) => {
    if (!selectedDates.start || (selectedDates.start && selectedDates.end)) {
      // Start new selection
      setSelectedDates({ start: date, end: null });
    } else if (selectedDates.start && !selectedDates.end) {
      // Complete selection
      const start = selectedDates.start;
      if (date < start) {
        setSelectedDates({ start: date, end: start });
      } else {
        setSelectedDates({ start, end: date });
      }
    }
  };

  const applyCustomDateRange = () => {
    if (selectedDates.start && selectedDates.end) {
      const startDate = selectedDates.start.toISOString().split('T')[0];
      const endDate = selectedDates.end.toISOString().split('T')[0];
      setDateFilters(prev => ({
        ...prev,
        createdFrom: startDate,
        createdTo: endDate
      }));
      setShowAdvancedDatePicker(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateDiscountPercentage = (mrp: number, srp: number) => {
    if (mrp <= 0 || srp >= mrp) return 0;
    return Math.round(((mrp - srp) / mrp) * 100);
  };

  const getCategoryLevels = (product: Product) => {
    const mainCategory = product.category?.name || '';
    const subCategory = product.subcategory?.name || '';
    
    // If we have subcategoryPath data, use it for more detailed categorization
    if (product.subcategoryPath && product.subcategoryPath.length > 0) {
      const sortedPath = product.subcategoryPath.sort((a, b) => a.level - b.level);
      return {
        mainCategory: sortedPath[0]?.name || mainCategory,
        subCategory: sortedPath[1]?.name || subCategory,
        subSubCategory: sortedPath[2]?.name || '',
        levels: sortedPath.length
      };
    }
    
    return {
      mainCategory,
      subCategory,
      subSubCategory: '',
      levels: subCategory ? 2 : 1
    };
  };

  const formatDateString = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return formatDateTime(dateString);
    }
  };

  const getDetailedTooltip = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    const fullDateTime = date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });

    let timeAgo = '';
    if (diffInHours < 1) {
      timeAgo = `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      timeAgo = `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      timeAgo = `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      timeAgo = `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    }

    return `Last updated: ${fullDateTime}\n(${timeAgo})`;
  };


  const openProductUrl = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.error('Product URL not available');
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setViewModalOpen(false);
    setSelectedProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingProduct(null);
  };

  const handleEditSuccess = (updatedProduct: Product) => {
    // Update the product in the list
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setEditModalOpen(false);
    setEditingProduct(null);
  };

  // Bulk upload functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a CSV or XLSX file');
        return;
      }
      
      setUploadedFile(file);
      setUploadResult(null);
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a CSV or XLSX file');
        return;
      }
      
      setUploadedFile(file);
      setUploadResult(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Title,Product Description,AI Description for SEO,Regular Price,Sale Price,Discount Percentage,Product Tag (For search functionality),Bank/Card Offers,Seller (Name of the Scrap Source),Brand Name,Product URL,Product Image URL,Product Created date,Product Updated date,Product ID,Product Main Category,Product Sub Category,Product Sub Sub Category
Sample Product,Sample product description,AI generated SEO description,1999,1499,25,"electronics, sample",10% off with XYZ Bank,Amazon,SampleBrand,https://example.com/product,https://example.com/image.jpg,2025-01-15,2025-01-15,EXT-001,650f0a1b2c3d4e5f6a7b8c9d,651111111111111111111111,652222222222222222222222
Wireless Headphones,Over-ear with ANC,Premium ANC wireless headphones for commuters,4999,3499,30,"audio, headphones, wireless","10% off with XYZ Bank",Amazon,SoundMax,https://example.com/prod/123,https://example.com/img/123.jpg,2025-10-07,2025-10-07,EXT-123,651111111111111111111111,652222222222222222222222,653333333333333333333333`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'product_bulk_upload_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkUpload = async () => {
    if (!uploadedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await adminApi.bulkUploadProducts(uploadedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResult(result);
      
      if (result.success) {
        toast.success(result.message || 'Products uploaded successfully!');
        // Refresh the products list
        fetchProducts(currentPage, searchTerm, dateFilters);
      } else {
        toast.error(result.message || 'Upload failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload products');
      setUploadResult({
        success: false,
        message: error.message || 'Upload failed'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const closeBulkUpload = () => {
    setBulkUploadOpen(false);
    setUploadedFile(null);
    setUploadResult(null);
    setUploadProgress(0);
    setParsedData([]);
    setCsvHeaders([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // CSV Parsing functions
  const parseCSV = (csvText: string): { headers: string[], data: any[] } => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], data: [] };
    
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(value => value.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
    
    return { headers, data };
  };

  const parseXLSX = async (_file: File): Promise<{ headers: string[], data: any[] }> => {
    // For XLSX files, we'll need to use a library like xlsx
    // For now, we'll show a message that XLSX preview is not available
    throw new Error('XLSX preview is not available. Please convert to CSV for preview.');
  };

  const handlePreviewCSV = async () => {
    if (!uploadedFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setIsParsing(true);
      let result: { headers: string[], data: any[] };

      if (uploadedFile.type === 'text/csv') {
        const text = await uploadedFile.text();
        result = parseCSV(text);
      } else if (uploadedFile.type.includes('sheet') || uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.xls')) {
        result = await parseXLSX(uploadedFile);
      } else {
        throw new Error('Unsupported file format');
      }

      setCsvHeaders(result.headers);
      setParsedData(result.data);
      setPreviewModalOpen(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to parse file');
    } finally {
      setIsParsing(false);
    }
  };

  const closePreviewModal = () => {
    setPreviewModalOpen(false);
    setParsedData([]);
    setCsvHeaders([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>


          
          <button 
            onClick={() => setBulkUploadOpen(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Upload className="h-5 w-5" />
            <span>Bulk Upload</span>
          </button>
          
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Bulk Upload Section */}
      {bulkUploadOpen && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Bulk Upload Products (CSV/XLSX)</h2>
            <button
              onClick={closeBulkUpload}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            Use the CSV/XLSX template to prepare products and upload. The server endpoint accepts a file at /api/admin/products/bulk-upload.
          </p>

          {/* Instructions */}
          <div className="space-y-6 mb-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">CSV Header Example:</h3>
              <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono text-gray-700">
                Title, Product Description, AI Description for SEO, Regular Price, Sale Price, Discount Percentage, Product Tag (For search functionality), Bank/Card Offers, Seller (Name of the Scrap Source), Brand Name, Product URL, Product Image URL, Product Created date, Product Updated date, Product ID, Product Main Category, Product Sub Category, Product Sub Sub Category
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">CSV Data Example (minimal valid):</h3>
                <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono text-gray-700">
                  Title, Regular Price, Sale Price, Product Image URL, Product Main Category<br/>
                  Sample Product, 1999, 1499, https://example.com/image.jpg, 650f0a1b2c3d4e5f6a7b8c9d
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">CSV Data Example (full):</h3>
                <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono text-gray-700 max-h-32 overflow-y-auto">
                  Title, Product Description, AI Description for SEO, Regular Price, Sale Price, Discount Percentage, Product Tag (For search functionality), Bank/Card Offers, Seller (Name of the Scrap Source), Brand Name, Product URL, Product Image URL, Product Created date, Product Updated date, Product ID, Product Main Category, Product Sub Category, Product Sub Sub Category<br/>
                  Wireless Headphones, Over-ear with ANC, Premium ANC wireless headphones for commuters, 4999, 3499, 30, "audio, headphones, wireless", "10% off with XYZ Bank", Amazon, SoundMax, https://example.com/prod/123, https://example.com/img/123.jpg, 2025-10-07, 2025-10-07, EXT-123, 651111111111111111111111, 652222222222222222222222, 653333333333333333333333
                </div>
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          <div className="mb-6">
            <div
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                uploadedFile 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 hover:border-indigo-400'
              }`}
            >
              {uploadedFile ? (
                <div className="space-y-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Drop your CSV/XLSX file here, or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports CSV and XLSX files up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div className={`mb-6 p-4 rounded-lg ${
              uploadResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {uploadResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <p className={`text-sm font-medium ${
                  uploadResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {uploadResult.message}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={downloadTemplate}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download CSV Template</span>
            </button>
            
            <button
              onClick={handlePreviewCSV}
              disabled={!uploadedFile || isParsing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isParsing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PreviewIcon className="h-4 w-4" />
              )}
              <span>Preview Data</span>
            </button>
            
            <button
              onClick={handleBulkUpload}
              disabled={!uploadedFile || isUploading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span>Upload CSV/XLSX</span>
            </button>
          </div>

          {/* Note */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Ensure category IDs correspond to existing Main/Sub/Sub Sub categories. 
              Dates should be ISO (YYYY-MM-DD).
            </p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Products</h3>
        
        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Advanced Date Filters */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Date Filters</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAdvancedDatePicker(!showAdvancedDatePicker)}
                className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <Calendar className="h-4 w-4" />
                <span>{showAdvancedDatePicker ? 'Hide Advanced Picker' : 'Show Advanced Picker'}</span>
              </button>
              <button
                onClick={clearDateFilters}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {showAdvancedDatePicker && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Preset Options */}
                <div className="lg:col-span-1">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Recently Used</h4>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {datePresets.map((preset) => (
                      <label
                        key={preset.value}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="datePreset"
                          value={preset.value}
                          checked={selectedPreset === preset.value}
                          onChange={() => handlePresetSelect(preset.value)}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{preset.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Calendar */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => navigateMonth('prev')}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                      </button>
                      <h3 className="text-lg font-medium text-gray-900">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      <button
                        onClick={() => navigateMonth('next')}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {getCalendarDays(currentMonth).map((day, index) => {
                        if (!day) {
                          return <div key={index} className="h-8"></div>;
                        }

                        const isSelected = selectedDates.start && selectedDates.end &&
                          day >= selectedDates.start && day <= selectedDates.end;
                        const isStart = selectedDates.start && day.getTime() === selectedDates.start.getTime();
                        const isEnd = selectedDates.end && day.getTime() === selectedDates.end.getTime();
                        const isToday = day.toDateString() === new Date().toDateString();

                        return (
                          <button
                            key={day.getTime()}
                            onClick={() => handleCustomDateSelect(day)}
                            className={`h-8 w-8 text-sm rounded-full flex items-center justify-center hover:bg-indigo-100 ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : isStart || isEnd
                                ? 'bg-indigo-500 text-white'
                                : isToday
                                ? 'bg-indigo-100 text-indigo-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </div>

                    {selectedDates.start && selectedDates.end && (
                      <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                        <div className="text-sm text-indigo-700">
                          <strong>Selected Range:</strong> {formatDateDisplay(selectedDates.start)} - {formatDateDisplay(selectedDates.end)}
                        </div>
                        <button
                          onClick={applyCustomDateRange}
                          className="mt-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                        >
                          Apply Custom Range
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Date Inputs */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Date Inputs</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created From
                    </label>
                    <input
                      type="date"
                      value={dateFilters.createdFrom}
                      onChange={(e) => handleDateFilterChange('createdFrom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created To
                    </label>
                    <input
                      type="date"
                      value={dateFilters.createdTo}
                      onChange={(e) => handleDateFilterChange('createdTo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Updated From
                    </label>
                    <input
                      type="date"
                      value={dateFilters.updatedFrom}
                      onChange={(e) => handleDateFilterChange('updatedFrom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Updated To
                    </label>
                    <input
                      type="date"
                      value={dateFilters.updatedTo}
                      onChange={(e) => handleDateFilterChange('updatedTo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-4">
                <button
                  onClick={applyDateFilters}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Apply Filters</span>
                </button>
                <button
                  onClick={clearDateFilters}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Clear Filters</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading products...</span>
        </div>
      )}

      {/* Products Content */}
      {!loading && (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    {product.mainImage ? (
                      <img 
                        src={product.mainImage} 
                        alt={product.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center relative">
                        <div className="text-center">
                          <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 font-medium">No Image</p>
                          <p className="text-xs text-gray-400">Available</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                    <div className="text-sm text-gray-600 mb-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Main:</span>
                        <span className="text-xs font-medium">{getCategoryLevels(product).mainCategory || 'N/A'}</span>
                      </div>
                      {getCategoryLevels(product).subCategory && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Sub:</span>
                          <span className="text-xs font-medium">{getCategoryLevels(product).subCategory}</span>
                        </div>
                      )}
                      {getCategoryLevels(product).subSubCategory && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Sub-Sub:</span>
                          <span className="text-xs font-medium">{getCategoryLevels(product).subSubCategory}</span>
                        </div>
                      )}
                      {getCategoryLevels(product).levels > 2 && (
                        <div className="text-xs text-gray-400 text-center">
                          {getCategoryLevels(product).levels} levels deep
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-600">by {product.createdBy.name}</p>
                      {product.vendorSite && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          product.vendorSite === 'flipkart' 
                            ? 'bg-blue-100 text-blue-800'
                            : product.vendorSite === 'amazon'
                            ? 'bg-orange-100 text-orange-800'
                            : product.vendorSite === 'myntra'
                            ? 'bg-pink-100 text-pink-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.vendorSite.charAt(0).toUpperCase() + product.vendorSite.slice(1)}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">MRP:</div>
                        <div className="text-sm font-medium text-gray-900">{formatPrice(product.mrp)}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">Selling Price:</div>
                        <div className="text-lg font-bold text-gray-900">{formatPrice(product.srp)}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">Discount:</div>
                        <span className="text-sm font-medium text-green-600">
                          {calculateDiscountPercentage(product.mrp, product.srp)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewProduct(product)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Product Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        {product.productUrl && (
                          <button 
                            onClick={() => openProductUrl(product.productUrl || '')}
                            className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>View</span>
                          </button>
                        )}
                        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-green-200">
                <h3 className="text-lg font-semibold text-gray-900">Fetched / Scraped Data</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-green-200">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        S. no
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        AI Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bank Offers
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Regular Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sale Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Seller
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Brand
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Main Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sub Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sub Sub Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Tag
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-green-50 divide-y divide-green-200">
                    {products.map((product, index) => (
                      <tr key={product.id} className="hover:bg-green-100">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(currentPage - 1) * limit + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {product.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {product.mainImage ? (
                                <img 
                                  className="h-12 w-12 rounded-lg object-cover" 
                                  src={product.mainImage}
                                  alt={product.title}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-image.png';
                                  }}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                {product.title}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 max-w-xs truncate" title={product.description}>
                            {product.description || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 max-w-xs truncate" title={product.detailedDescription}>
                            {product.detailedDescription || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {product.highlights && product.highlights.length > 0 ? (
                              <div className="space-y-1">
                                {product.highlights.slice(0, 2).map((highlight, idx) => (
                                  <div key={idx} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    {highlight.substring(0, 30)}...
                                  </div>
                                ))}
                                {product.highlights.length > 2 && (
                                  <div className="text-xs text-gray-500">+{product.highlights.length - 2} more</div>
                                )}
                              </div>
                            ) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(product.mrp)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(product.srp)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-green-600">
                            {calculateDiscountPercentage(product.mrp, product.srp)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.vendorSite ? (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              product.vendorSite === 'flipkart' 
                                ? 'bg-blue-100 text-blue-800'
                                : product.vendorSite === 'amazon'
                                ? 'bg-orange-100 text-orange-800'
                                : product.vendorSite === 'myntra'
                                ? 'bg-pink-100 text-pink-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {product.vendorSite.charAt(0).toUpperCase() + product.vendorSite.slice(1)}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.attributes?.find(attr => attr.key.toLowerCase().includes('brand'))?.value || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.productUrl ? (
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => openProductUrl(product.productUrl || '')}
                                className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"
                                title="Open product URL"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>Open link</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.mainImage ? (
                            <div className="text-sm text-blue-600 truncate max-w-32" title={product.mainImage}>
                              {product.mainImage.replace(/^https?:\/\//, '').substring(0, 20)}...
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {getCategoryLevels(product).mainCategory || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {getCategoryLevels(product).subCategory || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {getCategoryLevels(product).subSubCategory || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {product.keywords && product.keywords.length > 0 ? product.keywords.slice(0, 2).join(', ') : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span 
                            title={`Created: ${new Date(product.createdAt).toLocaleString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              timeZoneName: 'short'
                            })}`}
                            className="cursor-help hover:text-indigo-600 transition-colors border-b border-dotted border-gray-300 hover:border-indigo-400"
                          >
                            {formatDateString(product.createdAt)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <span 
                              title={getDetailedTooltip(product.updatedAt)}
                              className="cursor-help hover:text-indigo-600 transition-colors border-b border-dotted border-gray-300 hover:border-indigo-400"
                            >
                              {new Date(product.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
                                ? getTimeAgo(product.updatedAt) 
                                : formatDateTime(product.updatedAt)
                              }
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {product.productUrl && (
                              <button 
                                onClick={() => openProductUrl(product.productUrl || '')}
                                className="text-green-600 hover:text-green-900 text-xs"
                                title="Open link"
                              >
                                Open link
                              </button>
                            )}
                            <button 
                              onClick={() => handleViewProduct(product)}
                              className="text-indigo-600 hover:text-indigo-900 text-xs"
                              title="View"
                            >
                              View
                            </button>
                            <button 
                              onClick={() => handleEditProduct(product)}
                              className="text-indigo-600 hover:text-indigo-900 text-xs"
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900 text-xs"
                              title="Delete"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                    <span className="font-medium">{pagination.totalPages}</span> ({pagination.totalProducts} total products)
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {products.length === 0 && !loading && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new product.'}
              </p>
            </div>
          )}
        </>
      )}

      {/* View Product Modal */}
      <ViewDataModal
        isOpen={viewModalOpen}
        onClose={handleCloseModal}
        data={selectedProduct}
        type="product"
        title="Product Details"
        onEdit={handleEditProduct}
      />

      {/* Edit Product Modal */}
      {editModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <EditProductForm
              product={editingProduct}
              onSuccess={handleEditSuccess}
              onCancel={handleCloseEditModal}
            />
          </div>
        </div>
      )}

      {/* CSV Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">CSV Data Preview</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Preview of {parsedData.length} products that will be uploaded
                </p>
              </div>
              <button
                onClick={closePreviewModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
              {parsedData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        {csvHeaders.map((header, index) => (
                          <th
                            key={index}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parsedData.slice(0, 100).map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          {csvHeaders.map((header, colIndex) => (
                            <td
                              key={colIndex}
                              className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap max-w-xs truncate"
                              title={row[header]}
                            >
                              {row[header] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {parsedData.length > 100 && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Showing first 100 rows only. Total rows: {parsedData.length}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No data found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    The CSV file appears to be empty or could not be parsed.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                <strong>{parsedData.length}</strong> products ready for upload
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={closePreviewModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    closePreviewModal();
                    handleBulkUpload();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



    </div>
  );
};

export default Products;