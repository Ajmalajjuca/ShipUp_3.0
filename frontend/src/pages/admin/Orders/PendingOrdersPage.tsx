import React from 'react';
import { Card } from '../../../components/common';

const PendingOrdersPage: React.FC = () => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Pending Orders</h2>
      <p className="text-gray-600">Pending orders will be displayed here</p>
      {/* TODO: Implement PendingOrders component when uncommented */}
    </Card>
  );
};

export default PendingOrdersPage;
