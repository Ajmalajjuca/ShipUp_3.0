import React from 'react';
import { Card } from '../../../components/common';

const CompletedOrdersPage: React.FC = () => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Completed Orders</h2>
      <p className="text-gray-600">Completed orders will be displayed here</p>
      {/* TODO: Implement CompletedOrders component when uncommented */}
    </Card>
  );
};

export default CompletedOrdersPage;
