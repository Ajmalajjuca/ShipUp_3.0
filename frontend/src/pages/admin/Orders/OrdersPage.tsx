import React from 'react';
import { Card } from '../../../components/common';

const OrdersPage: React.FC = () => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">All Orders</h2>
      <p className="text-gray-600">Order list will be displayed here</p>
      {/* TODO: Implement AllOrders component when uncommented */}
    </Card>
  );
};

export default OrdersPage;
