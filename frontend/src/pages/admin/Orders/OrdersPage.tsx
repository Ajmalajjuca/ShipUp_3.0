import React from 'react';
import AllOrders from '../../../components/features/orders/AllOrders';

const OrdersPage: React.FC = () => {
  const handleViewOrder = (id: string) => {
    // Navigate to order details if such a page exists, otherwise just log or toast
    // For now, no specific route was set up for order details in route config?
    // Ah, task.md says "Orders routes (All Orders, Pending, Completed)" only.
    // implementation_plan.md says: Route path="orders" element={<OrdersPage />}
    // It doesn't list order detail page.
    console.log('View order', id);
  };

  return <AllOrders onViewOrder={handleViewOrder} />;
};

export default OrdersPage;
