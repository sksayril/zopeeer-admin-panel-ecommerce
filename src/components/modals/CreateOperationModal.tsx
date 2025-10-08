import React, { useState } from 'react';
import { X, Globe, Settings, Tag, FileText } from 'lucide-react';
import { scrapingApi, CreateScrapingOperationRequest } from '../../services/api';
import toast from 'react-hot-toast';

interface CreateOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateOperationModal: React.FC<CreateOperationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CreateScrapingOperationRequest>({
    url: '',
    seller: '',
    type: 'product',
    category: '',
    config: {
      usePuppeteer: true,
      timeout: 30000,
      waitTime: 3000
    },
    notes: '',
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const supportedSellers = [
    'amazon', 'flipkart', 'tatacliq', 'myntra', 'jiomart', 'ajio', 'chroma',
    'vijaysales', 'nykaa', '1mg', 'pharmeasy', 'netmeds', 'blinkit',
    'swiggy-instamart', 'zepto', 'bigbasket', 'pepperfry', 'homecentre',
    'shoppersstop', 'urbanic', 'ikea', 'biba', 'lifestylestores',
    'medplusmart', 'truemeds', 'apollopharmacy', 'wellnessforever',
    'dmart', 'licious'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url || !formData.seller) {
      toast.error('URL and seller are required');
      return;
    }

    try {
      setLoading(true);
      await scrapingApi.createScrapingOperation(formData);
      toast.success('Scraping operation created successfully');
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      url: '',
      seller: '',
      type: 'product',
      category: '',
      config: {
        usePuppeteer: true,
        timeout: 30000,
        waitTime: 3000
      },
      notes: '',
      tags: []
    });
    setTagInput('');
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Scraping Operation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="inline h-4 w-4 mr-1" />
              URL to Scrape *
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://example.com/product"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          {/* Seller */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seller Platform *
            </label>
            <select
              value={formData.seller}
              onChange={(e) => setFormData(prev => ({ ...prev, seller: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Select a seller</option>
              {supportedSellers.map(seller => (
                <option key={seller} value={seller}>
                  {seller.charAt(0).toUpperCase() + seller.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scraping Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'product' | 'category' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="product">Product</option>
              <option value="category">Category</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category (Optional)
            </label>
            <input
              type="text"
              value={formData.category || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Electronics, Fashion, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Configuration */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Use Puppeteer
                </label>
                <select
                  value={formData.config?.usePuppeteer ? 'true' : 'false'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    config: { ...prev.config!, usePuppeteer: e.target.value === 'true' }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeout (ms)
                </label>
                <input
                  type="number"
                  value={formData.config?.timeout || 30000}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    config: { ...prev.config!, timeout: parseInt(e.target.value) }
                  }))}
                  min="1000"
                  max="120000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wait Time (ms)
                </label>
                <input
                  type="number"
                  value={formData.config?.waitTime || 3000}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    config: { ...prev.config!, waitTime: parseInt(e.target.value) }
                  }))}
                  min="0"
                  max="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="inline h-4 w-4 mr-1" />
              Tags
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add
              </button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-indigo-600 hover:text-indigo-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this operation..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Operation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOperationModal;
