import React from 'react';
import { CheckCircle, Clock, Package, Truck, X, AlertCircle, BarChart2 } from 'lucide-react';
import { Card } from '../../../components/common';

interface OrderCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}

const OrderCard: React.FC<OrderCardProps> = ({ title, count, icon, color }) => {
  return (
    <Card hover className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-gray-600 font-medium">{title}</h3>
        <span className={`${color} p-2 rounded-full`}>{icon}</span>
      </div>
      <p className="text-3xl font-bold">{count}</p>
    </Card>
  );
};

const DashboardHome: React.FC = () => {
  const orderStats = [
    {
      title: 'Pending',
      count: 37,
      icon: <Clock size={20} />,
      color: 'text-yellow-500 bg-yellow-100',
    },
    {
      title: 'Confirmed',
      count: 24,
      icon: <CheckCircle size={20} />,
      color: 'text-green-500 bg-green-100',
    },
    {
      title: 'Processing',
      count: 6,
      icon: <Package size={20} />,
      color: 'text-blue-500 bg-blue-100',
    },
    {
      title: 'Out for delivery',
      count: 3,
      icon: <Truck size={20} />,
      color: 'text-purple-500 bg-purple-100',
    },
  ];

  const secondaryStats = [
    {
      title: 'Delivered',
      count: 35,
      icon: <CheckCircle size={20} />,
      color: 'text-green-500',
    },
    {
      title: 'Canceled',
      count: 3,
      icon: <X size={20} />,
      color: 'text-red-500',
    },
    {
      title: 'Returned',
      count: 2,
      icon: <Package size={20} />,
      color: 'text-orange-500',
    },
    {
      title: 'Failed To Deliver',
      count: 2,
      icon: <AlertCircle size={20} />,
      color: 'text-red-500',
    },
  ];

  return (
    <>
      {/* Welcome Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Welcome, Admin!</h2>
        <p className="text-gray-600">Monitor your logistics operations and statistics</p>
      </div>

      {/* Business Analytics */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BarChart2 size={20} className="text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-700">Business Analytics</h2>
          </div>
          <select
            className="border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Select time period"
          >
            <option>Overall Statistics</option>
            <option>Weekly Report</option>
            <option>Monthly Report</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {orderStats.map((stat, index) => (
            <OrderCard
              key={index}
              title={stat.title}
              count={stat.count}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {secondaryStats.map((stat, index) => (
          <Card key={index} hover className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-600">{stat.title}</h3>
                <p className="text-xl font-bold">{stat.count}</p>
              </div>
              <span className={stat.color}>{stat.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Order Statistics */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div className="flex items-center mb-3 md:mb-0">
            <Package size={20} className="text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-700">Order Statistics</h2>
          </div>
          <div className="flex space-x-2">
            <button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm shadow-sm hover:shadow-md transition-shadow duration-200">
              This Year
            </button>
            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors duration-200">
              This Month
            </button>
            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors duration-200">
              This Week
            </button>
          </div>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Order Status Statistics</h3>
          <div className="h-64 w-full bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart placeholder - Order status distribution</p>
          </div>
        </Card>
      </div>
    </>
  );
};

export default DashboardHome;
