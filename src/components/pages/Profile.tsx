import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, RefreshCw, Edit3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ChangePassword from './ChangePassword';

const Profile: React.FC = () => {
  const { admin, refreshProfile, loading } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleRefreshProfile = async () => {
    try {
      setIsRefreshing(true);
      await refreshProfile();
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !admin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Data</h3>
        <p className="text-gray-500">Unable to load admin profile information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-600">View and manage your account information</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefreshProfile}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{admin.name}</h3>
                  <p className="text-sm text-gray-500">Full Name</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{admin.email}</h3>
                  <p className="text-sm text-gray-500">Email Address</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 capitalize">{admin.role}</h3>
                  <p className="text-sm text-gray-500">Role</p>
                </div>
              </div>
            </div>

            {/* Account Status & Dates */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  admin.isActive ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <div className={`h-3 w-3 rounded-full ${
                    admin.isActive ? 'bg-green-600' : 'bg-red-600'
                  }`}></div>
                </div>
                <div>
                  <h3 className={`text-lg font-medium ${
                    admin.isActive ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {admin.isActive ? 'Active' : 'Inactive'}
                  </h3>
                  <p className="text-sm text-gray-500">Account Status</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {formatDate(admin.createdAt)}
                  </h3>
                  <p className="text-sm text-gray-500">Account Created</p>
                </div>
              </div>

              {admin.updatedAt && (
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {formatDate(admin.updatedAt)}
                    </h3>
                    <p className="text-sm text-gray-500">Last Updated</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      {showChangePassword && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
            <p className="text-sm text-gray-600">Update your account password</p>
          </div>
          <div className="p-6">
            <ChangePassword onSuccess={() => setShowChangePassword(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
