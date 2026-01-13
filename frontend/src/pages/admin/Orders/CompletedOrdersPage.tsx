import React from 'react';
import CompletedOrders from '../../../components/features/orders/CompletedOrders';

const CompletedOrdersPage: React.FC = () => {
  const handleViewOrder = (id: string) => {
    console.log('View completed order', id);
  };

  return <CompletedOrders onViewOrder={handleViewOrder} />;
};

export default CompletedOrdersPage;
