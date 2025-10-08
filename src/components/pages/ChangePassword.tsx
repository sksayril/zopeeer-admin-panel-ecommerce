import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ChangePasswordProps {
  onSuccess?: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onSuccess }) => {
  const { changePassword, loading } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword && formData.newPassword && 
        formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
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
      const success = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (success) {
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setErrors({});
        onSuccess?.();
      }
    } catch (error) {
      console.error('Change password error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (password.length < 8) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (password.length < 12) return { strength: 3, label: 'Good', color: 'bg-blue-500' };
    return { strength: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Current Password */}
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Current Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="currentPassword"
            type={showPasswords.current ? 'text' : 'password'}
            value={formData.currentPassword}
            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
              errors.currentPassword ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your current password"
            disabled={isSubmitting || loading}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('current')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            disabled={isSubmitting || loading}
          >
            {showPasswords.current ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <X className="h-4 w-4 mr-1" />
            {errors.currentPassword}
          </p>
        )}
      </div>

      {/* New Password */}
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
          New Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="newPassword"
            type={showPasswords.new ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={(e) => handleInputChange('newPassword', e.target.value)}
            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
              errors.newPassword ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your new password"
            disabled={isSubmitting || loading}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('new')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            disabled={isSubmitting || loading}
          >
            {showPasswords.new ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        
        {/* Password Strength Indicator */}
        {formData.newPassword && (
          <div className="mt-2">
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600">{passwordStrength.label}</span>
            </div>
          </div>
        )}
        
        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <X className="h-4 w-4 mr-1" />
            {errors.newPassword}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm New Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="confirmPassword"
            type={showPasswords.confirm ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
              errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Confirm your new password"
            disabled={isSubmitting || loading}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('confirm')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            disabled={isSubmitting || loading}
          >
            {showPasswords.confirm ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <X className="h-4 w-4 mr-1" />
            {errors.confirmPassword}
          </p>
        )}
        {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
          <p className="mt-1 text-sm text-green-600 flex items-center">
            <Check className="h-4 w-4 mr-1" />
            Passwords match
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setErrors({});
            onSuccess?.();
          }}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isSubmitting || loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          {(isSubmitting || loading) ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Changing...</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>Change Password</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ChangePassword;
