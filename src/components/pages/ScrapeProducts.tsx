import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Package, 
  Tag, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Copy,
  Eye,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { scrapingApi, ScrapedProduct, ScrapedCategoryData, adminApi, CreateScrapeLogResponse } from '../../services/api';

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
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [detailedProducts, setDetailedProducts] = useState<{[key: string]: ScrapedProduct}>({});
  const [scrapingProgress, setScrapingProgress] = useState<{[key: string]: 'pending' | 'scraping' | 'completed' | 'error'}>({});
  const [isScrapingDetails, setIsScrapingDetails] = useState<boolean>(false);
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

    if (!selectedCategoryId) {
      toast.error('Please select a category before scraping');
      return;
    }

    if (!productUrl.trim()) {
      toast.error(`Please enter a ${scrapeType} URL`);
      return;
    }

    setIsLoading(true);
    setError('');
    setScrapedData(null);
    // Prepare category name for history
    const categoryName = (() => {
      if (!selectedCategoryId) return undefined;
      const top = categories.find((c: any) => c.id === selectedCategoryId);
      return top?.name;
    })();

    // POST scrape-logs (pending)
    let remoteLogId: string | undefined;
    try {
      const createRes: CreateScrapeLogResponse = await scrapingApi.createScrapeLog({
        when: new Date().toISOString(),
        platform: selectedPlatform,
        type: scrapeType,
        url: productUrl.trim(),
        category: categoryName,
        status: 'pending',
        action: 'Manual',
      });
      remoteLogId = createRes?.data?._id;
    } catch {}

    try {
      if (scrapeType === 'product') {
        const data = await scrapingApi.scrapeProduct(selectedPlatform, productUrl);
        setScrapedData(data.data);
        setScrapedCategoryData(null);
        toast.success('Product scraped successfully!');
        // PUT scrape-logs success
        if (remoteLogId) {
          try { await scrapingApi.updateScrapeLog(remoteLogId, { status: 'success', action: 'Manual' }); } catch {}
        }
      } else if (scrapeType === 'category') {
        const data = await scrapingApi.scrapeCategory(selectedPlatform, productUrl, pageNumber);
        setScrapedCategoryData(data.data);
        setScrapedData(null);
        setSelectedProducts([]);
        toast.success(`Category scraped successfully! Found ${data.data.totalProducts} products on page ${pageNumber}.`);
        // PUT scrape-logs success
        if (remoteLogId) {
          try { await scrapingApi.updateScrapeLog(remoteLogId, { status: 'success', action: 'Manual' }); } catch {}
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || `Failed to scrape ${scrapeType}. Please try again.`;
      setError(errorMessage);
      toast.error(errorMessage);
      // PUT scrape-logs failed
      if (remoteLogId) {
        try { await scrapingApi.updateScrapeLog(remoteLogId, { status: 'failed', action: 'Manual' }); } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  const resetForm = () => {
    setSelectedPlatform('');
    setScrapeType('product');
    setProductUrl('');
    setPageNumber(1);
    setScrapedData(null);
    setScrapedCategoryData(null);
    setError('');
    setShowTableView(false);
    setSelectedCategoryId('');
    setSelectedSubcategoryId('');
    setSelectedSubSubcategoryId('');
    setAvailableSubcategories([]);
    setAvailableSubSubcategories([]);
    setSelectedProducts([]);
    setDetailedProducts({});
    setScrapingProgress({});
    setIsScrapingDetails(false);
    setSelectedProductForView(null);
    setShowProductDetailModal(false);
    setIsInserting(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);


  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await adminApi.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to fetch categories. Please refresh the page.');
    } finally {
      setIsLoadingCategories(false);
    }
  };


  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId('');
    setSelectedSubSubcategoryId('');
    
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    if (selectedCategory && selectedCategory.subcategory) {
      setAvailableSubcategories(selectedCategory.subcategory);
    } else {
      setAvailableSubcategories([]);
    }
    setAvailableSubSubcategories([]);
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
    setSelectedSubSubcategoryId('');
    
    const selectedSubcategory = availableSubcategories.find(sub => sub.id === subcategoryId);
    if (selectedSubcategory && selectedSubcategory.subcategory) {
      setAvailableSubSubcategories(selectedSubcategory.subcategory);
    } else {
      setAvailableSubSubcategories([]);
    }
  };

  const insertProductIntoDB = async () => {
    if (!selectedCategoryId) {
      toast.error('Please select a category first');
      return;
    }

    const tableData = getTableData();
    if (!tableData) {
      toast.error('No product data available');
      return;
    }

    setIsInserting(true);

    try {
      const productData = {
        title: tableData.title,
        mrp: tableData.mrp,
        srp: tableData.srp,
        description: tableData.description,
        shortDescription: tableData.shortDescription,
        detailedDescription: tableData.detailedDescription,
        features: tableData.features,
        specifications: tableData.specifications,
        highlights: tableData.highlights,
        mainImage: tableData.mainImage,
        additionalImages: tableData.additionalImages,
        productUrl: tableData.productUrl,
        vendorSite: tableData.vendorSite,
        categoryId: tableData.categoryId,
        subcategoryId: tableData.subcategoryId,
        categoryPath: tableData.categoryPath,
        attributes: tableData.attributes,
        keywords: tableData.keywords,
        aiDescription: 'AI-generated concise marketing description here.'
      };

      // Log the exact data being sent to database
      console.log('=== PRODUCT DATA BEING INSERTED INTO DATABASE ===');
      console.log('Title:', productData.title);
      console.log('MRP:', productData.mrp);
      console.log('SRP:', productData.srp);
      console.log('Description:', productData.description);
      console.log('Short Description:', productData.shortDescription);
      console.log('Detailed Description:', productData.detailedDescription);
      console.log('Features:', productData.features);
      console.log('Specifications:', productData.specifications);
      console.log('Highlights:', productData.highlights);
      console.log('Product URL:', productData.productUrl);
      console.log('Vendor Site:', productData.vendorSite);
      console.log('Category ID:', productData.categoryId);
      console.log('Subcategory ID:', productData.subcategoryId);
      console.log('Category Path:', productData.categoryPath);
      console.log('Main Image URL:', productData.mainImage);
      console.log('Additional Images URLs:', productData.additionalImages);
      console.log('Attributes:', productData.attributes);
      console.log('Keywords:', productData.keywords);
      console.log('AI Description:', productData.aiDescription);
      console.log('================================================');

      const response = await fetch('https://z7s50012-5000.inc1.devtunnels.ms/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(productData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Product inserted into database successfully!');
        console.log('Product created:', result.data.product);
      } else {
        toast.error(result.message || 'Failed to insert product');
      }
    } catch (error) {
      console.error('Error inserting product:', error);
      toast.error('Failed to insert product into database');
    } finally {
      setIsInserting(false);
    }
  };

  const handleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAllProducts = () => {
    if (scrapedCategoryData) {
      if (selectedProducts.length === scrapedCategoryData.products.length) {
        setSelectedProducts([]);
      } else {
        setSelectedProducts(scrapedCategoryData.products.map(p => p.productId));
      }
    }
  };

  const scrapeProductDetails = async (productId: string, productUrl: string) => {
    try {
      setScrapingProgress(prev => ({ ...prev, [productId]: 'scraping' }));
      
      const data = await scrapingApi.scrapeProduct(selectedPlatform, productUrl);
      // Auto-assign selected category to the scraped product
      const productWithCategory = {
        ...data.data,
        assignedCategory: {
          categoryId: selectedCategoryId,
          subcategoryId: selectedSubcategoryId,
          subSubcategoryId: selectedSubSubcategoryId,
          categoryPath: getSelectedCategoryNames()
        }
      };
      setDetailedProducts(prev => ({ ...prev, [productId]: productWithCategory }));
      setScrapingProgress(prev => ({ ...prev, [productId]: 'completed' }));
      
      return data.data;
    } catch (error) {
      console.error(`Error scraping product ${productId}:`, error);
      setScrapingProgress(prev => ({ ...prev, [productId]: 'error' }));
      throw error;
    }
  };

  const scrapeIndividualProduct = async (productId: string, productUrl: string, productName: string) => {
    try {
      setScrapingProgress(prev => ({ ...prev, [productId]: 'scraping' }));
      toast.success(`Scraping: ${productName}`);
      
      const data = await scrapingApi.scrapeProduct(selectedPlatform, productUrl);
      // Auto-assign selected category to the scraped product
      const productWithCategory = {
        ...data.data,
        assignedCategory: {
          categoryId: selectedCategoryId,
          subcategoryId: selectedSubcategoryId,
          subSubcategoryId: selectedSubSubcategoryId,
          categoryPath: getSelectedCategoryNames()
        }
      };
      setDetailedProducts(prev => ({ ...prev, [productId]: productWithCategory }));
      setScrapingProgress(prev => ({ ...prev, [productId]: 'completed' }));
      
      toast.success(`✅ Successfully scraped: ${productName}`);
      return data.data;
    } catch (error) {
      console.error(`Error scraping product ${productId}:`, error);
      setScrapingProgress(prev => ({ ...prev, [productId]: 'error' }));
      toast.error(`❌ Failed to scrape: ${productName}`);
      throw error;
    }
  };

  const scrapeAllSelectedProducts = async () => {
    if (!scrapedCategoryData) {
      toast.error('No category data available');
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product to scrape details');
      return;
    }

    setIsScrapingDetails(true);
    
    // Initialize progress tracking
    const initialProgress: {[key: string]: 'pending' | 'scraping' | 'completed' | 'error'} = {};
    selectedProducts.forEach(productId => {
      initialProgress[productId] = 'pending';
    });
    setScrapingProgress(initialProgress);

    try {
      const selectedProductsData = scrapedCategoryData.products.filter(p => 
        selectedProducts.includes(p.productId)
      );

      let completedCount = 0;
      let errorCount = 0;

      // Scrape each product one by one sequentially
      for (let i = 0; i < selectedProductsData.length; i++) {
        const product = selectedProductsData[i];
        
        try {
          if (product.productUrl) {
            // Show current product being scraped
            toast.success(`Scraping product ${i + 1} of ${selectedProductsData.length}: ${product.productName}`);
            
            // Scrape this product
            await scrapeProductDetails(product.productId, product.productUrl);
            completedCount++;
            
            // Show success for this product
            toast.success(`✅ Scraped: ${product.productName}`);
          } else {
            // If no product URL, mark as error
            setScrapingProgress(prev => ({ ...prev, [product.productId]: 'error' }));
            errorCount++;
            toast.error(`❌ No URL for: ${product.productName}`);
          }
        } catch (error) {
          console.error(`Error scraping product ${product.productName}:`, error);
          setScrapingProgress(prev => ({ ...prev, [product.productId]: 'error' }));
          errorCount++;
          toast.error(`❌ Failed: ${product.productName}`);
        }
        
        // Small delay between requests to avoid overwhelming the API
        if (i < selectedProductsData.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Final summary
      toast.success(`🎉 Completed! ${completedCount} products scraped successfully, ${errorCount} failed.`);
    } catch (error) {
      console.error('Error in sequential scraping:', error);
      toast.error('Sequential scraping process failed');
    } finally {
      setIsScrapingDetails(false);
    }
  };

  const parsePrice = (priceString: string | number): number => {
    if (typeof priceString === 'number') {
      return priceString;
    }
    
    if (!priceString) {
      return 0;
    }
    
    // Remove currency symbols and non-numeric characters except decimal point
    const cleanPrice = priceString.toString().replace(/[₹$€£¥,\s]/g, '');
    
    // Parse as float and convert to integer (assuming prices are in paise/cent)
    const parsedPrice = parseFloat(cleanPrice);
    
    // Return 0 if parsing failed
    return isNaN(parsedPrice) ? 0 : Math.round(parsedPrice);
  };

  const getSelectedCategoryNames = () => {
    const categoryNames = [];
    
    if (selectedCategoryId) {
      const mainCategory = categories.find(cat => cat._id === selectedCategoryId);
      if (mainCategory) categoryNames.push(mainCategory.name);
    }
    
    if (selectedSubcategoryId) {
      const subCategory = availableSubcategories.find(cat => cat._id === selectedSubcategoryId);
      if (subCategory) categoryNames.push(subCategory.name);
    }
    
    if (selectedSubSubcategoryId) {
      const subSubCategory = availableSubSubcategories.find(cat => cat._id === selectedSubSubcategoryId);
      if (subSubCategory) categoryNames.push(subSubCategory.name);
    }
    
    return categoryNames;
  };

  const viewProductDetails = (productId: string) => {
    const detailedProduct = detailedProducts[productId];
    if (detailedProduct) {
      setSelectedProductForView(detailedProduct);
      setShowProductDetailModal(true);
    }
  };

  const insertIndividualProduct = async (productId: string) => {
    const detailedProduct = detailedProducts[productId];
    const categoryProduct = scrapedCategoryData?.products.find(p => p.productId === productId);
    
    if (!detailedProduct || !categoryProduct) {
      toast.error('Product data not available');
      return;
    }

    // Check if category is assigned (either auto-assigned or manually selected)
    const hasAssignedCategory = (detailedProduct as any).assignedCategory || selectedCategoryId;
    if (!hasAssignedCategory) {
      toast.error('Please select a category first');
      return;
    }

    setIsInserting(true);

    try {
      // Use the new function to get table data with auto-assigned category
      const tableData = getTableDataForProduct(detailedProduct);
      if (!tableData) {
        toast.error('Failed to process product data');
        return;
      }

      // Override prices with category product prices if available
      const productData = {
        ...tableData,
        mrp: parsePrice(detailedProduct.originalPrice || categoryProduct.actualPrice || 0),
        srp: parsePrice(detailedProduct.currentPrice || categoryProduct.sellingPrice || 0),
        mainImage: detailedProduct.images?.thumbnails?.[0]?.url || categoryProduct.productImage,
        additionalImages: detailedProduct.images?.thumbnails?.slice(1, 4).map((img: any) => img.url) || [],
        productUrl: detailedProduct.url || categoryProduct.productUrl || '',
        // Add category hierarchy information
        categoryHierarchy: {
          mainCategory: tableData.categoryId ? categories.find(cat => cat.id === tableData.categoryId)?.name : null,
          subCategory: tableData.subcategoryId ? availableSubcategories.find(cat => cat.id === tableData.subcategoryId)?.name : null,
          subSubCategory: tableData.categoryId !== tableData.subcategoryId ? availableSubSubcategories.find(cat => cat.id === tableData.categoryId)?.name : null,
          fullPath: ((detailedProduct as any).assignedCategory?.categoryPath || getSelectedCategoryNames()).join(' > ')
        },
        keywords: [
          ...detailedProduct.title.split(' ').slice(0, 3),
          ...detailedProduct.breadcrumbs?.map((b: any) => b.text) || [],
          ...((detailedProduct as any).assignedCategory?.categoryPath || getSelectedCategoryNames()) // Add category names to keywords
        ].filter(Boolean)
      };

      const response = await fetch('https://z7s50012-5000.inc1.devtunnels.ms/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(productData)
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`✅ Product "${detailedProduct.title}" inserted successfully!`);
        // Remove from detailed products after successful insertion
        setDetailedProducts(prev => {
          const newProducts = { ...prev };
          delete newProducts[productId];
          return newProducts;
        });
        // Remove from selected products
        setSelectedProducts(prev => prev.filter(id => id !== productId));
      } else {
        console.error('Product insertion failed:', result);
        console.error('Product data sent:', productData);
        toast.error(result.message || 'Failed to insert product');
      }
    } catch (error) {
      console.error('Error inserting individual product:', error);
      toast.error('Failed to insert product into database');
    } finally {
      setIsInserting(false);
    }
  };

  const insertSelectedProducts = async () => {
    if (!selectedCategoryId) {
      toast.error('Please select a category first');
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product to insert');
      return;
    }

    if (!scrapedCategoryData) {
      toast.error('No category data available');
      return;
    }

    // Check if we have detailed data for all selected products
    const productsWithoutDetails = selectedProducts.filter(productId => !detailedProducts[productId]);

    if (productsWithoutDetails.length > 0) {
      toast.error(`Please scrape detailed data for ${productsWithoutDetails.length} products first`);
      return;
    }

    setIsInserting(true);

    try {
      const insertPromises = selectedProducts.map(async (productId) => {
        const detailedProduct = detailedProducts[productId];
        const categoryProduct = scrapedCategoryData.products.find(p => p.productId === productId);
        
        if (!detailedProduct || !categoryProduct) {
          throw new Error(`Missing data for product ${productId}`);
        }

        // Build category path array
        const categoryPath = [];
        if (selectedCategoryId) categoryPath.push(selectedCategoryId);
        if (selectedSubcategoryId) categoryPath.push(selectedSubcategoryId);
        if (selectedSubSubcategoryId) categoryPath.push(selectedSubSubcategoryId);

        // Extract features from highlights
        const features = detailedProduct.highlights || [];
        
        // Convert specifications to the required format
        const specifications = Object.entries(detailedProduct.specifications || {}).map(([key, value]) => ({
          key,
          value: value.toString()
        }));

        // Create short description from title and first highlight
        const shortDescription = detailedProduct.highlights?.[0] || detailedProduct.title.split(' ').slice(0, 8).join(' ');

        // Create detailed description
        const detailedDescription = detailedProduct.description || 
          (detailedProduct.highlights ? detailedProduct.highlights.join('. ') : 'No detailed description available');

        const productData = {
          title: detailedProduct.title,
          mrp: parsePrice(detailedProduct.originalPrice || categoryProduct.actualPrice || 0),
          srp: parsePrice(detailedProduct.currentPrice || categoryProduct.sellingPrice || 0),
          description: detailedProduct.description || detailedProduct.title,
          shortDescription: shortDescription,
          detailedDescription: detailedDescription,
          features: features,
          specifications: specifications,
          highlights: detailedProduct.highlights || [],
          mainImage: detailedProduct.images?.thumbnails?.[0]?.url || categoryProduct.productImage,
          additionalImages: detailedProduct.images?.thumbnails?.slice(1, 4).map(img => img.url) || [],
          productUrl: detailedProduct.url || categoryProduct.productUrl || '',
          vendorSite: selectedPlatform,
          categoryId: selectedSubSubcategoryId || selectedSubcategoryId || selectedCategoryId,
          subcategoryId: selectedSubSubcategoryId || selectedSubcategoryId,
          categoryPath: categoryPath,
          // Add category hierarchy information
          categoryHierarchy: {
            mainCategory: selectedCategoryId ? categories.find(cat => cat._id === selectedCategoryId)?.name : null,
            subCategory: selectedSubcategoryId ? availableSubcategories.find(cat => cat._id === selectedSubcategoryId)?.name : null,
            subSubCategory: selectedSubSubcategoryId ? availableSubSubcategories.find(cat => cat._id === selectedSubSubcategoryId)?.name : null,
            fullPath: getSelectedCategoryNames().join(' > ')
          },
          attributes: Object.entries(detailedProduct.specifications || {}).slice(0, 5).map(([key, value]) => ({
            key,
            value: value.toString()
          })),
          keywords: [
            ...detailedProduct.title.split(' ').slice(0, 3),
            ...detailedProduct.breadcrumbs?.map(b => b.text) || [],
            ...getSelectedCategoryNames() // Add category names to keywords
          ].filter(Boolean)
        };

        const response = await fetch('https://z7s50012-5000.inc1.devtunnels.ms/api/admin/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify(productData)
        });

        return response.json();
      });

      const results = await Promise.all(insertPromises);
      const successCount = results.filter(r => r.success).length;
      const failedResults = results.filter(r => !r.success);
      
      if (failedResults.length > 0) {
        console.error('Failed product insertions:', failedResults);
        toast.error(`${failedResults.length} products failed to insert. Check console for details.`);
      }
      
      toast.success(`Successfully inserted ${successCount} out of ${selectedProducts.length} products with detailed data!`);
      setSelectedProducts([]);
      setDetailedProducts({});
      setScrapingProgress({});
    } catch (error) {
      console.error('Error inserting products:', error);
      toast.error('Failed to insert products into database');
    } finally {
      setIsInserting(false);
    }
  };

  const getTableDataForProduct = (productData: any) => {
    if (!productData) return null;

    // Use auto-assigned category if available, otherwise use selected category
    const assignedCategory = productData.assignedCategory;
    const categoryId = assignedCategory?.categoryId || selectedCategoryId;
    const subcategoryId = assignedCategory?.subcategoryId || selectedSubcategoryId;
    const subSubcategoryId = assignedCategory?.subSubcategoryId || selectedSubSubcategoryId;

    // Build category path array
    const categoryPath = [];
    if (categoryId) categoryPath.push(categoryId);
    if (subcategoryId) categoryPath.push(subcategoryId);
    if (subSubcategoryId) categoryPath.push(subSubcategoryId);

    // Extract features from highlights
    const features = productData.highlights || [];
    
    // Convert specifications to the required format
    const specifications = Object.entries(productData.specifications || {}).map(([key, value]) => ({
      key,
      value: (value as any).toString()
    }));

    // Create short description from title and first highlight
    const shortDescription = productData.highlights?.[0] || productData.title.split(' ').slice(0, 8).join(' ');

    // Create detailed description
    const detailedDescription = productData.description || 
      (productData.highlights ? productData.highlights.join('. ') : 'No detailed description available');

    return {
      title: productData.title,
      mrp: parsePrice(productData.originalPrice || '0'),
      srp: parsePrice(productData.currentPrice),
      description: productData.description || productData.highlights?.join(', ') || 'No description available',
      shortDescription: shortDescription,
      detailedDescription: detailedDescription,
      features: features,
      specifications: specifications,
      highlights: productData.highlights || [],
      mainImage: productData.images?.thumbnails?.[0]?.url || '',
      additionalImages: productData.images?.thumbnails?.slice(1, 4).map((img: any) => img.url) || [],
      productUrl: productData.url || '',
      vendorSite: selectedPlatform,
      categoryId: subSubcategoryId || subcategoryId || categoryId,
      subcategoryId: subSubcategoryId || subcategoryId,
      categoryPath: categoryPath,
      attributes: Object.entries(productData.specifications || {}).slice(0, 5).map(([key, value]) => ({
        key,
        value: (value as any).toString()
      })),
      keywords: [
        ...productData.title.split(' ').slice(0, 3),
        ...productData.breadcrumbs?.map((b: any) => b.text) || []
      ].filter(Boolean)
    };
  };

  const getTableData = () => {
    if (!scrapedData) return null;

    // Build category path array
    const categoryPath = [];
    if (selectedCategoryId) categoryPath.push(selectedCategoryId);
    if (selectedSubcategoryId) categoryPath.push(selectedSubcategoryId);
    if (selectedSubSubcategoryId) categoryPath.push(selectedSubSubcategoryId);

    // Extract features from highlights
    const features = scrapedData.highlights || [];
    
    // Convert specifications to the required format
    const specifications = Object.entries(scrapedData.specifications || {}).map(([key, value]) => ({
      key,
      value: value.toString()
    }));

    // Create short description from title and first highlight
    const shortDescription = scrapedData.highlights?.[0] || scrapedData.title.split(' ').slice(0, 8).join(' ');

    // Create detailed description
    const detailedDescription = scrapedData.description || 
      (scrapedData.highlights ? scrapedData.highlights.join('. ') : 'No detailed description available');

    return {
      title: scrapedData.title,
        mrp: parsePrice(scrapedData.originalPrice || '0'),
        srp: parsePrice(scrapedData.currentPrice),
      description: scrapedData.description || scrapedData.highlights?.join(', ') || 'No description available',
      shortDescription: shortDescription,
      detailedDescription: detailedDescription,
      features: features,
      specifications: specifications,
      highlights: scrapedData.highlights || [],
      mainImage: scrapedData.images.thumbnails?.[0]?.url || '',
      additionalImages: scrapedData.images.thumbnails?.slice(1, 4).map(img => img.url) || [],
      productUrl: scrapedData.url || '',
      vendorSite: selectedPlatform,
      categoryId: selectedSubSubcategoryId || selectedSubcategoryId || selectedCategoryId,
      subcategoryId: selectedSubSubcategoryId || selectedSubcategoryId,
      categoryPath: categoryPath,
      attributes: Object.entries(scrapedData.specifications || {}).slice(0, 5).map(([key, value]) => ({
        key,
        value: value.toString()
      })),
      keywords: [
        ...scrapedData.title.split(' ').slice(0, 3),
        ...scrapedData.breadcrumbs?.map(b => b.text) || []
      ].filter(Boolean)
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Download className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scrape Products</h1>
            <p className="text-gray-600">Extract product data from e-commerce platforms</p>
          </div>
        </div>
      </div>


      {/** Bulk Upload Documentation & Uploader */}
      {/* <div className="mt-8 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Bulk Upload Products (CSV/XLSX)</h2>
        <p className="text-sm text-gray-600 mb-4">
          Use the CSV/XLSX template to prepare products and upload. The server endpoint accepts a file at
          <code className="ml-1 px-1 py-0.5 bg-gray-100 rounded">/api/admin/products/bulk-upload</code>.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">CSV Header Example</h3>
          <pre className="whitespace-pre-wrap text-xs text-gray-800 overflow-x-auto">
{`Title,Product Description,AI Description for SEO,Regular Price,Sale Price,Discount Percentage,Product Tag (For search functionality),Bank/Card Offers,Seller (Name of the Scrap Source),Brand Name,Product URL,Product Image URL,Product Created date,Product Updated date,Product ID,Product Main Category,Product Sub Category,Product Sub Sub Category`}
          </pre>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">CSV Data Example (minimal valid)</h3>
            <pre className="whitespace-pre-wrap text-xs text-gray-800 overflow-x-auto">
{`Title,Regular Price,Sale Price,Product Image URL,Product Main Category
Sample Product,1999,1499,https://example.com/image.jpg,650f0a1b2c3d4e5f6a7b8c9d`}
            </pre>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">CSV Data Example (full)</h3>
            <pre className="whitespace-pre-wrap text-xs text-gray-800 overflow-x-auto">
{`Title,Product Description,AI Description for SEO,Regular Price,Sale Price,Discount Percentage,Product Tag (For search functionality),Bank/Card Offers,Seller (Name of the Scrap Source),Brand Name,Product URL,Product Image URL,Product Created date,Product Updated date,Product ID,Product Main Category,Product Sub Category,Product Sub Sub Category
Wireless Headphones,Over-ear with ANC,Premium ANC wireless headphones for commuters,4999,3499,30,"audio,headphones,wireless","10% off with XYZ Bank",Amazon,SoundMax,https://example.com/prod/123,https://example.com/img/123.jpg,2025-10-07,2025-10-07,EXT-123,651111111111111111111111,652222222222222222222222,653333333333333333333333`}
            </pre>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleDownloadCSVTemplate}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Download CSV Template
          </button>
          <label className="px-4 py-2 bg-gray-100 border border-gray-300 rounded cursor-pointer hover:bg-gray-200">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files && e.target.files[0];
                if (file) {
                  await handleBulkUploadFile(file);
                  e.currentTarget.value = '';
                }
              }}
            />
            Upload CSV/XLSX
          </label>
        </div>

        <p className="text-xs text-gray-500">
          Note: Ensure category IDs correspond to existing `Main/Sub/Sub Sub` categories. Dates should be ISO (YYYY-MM-DD).
        </p>
      </div> */}

      {/** Existing Products (Quick View) */}
      {/* <div className="mt-8 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Existing Products</h2>
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            value={existingProductsSearch}
            onChange={(e) => setExistingProductsSearch(e.target.value)}
            placeholder="Search products..."
            className="px-3 py-2 border rounded w-full max-w-md"
          />
          <button
            onClick={() => fetchExistingProducts(1, existingProductsSearch)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Search
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">MRP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">SRP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">AI Desc</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {existingProductsLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">Loading...</td>
                </tr>
              ) : existingProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">No products found</td>
                </tr>
              ) : (
                existingProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-xs" title={p.title}>{p.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">₹{p.mrp?.toLocaleString?.() || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">₹{p.srp?.toLocaleString?.() || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">{p.vendorSite || '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 truncate max-w-xs" title={(p as any).aiDescription || ''}>{(p as any).aiDescription || '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{p.updatedAt ? new Date(p.updatedAt).toLocaleString() : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {existingProductsPagination && existingProductsPagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => fetchExistingProducts(Math.max(1, existingProductsPage - 1), existingProductsSearch)}
              disabled={!existingProductsPagination.hasPrev}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <div className="text-sm text-gray-600">Page {existingProductsPagination.currentPage} of {existingProductsPagination.totalPages}</div>
            <button
              onClick={() => fetchExistingProducts(existingProductsPage + 1, existingProductsSearch)}
              disabled={!existingProductsPagination.hasNext}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div> */}

      {/** Handlers defined as function declarations to allow usage above */}
      {(() => { /* no render */ return null; })()}
      {/* Scraping Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Scraping Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Platform
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">Choose Platform</option>
              {platforms.map((platform) => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>
          </div>

          {/* Scrape Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scrape Type
            </label>
            <select
              value={scrapeType}
              onChange={(e) => setScrapeType(e.target.value as 'product' | 'category')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="product">Product</option>
              <option value="category">Category</option>
            </select>
          </div>

          {/* Platform Preview */}
          {selectedPlatform && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Platform
              </label>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
                <div className={`w-8 h-8 ${platforms.find(p => p.value === selectedPlatform)?.color} rounded-full`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {platforms.find(p => p.value === selectedPlatform)?.label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* URL Input Section */}
        {selectedPlatform && (
          <div className={`mt-6 p-4 rounded-lg border ${
            scrapeType === 'product' 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center space-x-2 mb-3">
              {scrapeType === 'product' ? (
                <Package className="h-5 w-5 text-blue-600" />
              ) : (
                <Tag className="h-5 w-5 text-green-600" />
              )}
              <h3 className={`text-sm font-medium ${
                scrapeType === 'product' ? 'text-blue-900' : 'text-green-900'
              }`}>
                {scrapeType === 'product' ? 'Product URL Configuration' : 'Category URL Configuration'}
              </h3>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter {platforms.find(p => p.value === selectedPlatform)?.label} {scrapeType === 'product' ? 'Product' : 'Category'} URL
            </label>
            <div className="flex space-x-3">
              <div className="flex-1">
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder={
                    scrapeType === 'product' 
                      ? `https://www.${selectedPlatform}.com/product/...`
                      : `https://www.${selectedPlatform}.com/category/...`
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {scrapeType === 'category' && (
                <div className="w-24">
                  <input
                    type="number"
                    min="1"
                    value={pageNumber}
                    onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
                    placeholder="Page"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center"
                    title="Page number to scrape"
                  />
                </div>
              )}
              <button
                onClick={() => copyToClipboard(productUrl)}
                disabled={!productUrl}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Copy URL"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Paste the complete {scrapeType} URL from {platforms.find(p => p.value === selectedPlatform)?.label}
              </p>
              {scrapeType === 'category' && (
                <div className="mt-1">
                  <p className="text-xs text-green-600">
                    💡 Category scraping will extract multiple products from the category page
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    📄 Specify page number to scrape specific page (default: page 1)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Category Selection */}
        {selectedPlatform && (
          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Tag className="h-5 w-5 text-purple-600" />
              <h3 className="text-sm font-medium text-purple-900">Category Assignment</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Main Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Main Category *
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  disabled={isLoadingCategories}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {isLoadingCategories ? 'Loading categories...' : 'Choose Main Category'}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {selectedCategoryId && (
                  <div className="mt-1 text-xs text-gray-500">
                    Selected: {categories.find(cat => cat.id === selectedCategoryId)?.name}
                  </div>
                )}
              </div>

              {/* Subcategory Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Subcategory
                </label>
                <select
                  value={selectedSubcategoryId}
                  onChange={(e) => handleSubcategoryChange(e.target.value)}
                  disabled={!selectedCategoryId || availableSubcategories.length === 0}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Choose Subcategory (Optional)</option>
                  {availableSubcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
                {selectedCategoryId && availableSubcategories.length === 0 && (
                  <div className="mt-1 text-xs text-gray-500">
                    No subcategories available
                  </div>
                )}
                {selectedSubcategoryId && (
                  <div className="mt-1 text-xs text-gray-500">
                    Selected: {availableSubcategories.find(sub => sub.id === selectedSubcategoryId)?.name}
                  </div>
                )}
              </div>

              {/* Sub-Subcategory Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Sub-Subcategory
                </label>
                <select
                  value={selectedSubSubcategoryId}
                  onChange={(e) => setSelectedSubSubcategoryId(e.target.value)}
                  disabled={!selectedSubcategoryId || availableSubSubcategories.length === 0}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Choose Sub-Subcategory (Optional)</option>
                  {availableSubSubcategories.map((subSubcategory) => (
                    <option key={subSubcategory.id} value={subSubcategory.id}>
                      {subSubcategory.name}
                    </option>
                  ))}
                </select>
                {selectedSubcategoryId && availableSubSubcategories.length === 0 && (
                  <div className="mt-1 text-xs text-gray-500">
                    No sub-subcategories available
                  </div>
                )}
                {selectedSubSubcategoryId && (
                  <div className="mt-1 text-xs text-gray-500">
                    Selected: {availableSubSubcategories.find(sub => sub.id === selectedSubSubcategoryId)?.name}
                  </div>
                )}
              </div>
            </div>
            {/* Category Hierarchy Display */}
            {(selectedCategoryId || selectedSubcategoryId || selectedSubSubcategoryId) && (
              <div className="mt-4 p-3 bg-white border border-purple-200 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Category Path:</h4>
                <div className="flex items-center space-x-2 text-sm">
                  {selectedCategoryId && (
                    <>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                        {categories.find(cat => cat.id === selectedCategoryId)?.name}
                      </span>
                      {selectedSubcategoryId && (
                        <>
                          <span className="text-gray-400">›</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {availableSubcategories.find(sub => sub.id === selectedSubcategoryId)?.name}
                          </span>
                          {selectedSubSubcategoryId && (
                            <>
                              <span className="text-gray-400">›</span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                {availableSubSubcategories.find(sub => sub.id === selectedSubSubcategoryId)?.name}
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Select a category to assign the scraped product. This helps organize products in your database.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleScrape}
            disabled={isLoading || !selectedPlatform || !productUrl || !selectedCategoryId}
            className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            <span>
              {isLoading 
                ? `Scraping ${scrapeType}...` 
                : `Start ${scrapeType === 'product' ? 'Product' : 'Category'} Scraping`
              }
            </span>
          </button>
          
          <button
            onClick={resetForm}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700 font-medium">Error</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Category Products Display */}
      {scrapedCategoryData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Scraped Category Products
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Found {scrapedCategoryData.totalProducts} products from category page
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-600 font-medium">
                  Category Scraped Successfully
                </span>
              </div>
            </div>
          </div>

          {/* Category Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Total Products:</span>
                <span className="ml-2 text-sm text-gray-900">{scrapedCategoryData.totalProducts}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Current Page:</span>
                <span className="ml-2 text-sm text-gray-900">{scrapedCategoryData.page}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Total Pages:</span>
                <span className="ml-2 text-sm text-gray-900">{scrapedCategoryData.pagination.totalPages}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Scraped At:</span>
                <span className="ml-2 text-sm text-gray-900">
                  {new Date(scrapedCategoryData.scrapedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Pagination Controls */}
          {scrapedCategoryData.pagination.totalPages > 1 && (
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Navigate to page:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const newPage = Math.max(1, pageNumber - 1);
                      setPageNumber(newPage);
                    }}
                    disabled={pageNumber <= 1}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ←
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={scrapedCategoryData.pagination.totalPages}
                    value={pageNumber}
                    onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center"
                  />
                  <button
                    onClick={() => {
                      const newPage = Math.min(scrapedCategoryData.pagination.totalPages, pageNumber + 1);
                      setPageNumber(newPage);
                    }}
                    disabled={pageNumber >= scrapedCategoryData.pagination.totalPages}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    →
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  of {scrapedCategoryData.pagination.totalPages}
                </span>
              </div>
              <button
                onClick={() => {
                  if (pageNumber !== scrapedCategoryData.page) {
                    handleScrape();
                  }
                }}
                disabled={pageNumber === scrapedCategoryData.page || isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? 'Scraping...' : 'Scrape Page'}
              </button>
            </div>
          )}

          {/* Product Selection Controls */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSelectAllProducts}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                <span>
                  {selectedProducts.length === scrapedCategoryData.products.length ? 'Deselect All' : 'Select All'}
                </span>
              </button>
              <span className="text-sm text-gray-600">
                {selectedProducts.length} of {scrapedCategoryData.products.length} products selected
              </span>
            </div>
            {selectedProducts.length > 0 && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={scrapeAllSelectedProducts}
                  disabled={isScrapingDetails}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isScrapingDetails ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>
                    {isScrapingDetails ? 'Scraping All...' : 'Scrape All Selected'}
                  </span>
                </button>
                <button
                  onClick={insertSelectedProducts}
                  disabled={isInserting || selectedProducts.some(id => !detailedProducts[id])}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isInserting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Package className="h-5 w-5" />
                  )}
                  <span>
                    {isInserting ? 'Inserting...' : `Insert ${selectedProducts.length} Products`}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="text-blue-600 mt-0.5">💡</div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How to scrape product details:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Click "🔍 Scrape Details" on individual products to get detailed information</li>
                  <li>Or use "Scrape All Selected" to process all selected products one by one</li>
                  <li>Each product will be scraped sequentially with progress updates</li>
                  <li>Once details are ready, you can insert products into the database</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scrapedCategoryData.products.map((product) => (
              <div key={product.productId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.productId)}
                    onChange={() => handleProductSelection(product.productId)}
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-start space-x-3">
                      <img
                        src={product.productImage}
                        alt={product.productName}
                        className="w-16 h-16 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {product.productName}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{product.brand}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-sm font-bold text-green-600">₹{product.sellingPrice}</span>
                          {product.actualPrice !== product.sellingPrice && (
                            <span className="text-xs text-gray-500 line-through">₹{product.actualPrice}</span>
                          )}
                          {product.discount && (
                            <span className="text-xs bg-red-100 text-red-600 px-1 rounded">{product.discount}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">{product.rating}</span>
                          <span className={`text-xs px-1 rounded ${
                            product.availability === 'In Stock' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {product.availability}
                          </span>
                        </div>
                        {/* Individual Scrape Button and Status */}
                        <div className="mt-2">
                          {product.productUrl ? (
                            <button
                              onClick={() => scrapeIndividualProduct(product.productId, product.productUrl, product.productName)}
                              disabled={scrapingProgress[product.productId] === 'scraping' || isScrapingDetails}
                              className="w-full text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {scrapingProgress[product.productId] === 'scraping' ? '🔄 Scraping...' : '🔍 Scrape Details'}
                            </button>
                          ) : (
                            <span className="text-xs text-red-500">❌ No URL</span>
                          )}
                          
                          {/* Scraping Status */}
                          {scrapingProgress[product.productId] && (
                            <div className="mt-1">
                              {scrapingProgress[product.productId] === 'pending' && (
                                <span className="text-xs text-gray-500">⏳ Pending</span>
                              )}
                              {scrapingProgress[product.productId] === 'scraping' && (
                                <span className="text-xs text-blue-600">🔄 Scraping...</span>
                              )}
                              {scrapingProgress[product.productId] === 'completed' && (
                                <div className="space-y-1">
                                  <span className="text-xs text-green-600">✅ Details Ready</span>
                                  {(detailedProducts[product.productId] as any)?.assignedCategory && (
                                    <span className="text-xs text-purple-600">🏷️ Auto-categorized</span>
                                  )}
                                </div>
                              )}
                              {scrapingProgress[product.productId] === 'error' && (
                                <span className="text-xs text-red-600">❌ Failed</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Products Display */}
          {Object.keys(detailedProducts).length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detailed Product Data ({Object.keys(detailedProducts).length} products)
              </h3>
              <div className="space-y-4">
                {Object.entries(detailedProducts).map(([productId, detailedProduct]) => {
                  const categoryProduct = scrapedCategoryData.products.find(p => p.productId === productId);
                  return (
                    <div key={productId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={detailedProduct.images?.thumbnails?.[0]?.url || categoryProduct?.productImage}
                          alt={detailedProduct.title}
                          className="w-20 h-20 object-cover rounded border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{detailedProduct.title}</h4>
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Price:</span>
                              <span className="ml-2 text-green-600">₹{detailedProduct.currentPrice}</span>
                              {detailedProduct.originalPrice && (
                                <span className="ml-2 text-gray-500 line-through">₹{detailedProduct.originalPrice}</span>
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Features:</span>
                              <span className="ml-2">{detailedProduct.highlights?.length || 0} features</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Specifications:</span>
                              <span className="ml-2">{Object.keys(detailedProduct.specifications || {}).length} specs</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Images:</span>
                              <span className="ml-2">{detailedProduct.images?.thumbnails?.length || 0} images</span>
                            </div>
                          </div>
                          {detailedProduct.highlights && detailedProduct.highlights.length > 0 && (
                            <div className="mt-2">
                              <span className="font-medium text-gray-700 text-sm">Key Features:</span>
                              <div className="mt-1">
                                {detailedProduct.highlights.slice(0, 3).map((highlight, index) => (
                                  <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1 mb-1 inline-block">
                                    {highlight}
                                  </span>
                                ))}
                                {detailedProduct.highlights.length > 3 && (
                                  <span className="text-xs text-gray-500">+{detailedProduct.highlights.length - 3} more</span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Category Information */}
                          <div className="mt-3">
                            <span className="font-medium text-gray-700 text-sm">Assigned Category:</span>
                            <div className="mt-1 flex items-center space-x-1">
                              {((detailedProduct as any).assignedCategory?.categoryPath || getSelectedCategoryNames()).map((categoryName: string, index: number) => (
                                <React.Fragment key={index}>
                                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                                    {categoryName}
                                  </span>
                                  {index < ((detailedProduct as any).assignedCategory?.categoryPath || getSelectedCategoryNames()).length - 1 && (
                                    <span className="text-purple-500 text-xs">→</span>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                            {(detailedProduct as any).assignedCategory && (
                              <div className="mt-1 text-xs text-green-600">
                                ✅ Auto-assigned from category scraping
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-4 flex items-center space-x-2">
                            <button
                              onClick={() => viewProductDetails(productId)}
                              className="flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View Details</span>
                            </button>
                            <button
                              onClick={() => insertIndividualProduct(productId)}
                              disabled={isInserting}
                              className="flex items-center space-x-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Package className="h-4 w-4" />
                              <span>{isInserting ? 'Inserting...' : 'Insert'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scraped Data Display */}
      {scrapedData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Scraped {scrapeType === 'product' ? 'Product' : 'Category'} Data
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {scrapeType === 'product' 
                  ? 'Individual product information extracted from the URL'
                  : 'Multiple products extracted from the category page'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowTableView(!showTableView)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                <Package className="h-4 w-4" />
                <span>{showTableView ? 'Hide Table' : 'View Table Format'}</span>
              </button>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-600 font-medium">
                  {scrapeType === 'product' ? 'Product Scraped' : 'Category Scraped'}
                </span>
              </div>
            </div>
          </div>

          {/* Product Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Product Images */}
            <div className="lg:col-span-1">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Product Images</h3>
              

              {/* Thumbnail Images */}
              {scrapedData.images.thumbnails && scrapedData.images.thumbnails.length > 0 && (
                <div className="space-y-3 mb-4">
                  <h4 className="text-sm font-medium text-gray-700">Thumbnail Images</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {scrapedData.images.thumbnails.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url.startsWith('//') ? `https:${image.url}` : image.url}
                          alt={image.alt || `Thumbnail ${index + 1}`}
                          className="w-full h-16 object-cover rounded border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.png';
                          }}
                        />
                        <button
                          onClick={() => openInNewTab(image.highQualityUrl.startsWith('//') ? `https:${image.highQualityUrl}` : image.highQualityUrl)}
                          className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center"
                        >
                          <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Product Details */}
            <div className="lg:col-span-2">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Product Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{scrapedData.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>ID: {scrapedData.id}</span>
                    <span>•</span>
                    <span>Rating: {scrapedData.rating} ⭐</span>
                    <span>•</span>
                    <span>{scrapedData.ratingCount}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold text-green-600">{scrapedData.currentPrice}</span>
                  {scrapedData.originalPrice && (
                    <>
                      <span className="text-lg text-gray-500 line-through">{scrapedData.originalPrice}</span>
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-medium rounded">
                        {scrapedData.discount}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Product URL:</span>
                  <button
                    onClick={() => openInNewTab(scrapedData.url)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center space-x-1"
                  >
                    <span>View Product</span>
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-sm text-gray-600">
                  <span className="font-medium">Seller:</span> {scrapedData.seller.name} ({scrapedData.seller.rating} ⭐)
                </div>

                <div className="text-sm text-gray-600">
                  <span className="font-medium">Availability:</span> {scrapedData.availability}
                </div>

                <div className="text-sm text-gray-600">
                  <span className="font-medium">Delivery:</span> {scrapedData.delivery.date} {scrapedData.delivery.time}
                </div>
              </div>
            </div>
          </div>

          {/* Product Highlights */}
          {scrapedData.highlights && scrapedData.highlights.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Key Highlights</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {scrapedData.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Offers */}
          {scrapedData.offers && scrapedData.offers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Available Offers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scrapedData.offers.slice(0, 4).map((offer, index) => (
                  <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-green-800">{offer.type}</span>
                      {offer.details?.percentage && (
                        <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-medium rounded">
                          {offer.details.percentage}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-green-700">{offer.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specifications */}
          {scrapedData.specifications && Object.keys(scrapedData.specifications).length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(scrapedData.specifications).slice(0, 10).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">{key}:</span>
                    <span className="text-sm text-gray-900 text-right max-w-xs">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Breadcrumbs */}
          {scrapedData.breadcrumbs && scrapedData.breadcrumbs.length > 0 && (
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">Category Path</h3>
              <div className="flex items-center space-x-2 text-sm">
                {scrapedData.breadcrumbs.map((breadcrumb, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <span className="text-gray-400">›</span>}
                    <span className="text-gray-600">{breadcrumb.text}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}


          {/* Table Format Display */}
          {showTableView && getTableData() && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Table Format Data</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Field
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Product Name</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{getTableData()?.title}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Product Images</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Main (Original Thumbnail):</span>
                            <img 
                              src={getTableData()?.mainImage.startsWith('//') ? `https:${getTableData()?.mainImage}` : getTableData()?.mainImage} 
                              alt="Main" 
                              className="w-12 h-12 object-cover rounded border"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
                              }}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Additional (Original Thumbnails):</span>
                            <div className="flex space-x-1">
                              {getTableData()?.additionalImages?.slice(0, 3).map((img, index) => (
                                <img 
                                  key={index}
                                  src={img.startsWith('//') ? `https:${img}` : img} 
                                  alt={`Additional ${index + 1}`} 
                                  className="w-8 h-8 object-cover rounded border"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            ✓ Using original thumbnail URLs from scraped data (no quality changes)
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Description</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-md">{getTableData()?.description}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Short Description</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-md">{getTableData()?.shortDescription}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">AI Description</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-md">{(getTableData() as any)?.aiDescription || 'AI-generated concise marketing description here.'}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Features</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="space-y-1">
                          {getTableData()?.features?.slice(0, 3).map((feature, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <span className="text-green-500">•</span>
                              <span>{feature}</span>
                            </div>
                          ))}
                          {(getTableData()?.features?.length || 0) > 3 && (
                            <div className="text-xs text-gray-500">
                              +{(getTableData()?.features?.length || 0) - 3} more features
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Selling Price (SRP)</td>
                      <td className="px-4 py-3 text-sm text-gray-600">₹{getTableData()?.srp.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Actual Price (MRP)</td>
                      <td className="px-4 py-3 text-sm text-gray-600">₹{getTableData()?.mrp.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Product URL</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <span className="truncate max-w-xs">{getTableData()?.productUrl}</span>
                          <button
                            onClick={() => openInNewTab(getTableData()?.productUrl || '')}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Vendor Site</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          getTableData()?.vendorSite === 'flipkart' 
                            ? 'bg-blue-100 text-blue-800'
                            : getTableData()?.vendorSite === 'amazon'
                            ? 'bg-orange-100 text-orange-800'
                            : getTableData()?.vendorSite === 'myntra'
                            ? 'bg-pink-100 text-pink-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {(() => {
                            const vendorSite = getTableData()?.vendorSite;
                            return vendorSite ? vendorSite.charAt(0).toUpperCase() + vendorSite.slice(1) : 'Unknown';
                          })()}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Category</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <select
                          value={selectedCategoryId}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select Category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        {selectedCategoryId && (
                          <div className="mt-1 text-xs text-gray-500">
                            ID: {selectedCategoryId}
                          </div>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Subcategory</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <select
                          value={selectedSubcategoryId}
                          onChange={(e) => handleSubcategoryChange(e.target.value)}
                          disabled={!selectedCategoryId || availableSubcategories.length === 0}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">Select Subcategory</option>
                          {availableSubcategories.map((subcategory) => (
                            <option key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </option>
                          ))}
                        </select>
                        {selectedSubcategoryId && (
                          <div className="mt-1 text-xs text-gray-500">
                            ID: {selectedSubcategoryId}
                          </div>
                        )}
                        {selectedCategoryId && availableSubcategories.length === 0 && (
                          <div className="mt-1 text-xs text-gray-500">
                            No subcategories available
                          </div>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Sub-Subcategory</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <select
                          value={selectedSubSubcategoryId}
                          onChange={(e) => setSelectedSubSubcategoryId(e.target.value)}
                          disabled={!selectedSubcategoryId || availableSubSubcategories.length === 0}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">Select Sub-Subcategory</option>
                          {availableSubSubcategories.map((subSubcategory) => (
                            <option key={subSubcategory.id} value={subSubcategory.id}>
                              {subSubcategory.name}
                            </option>
                          ))}
                        </select>
                        {selectedSubSubcategoryId && (
                          <div className="mt-1 text-xs text-gray-500">
                            ID: {selectedSubSubcategoryId}
                          </div>
                        )}
                        {selectedSubcategoryId && availableSubSubcategories.length === 0 && (
                          <div className="mt-1 text-xs text-gray-500">
                            No sub-subcategories available
                          </div>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Category Path</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          {getTableData()?.categoryPath?.map((categoryId, index) => {
                            let categoryName = '';
                            if (index === 0) {
                              categoryName = categories.find(cat => cat.id === categoryId)?.name || categoryId;
                            } else if (index === 1) {
                              categoryName = availableSubcategories.find(sub => sub.id === categoryId)?.name || categoryId;
                            } else if (index === 2) {
                              categoryName = availableSubSubcategories.find(sub => sub.id === categoryId)?.name || categoryId;
                            }
                            return (
                              <React.Fragment key={categoryId}>
                                {index > 0 && <span className="text-gray-400">›</span>}
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  {categoryName}
                                </span>
                              </React.Fragment>
                            );
                          })}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          Path IDs: {getTableData()?.categoryPath?.join(' → ')}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Attributes</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="space-y-1">
                          {getTableData()?.attributes.map((attr, index) => (
                            <div key={index} className="flex space-x-2">
                              <span className="font-medium">{attr.key}:</span>
                              <span>{attr.value}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Keywords</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex flex-wrap gap-1">
                          {getTableData()?.keywords.map((keyword, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Insert into DB Button */}
              {selectedCategoryId && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Ready to Insert Product</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Category and product data are ready for database insertion
                      </p>
                    </div>
                    <button
                      onClick={insertProductIntoDB}
                      disabled={isInserting}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isInserting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Package className="h-5 w-5" />
                      )}
                      <span>{isInserting ? 'Inserting...' : 'Insert into DB'}</span>
                    </button>
                  </div>
                </div>
              )}
              
            </div>
          )}

          {/* Scraping Metadata */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Scraped at: {new Date(scrapedData.scrapedAt).toLocaleString()}</span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(scrapedData, null, 2))}
                className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800"
              >
                <Copy className="h-4 w-4" />
                <span>Copy Full JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Product Detail Modal */}
      {showProductDetailModal && selectedProductForView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
                <button
                  onClick={() => setShowProductDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Selected Category Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Selected Category Hierarchy</h3>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-800">Category Path:</span>
                    <div className="flex items-center space-x-2">
                      {getSelectedCategoryNames().map((categoryName, index) => (
                        <React.Fragment key={index}>
                          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                            {categoryName}
                          </span>
                          {index < getSelectedCategoryNames().length - 1 && (
                            <span className="text-purple-600">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-purple-700">
                    <span className="font-medium">Category IDs:</span>
                    <span className="ml-2 font-mono text-xs">
                      {[selectedCategoryId, selectedSubcategoryId, selectedSubSubcategoryId]
                        .filter(Boolean)
                        .join(' → ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Basic Product Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Product ID:</span>
                      <p className="text-gray-900 text-sm font-mono">{selectedProductForView.id}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Title:</span>
                      <p className="text-gray-900">{selectedProductForView.title}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Current Price:</span>
                      <span className="text-green-600 font-bold text-lg">₹{selectedProductForView.currentPrice}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Original Price:</span>
                      <span className="text-gray-500 line-through">₹{selectedProductForView.originalPrice}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Discount:</span>
                      <span className="text-red-600 font-medium">{selectedProductForView.discount}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Rating:</span>
                      <span className="text-yellow-600">{selectedProductForView.rating} ⭐</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Rating Count:</span>
                      <span className="text-gray-600">{selectedProductForView.ratingCount}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Review Count:</span>
                      <span className="text-gray-600">{selectedProductForView.reviewCount}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Availability:</span>
                      <span className="text-green-600">{selectedProductForView.availability || 'Available'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Scraped At:</span>
                      <span className="text-gray-600 text-sm">{new Date(selectedProductForView.scrapedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Product URL & Description</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Product URL:</span>
                      <div className="mt-1">
                        <a
                          href={selectedProductForView.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 break-all text-sm"
                        >
                          {selectedProductForView.url}
                        </a>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Description:</span>
                      <p className="text-gray-900 text-sm mt-1">{selectedProductForView.description || 'No description available'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seller Information */}
              {selectedProductForView.seller && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Seller Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="font-medium text-gray-700">Seller Name:</span>
                        <p className="text-gray-900">{selectedProductForView.seller.name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Seller Rating:</span>
                        <p className="text-yellow-600">{selectedProductForView.seller.rating} ⭐</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Policies:</span>
                        <div className="text-gray-900">
                          {selectedProductForView.seller.policies?.map((policy, index) => (
                            <span key={index} className="block text-sm">{policy}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Information */}
              {selectedProductForView.delivery && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Delivery Information</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="font-medium text-gray-700">Delivery Date:</span>
                        <p className="text-gray-900">{selectedProductForView.delivery.date}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Delivery Time:</span>
                        <p className="text-gray-900">{selectedProductForView.delivery.time}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Delivery Cost:</span>
                        <p className="text-gray-900">{selectedProductForView.delivery.cost || 'Free'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Offers */}
              {selectedProductForView.offers && selectedProductForView.offers.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Available Offers</h3>
                  <div className="space-y-2">
                    {selectedProductForView.offers.map((offer, index) => (
                      <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-medium text-green-800">{offer.type}</span>
                            <p className="text-green-700 text-sm mt-1">{offer.description}</p>
                            {offer.details && (
                              <div className="mt-2 text-xs text-green-600">
                                {offer.details.percentage && <span>Discount: {offer.details.percentage}</span>}
                                {offer.details.bank && <span className="ml-2">Bank: {offer.details.bank}</span>}
                                {offer.details.paymentMethod && <span className="ml-2">Payment: {offer.details.paymentMethod}</span>}
                              </div>
                            )}
                          </div>
                          {offer.hasTnC && (
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">T&C Apply</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Images */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Product Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {selectedProductForView.images?.thumbnails?.map((image, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-2">
                      <img
                        src={image.url}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1 text-center">Image {index + 1}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              {selectedProductForView.highlights && selectedProductForView.highlights.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedProductForView.highlights.map((highlight, index) => (
                      <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <span className="text-blue-800">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications */}
              {selectedProductForView.specifications && Object.keys(selectedProductForView.specifications).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Specifications</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(selectedProductForView.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium text-gray-700">{key}:</span>
                          <span className="text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Breadcrumbs */}
              {selectedProductForView.breadcrumbs && selectedProductForView.breadcrumbs.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Category Path</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProductForView.breadcrumbs.map((breadcrumb, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {breadcrumb.text}
                      </span>
                    ))}
                  </div>
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
