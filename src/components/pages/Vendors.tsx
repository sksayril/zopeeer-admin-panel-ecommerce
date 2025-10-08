import React, { useState, useEffect } from 'react';
import { Search, Plus, CreditCard as Edit, Trash2, Store, Mail, Phone, MapPin, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { adminApi, Vendor } from '../../services/api';
import CreateVendorForm from '../forms/CreateVendorForm';
import ViewDataModal from '../ViewDataModal';
import toast from 'react-hot-toast';

const Vendors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const fetchVendors = async () => {
    try {
      setRefreshing(true);
      const response = await adminApi.getVendors();
      if (response.success) {
        setVendors(response.data.vendors);
      }
    } catch (error: any) {
      console.error('Failed to fetch vendors:', error);
      toast.error(error.message || 'Failed to fetch vendors');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchVendors(); // Refresh the list
  };

  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setViewModalOpen(false);
    setSelectedVendor(null);
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.shopName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAddress = (address: any) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Users</h1>
          <p className="text-gray-600 mt-1">Manage vendor accounts and their information</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchVendors}
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
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Create Vendor Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CreateVendorForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="relative">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search vendors by name, email, or shop name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Vendors Count */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Total Vendors</h3>
            <p className="text-2xl font-bold text-indigo-600">{vendors.length}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Showing {filteredVendors.length} of {vendors.length}</p>
          </div>
        </div>
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length === 0 ? (
        <div className="text-center py-12">
          <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No vendors found' : 'No vendors yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Get started by creating your first vendor account'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create First Vendor
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <div key={vendor._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Store className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                    <p className="text-sm text-gray-600">{vendor.shopName}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                    vendor.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {vendor.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                    vendor.isVerified 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {vendor.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{vendor.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{vendor.phone}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-600">{formatAddress(vendor.address)}</span>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                Joined: {formatDate(vendor.createdAt)}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleViewVendor(vendor)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="View Vendor Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <button 
                  onClick={() => handleViewVendor(vendor)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Vendor Modal */}
      <ViewDataModal
        isOpen={viewModalOpen}
        onClose={handleCloseModal}
        data={selectedVendor}
        type="vendor"
        title="Vendor Details"
      />
    </div>
  );
};

export default Vendors;