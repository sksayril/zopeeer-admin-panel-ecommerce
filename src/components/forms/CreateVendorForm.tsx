import React, { useState } from 'react';
import { User, Mail, Lock, Phone, MapPin, Store, Eye, EyeOff, Check, X } from 'lucide-react';
import { adminApi, CreateVendorRequest, VendorAddress } from '../../services/api';
import toast from 'react-hot-toast';

interface CreateVendorFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateVendorForm: React.FC<CreateVendorFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<CreateVendorRequest>({
    name: '',
    email: '',
    password: '',
    phone: '',
    shopName: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic validation
    if (!formData.name.trim()) {
      newErrors.name = 'Vendor name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.shopName.trim()) {
      newErrors.shopName = 'Shop name is required';
    }

    // Address validation
    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street address is required';
    }

    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }

    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State is required';
    }

    if (!formData.address.zipCode.trim()) {
      newErrors['address.zipCode'] = 'ZIP code is required';
    } else if (!/^[0-9]{6}$/.test(formData.address.zipCode)) {
      newErrors['address.zipCode'] = 'ZIP code must be 6 digits';
    }

    if (!formData.address.country.trim()) {
      newErrors['address.country'] = 'Country is required';
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
      const response = await adminApi.createVendor(formData);
      
      if (response.success) {
        toast.success('Vendor created successfully!');
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          shopName: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India',
          },
        });
        setErrors({});
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Create vendor error:', error);
      toast.error(error.message || 'Failed to create vendor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (password.length < 8) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (password.length < 12) return { strength: 3, label: 'Good', color: 'bg-blue-500' };
    return { strength: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Create New Vendor</h2>
        <p className="text-gray-600">Add a new vendor to the system with their shop and contact information.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vendor Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Vendor Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter vendor name"
                disabled={isSubmitting}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <X className="h-4 w-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <X className="h-4 w-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
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
            
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <X className="h-4 w-4 mr-1" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter 10-digit phone number"
                disabled={isSubmitting}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <X className="h-4 w-4 mr-1" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Shop Name */}
          <div className="md:col-span-2">
            <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-2">
              Shop Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Store className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="shopName"
                type="text"
                value={formData.shopName}
                onChange={(e) => handleInputChange('shopName', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  errors.shopName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter shop name"
                disabled={isSubmitting}
              />
            </div>
            {errors.shopName && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <X className="h-4 w-4 mr-1" />
                {errors.shopName}
              </p>
            )}
          </div>
        </div>

        {/* Address Information */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Address Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Street */}
            <div className="md:col-span-2">
              <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                id="street"
                type="text"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  errors['address.street'] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter street address"
                disabled={isSubmitting}
              />
              {errors['address.street'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors['address.street']}
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                id="city"
                type="text"
                value={formData.address.city}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  errors['address.city'] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter city"
                disabled={isSubmitting}
              />
              {errors['address.city'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors['address.city']}
                </p>
              )}
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                id="state"
                type="text"
                value={formData.address.state}
                onChange={(e) => handleInputChange('address.state', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  errors['address.state'] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter state"
                disabled={isSubmitting}
              />
              {errors['address.state'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors['address.state']}
                </p>
              )}
            </div>

            {/* ZIP Code */}
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code *
              </label>
              <input
                id="zipCode"
                type="text"
                value={formData.address.zipCode}
                onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  errors['address.zipCode'] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter 6-digit ZIP code"
                disabled={isSubmitting}
              />
              {errors['address.zipCode'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors['address.zipCode']}
                </p>
              )}
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <input
                id="country"
                type="text"
                value={formData.address.country}
                onChange={(e) => handleInputChange('address.country', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  errors['address.country'] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter country"
                disabled={isSubmitting}
              />
              {errors['address.country'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors['address.country']}
                </p>
              )}
            </div>
          </div>
        </div>

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
            disabled={isSubmitting}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                <span>Create Vendor</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateVendorForm;
