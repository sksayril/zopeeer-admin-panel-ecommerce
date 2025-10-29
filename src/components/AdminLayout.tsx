import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Vendors from './pages/Vendors';
import Products from './pages/Products';
import Categories from './pages/Categories';
import ScrapeProducts from './pages/ScrapeProducts';
import ScrapingDetails from './pages/ScrapingDetails';
import Scheduler from './pages/Scheduler';
import Profile from './pages/Profile';

const AdminLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <Users />;
      case 'vendors':
        return <Vendors />;
      case 'products':
        return <Products />;
      case 'categories':
        return <Categories />;
      case 'scrape-products':
        return <ScrapeProducts />;
      case 'scraping-details':
        return <ScrapingDetails />;
      case 'scheduler':
        return <Scheduler />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">Settings page coming soon...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;