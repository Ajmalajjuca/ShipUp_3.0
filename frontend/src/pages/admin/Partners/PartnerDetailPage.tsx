import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PartnerRequestView from '../../../components/features/partners/PartnerRequestView';
import { ADMIN_ROUTES } from '../../../constants';

const PartnerDetailPage: React.FC = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(ADMIN_ROUTES.PARTNER_REQUESTS);
  };

  if (!partnerId) {
    return <div>Partner ID not found</div>;
  }

  return <PartnerRequestView partnerId={partnerId} onBack={handleBack} />;
};

export default PartnerDetailPage;
