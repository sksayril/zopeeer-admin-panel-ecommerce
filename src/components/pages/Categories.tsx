import React, { useState, useEffect } from 'react';
import { Search, Plus, CreditCard as Edit, Trash2, Tag, RefreshCw, ChevronDown, ChevronRight, User, Eye } from 'lucide-react';
import { adminApi, Category } from '../../services/api';
import CreateCategoryForm from '../forms/CreateCategoryForm';
import ViewDataModal from '../ViewDataModal';
import toast from 'react-hot-toast';

const Categories: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'create' | 'edit' | 'createSubcategory';
    category?: Category;
    parentCategoryId?: string;
  }>({ open: false, mode: 'create' });
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    category?: Category;
  }>({ open: false });
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    try {
      setRefreshing(true);
      const response = await adminApi.getCategories();
      if (response.success) {
        setCategories(response.data.categories);
      }
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      toast.error(error.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchCategories(); // Refresh the list
  };

  const openEditModal = (category: Category) => {
    setModalState({ open: true, mode: 'edit', category });
  };

  const openCreateSubModal = (parent: Category) => {
    setModalState({ open: true, mode: 'createSubcategory', parentCategoryId: parent.id, category: parent });
  };

  const closeModal = () => {
    setModalState({ open: false, mode: 'create' });
  };

  const onModalSuccess = () => {
    closeModal();
    fetchCategories();
  };

  const requestDelete = (category: Category) => {
    setConfirmState({ open: true, category });
  };

  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
    setViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setViewModalOpen(false);
    setSelectedCategory(null);
  };

  const cancelDelete = () => setConfirmState({ open: false });

  const confirmDelete = async () => {
    if (!confirmState.category) return;
    try {
      await adminApi.deleteCategory(confirmState.category.id);
      toast.success('Category deleted successfully');
      setConfirmState({ open: false });
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const searchInCategory = (category: Category, term: string): boolean => {
    const searchLower = term.toLowerCase();
    return (
      category.name.toLowerCase().includes(searchLower) ||
      (category.description && category.description.toLowerCase().includes(searchLower)) ||
      category.subcategory.some(sub => searchInCategory(sub, term))
    );
  };

  const filteredCategories = categories.filter(category => 
    searchInCategory(category, searchTerm)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-yellow-500'
    ];
    return colors[index % colors.length];
  };

  const renderSubcategories = (subcategories: Category[], level: number = 1) => {
    if (subcategories.length === 0) return null;

    return (
      <div className={`ml-${level * 4} mt-2 space-y-2`}>
        {subcategories.map((subcategory, index) => (
          <div key={subcategory.id} className="border-l-2 border-gray-200 pl-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`h-6 w-6 ${getCategoryColor(index)} rounded flex items-center justify-center`}>
                <Tag className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{subcategory.name}</span>
              {subcategory.description && (
                <span className="text-xs text-gray-500">- {subcategory.description}</span>
              )}
              <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                subcategory.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {subcategory.isActive ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={() => openCreateSubModal(subcategory)}
                className="ml-2 p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                title="Add subcategory"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            {renderSubcategories(subcategory.subcategory, level + 1)}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage product categories and their hierarchical structure</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchCategories}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Create Category Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CreateCategoryForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Unified Modal for Edit / Create Subcategory */}
      {modalState.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CreateCategoryForm
              mode={modalState.mode}
              categoryId={modalState.mode === 'edit' ? modalState.category?.id : undefined}
              initialValues={modalState.mode === 'edit' ? {
                name: modalState.category?.name,
                description: modalState.category?.description,
                isActive: modalState.category?.isActive,
              } : undefined}
              parentCategoryId={modalState.mode === 'createSubcategory' ? modalState.parentCategoryId : undefined}
              onSuccess={onModalSuccess}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmState.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900">Delete Category</h3>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to delete <span className="font-medium">{confirmState.category?.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={cancelDelete} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="relative">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search categories and subcategories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories Count */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Total Categories</h3>
            <p className="text-2xl font-bold text-indigo-600">{categories.length}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Showing {filteredCategories.length} of {categories.length}</p>
          </div>
        </div>
      </div>

      {/* Categories List */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No categories found' : 'No categories yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Get started by creating your first category'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create First Category
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCategories.map((category, index) => (
            <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`h-12 w-12 ${getCategoryColor(index)} rounded-lg flex items-center justify-center`}>
                    <Tag className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900 text-lg">{category.name}</h3>
                      <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                        category.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">Created by {category.createdBy.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        Created: {formatDate(category.createdAt)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Slug: {category.slug}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {category.subcategory.length > 0 && (
                    <button
                      onClick={() => toggleCategoryExpansion(category.id)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  <button 
                    onClick={() => handleViewCategory(category)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="View Category Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button onClick={() => openCreateSubModal(category)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Add subcategory">
                    <Plus className="h-4 w-4" />
                  </button>
                  <button onClick={() => openEditModal(category)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => requestDelete(category)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Subcategories */}
              {category.subcategory.length > 0 && expandedCategories.has(category.id) && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Subcategories ({category.subcategory.length})
                  </h4>
                  {renderSubcategories(category.subcategory)}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {category.subcategory.length} subcategories
                  </span>
                </div>
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  View Products
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            <p className="text-sm text-gray-600">Total Categories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {categories.filter(c => c.isActive).length}
            </p>
            <p className="text-sm text-gray-600">Active Categories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {categories.reduce((acc, c) => acc + c.subcategory.length, 0)}
            </p>
            <p className="text-sm text-gray-600">Total Subcategories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {categories.length > 0 ? Math.round(categories.reduce((acc, c) => acc + c.subcategory.length, 0) / categories.length) : 0}
            </p>
            <p className="text-sm text-gray-600">Avg Subcategories/Category</p>
          </div>
        </div>
      </div>

      {/* View Category Modal */}
      <ViewDataModal
        isOpen={viewModalOpen}
        onClose={handleCloseModal}
        data={selectedCategory}
        type="category"
        title="Category Details"
      />
    </div>
  );
};

export default Categories;