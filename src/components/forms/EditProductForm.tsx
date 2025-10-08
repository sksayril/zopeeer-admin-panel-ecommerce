import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Package, DollarSign, Tag, Image, Link, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminApi, Product, UpdateProductRequest } from '../../services/api';
import toast from 'react-hot-toast';

interface EditProductFormProps {
  product: Product;
  onSuccess: (updatedProduct: Product) => void;
  onCancel: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ product, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateProductRequest>({
    title: product.title,
    mrp: product.mrp,
    srp: product.srp,
    description: product.description,
    shortDescription: product.shortDescription || '',
    detailedDescription: product.detailedDescription || '',
    features: product.features || [],
    specifications: product.specifications || [],
    highlights: product.highlights || [],
    mainImage: product.mainImage || '',
    additionalImages: product.additionalImages || [],
    attributes: product.attributes || [],
    keywords: product.keywords || [],
    productUrl: product.productUrl || '',
    vendorSite: product.vendorSite || '',
    isActive: product.isActive,
  });

  const [newFeature, setNewFeature] = useState('');
  const [newHighlight, setNewHighlight] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newAdditionalImage, setNewAdditionalImage] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');

  const handleInputChange = (field: keyof UpdateProductRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }));
  };

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setFormData(prev => ({
        ...prev,
        highlights: [...(prev.highlights || []), newHighlight.trim()]
      }));
      setNewHighlight('');
    }
  };

  const removeHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights?.filter((_, i) => i !== index) || []
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      setFormData(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords?.filter((_, i) => i !== index) || []
    }));
  };

  const addAdditionalImage = () => {
    if (newAdditionalImage.trim()) {
      setFormData(prev => ({
        ...prev,
        additionalImages: [...(prev.additionalImages || []), newAdditionalImage.trim()]
      }));
      setNewAdditionalImage('');
    }
  };

  const removeAdditionalImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalImages: prev.additionalImages?.filter((_, i) => i !== index) || []
    }));
  };

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: [...(prev.specifications || []), { key: newSpecKey.trim(), value: newSpecValue.trim() }]
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const removeSpecification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications?.filter((_, i) => i !== index) || []
    }));
  };

  const addAttribute = () => {
    if (newAttrKey.trim() && newAttrValue.trim()) {
      setFormData(prev => ({
        ...prev,
        attributes: [...(prev.attributes || []), { key: newAttrKey.trim(), value: newAttrValue.trim() }]
      }));
      setNewAttrKey('');
      setNewAttrValue('');
    }
  };

  const removeAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await adminApi.updateProduct(product.id, formData);
      
      if (response.success) {
        toast.success('Product updated successfully!');
        onSuccess(response.data.product);
      }
    } catch (error: any) {
      console.error('Failed to update product:', error);
      toast.error(error.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Package className="h-6 w-6 text-indigo-600" />
          <h1 className="text-xl font-bold text-gray-900">Edit Product</h1>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Site
              </label>
              <select
                value={formData.vendorSite}
                onChange={(e) => handleInputChange('vendorSite', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select Vendor</option>
                <option value="flipkart">Flipkart</option>
                <option value="amazon">Amazon</option>
                <option value="myntra">Myntra</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Description
            </label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description
            </label>
            <textarea
              value={formData.detailedDescription}
              onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Pricing Information */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Pricing Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Market Price (MRP) *
              </label>
              <input
                type="number"
                value={formData.mrp}
                onChange={(e) => handleInputChange('mrp', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price (SRP) *
              </label>
              <input
                type="number"
                value={formData.srp}
                onChange={(e) => handleInputChange('srp', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                min="0"
              />
            </div>
          </div>

          {formData.mrp && formData.srp && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Current Margin:</span> {formatPrice(formData.mrp - formData.srp)} 
                ({(((formData.mrp - formData.srp) / formData.mrp) * 100).toFixed(2)}%)
              </p>
            </div>
          )}
        </div>

        {/* Images */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Image className="h-5 w-5 mr-2" />
            Product Images
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Image URL
            </label>
            <input
              type="url"
              value={formData.mainImage}
              onChange={(e) => handleInputChange('mainImage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {formData.mainImage && (
              <div className="mt-2">
                <img 
                  src={formData.mainImage} 
                  alt="Main product image"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Images
            </label>
            <div className="space-y-3">
              {formData.additionalImages?.map((image, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => {
                      const newImages = [...(formData.additionalImages || [])];
                      newImages[index] = e.target.value;
                      handleInputChange('additionalImages', newImages);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeAdditionalImage(index)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  value={newAdditionalImage}
                  onChange={(e) => setNewAdditionalImage(e.target.value)}
                  placeholder="Add additional image URL"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addAdditionalImage}
                  className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            Product Features
          </h2>
          
          <div className="space-y-3">
            {formData.features?.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {feature}
                </span>
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add a feature"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addFeature}
                className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Product Highlights</h2>
          
          <div className="space-y-3">
            {formData.highlights?.map((highlight, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {highlight}
                </span>
                <button
                  type="button"
                  onClick={() => removeHighlight(index)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                placeholder="Add a highlight"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addHighlight}
                className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Specifications</h2>
          
          <div className="space-y-3">
            {formData.specifications?.map((spec, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={spec.key}
                  onChange={(e) => {
                    const newSpecs = [...(formData.specifications || [])];
                    newSpecs[index] = { ...spec, key: e.target.value };
                    handleInputChange('specifications', newSpecs);
                  }}
                  className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Key"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => {
                    const newSpecs = [...(formData.specifications || [])];
                    newSpecs[index] = { ...spec, value: e.target.value };
                    handleInputChange('specifications', newSpecs);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Value"
                />
                <button
                  type="button"
                  onClick={() => removeSpecification(index)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newSpecKey}
                onChange={(e) => setNewSpecKey(e.target.value)}
                placeholder="Specification key"
                className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <input
                type="text"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                placeholder="Specification value"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addSpecification}
                className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Attributes */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Product Attributes</h2>
          
          <div className="space-y-3">
            {formData.attributes?.map((attr, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={attr.key}
                  onChange={(e) => {
                    const newAttrs = [...(formData.attributes || [])];
                    newAttrs[index] = { ...attr, key: e.target.value };
                    handleInputChange('attributes', newAttrs);
                  }}
                  className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Attribute key"
                />
                <input
                  type="text"
                  value={attr.value}
                  onChange={(e) => {
                    const newAttrs = [...(formData.attributes || [])];
                    newAttrs[index] = { ...attr, value: e.target.value };
                    handleInputChange('attributes', newAttrs);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Attribute value"
                />
                <button
                  type="button"
                  onClick={() => removeAttribute(index)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newAttrKey}
                onChange={(e) => setNewAttrKey(e.target.value)}
                placeholder="Attribute key"
                className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <input
                type="text"
                value={newAttrValue}
                onChange={(e) => setNewAttrValue(e.target.value)}
                placeholder="Attribute value"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addAttribute}
                className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Keywords */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Keywords</h2>
          
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {formData.keywords?.map((keyword, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(index)}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add a keyword"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product URL */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Link className="h-5 w-5 mr-2" />
            Product URL
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product URL
            </label>
            <input
              type="url"
              value={formData.productUrl}
              onChange={(e) => handleInputChange('productUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="https://example.com/product"
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Product Status</h2>
          
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleInputChange('isActive', !formData.isActive)}
              className="flex items-center space-x-2"
            >
              {formData.isActive ? (
                <ToggleRight className="h-6 w-6 text-green-600" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-gray-400" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {formData.isActive ? 'Active' : 'Inactive'}
              </span>
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Update Product</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductForm;

