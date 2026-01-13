import React from 'react';
import { useNavigate } from 'react-router-dom';
import PartnerRequest from '../../../components/features/partners/PartnerRequest';
import { ADMIN_ROUTES } from '../../../constants';

const PartnerRequestsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleViewPartner = (partnerId: string) => {
    navigate(ADMIN_ROUTES.PARTNER_DETAIL(partnerId));
  };

  return <PartnerRequest onViewPartner={handleViewPartner} />;
};

export default PartnerRequestsPage;
