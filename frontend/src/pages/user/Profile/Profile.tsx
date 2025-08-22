import { useLocation } from 'react-router-dom';
import EditProfile from './ProfileComponents/EditProfile';
import ModernProfilePage from './ProfileComponents/ModernProfilePage';
import ProfileLayout from './ProfileLayout';
import AddressBook from './ProfileComponents/AddressBook';
import AddAddressForm from './ProfileComponents/AddAddressForm';
import EditAddressForm from './ProfileComponents/EditAddressForm';

const Profile = () => {
  const location = useLocation();


  const renderContent = () => {
    const path = location.pathname;
    
    switch (path) {
      case '/profile/edit':
        return <EditProfile />;
      case '/address':
        return <AddressBook />;  
      case '/address/add':
        return <AddAddressForm/>
      case '/profile':
      default:
        if (path.startsWith('/address/edit/')) {
          return <EditAddressForm />;
        }
        return <ModernProfilePage />;
    }
  };
  return (
    <ProfileLayout>
      {renderContent()}
    </ProfileLayout>
  );
};

export default Profile;
