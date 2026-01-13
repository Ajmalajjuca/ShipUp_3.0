import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserList from '../../../components/features/users/UserList';
import { ADMIN_ROUTES } from '../../../constants';

const UsersPage: React.FC = () => {
  const navigate = useNavigate();

  const handleViewUser = (userId: string) => {
    navigate(ADMIN_ROUTES.USER_DETAIL(userId));
  };

  return <UserList onViewUser={handleViewUser} />;
};

export default UsersPage;
