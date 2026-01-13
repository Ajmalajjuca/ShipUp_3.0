import React from 'react';
import { Card } from '../../../components/common';
import { BarChart2, TrendingUp, Users, DollarSign, Package } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  const stats = [
    { label: 'Total Revenue', value: '₹1,234,567', change: '+12.5%', icon: <DollarSign size={24} className="text-green-500" />, color: 'bg-green-100' },
    { label: 'Active Users', value: '1,234', change: '+5.2%', icon: <Users size={24} className="text-blue-500" />, color: 'bg-blue-100' },
    { label: 'Total Orders', value: '5,678', change: '+8.1%', icon: <Package size={24} className="text-purple-500" />, color: 'bg-purple-100' },
    { label: 'Growth Rate', value: '23%', change: '+2.4%', icon: <TrendingUp size={24} className="text-orange-500" />, color: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Analytics Overview</h1>
        <div className="flex space-x-2">
            <select className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>This Year</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="flex items-center p-6" hover>
            <div className={`p-4 rounded-full ${stat.color} mr-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <h3 className="text-xl font-bold text-gray-800">{stat.value}</h3>
              <p className="text-xs text-green-600 font-medium mt-1">{stat.change} vs last period</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
           <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-semibold text-gray-800">Revenue Trends</h3>
               <BarChart2 size={20} className="text-gray-400" />
           </div>
           <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
                <p className="text-gray-400">Revenue Chart Placeholder</p>
           </div>
        </Card>

        <Card className="p-6">
           <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-semibold text-gray-800">Order Volume</h3>
               <BarChart2 size={20} className="text-gray-400" />
           </div>
           <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
                <p className="text-gray-400">Order Volume Chart Placeholder</p>
           </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
