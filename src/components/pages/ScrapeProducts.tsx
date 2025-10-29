import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Eye, 
  AlertCircle,
  X,
  FileSpreadsheet,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { scrapingApi, ScrapedProduct, ScrapedCategoryData, adminApi } from '../../services/api';
import * as XLSX from 'xlsx';

// Using types from API service

const ScrapeProducts: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [scrapeType, setScrapeType] = useState<'product' | 'category'>('product');
  const [productUrl, setProductUrl] = useState<string>('');
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scrapedData, setScrapedData] = useState<ScrapedProduct | null>(null);
  const [scrapedCategoryData, setScrapedCategoryData] = useState<ScrapedCategoryData | null>(null);
  const [error, setError] = useState<string>('');
  const [showTableView, setShowTableView] = useState<boolean>(false);
  const [selectedProductForView, setSelectedProductForView] = useState<ScrapedProduct | null>(null);
  const [showProductDetailModal, setShowProductDetailModal] = useState<boolean>(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');
  const [selectedSubSubcategoryId, setSelectedSubSubcategoryId] = useState<string>('');
  const [availableSubcategories, setAvailableSubcategories] = useState<any[]>([]);
  const [availableSubSubcategories, setAvailableSubSubcategories] = useState<any[]>([]);
  const [isInserting, setIsInserting] = useState<boolean>(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  

  const platforms = [
    { value: 'flipkart', label: 'Flipkart', color: 'bg-blue-500' },
    { value: 'amazon', label: 'Amazon', color: 'bg-orange-500' },
    { value: 'myntra', label: 'Myntra', color: 'bg-pink-500' },
  ];

  const handleScrape = async () => {
    if (!selectedPlatform) {
      toast.error('Please select a platform');
      return;
    }

    if (scrapeType === 'product' && !productUrl) {
      toast.error('Please enter a product URL');
      return;
    }

    if (scrapeType === 'category' && !selectedCategoryId) {
      toast.error('Please select a category');
      return;
    }

    setIsLoading(true);
    setError('');
    setScrapedData(null);
    setScrapedCategoryData(null);

    try {
      if (scrapeType === 'product') {
        const response = await scrapingApi.scrapeProduct(selectedPlatform, productUrl);
        if (response.success) {
          setScrapedData(response.data);
          toast.success('Product scraped successfully!');
        } else {
          setError(response.message || 'Failed to scrape product');
        }
      } else {
        const response = await scrapingApi.scrapeCategory(selectedPlatform, selectedCategoryId, pageNumber);
        if (response.success) {
          setScrapedCategoryData(response.data);
          toast.success('Category scraped successfully!');
        } else {
          setError(response.message || 'Failed to scrape category');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while scraping');
      toast.error(err.message || 'An error occurred while scraping');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await adminApi.getCategories();
      if (response.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId('');
    setSelectedSubSubcategoryId('');
    
    const category = categories.find(cat => cat.id === categoryId);
    if (category && category.subcategory) {
      setAvailableSubcategories(category.subcategory);
    } else {
      setAvailableSubcategories([]);
    }
    setAvailableSubSubcategories([]);
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
    setSelectedSubSubcategoryId('');
    
    const subcategory = availableSubcategories.find(sub => sub.id === subcategoryId);
    if (subcategory && subcategory.subcategory) {
      setAvailableSubSubcategories(subcategory.subcategory);
    } else {
      setAvailableSubSubcategories([]);
    }
  };

  const handleSubSubcategoryChange = (subSubcategoryId: string) => {
    setSelectedSubSubcategoryId(subSubcategoryId);
  };

  const insertScrapedData = async () => {
    if (!scrapedData) {
      toast.error('No scraped data to insert');
      return;
    }

    setIsInserting(true);
    try {
      // Note: createProduct API method needs to be implemented in adminApi
      toast.success('Product insertion feature will be available soon');
      setScrapedData(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to insert product');
    } finally {
      setIsInserting(false);
    }
  };

  const insertCategoryData = async () => {
    if (!scrapedCategoryData || !scrapedCategoryData.products || scrapedCategoryData.products.length === 0) {
      toast.error('No category data to insert');
      return;
    }

    setIsInserting(true);
    try {
      // Note: createProduct API method needs to be implemented in adminApi
      toast.success('Category data insertion feature will be available soon');
      setScrapedCategoryData(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to insert category data');
    } finally {
      setIsInserting(false);
    }
  };

  const downloadAsExcel = () => {
    if (!scrapedData && !scrapedCategoryData) {
      toast.error('No data to download');
      return;
    }

    let data: any[] = [];
    let filename = '';

    if (scrapedData) {
      data = [scrapedData];
      filename = `product_${selectedPlatform}_${Date.now()}.xlsx`;
    } else if (scrapedCategoryData && scrapedCategoryData.products) {
      data = scrapedCategoryData.products;
      filename = `category_${selectedPlatform}_${Date.now()}.xlsx`;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Scraped Data');
    XLSX.writeFile(wb, filename);
    toast.success('Data downloaded successfully!');
  };


  const viewProductDetails = (product: ScrapedProduct) => {
    setSelectedProductForView(product);
    setShowProductDetailModal(true);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Scrape Products</h1>
              <p className="text-gray-600">Extract product data from e-commerce platforms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scraping Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Scraping Configuration</h2>
        
        {/* Step 1: Platform Selection */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
              selectedPlatform ? 'bg-green-500' : 'bg-gray-300'
            }`}>
              {selectedPlatform ? '✓' : '1'}
            </div>
            <h3 className="text-lg font-medium text-gray-900">Step 1: Select Platform</h3>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Choose Platform</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">Choose Platform</option>
              {platforms.map((platform) => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>
          </div>
          
          {selectedPlatform && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className={`w-3 h-3 rounded-full ${platforms.find(p => p.value === selectedPlatform)?.color || 'bg-gray-400'}`}></div>
              <span>Selected: {platforms.find(p => p.value === selectedPlatform)?.label}</span>
            </div>
          )}
        </div>

        {/* Step 2: Scrape Type */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
              scrapeType ? 'bg-green-500' : 'bg-gray-300'
            }`}>
              {scrapeType ? '✓' : '2'}
            </div>
            <h3 className="text-lg font-medium text-gray-900">Step 2: Choose Scrape Type</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setScrapeType('product')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                scrapeType === 'product'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h4 className="font-medium text-gray-900">Single Product</h4>
              <p className="text-sm text-gray-600 mt-1">Scrape data from a specific product URL</p>
            </button>
            
            <button
              onClick={() => setScrapeType('category')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                scrapeType === 'category'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h4 className="font-medium text-gray-900">Category Products</h4>
              <p className="text-sm text-gray-600 mt-1">Scrape multiple products from a category</p>
            </button>
          </div>
        </div>

        {/* Step 3: Configuration */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
              (scrapeType === 'product' && productUrl) || (scrapeType === 'category' && selectedCategoryId) ? 'bg-green-500' : 'bg-gray-300'
            }`}>
              {(scrapeType === 'product' && productUrl) || (scrapeType === 'category' && selectedCategoryId) ? '✓' : '3'}
            </div>
            <h3 className="text-lg font-medium text-gray-900">Step 3: Configuration</h3>
          </div>

          {scrapeType === 'product' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product URL</label>
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://www.flipkart.com/product-name/p/..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Main Category</label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={isLoadingCategories}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sub Category</label>
                  <select
                    value={selectedSubcategoryId}
                    onChange={(e) => handleSubcategoryChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={!selectedCategoryId}
                  >
                    <option value="">Select Sub Category</option>
                    {availableSubcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sub-Sub Category</label>
                  <select
                    value={selectedSubSubcategoryId}
                    onChange={(e) => handleSubSubcategoryChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={!selectedSubcategoryId}
                  >
                    <option value="">Select Sub-Sub Category</option>
                    {availableSubSubcategories.map((subSubcategory) => (
                      <option key={subSubcategory.id} value={subSubcategory.id}>
                        {subSubcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Page Number</label>
                <input
                  type="number"
                  min="1"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
                  className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Action */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleScrape}
            disabled={isLoading || !selectedPlatform || (scrapeType === 'product' && !productUrl) || (scrapeType === 'category' && !selectedCategoryId)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Download className="h-5 w-5" />
            <span>{isLoading ? 'Scraping...' : 'Start Scraping'}</span>
          </button>
          
          {error && (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {(scrapedData || scrapedCategoryData) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Scraping Results</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={downloadAsExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Download Excel</span>
              </button>
              
              {scrapedData && (
                <button
                  onClick={insertScrapedData}
                  disabled={isInserting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isInserting ? 'Inserting...' : 'Insert to Database'}</span>
                </button>
              )}
              
              {scrapedCategoryData && (
                <button
                  onClick={insertCategoryData}
                  disabled={isInserting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isInserting ? 'Inserting...' : 'Insert All to Database'}</span>
                </button>
              )}
            </div>
          </div>

          {scrapedData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Product Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Title:</span>
                      <p className="text-gray-900">{scrapedData.title}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Price:</span>
                      <p className="text-gray-900">₹{scrapedData.currentPrice} (MRP: ₹{scrapedData.originalPrice})</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Description:</span>
                      <p className="text-gray-900 text-sm">{scrapedData.description}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Product Image</h3>
                  {scrapedData.images && scrapedData.images.main && scrapedData.images.main.length > 0 && (
                    <img
                      src={scrapedData.images.main[0].url}
                      alt={scrapedData.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {scrapedCategoryData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Category Products ({scrapedCategoryData.products?.length || 0})
                </h3>
                <button
                  onClick={() => setShowTableView(!showTableView)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                  {showTableView ? 'Hide Table' : 'Show Table'}
                </button>
              </div>
              
              {showTableView && scrapedCategoryData.products && (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {scrapedCategoryData.products.map((product, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-xs" title={product.productName}>
                            {product.productName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            ₹{product.sellingPrice} (MRP: ₹{product.actualPrice})
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => viewProductDetails(product as any)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductDetailModal && selectedProductForView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
                <button
                  onClick={() => setShowProductDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Title</h4>
                <p className="text-gray-700">{selectedProductForView.title}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Price</h4>
                <p className="text-gray-700">₹{selectedProductForView.currentPrice} (MRP: ₹{selectedProductForView.originalPrice})</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 text-sm">{selectedProductForView.description}</p>
              </div>
              {selectedProductForView.images && selectedProductForView.images.main && selectedProductForView.images.main.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Image</h4>
                  <img
                    src={selectedProductForView.images.main[0].url}
                    alt={selectedProductForView.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrapeProducts;