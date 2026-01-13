import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, ChevronLeft, Truck, LogOut } from 'lucide-react';
import {
  NAVIGATION_ITEMS,
  MANAGEMENT_ITEMS,
  ANALYTICS_ITEMS,
  SYSTEM_ITEMS,
  type NavigationItem,
} from '../../../constants/navigation.constants';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, isMobile }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const navigate = useNavigate();

  const toggleDropdown = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const isDropdownExpanded = (itemId: string) => expandedItems.includes(itemId);

  const renderNavigationItem = (item: NavigationItem) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = isDropdownExpanded(item.id);

    if (!hasChildren && item.path) {
      // Simple navigation item without children
      return (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200 ease-in-out rounded-md mb-1 relative ${
              isActive
                ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-medium shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center">
                <span
                  className={`${isActive ? 'text-blue-600' : 'text-gray-500'} ${
                    isOpen ? 'mr-3' : ''
                  } ${!isOpen ? 'mx-auto' : ''}`}
                >
                  <Icon size={18} />
                </span>
                {isOpen && <span className={isActive ? 'font-medium' : ''}>{item.title}</span>}
              </div>
            </>
          )}
        </NavLink>
      );
    }

    // Navigation item with children (dropdown)
    return (
      <div key={item.id} className="mb-2">
        <div
          className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200 ease-in-out rounded-md mb-1 relative ${
            isExpanded
              ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-medium shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => toggleDropdown(item.id)}
        >
          <div className="flex items-center">
            <span
              className={`${isExpanded ? 'text-blue-600' : 'text-gray-500'} ${
                isOpen ? 'mr-3' : ''
              } ${!isOpen ? 'mx-auto' : ''}`}
            >
              <Icon size={18} />
            </span>
            {isOpen && <span className={isExpanded ? 'font-medium' : ''}>{item.title}</span>}
          </div>
          {isOpen && (
            <div className="flex items-center">
              {isExpanded ? (
                <ChevronDown size={16} className="text-blue-600" />
              ) : (
                <ChevronRight size={16} className="text-gray-500" />
              )}
            </div>
          )}
        </div>

        {/* Dropdown children */}
        {isExpanded && isOpen && item.children && (
          <div className="my-1 transition-all duration-300 ease-in-out">
            {item.children.map((child) => (
              <NavLink
                key={child.id}
                to={child.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ml-7 text-sm flex items-center justify-between ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <span>{child.title}</span>
                {child.badge && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                    {child.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`${
        isMobile ? 'fixed' : 'relative'
      } z-20 h-full transform transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64 translate-x-0' : 'w-16 translate-x-0'
      } bg-white shadow-lg flex flex-col`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          {isOpen && (
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-lg shadow-sm">
              <Truck size={20} />
            </div>
          )}
          {isOpen && (
            <h1 onClick={() => navigate('/')} className="ml-3 text-xl font-semibold cursor-pointer">
              Ship<span className="text-red-500 font-bold">Up</span>
            </h1>
          )}
          {!isOpen && (
            <div className="flex justify-center w-full">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-1 rounded-lg shadow-sm">
                <Truck size={18} />
              </div>
            </div>
          )}
        </div>
        <button
          className={`text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none ${
            !isOpen && 'hidden'
          }`}
          onClick={onToggle}
          title="Toggle sidebar"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Sidebar content */}
      <div className={`p-3 flex-1 overflow-y-auto ${!isOpen && 'overflow-visible'}`}>
        {/* Dashboard */}
        <div className="mb-6">
          {NAVIGATION_ITEMS.map((item) => renderNavigationItem(item))}
        </div>

        {/* Management Section */}
        {isOpen && (
          <div className="mb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
              Management
            </p>
          </div>
        )}
        <div className="mb-6">
          {MANAGEMENT_ITEMS.map((item) => renderNavigationItem(item))}
        </div>

        {/* Analytics & Operations Section */}
        {isOpen && (
          <div className="mb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
              Analytics & Operations
            </p>
          </div>
        )}
        <div className="mb-6">
          {ANALYTICS_ITEMS.map((item) => renderNavigationItem(item))}
        </div>

        {/* System Section */}
        {isOpen && (
          <div className="mb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
              System
            </p>
          </div>
        )}
        <div>{SYSTEM_ITEMS.map((item) => renderNavigationItem(item))}</div>
      </div>

      {/* User profile section */}
      {isOpen ? (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center mr-3 shadow-sm">
              A
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium">Admin User</h4>
              <p className="text-xs text-gray-500">System Administrator</p>
            </div>
            <button
              onClick={() => {
                // Handle logout
                navigate('/admin/login');
              }}
              className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-sm hover:from-blue-600 hover:to-blue-700 transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-gray-200 flex justify-center">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-sm cursor-pointer">
            A
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
