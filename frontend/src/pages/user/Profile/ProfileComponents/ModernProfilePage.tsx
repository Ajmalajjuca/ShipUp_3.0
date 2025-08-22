import React, { useState } from 'react';
import { User, Settings, LogOut, Truck, MapPin, CreditCard, Bell, LifeBuoy, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';

const ModernProfilePage: React.FC = () => {
  const [isHovering, setIsHovering] = useState('');
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Menu items expanded for a shipping profile
  const menuItems = [
    { id: 'profile/edit', label: 'Edit Your Profile', icon: <User size={20} /> },
    { id: 'address', label: 'Address Book', icon: <MapPin size={20} /> },
    { id: 'tracking', label: 'Track Shipments', icon: <Truck size={20} /> },
    { id: 'history', label: 'Order History', icon: <History size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'support', label: 'Get Support', icon: <LifeBuoy size={20} /> },
  ];
  
  const handleNavigate = (path: string) => {   
    navigate(`/${path}`);
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        {/* Header - only visible on mobile for context */}
        <div className="lg:hidden mb-4">
          <h2 className="text-xl font-bold text-gray-800">Profile Options</h2>
          <p className="text-sm text-gray-600">Manage your account and preferences</p>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onMouseEnter={() => setIsHovering(item.id)}
              onMouseLeave={() => setIsHovering('')}
              onClick={() => handleNavigate(item.id)}
              className="w-full bg-white hover:bg-gray-50 p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group border border-gray-100 active:scale-98 touch-manipulation"
            >
              <div className="flex items-center min-w-0 flex-1">
                <div className={`p-2 sm:p-2.5 rounded-lg mr-3 sm:mr-4 transition-all duration-300 flex-shrink-0 ${
                  isHovering === item.id 
                    ? 'bg-red-100 text-red-400' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <div className="w-4 h-4 sm:w-5 sm:h-5">
                    {React.cloneElement(item.icon, { 
                      size: window.innerWidth >= 640 ? 20 : 16 
                    })}
                  </div>
                </div>
                <span className={`font-medium transition-all duration-300 text-sm sm:text-base truncate ${
                  isHovering === item.id 
                    ? 'text-red-400' 
                    : 'text-gray-800'
                }`}>
                  {item.label}
                </span>
              </div>
              <svg 
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 flex-shrink-0 ml-2 ${
                  isHovering === item.id 
                    ? 'transform translate-x-1 text-red-400' 
                    : 'text-gray-400'
                }`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Footer info - only visible on larger screens */}
        <div className="hidden lg:block mt-6 pt-6 border-t border-gray-100">
          <div className="text-center text-sm text-gray-500">
            <p>Need help? Contact our support team</p>
            <p className="mt-1">Available 24/7 for assistance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernProfilePage;