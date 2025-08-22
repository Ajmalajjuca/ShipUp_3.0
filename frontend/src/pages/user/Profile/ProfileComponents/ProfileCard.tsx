import React, { useState } from 'react';
import { CreditCard, Award, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileCardProps {
  userData: {
    fullName: string;
    email: string;
    phone?: string;
    referralId?: string;
    profilePicture?: string;
    loyaltyPoints?: number;
    walletBalance?: number;
  };
  showControls?: boolean;
  onLogout?: () => void;
  isEditing?: boolean;
  children?: React.ReactNode;
  setActiveSection: (section: "profile" | "wallet") => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  userData, 
  showControls = true, 
  onLogout,
  setActiveSection,
  isEditing = false,
  children 
}) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-100 w-full">
      {/* Header gradient banner */}
      <div className="h-12 bg-indigo-900"></div>
      
      <div className="p-4 sm:p-6 relative">
        {/* Profile image positioned to overlap the banner */}
        <div className="absolute -top-8 sm:-top-10 left-1/2 transform -translate-x-1/2">
          {userData.profilePicture && !imageError ? (
            <img 
              src={userData.profilePicture}
              alt={userData.fullName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-md"
              onError={() => {
                console.error('Failed to load profile image:', userData.profilePicture);
                setImageError(true);
              }}
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 flex items-center justify-center border-4 border-white shadow-md">
              <span className="text-white text-lg sm:text-xl font-bold">
                {userData?.fullName?.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          )}
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold mt-10 sm:mt-12 mb-4 sm:mb-6 text-center text-gray-800 break-words">
          {isEditing ? 'Edit Profile' : userData.fullName}
        </h2>
        
        <div className="flex flex-col items-center">
          <p className="text-gray-600 text-center text-sm sm:text-base break-all">{userData.email}</p>
          {userData.phone && <p className="text-gray-600 mt-1 text-center text-sm sm:text-base">{userData.phone}</p>}

          {userData.referralId && (
            <div className="mt-4 sm:mt-6 w-full bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm text-gray-500">Referral Id:</span>
                <span className="font-mono font-medium text-indigo-900 text-sm sm:text-base break-all">{userData.referralId}</span>
              </div>
            </div>
          )}

          {/* Slot for additional content */}
          {children}
        </div>
        
        {showControls && (
          <div className="mt-4 sm:mt-6">
            {/* Balance & Loyalty Point Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div 
                onClick={() => setActiveSection('wallet')} 
                className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl p-4 text-white shadow-md hover:shadow-lg transition-all duration-300 relative cursor-pointer overflow-hidden"
              >
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <CreditCard size={48} className="sm:w-16 sm:h-16" />
                </div>
                <div className="flex items-center mb-2 relative z-10">
                  <CreditCard size={16} className="sm:w-5 sm:h-5 mr-2" />
                  <span className="text-sm font-medium">Wallet</span>
                </div>
                <div className="text-lg sm:text-xl font-bold relative z-10">
                  ₹{userData.walletBalance?.toFixed(2) || '0.00'}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Award size={48} className="sm:w-16 sm:h-16" />
                </div>
                <div className="flex items-center mb-2 relative z-10">
                  <Award size={16} className="sm:w-5 sm:h-5 mr-2" />
                  <span className="text-sm font-medium">Loyalty</span>
                </div>
                <div className="text-lg sm:text-xl font-bold relative z-10">
                  {userData.loyaltyPoints || 0} pts
                </div>
              </div>
            </div>
            
            {/* Logout Button */}
            {onLogout && (
              <button 
                onClick={onLogout}
                className="w-full mt-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 hover:from-red-50 hover:to-red-100 text-gray-700 hover:text-red-600 py-3 px-4 rounded-lg transition-all duration-300 border border-gray-200 hover:border-red-200"
              >
                <span className="font-medium text-sm sm:text-base">Logout</span>
                <ChevronRight size={18} className="sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;