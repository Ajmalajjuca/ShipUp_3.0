import React from 'react';
import { useNavigate } from 'react-router-dom';
import PartnerList from '../../../components/features/partners/PartnerList';
import { ADMIN_ROUTES } from '../../../constants';

const PartnersPage: React.FC = () => {
  const navigate = useNavigate();

  const handleViewPartner = (partnerId: string) => {
    navigate(ADMIN_ROUTES.PARTNER_DETAIL(partnerId));
  };

  return <PartnerList onViewPartner={handleViewPartner} />;
};

export default PartnersPage;
