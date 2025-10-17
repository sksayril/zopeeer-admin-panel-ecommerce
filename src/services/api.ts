import axios, { AxiosResponse } from 'axios';

// Base URL configuration
// const BASE_URL = 'https://z7s50012-5000.inc1.devtunnels.ms/api';
const BASE_URL = 'https://admin.b2bbusineesleads.shop/api';
// const BASE_URL = 'https://z7s50012-5000.inc1.devtunnels.ms/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Types for API responses
export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    admin: Admin;
    token: string;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    admin: Admin;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  data: {
    adminId: string;
    email: string;
    updatedAt: string;
  };
}

export interface VendorAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Vendor {
  _id: string;
  name: string;
  email: string;
  shopName: string;
  phone: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  address: VendorAddress;
  __v: number;
}

export interface CreateVendorRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: VendorAddress;
  shopName: string;
}

export interface CreateVendorResponse {
  success: boolean;
  message: string;
  data: {
    vendor: Vendor;
  };
}

export interface GetVendorsResponse {
  success: boolean;
  message: string;
  data: {
    vendors: Vendor[];
    count: number;
  };
}

export interface CategoryCreator {
  _id: string;
  name: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  createdBy: CategoryCreator;
  createdAt: string;
  updatedAt: string;
  subcategory: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface CreateCategoryResponse {
  success: boolean;
  message: string;
  data: {
    category: Category;
  };
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryResponse {
  success: boolean;
  message: string;
  data: {
    category: Category;
  };
}

export interface DeleteCategoryResponse {
  success: boolean;
  message: string;
  data: {
    deletedCategory: {
      id: string;
      name: string;
    };
  };
}

export interface CreateSubcategoryRequest {
  name: string;
  description?: string;
  parentCategoryId: string;
}

export interface CreateSubcategoryResponse {
  success: boolean;
  message: string;
  data: {
    subcategory: Category;
  };
}

export interface GetCategoriesResponse {
  success: boolean;
  message: string;
  data: {
    categories: Category[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCategories: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

// Product API Types
export interface Product {
  id: string;
  title: string;
  mrp: number;
  srp: number;
  description: string;
  shortDescription?: string;
  detailedDescription?: string;
  features?: string[];
  specifications?: Array<{
    key: string;
    value: string;
  }>;
  highlights?: string[];
  mainImage?: string;
  additionalImages?: string[];
  attributes: Array<{
    key: string;
    value: string;
  }>;
  keywords: string[];
  productUrl?: string;
  vendorSite?: string;
  isActive: boolean;
  profitMargin: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: {
    id: string;
    name: string;
    slug: string;
  };
  subcategoryPath?: Array<{
    _id: string;
    id: string;
    name: string;
    slug: string;
    level: number;
  }>;
  categoryPath?: string[];
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProductRequest {
  title?: string;
  mrp?: number;
  srp?: number;
  description?: string;
  shortDescription?: string;
  detailedDescription?: string;
  features?: string[];
  specifications?: Array<{
    key: string;
    value: string;
  }>;
  highlights?: string[];
  mainImage?: string;
  additionalImages?: string[];
  attributes?: Array<{
    key: string;
    value: string;
  }>;
  keywords?: string[];
  productUrl?: string;
  vendorSite?: string;
  isActive?: boolean;
}

export interface UpdateProductResponse {
  success: boolean;
  message: string;
  data: {
    product: Product;
  };
}

export interface GetProductsResponse {
  success: boolean;
  message: string;
  data: {
    products: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// Bulk upload types
export interface BulkUploadResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Scraping API Types
export interface ScrapedProductImage {
  url: string;
  highQualityUrl: string;
  alt: string;
  type: string;
  srcset?: string;
}

export interface ScrapedProductImages {
  main: ScrapedProductImage[];
  thumbnails: ScrapedProductImage[];
  highQuality: string[];
  all: ScrapedProductImage[];
}

export interface ScrapedProductSeller {
  name: string;
  rating: string;
  policies: string[];
}

export interface ScrapedProductOffer {
  type: string;
  description: string;
  hasTnC: boolean;
  index: number;
  selector: string;
  details?: Record<string, any>;
}

export interface ScrapedProductBreadcrumb {
  text: string;
  url: string;
}

export interface ScrapedProductDelivery {
  date: string;
  time: string;
  cost: string;
}

export interface ScrapedProduct {
  id: string;
  title: string;
  url: string;
  currentPrice: string;
  originalPrice: string;
  discount: string;
  rating: string;
  ratingCount: string;
  reviewCount: string;
  images: ScrapedProductImages;
  description: string;
  highlights: string[];
  specifications: Record<string, string>;
  seller: ScrapedProductSeller;
  offers: ScrapedProductOffer[];
  breadcrumbs: ScrapedProductBreadcrumb[];
  availability: string;
  delivery: ScrapedProductDelivery;
  scrapedAt: string;
}

export interface ScrapeProductRequest {
  url: string;
}

export interface ScrapeProductResponse {
  success: boolean;
  message: string;
  data: ScrapedProduct;
}

// Category scraping response types
export interface ScrapedCategoryProduct {
  productId: string;
  productName: string;
  brand: string;
  sellingPrice: string;
  actualPrice: string;
  discount: string;
  productImage: string;
  productUrl: string;
  rating: string;
  reviewCount: string;
  availability: string;
  isWishlisted: boolean;
  scrapedAt: string;
}

export interface ScrapedCategoryData {
  page: number;
  url: string;
  products: ScrapedCategoryProduct[];
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  totalProducts: number;
  scrapedAt: string;
}

export interface ScrapeCategoryResponse {
  success: boolean;
  message: string;
  data: ScrapedCategoryData;
}

// Scraping Operations API Types
export interface ScrapingOperationProgress {
  current: number;
  total: number;
  percentage: number;
}

export interface ScrapingOperationConfig {
  usePuppeteer: boolean;
  timeout: number;
  waitTime: number;
}

export interface ScrapingOperation {
  _id: string;
  url: string;
  seller: string;
  type: 'product' | 'category';
  category?: string;
  status: 'pending' | 'in_progress' | 'success' | 'failed' | 'cancelled';
  attemptTime: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  totalProducts?: number;
  scrapedProducts?: number;
  failedProducts?: number;
  retryCount: number;
  maxRetries: number;
  config: ScrapingOperationConfig;
  scrapedData?: any;
  dataFile?: string;
  userAgent?: string;
  ipAddress?: string;
  requestHeaders?: any;
  progress: ScrapingOperationProgress;
  notes?: string;
  tags?: string[];
  errorMessage?: string;
  errorDetails?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ScrapingOperationsResponse {
  success: boolean;
  data: ScrapingOperation[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface ScrapingOperationStats {
  statusStats: Array<{
    _id: string;
    count: number;
    totalProducts: number;
    avgDuration: number;
  }>;
  sellerStats: Array<{
    _id: string;
    totalOperations: number;
    successCount: number;
    failedCount: number;
    pendingCount: number;
    totalProducts: number;
    successRate: number;
  }>;
  recentOperations: ScrapingOperation[];
  summary: {
    totalOperations: number;
    totalProducts: number;
  };
}

export interface ScrapingOperationStatsResponse {
  success: boolean;
  data: ScrapingOperationStats;
}

export interface CreateScrapingOperationRequest {
  url: string;
  seller: string;
  type?: 'product' | 'category';
  category?: string;
  config?: Partial<ScrapingOperationConfig>;
  notes?: string;
  tags?: string[];
}

export interface CreateScrapingOperationResponse {
  success: boolean;
  message: string;
  data: ScrapingOperation;
}

export interface UpdateScrapingOperationRequest {
  status?: 'pending' | 'in_progress' | 'success' | 'failed' | 'cancelled';
  progress?: Partial<ScrapingOperationProgress>;
  errorMessage?: string;
  errorDetails?: any;
  notes?: string;
  tags?: string[];
}

export interface UpdateScrapingOperationResponse {
  success: boolean;
  message: string;
  data: Partial<ScrapingOperation>;
}

export interface CompleteScrapingOperationRequest {
  scrapedData: any;
  totalProducts: number;
  dataFile?: string;
}

export interface CompleteScrapingOperationResponse {
  success: boolean;
  message: string;
  data: Partial<ScrapingOperation>;
}

export interface FailScrapingOperationRequest {
  errorMessage: string;
  errorDetails?: any;
}

export interface FailScrapingOperationResponse {
  success: boolean;
  message: string;
  data: Partial<ScrapingOperation>;
}

export interface JobProcessorStatus {
  isProcessing: boolean;
  processingIntervalMs: number;
  pendingOperations: number;
  inProgressOperations: number;
  stats: Array<{
    _id: string;
    count: number;
    totalProducts: number;
    avgDuration: number;
  }>;
  sellerStats: Array<{
    _id: string;
    totalOperations: number;
    successCount: number;
    failedCount: number;
    pendingCount: number;
    totalProducts: number;
    successRate: number;
  }>;
}

export interface JobProcessorStatusResponse {
  success: boolean;
  data: JobProcessorStatus;
}

export interface RetryFailedOperationsResponse {
  success: boolean;
  message: string;
  data: Array<{
    operation: ScrapingOperation;
    scrapedData?: any;
    totalProducts?: number;
  }>;
}

export interface CleanupOperationsRequest {
  daysOld: number;
}

export interface CleanupOperationsResponse {
  success: boolean;
  message: string;
  data: string[];
}

export interface UpdateProcessingIntervalRequest {
  intervalMs: number;
}

export interface UpdateProcessingIntervalResponse {
  success: boolean;
  message: string;
}

// Scrape Logs API Types
export interface ScrapeLog {
  _id: string;
  when: string; // ISO date
  platform: string;
  type: 'product' | 'category';
  url: string;
  category?: string;
  status: 'pending' | 'success' | 'failed' | 'completed';
  action?: 'Manual' | 'Retry' | string;
  operationId?: string;
  createdAt?: string;
  updatedAt?: string;
  totalProducts?: number;
  scrapedProducts?: number;
  failedProducts?: number;
  duration?: number;
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
  errorMessage?: string;
  retryCount?: number;
}

export interface CreateScrapeLogRequest {
  when: string;
  platform: string;
  type: 'product' | 'category';
  url: string;
  category?: string;
  status: 'pending' | 'success' | 'failed' | 'completed';
  action?: 'Manual' | 'Retry' | string;
  operationId?: string;
  totalProducts?: number;
  scrapedProducts?: number;
  failedProducts?: number;
  duration?: number;
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
  errorMessage?: string;
  retryCount?: number;
}

export interface CreateScrapeLogResponse {
  success: boolean;
  data: ScrapeLog;
}

export interface UpdateScrapeLogRequest {
  status?: 'pending' | 'success' | 'failed' | 'completed';
  action?: 'Manual' | 'Retry' | string;
  totalProducts?: number;
  scrapedProducts?: number;
  failedProducts?: number;
  duration?: number;
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
  errorMessage?: string;
  retryCount?: number;
}

export interface UpdateScrapeLogResponse {
  success: boolean;
  data: ScrapeLog;
}

export interface CategoryStats {
  category: string;
  totalSessions: number;
  totalProducts: number;
  successfulProducts: number;
  failedProducts: number;
  averageSuccessRate: number;
}

export interface PlatformStats {
  platform: string;
  totalSessions: number;
  totalProducts: number;
  successfulProducts: number;
  failedProducts: number;
}

export interface ScrapeLogsStatistics {
  categoryStats: CategoryStats[];
  platformStats: PlatformStats[];
}

export interface GetScrapeLogsResponse {
  success: boolean;
  data: ScrapeLog[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  statistics?: ScrapeLogsStatistics;
}

// Scrape Logs Stats
export interface ScrapeLogsStatsCounts {
  pending: number;
  in_progress: number;
  success: number;
  failed: number;
  cancelled: number;
}

export interface ScrapeLogsStatsDailyItem {
  date: string; // YYYY-MM-DD
  total: number;
  success: number;
  failed: number;
  pending: number;
  in_progress: number;
  cancelled: number;
}

export interface ScrapeLogsStatsData {
  counts: ScrapeLogsStatsCounts;
  total: number;
  successRate: number;
  chart: ScrapeLogsStatsDailyItem[];
}

export interface GetScrapeLogsStatsResponse {
  success: boolean;
  data: ScrapeLogsStatsData;
}

// Admin authentication API functions
export const adminApi = {
  // Login admin
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response: AxiosResponse<LoginResponse> = await api.post('/admin/login', {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Login failed. Please try again.'
      );
    }
  },

  // Logout admin
  logout: async (): Promise<LogoutResponse> => {
    try {
      const response: AxiosResponse<LogoutResponse> = await api.post('/admin/logout');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Logout failed. Please try again.'
      );
    }
  },

  // Get current admin profile
  getProfile: async (): Promise<ProfileResponse> => {
    try {
      const response: AxiosResponse<ProfileResponse> = await api.get('/admin/me');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch admin profile.'
      );
    }
  },

  // Change admin password
  changePassword: async (passwordData: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    try {
      const response: AxiosResponse<ChangePasswordResponse> = await api.post('/admin/change-password', passwordData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to change password.'
      );
    }
  },

  // Verify token (optional - for checking if token is still valid)
  verifyToken: async (): Promise<{ success: boolean; admin: Admin }> => {
    try {
      const response = await api.get('/admin/verify');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Token verification failed.'
      );
    }
  },

  // Create vendor
  createVendor: async (vendorData: CreateVendorRequest): Promise<CreateVendorResponse> => {
    try {
      const response: AxiosResponse<CreateVendorResponse> = await api.post('/admin/vendor', vendorData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create vendor.'
      );
    }
  },

  // Get all vendors
  getVendors: async (): Promise<GetVendorsResponse> => {
    try {
      const response: AxiosResponse<GetVendorsResponse> = await api.get('/admin/vendors');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch vendors.'
      );
    }
  },

  // Create category
  createCategory: async (categoryData: CreateCategoryRequest): Promise<CreateCategoryResponse> => {
    try {
      const response: AxiosResponse<CreateCategoryResponse> = await api.post('/admin/category', categoryData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create category.'
      );
    }
  },

  // Get all categories
  getCategories: async (): Promise<GetCategoriesResponse> => {
    try {
      const response: AxiosResponse<GetCategoriesResponse> = await api.get('/admin/categories');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch categories.'
      );
    }
  },

  // Update category
  updateCategory: async (id: string, updateData: UpdateCategoryRequest): Promise<UpdateCategoryResponse> => {
    try {
      const response: AxiosResponse<UpdateCategoryResponse> = await api.put(`/admin/category/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update category.'
      );
    }
  },

  // Delete category
  deleteCategory: async (id: string): Promise<DeleteCategoryResponse> => {
    try {
      const response: AxiosResponse<DeleteCategoryResponse> = await api.delete(`/admin/category/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to delete category.'
      );
    }
  },

  // Create subcategory (supports unlimited nesting via parentCategoryId)
  createSubcategory: async (payload: CreateSubcategoryRequest): Promise<CreateSubcategoryResponse> => {
    try {
      const response: AxiosResponse<CreateSubcategoryResponse> = await api.post('/admin/subcategory', payload);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create subcategory.'
      );
    }
  },

  // Get all products
  getProducts: async (params?: { page?: number; limit?: number; search?: string }): Promise<GetProductsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      
      const response: AxiosResponse<GetProductsResponse> = await api.get(`/admin/products?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch products.'
      );
    }
  },

  // Update product
  updateProduct: async (id: string, updateData: UpdateProductRequest): Promise<UpdateProductResponse> => {
    try {
      const response: AxiosResponse<UpdateProductResponse> = await api.put(`/admin/products/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update product.'
      );
    }
  },

  // Bulk upload products via CSV/XLSX
  bulkUploadProducts: async (file: File): Promise<BulkUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response: AxiosResponse<BulkUploadResponse> = await api.post('/admin/products/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to bulk upload products.'
      );
    }
  },
};

// External scraping API base URL
// const SCRAPING_API_BASE_URL = 'https://api.b2bbusineesleads.shop/api';
const SCRAPING_API_BASE_URL = 'https://api.b2bbusineesleads.shop/api';

// Create separate axios instance for scraping API (without auth headers)
const scrapingApiClient = axios.create({
  baseURL: SCRAPING_API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for scraping
  headers: {
    'Content-Type': 'application/json',
  },
});

// Scraping API functions
export const scrapingApi = {
  // Scrape product from Flipkart
  scrapeFlipkartProduct: async (url: string): Promise<ScrapeProductResponse> => {
    try {
      const response: AxiosResponse<ScrapeProductResponse> = await scrapingApiClient.post('/flipkart/scrape-product', { url });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to scrape Flipkart product.'
      );
    }
  },

  // Scrape product from Amazon
  scrapeAmazonProduct: async (url: string): Promise<ScrapeProductResponse> => {
    try {
      const response: AxiosResponse<ScrapeProductResponse> = await scrapingApiClient.post('/amazon/scrape-product', { url });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to scrape Amazon product.'
      );
    }
  },

  // Scrape product from Myntra
  scrapeMyntraProduct: async (url: string): Promise<ScrapeProductResponse> => {
    try {
      const response: AxiosResponse<ScrapeProductResponse> = await scrapingApiClient.post('/myntra/scrape-product', { url });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to scrape Myntra product.'
      );
    }
  },

  // Generic scrape product function
  scrapeProduct: async (platform: string, url: string): Promise<ScrapeProductResponse> => {
    try {
      const response: AxiosResponse<ScrapeProductResponse> = await scrapingApiClient.post(`/${platform}/scrape-product`, { url });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        `Failed to scrape ${platform} product.`
      );
    }
  },

  // Scrape category from Flipkart
  scrapeFlipkartCategory: async (url: string, page: number = 1): Promise<ScrapeCategoryResponse> => {
    try {
      const response: AxiosResponse<ScrapeCategoryResponse> = await scrapingApiClient.post('/flipkart/scrape-category', { url, page });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to scrape Flipkart category.'
      );
    }
  },

  // Scrape category from Amazon
  scrapeAmazonCategory: async (url: string, page: number = 1): Promise<ScrapeCategoryResponse> => {
    try {
      const response: AxiosResponse<ScrapeCategoryResponse> = await scrapingApiClient.post('/amazon/scrape-category', { url, page });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to scrape Amazon category.'
      );
    }
  },

  // Scrape category from Myntra
  scrapeMyntraCategory: async (url: string, page: number = 1): Promise<ScrapeCategoryResponse> => {
    try {
      const response: AxiosResponse<ScrapeCategoryResponse> = await scrapingApiClient.post('/myntra/scrape-category', { url, page });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to scrape Myntra category.'
      );
    }
  },

  // Generic scrape category function
  scrapeCategory: async (platform: string, url: string, page: number = 1): Promise<ScrapeCategoryResponse> => {
    try {
      const response: AxiosResponse<ScrapeCategoryResponse> = await scrapingApiClient.post(`/${platform}/scrape-category`, { url, page });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        `Failed to scrape ${platform} category.`
      );
    }
  },

  // Scraping Operations API functions
  // Get all scraping operations
  getScrapingOperations: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    seller?: string;
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
  }): Promise<ScrapingOperationsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.seller) queryParams.append('seller', params.seller);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params?.search) queryParams.append('search', params.search);

      const response: AxiosResponse<ScrapingOperationsResponse> = await scrapingApiClient.get(`/scraping-operations?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch scraping operations.'
      );
    }
  },

  // Get scraping operations statistics
  getScrapingOperationsStats: async (params?: {
    seller?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ScrapingOperationStatsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.seller) queryParams.append('seller', params.seller);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);

      const response: AxiosResponse<ScrapingOperationStatsResponse> = await scrapingApiClient.get(`/scraping-operations/stats?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch scraping operations statistics.'
      );
    }
  },

  // Get single scraping operation
  getScrapingOperation: async (id: string): Promise<{ success: boolean; data: ScrapingOperation }> => {
    try {
      const response = await scrapingApiClient.get(`/scraping-operations/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch scraping operation.'
      );
    }
  },

  // Create new scraping operation
  createScrapingOperation: async (operationData: CreateScrapingOperationRequest): Promise<CreateScrapingOperationResponse> => {
    try {
      const response: AxiosResponse<CreateScrapingOperationResponse> = await scrapingApiClient.post('/scraping-operations', operationData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create scraping operation.'
      );
    }
  },

  // Update scraping operation
  updateScrapingOperation: async (id: string, updateData: UpdateScrapingOperationRequest): Promise<UpdateScrapingOperationResponse> => {
    try {
      const response: AxiosResponse<UpdateScrapingOperationResponse> = await scrapingApiClient.put(`/scraping-operations/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update scraping operation.'
      );
    }
  },

  // Start scraping operation
  startScrapingOperation: async (id: string): Promise<{ success: boolean; message: string; data: Partial<ScrapingOperation> }> => {
    try {
      const response = await scrapingApiClient.post(`/scraping-operations/${id}/start`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to start scraping operation.'
      );
    }
  },

  // Complete scraping operation
  completeScrapingOperation: async (id: string, completionData: CompleteScrapingOperationRequest): Promise<CompleteScrapingOperationResponse> => {
    try {
      const response: AxiosResponse<CompleteScrapingOperationResponse> = await scrapingApiClient.post(`/scraping-operations/${id}/complete`, completionData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to complete scraping operation.'
      );
    }
  },

  // Fail scraping operation
  failScrapingOperation: async (id: string, failData: FailScrapingOperationRequest): Promise<FailScrapingOperationResponse> => {
    try {
      const response: AxiosResponse<FailScrapingOperationResponse> = await scrapingApiClient.post(`/scraping-operations/${id}/fail`, failData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to mark scraping operation as failed.'
      );
    }
  },

  // Retry scraping operation
  retryScrapingOperation: async (id: string): Promise<{ success: boolean; message: string; data: Partial<ScrapingOperation> }> => {
    try {
      const response = await scrapingApiClient.post(`/scraping-operations/${id}/retry`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to retry scraping operation.'
      );
    }
  },

  // Delete scraping operation
  deleteScrapingOperation: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await scrapingApiClient.delete(`/scraping-operations/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to delete scraping operation.'
      );
    }
  },

  // Get scraped data
  getScrapedData: async (id: string): Promise<{ success: boolean; data: any }> => {
    try {
      const response = await scrapingApiClient.get(`/scraping-operations/${id}/data`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch scraped data.'
      );
    }
  },

  // Job Processor API functions
  // Get processor status
  getJobProcessorStatus: async (): Promise<JobProcessorStatusResponse> => {
    try {
      const response: AxiosResponse<JobProcessorStatusResponse> = await scrapingApiClient.get('/job-processor/status');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch job processor status.'
      );
    }
  },

  // Start processor
  startJobProcessor: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await scrapingApiClient.post('/job-processor/start');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to start job processor.'
      );
    }
  },

  // Stop processor
  stopJobProcessor: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await scrapingApiClient.post('/job-processor/stop');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to stop job processor.'
      );
    }
  },

  // Trigger processing
  triggerJobProcessor: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await scrapingApiClient.post('/job-processor/trigger');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to trigger job processor.'
      );
    }
  },

  // Retry failed operations
  retryFailedOperations: async (): Promise<RetryFailedOperationsResponse> => {
    try {
      const response: AxiosResponse<RetryFailedOperationsResponse> = await scrapingApiClient.post('/job-processor/retry-failed');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to retry failed operations.'
      );
    }
  },

  // Cleanup old operations
  cleanupOldOperations: async (cleanupData: CleanupOperationsRequest): Promise<CleanupOperationsResponse> => {
    try {
      const response: AxiosResponse<CleanupOperationsResponse> = await scrapingApiClient.post('/job-processor/cleanup', cleanupData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to cleanup old operations.'
      );
    }
  },

  // Update processing interval
  updateProcessingInterval: async (intervalData: UpdateProcessingIntervalRequest): Promise<UpdateProcessingIntervalResponse> => {
    try {
      const response: AxiosResponse<UpdateProcessingIntervalResponse> = await scrapingApiClient.put('/job-processor/interval', intervalData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update processing interval.'
      );
    }
  },

  // Scrape Logs API
  createScrapeLog: async (payload: CreateScrapeLogRequest): Promise<CreateScrapeLogResponse> => {
    try {
      const response: AxiosResponse<CreateScrapeLogResponse> = await scrapingApiClient.post('/scrape-logs', payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to create scrape log.');
    }
  },

  updateScrapeLog: async (id: string, payload: UpdateScrapeLogRequest): Promise<UpdateScrapeLogResponse> => {
    try {
      console.log(`Attempting to update scrape log ${id} with payload:`, payload);
      console.log(`Full URL: ${SCRAPING_API_BASE_URL}/scrape-logs/${id}`);
      
      // Try PATCH first (as per your curl example)
      const response: AxiosResponse<UpdateScrapeLogResponse> = await scrapingApiClient.patch(`/scrape-logs/${id}`, payload);
      return response.data;
    } catch (error: any) {
      console.error('PATCH request failed:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // If PATCH fails, try PUT as fallback
      if (error.response?.status === 405 || error.message?.includes('Cannot PATCH')) {
        try {
          console.log('PATCH failed, trying PUT method...');
          const response: AxiosResponse<UpdateScrapeLogResponse> = await scrapingApiClient.put(`/scrape-logs/${id}`, payload);
          return response.data;
        } catch (putError: any) {
          console.error('PUT request also failed:', putError);
          throw new Error(putError.response?.data?.message || putError.message || 'Failed to update scrape log with PUT method.');
        }
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to update scrape log.');
    }
  },

  getScrapeLogs: async (params?: {
    page?: number;
    limit?: number;
    platform?: string;
    type?: 'product' | 'category';
    status?: 'pending' | 'success' | 'failed';
    startDate?: string; // e.g. 2025-10-06
    endDate?: string;   // e.g. 2025-10-07
    search?: string;
    category?: string;
  }): Promise<GetScrapeLogsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.platform) queryParams.append('platform', params.platform);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.category) queryParams.append('category', params.category);

      const response: AxiosResponse<GetScrapeLogsResponse> = await scrapingApiClient.get(`/scrape-logs?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch scrape logs.');
    }
  },

  // Get scrape-logs stats
  getScrapeLogsStats: async (params: { startDate: string; endDate: string; platform?: string; type?: 'product' | 'category' }): Promise<GetScrapeLogsStatsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('startDate', params.startDate);
      queryParams.append('endDate', params.endDate);
      if (params.platform) queryParams.append('platform', params.platform);
      if (params.type) queryParams.append('type', params.type);
      const response: AxiosResponse<GetScrapeLogsStatsResponse> = await scrapingApiClient.get(`/scrape-logs/stats?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch scrape logs stats.');
    }
  },

  // Bulk update scrape logs
  bulkUpdateScrapeLogs: async (updates: Array<{ id: string; data: UpdateScrapeLogRequest }>): Promise<{ success: boolean; data: ScrapeLog[]; errors?: any[] }> => {
    try {
      const response = await scrapingApiClient.patch('/scrape-logs/bulk-update', { updates });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to bulk update scrape logs.');
    }
  },

  // Alternative update method - try different endpoint variations
  updateScrapeLogAlternative: async (id: string, payload: UpdateScrapeLogRequest): Promise<UpdateScrapeLogResponse> => {
    const endpoints = [
      `/scrape-logs/${id}`,
      `/scrape-logs/update/${id}`,
      `/scrape-logs/${id}/update`,
      `/scrape-logs/${id}/patch`
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const response: AxiosResponse<UpdateScrapeLogResponse> = await scrapingApiClient.patch(endpoint, payload);
        console.log(`Success with endpoint: ${endpoint}`);
        return response.data;
      } catch (error: any) {
        console.log(`Failed with endpoint ${endpoint}:`, error.response?.status, error.message);
        if (endpoint === endpoints[endpoints.length - 1]) {
          // Last endpoint failed, throw the error
          throw new Error(error.response?.data?.message || error.message || 'Failed to update scrape log with all endpoint variations.');
        }
      }
    }
    throw new Error('All endpoint variations failed');
  },
};

export default api;
