import React from 'react';
import PendingOrders from '../../../components/features/orders/PendingOrders';

const PendingOrdersPage: React.FC = () => {
  const handleViewOrder = (id: string) => {
    console.log('View pending order', id);
  };

  return <PendingOrders onViewOrder={handleViewOrder} />;
};

export default PendingOrdersPage;
