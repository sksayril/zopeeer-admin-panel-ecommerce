import React, { useState, useEffect } from 'react';
import { Search, Plus, CreditCard as Edit, Trash2, Eye, Package, Grid3X3, List, Loader2, ExternalLink } from 'lucide-react';
import { adminApi, Product } from '../../services/api';
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

  const fetchProducts = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const response = await adminApi.getProducts({
        page,
        limit,
        search: search || undefined
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
    fetchProducts(1, searchTerm);
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchProducts(1, value);
  };

  const handlePageChange = (page: number) => {
    fetchProducts(page, searchTerm);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
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

  const formatCategoryPath = (product: Product) => {
    // Check if product has subcategoryPath data (from API response)
    if (product.subcategoryPath && product.subcategoryPath.length > 0) {
      return product.subcategoryPath
        .sort((a, b) => a.level - b.level) // Sort by level
        .map(cat => cat.name)
        .join(' > ');
    }
    
    // Fallback to basic category/subcategory display
    const parts = [];
    if (product.category?.name) {
      parts.push(product.category.name);
    }
    if (product.subcategory?.name) {
      parts.push(product.subcategory.name);
    }
    
    return parts.length > 0 ? parts.join(' > ') : 'No Category';
  };

  const getCategoryPathTooltip = (product: Product) => {
    if (product.subcategoryPath && product.subcategoryPath.length > 0) {
      const sortedPath = product.subcategoryPath.sort((a, b) => a.level - b.level);
      return sortedPath.map((cat, index) => `Level ${index}: ${cat.name}`).join('\n');
    }
    return `${product.category?.name || 'No Category'}${product.subcategory ? ` > ${product.subcategory.name}` : ''}`;
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
          
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="relative">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
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
                    <div className="text-sm text-gray-600 mb-2">
                      <div 
                        title={getCategoryPathTooltip(product)}
                        className="cursor-help hover:text-indigo-600 transition-colors border-b border-dotted border-gray-300 hover:border-indigo-400"
                      >
                        {formatCategoryPath(product)}
                      </div>
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
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-lg font-bold text-gray-900">{formatPrice(product.srp)}</span>
                        {product.mrp > product.srp && (
                          <span className="text-sm text-gray-500 line-through ml-2">{formatPrice(product.mrp)}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        {product.profitMargin}% margin
                      </span>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category Path
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Seller
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
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
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {product.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div 
                            title={getCategoryPathTooltip(product)}
                            className="text-sm text-gray-900 cursor-help hover:text-indigo-600 transition-colors border-b border-dotted border-gray-300 hover:border-indigo-400"
                          >
                            {formatCategoryPath(product)}
                          </div>
                          {product.subcategoryPath && product.subcategoryPath.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {product.subcategoryPath.length} level{product.subcategoryPath.length > 1 ? 's' : ''} deep
                            </div>
                          )}
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
                          {product.productUrl ? (
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => openProductUrl(product.productUrl || '')}
                                className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"
                                title="Open product URL"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>View</span>
                              </button>
                              <div className="text-xs text-gray-500 max-w-32 truncate" title={product.productUrl}>
                                {product.productUrl.replace(/^https?:\/\//, '').substring(0, 20)}...
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(product.srp)}
                          </div>
                          {product.mrp > product.srp && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(product.mrp)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-green-600">
                            {product.profitMargin}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
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
                            {formatDate(product.createdAt)}
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
                            {new Date(product.updatedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Recent
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleViewProduct(product)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View Product Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEditProduct(product)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit Product"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" />
                            </button>
                            {product.productUrl && (
                              <button 
                                onClick={() => openProductUrl(product.productUrl || '')}
                                className="text-green-600 hover:text-green-900"
                                title="View Product"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            )}
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

    </div>
  );
};

export default Products;