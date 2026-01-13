import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerDetailView from '../../../components/features/users/CustomerDetailView';
import { ADMIN_ROUTES } from '../../../constants';

const UserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(ADMIN_ROUTES.USERS);
  };

  if (!userId) {
    return <div>User ID not found</div>;
  }

  return <CustomerDetailView userId={userId} onBack={handleBack} />;
};

export default UserDetailPage;
