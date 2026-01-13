import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  showMenuButton: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, showMenuButton }) => {
  const location = useLocation();

  // Get page title from current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path.includes('/users/')) return 'Customer Details';
    if (path.includes('/users')) return 'Users';
    if (path.includes('/partners/requests')) return 'Partner Requests';
    if (path.includes('/partners/')) return 'Partner Details';
    if (path.includes('/partners')) return 'Partners';
    if (path.includes('/vehicles/')) return 'Vehicle Details';
    if (path.includes('/vehicles')) return 'Vehicles';
    if (path.includes('/orders/pending')) return 'Pending Orders';
    if (path.includes('/orders/completed')) return 'Completed Orders';
    if (path.includes('/orders/')) return 'Order Details';
    if (path.includes('/orders')) return 'All Orders';
    if (path.includes('/analytics')) return 'Analytics';
    if (path.includes('/route-management')) return 'Route Management';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/security')) return 'Security';
    if (path.includes('/help')) return 'Help & Support';
    if (path === '/admin/dashboard') return 'Dashboard';
    
    return 'Dashboard';
  };

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
      {/* Menu button */}
      {showMenuButton && (
        <button
          className="text-gray-500 mr-4"
          onClick={onMenuClick}
          title="Toggle menu"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Page title */}
      <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>

      {/* Right side actions */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search..."
            className="py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
          />
          <Search size={18} className="absolute top-2.5 left-3 text-gray-400" />
        </div>

        {/* Notifications */}
        <div className="relative">
          <Bell
            size={20}
            className="text-gray-600 cursor-pointer hover:text-blue-500 transition-colors duration-200"
          />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
            2
          </span>
        </div>

        {/* User avatar */}
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center mr-2 shadow-sm">
            A
          </div>
          <span className="text-gray-700 font-medium hidden md:inline">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
