import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Package, 
  Tag, 
  LogOut,
  Shield,
  User,
  UserCircle,
  Settings,
  Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { admin, logout, loading } = useAuth();
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'vendors', label: 'Vendors', icon: Store },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'scrape-products', label: 'Scrape Products', icon: Download },
    { id: 'scraping-details', label: 'Scraping Details', icon: Download },
  ];

  const settingsItems = [
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-sm text-gray-400">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {/* Main Menu Items */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* Settings Section */}
        <div className="pt-6 mt-6 border-t border-gray-700">
          <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Account
          </h3>
          {settingsItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Admin Info & Logout */}
      <div className="p-4 border-t border-gray-700 space-y-3">
        {/* Admin Info */}
        {admin && (
          <div className="flex items-center space-x-3 px-4 py-3 bg-gray-800 rounded-lg">
            <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{admin.name}</p>
              <p className="text-xs text-gray-400 truncate">{admin.email}</p>
            </div>
          </div>
        )}
        
        {/* Logout Button */}
        <button
          onClick={logout}
          disabled={loading}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">
            {loading ? 'Logging out...' : 'Logout'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;