import React, { useEffect, useState } from 'react';
import { Tag, FileText, X, Check } from 'lucide-react';
import { adminApi, CreateCategoryRequest } from '../../services/api';
import toast from 'react-hot-toast';

interface CreateCategoryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit' | 'createSubcategory';
  categoryId?: string; // required for edit
  initialValues?: {
    name?: string;
    description?: string;
    isActive?: boolean;
  };
  parentCategoryId?: string; // required for createSubcategory
}

const CreateCategoryForm: React.FC<CreateCategoryFormProps> = ({ onSuccess, onCancel, mode = 'create', categoryId, initialValues, parentCategoryId }) => {
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    if (initialValues) {
      setFormData({
        name: initialValues.name || '',
        description: initialValues.description || '',
      });
      if (typeof initialValues.isActive === 'boolean') {
        setIsActive(initialValues.isActive);
      }
    }
  }, [initialValues]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    }

    if (formData.description && formData.description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (mode === 'create') {
        const response = await adminApi.createCategory(formData);
        if (response.success) {
          toast.success('Category created successfully!');
          setFormData({ name: '', description: '' });
          setErrors({});
          onSuccess?.();
        }
      } else if (mode === 'edit') {
        if (!categoryId) {
          throw new Error('Missing category id');
        }
        const payload: any = {};
        if (formData.name?.trim()) payload.name = formData.name.trim();
        if (typeof formData.description === 'string') payload.description = formData.description;
        payload.isActive = isActive;
        const response = await adminApi.updateCategory(categoryId, payload);
        if (response.success) {
          toast.success('Category updated successfully!');
          onSuccess?.();
        }
      } else if (mode === 'createSubcategory') {
        if (!parentCategoryId) {
          throw new Error('Missing parent category id');
        }
        const response = await adminApi.createSubcategory({
          name: formData.name.trim(),
          description: formData.description,
          parentCategoryId,
        });
        if (response.success) {
          toast.success('Subcategory created successfully!');
          setFormData({ name: '', description: '' });
          onSuccess?.();
        }
      }
    } catch (error: any) {
      console.error('Create category error:', error);
      toast.error(error.message || 'Failed to create category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateCategoryRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {mode === 'create' && 'Create New Category'}
          {mode === 'edit' && 'Edit Category'}
          {mode === 'createSubcategory' && 'Create New Subcategory'}
        </h2>
        <p className="text-gray-600">
          {mode === 'create' && 'Add a new product category to organize your inventory.'}
          {mode === 'edit' && 'Update category details and status.'}
          {mode === 'createSubcategory' && 'Add a subcategory under the selected parent.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Category Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter category name (e.g., Electronics, Books, Clothing)"
              disabled={isSubmitting}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <X className="h-4 w-4 mr-1" />
              {errors.name}
            </p>
          )}
          {formData.name && !errors.name && (
            <p className="mt-1 text-sm text-green-600 flex items-center">
              <Check className="h-4 w-4 mr-1" />
              Category name looks good
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter a brief description of this category (optional)"
              disabled={isSubmitting}
            />
          </div>
          <div className="mt-1 flex justify-between items-center">
            {errors.description ? (
              <p className="text-sm text-red-600 flex items-center">
                <X className="h-4 w-4 mr-1" />
                {errors.description}
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Help users understand what products belong in this category
              </p>
            )}
            <span className="text-xs text-gray-400">
              {formData.description.length}/500
            </span>
          </div>
        </div>

        {/* Active toggle only for edit */}
        {mode === 'edit' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {isActive ? 'Active' : 'Inactive'}
              </button>
              <span className="text-xs text-gray-500">Toggle to activate/deactivate</span>
            </div>
          </div>
        )}

        {/* Category Preview */}
        {formData.name && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Tag className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <h5 className="font-medium text-gray-900 capitalize">{formData.name}</h5>
                {formData.description && (
                  <p className="text-sm text-gray-600">{formData.description}</p>
                )}
                <p className="text-xs text-gray-500">
                  Slug: {formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.name.trim()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>{mode === 'edit' ? 'Saving...' : 'Submitting...'}</span>
              </>
            ) : (
              <>
                <Tag className="h-4 w-4" />
                <span>
                  {mode === 'create' && 'Create Category'}
                  {mode === 'edit' && 'Save Changes'}
                  {mode === 'createSubcategory' && 'Create Subcategory'}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategoryForm;
