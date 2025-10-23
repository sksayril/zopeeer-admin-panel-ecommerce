/**
 * Test Example: Add to Compare Text Removal
 * 
 * This demonstrates how the "Add to Compare" text removal works
 * when scraping category data from the API.
 */

import { scrapingApi, ScrapedCategoryData } from '../services/api';

// Example test data with "Add to Compare" text
const testDataWithAddToCompare: ScrapedCategoryData = {
  page: 1,
  url: 'https://flipkart.com/electronics',
  products: [
    {
      productId: '1',
      productName: 'Samsung Galaxy S21 Add to Compare',
      brand: 'Samsung Add to Compare',
      sellingPrice: '₹50,000 Add to Compare',
      actualPrice: '₹60,000 Add to Compare',
      discount: '17% Add to Compare',
      productImage: 'https://example.com/image1.jpg',
      productUrl: 'https://flipkart.com/samsung-galaxy-s21',
      rating: '4.5 Add to Compare',
      reviewCount: '1,234 Add to Compare',
      availability: 'In Stock Add to Compare',
      isWishlisted: false,
      scrapedAt: '2024-01-01T00:00:00Z'
    },
    {
      productId: '2',
      productName: 'iPhone 13 Add to Compare',
      brand: 'Apple Add to Compare',
      sellingPrice: '₹70,000 Add to Compare',
      actualPrice: '₹80,000 Add to Compare',
      discount: '12% Add to Compare',
      productImage: 'https://example.com/image2.jpg',
      productUrl: 'https://flipkart.com/iphone-13',
      rating: '4.8 Add to Compare',
      reviewCount: '2,345 Add to Compare',
      availability: 'In Stock Add to Compare',
      isWishlisted: false,
      scrapedAt: '2024-01-01T00:00:00Z'
    }
  ],
  pagination: {
    currentPage: 1,
    totalPages: 5,
    hasNextPage: true,
    hasPreviousPage: false
  },
  totalProducts: 2,
  scrapedAt: '2024-01-01T00:00:00Z'
};

// Test the removal function
export const testAddToCompareRemoval = () => {
  console.log('🧪 Testing "Add to Compare" text removal...');
  
  console.log('\n📥 Original data with "Add to Compare" text:');
  console.log(JSON.stringify(testDataWithAddToCompare, null, 2));
  
  // Apply the removal function
  const cleanedData = scrapingApi.removeAddToCompareText(testDataWithAddToCompare);
  
  console.log('\n📤 Cleaned data after removal:');
  console.log(JSON.stringify(cleanedData, null, 2));
  
  // Verify the removal worked
  const hasAddToCompare = cleanedData.products.some(product => 
    product.productName.includes('Add to Compare') ||
    product.brand.includes('Add to Compare') ||
    product.sellingPrice.includes('Add to Compare') ||
    product.actualPrice.includes('Add to Compare') ||
    product.discount.includes('Add to Compare') ||
    product.rating.includes('Add to Compare') ||
    product.reviewCount.includes('Add to Compare') ||
    product.availability.includes('Add to Compare')
  );
  
  console.log(`\n✅ "Add to Compare" text removal ${hasAddToCompare ? 'FAILED' : 'SUCCESSFUL'}`);
  
  return cleanedData;
};

// Example of how this works in real scraping
export const demonstrateRealScraping = async () => {
  try {
    console.log('🚀 Demonstrating real category scraping with "Add to Compare" removal...');
    
    // This would be called from the ScrapeProducts component
    const response = await scrapingApi.scrapeFlipkartCategory(
      'https://flipkart.com/electronics/mobiles',
      1
    );
    
    console.log('📊 Scraped data (automatically cleaned):');
    console.log(`Found ${response.data.products.length} products`);
    
    // Show first product as example
    if (response.data.products.length > 0) {
      const firstProduct = response.data.products[0];
      console.log('\n🔍 First product details:');
      console.log(`Name: ${firstProduct.productName}`);
      console.log(`Brand: ${firstProduct.brand}`);
      console.log(`Price: ${firstProduct.sellingPrice}`);
      console.log(`Rating: ${firstProduct.rating}`);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error during scraping:', error);
    throw error;
  }
};

// Run the test
if (typeof window === 'undefined') {
  // Only run in Node.js environment
  testAddToCompareRemoval();
}
