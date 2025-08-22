import React, { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
// import WalletComponent from './ProfileComponents/WalletComponent';
import HomeLayout from '../../../components/user/layout/HomeLayout';
import ProfileCard from './ProfileComponents/ProfileCard';
import type { RootState } from '../../../store';
import { authService } from '../../../services/auth';
import { logout } from '../../../store/slices/authSlice';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth.user);
  const [activeSection, setActiveSection] = useState<'profile' | 'wallet'>('profile');

  const handleLogout = async() => {
    try {
      await authService.logout();
      dispatch(logout());
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      <HomeLayout>
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-stretch">
            
            {/* ProfileCard */}
            <div className="w-full lg:w-2/5 xl:w-1/3 flex">
              <ProfileCard
                userData={{
                  ...user,
                  walletBalance: user.walletBalance || 0,
                  loyaltyPoints: user.loyaltyPoints || 0,
                }}
                onLogout={handleLogout}
                setActiveSection={setActiveSection}
              />
            </div>

            {/* Children Content */}
            <div className="w-full lg:w-3/5 xl:w-2/3 flex">
              {activeSection === 'profile' ? (
                children
              ) : (
                <></>
                // WalletComponent goes here
              )}
            </div>
          </div>
        </div>
      </HomeLayout>
    </div>
  );
};

export default ProfileLayout;