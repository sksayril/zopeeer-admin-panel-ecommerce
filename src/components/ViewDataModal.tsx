import React from 'react';
import { X, User, Package, Tag, Store, Mail, Phone, Calendar, CheckCircle, XCircle, ExternalLink, Edit } from 'lucide-react';
import { Product, Category, Vendor } from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  joinDate: string;
}

interface ViewDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Product | Category | Vendor | User | null;
  type: 'product' | 'category' | 'vendor' | 'user';
  title: string;
  onEdit?: (data: any) => void;
}

const ViewDataModal: React.FC<ViewDataModalProps> = ({
  isOpen,
  onClose,
  data,
  type,
  title,
  onEdit
}) => {
  if (!isOpen || !data) return null;

  const renderUserDetails = (user: User) => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
          <User className="h-8 w-8 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
          <p className="text-gray-600">User ID: {user.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{user.phone}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {user.status === 'Active' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={`font-medium ${user.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                  {user.status}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Join Date</p>
              <p className="font-medium text-gray-900">{user.joinDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProductDetails = (product: Product) => {
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
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return (
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            {product.mainImage ? (
              <img
                src={product.mainImage}
                alt={product.title}
                className="w-32 h-32 object-cover rounded-xl shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
                }}
              />
            ) : (
              <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h3>
            <p className="text-gray-600 mb-4">Product ID: {product.id}</p>
            {product.shortDescription && (
              <p className="text-gray-700 text-lg leading-relaxed">{product.shortDescription}</p>
            )}
          </div>
        </div>

        {/* Additional Images */}
        {product.additionalImages && product.additionalImages.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Additional Images</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.additionalImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.title} - Image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.open(image, '_blank')}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Pricing</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">MRP</span>
                <span className="font-semibold text-gray-900">{formatPrice(product.mrp)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">SRP</span>
                <span className="font-semibold text-green-600">{formatPrice(product.srp)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Profit Margin</span>
                <span className="font-semibold text-blue-600">{product.profitMargin}%</span>
              </div>
              {product.mrp > product.srp && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-semibold text-red-600">
                    {Math.round(((product.mrp - product.srp) / product.mrp) * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Category & Vendor</h4>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 block">Category</span>
                <span className="font-medium text-gray-900">
                  {product.category?.name || 'No Category'}
                </span>
              </div>
              {product.subcategory && (
                <div>
                  <span className="text-gray-600 block">Subcategory</span>
                  <span className="font-medium text-gray-900">{product.subcategory.name}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600 block">Vendor Site</span>
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
                  <span className="text-gray-400">Not specified</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Status & Dates</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                {product.isActive ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={`font-medium ${product.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 block">Created</span>
                <span className="font-medium text-gray-900">{formatDate(product.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-600 block">Updated</span>
                <span className="font-medium text-gray-900">{formatDate(product.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Creator Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Created By</h4>
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">{product.createdBy.name}</p>
              <p className="text-sm text-gray-600">{product.createdBy.email}</p>
            </div>
          </div>
        </div>

        {/* Product URLs */}
        {product.productUrl && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Product Links</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Product URL</span>
                <button
                  onClick={() => window.open(product.productUrl, '_blank')}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open Link</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          </div>
        )}

        {/* Detailed Description */}
        {product.detailedDescription && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Detailed Description</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{product.detailedDescription}</p>
            </div>
          </div>
        )}

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {product.features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Highlights */}
        {product.highlights && product.highlights.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Highlights</h4>
            <div className="space-y-2">
              {product.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h4>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {product.specifications.map((spec, index) => (
                  <div key={index} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                    <span className="font-medium text-gray-700">{spec.key}</span>
                    <span className="text-gray-600 text-right max-w-xs">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Attributes */}
        {product.attributes && product.attributes.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Attributes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.attributes.map((attr, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-700 mb-1">{attr.key}</div>
                  <div className="text-gray-600">{attr.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keywords */}
        {product.keywords && product.keywords.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {product.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCategoryDetails = (category: Category) => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Tag className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
          <p className="text-gray-600">Category ID: {category.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Slug</p>
            <p className="font-medium text-gray-900">{category.slug}</p>
          </div>
          {category.description && (
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="font-medium text-gray-900">{category.description}</p>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {category.isActive ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={`font-medium ${category.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Created By</p>
              <p className="font-medium text-gray-900">{category.createdBy.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center space-x-3">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="font-medium text-gray-900">
              {new Date(category.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Updated</p>
            <p className="font-medium text-gray-900">
              {new Date(category.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {category.subcategory && category.subcategory.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Subcategories</h4>
          <div className="space-y-2">
            {category.subcategory.map((sub) => (
              <div key={sub.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{sub.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  sub.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {sub.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderVendorDetails = (vendor: Vendor) => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Store className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{vendor.name}</h3>
          <p className="text-gray-600">Shop: {vendor.shopName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{vendor.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{vendor.phone}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium text-gray-900">{vendor.role}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {vendor.isActive ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={`font-medium ${vendor.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {vendor.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {vendor.isVerified ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="text-sm text-gray-500">Verification</p>
                <p className={`font-medium ${vendor.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                  {vendor.isVerified ? 'Verified' : 'Unverified'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium text-gray-900">
                {new Date(vendor.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'user':
        return renderUserDetails(data as User);
      case 'product':
        return renderProductDetails(data as Product);
      case 'category':
        return renderCategoryDetails(data as Category);
      case 'vendor':
        return renderVendorDetails(data as Vendor);
      default:
        return <div>Unknown data type</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] min-h-[400px] overflow-hidden border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:shadow-sm"
            title="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 pb-4 overflow-y-auto">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 pt-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-500">
            {type === 'product' && 'Product Details'}
            {type === 'category' && 'Category Details'}
            {type === 'vendor' && 'Vendor Details'}
            {type === 'user' && 'User Details'}
          </div>
          <div className="flex items-center space-x-3">
            {onEdit && (
              <button
                onClick={() => onEdit(data)}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 hover:shadow-md transition-all duration-200 shadow-sm"
            >
              <X className="h-4 w-4" />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDataModal;
