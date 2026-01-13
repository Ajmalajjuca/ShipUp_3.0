import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Search, Package, Truck, CheckCircle, CreditCard, Filter, AlertCircle } from 'lucide-react';
import { adminService } from '../../../services/admin';
import { toast } from 'react-hot-toast';
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Badge from '../../../components/common/Badge/Badge';
import Loader from '../../../components/common/Loader/Loader';

const STATUS_COLORS = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', variant: 'warning' },
  'Out For Delivery': { bg: 'bg-blue-50', text: 'text-blue-700', variant: 'info' },
  Delivered: { bg: 'bg-green-50', text: 'text-green-700', variant: 'success' },
  Cancelled: { bg: 'bg-red-50', text: 'text-red-700', variant: 'danger' },
};

// Define interfaces
interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  totalItems: number;
  totalAmount: number;
  paymentMethod: string;
  branch: string;
  status: string;
  deliveryType: string;
  distance: number;
  estimatedTime: string;
  pickupAddress: { street: string };
  dropoffAddress: { street: string };
}

interface Partner {
  partnerId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  createdAt: string;
  profileImage?: string;
  vehicleType: string;
  registrationNumber: string;
}

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
}

interface PartnerDetailViewProps {
  partnerId: string;
  onBack: () => void;
}

// Stats Card Component
const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, variant }) => {
    let bgClass = 'bg-white';
    let iconBgClass = 'bg-gray-100';
    let iconColorClass = 'text-gray-600';

    switch (variant) {
        case 'warning':
            bgClass = 'bg-amber-50';
            iconBgClass = 'bg-amber-100';
            iconColorClass = 'text-amber-600';
            break;
        case 'info':
            bgClass = 'bg-blue-50';
            iconBgClass = 'bg-blue-100';
            iconColorClass = 'text-blue-600';
            break;
        case 'success':
            bgClass = 'bg-green-50';
            iconBgClass = 'bg-green-100';
            iconColorClass = 'text-green-600';
            break;
        case 'primary':
            bgClass = 'bg-indigo-50';
            iconBgClass = 'bg-indigo-100';
            iconColorClass = 'text-indigo-600';
            break;
    }

  return (
    <Card className={`${bgClass} border-none shadow-sm transition-all hover:shadow-md h-full`} padding="md">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
          <p className="text-gray-600 font-medium mt-1">{title}</p>
        </div>
        <div className={`rounded-full ${iconBgClass} p-3`}>
          <div className={`${iconColorClass}`}>{icon}</div>
        </div>
      </div>
    </Card>
  );
};

// Order Item Component
const OrderItem: React.FC<{ order: Order }> = ({ order }) => {
  const statusConfig = STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] || 
    { bg: 'bg-gray-50', text: 'text-gray-700', variant: 'neutral' };
    
  return (
    <Card className="hover:shadow-lg transition-all overflow-hidden group border-l-4" padding="none">
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
             order.status === 'Pending' ? 'bg-amber-500' :
             order.status === 'Out For Delivery' ? 'bg-blue-500' :
             order.status === 'Delivered' ? 'bg-green-500' :
             order.status === 'Cancelled' ? 'bg-red-500' : 'bg-gray-500'
        }`}></div>

      <div className="p-5 pl-6">
        {/* Top section with order ID, status, date, amount */}
        <div className="flex flex-col sm:flex-row justify-between mb-5 pb-4 border-b border-gray-100">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">Order</span>
              <h3 className="text-base font-bold text-gray-800">#{order.id}</h3>
            </div>
            <p className="text-gray-500 text-xs">
              {new Date(order.createdAt).toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric',
              })} | {new Date(order.createdAt).toLocaleTimeString('en-GB', {
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </p>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-6 mt-3 sm:mt-0">
             <Badge variant={statusConfig.variant as any} dot>
                {order.status}
             </Badge>
            
            <div className="text-right">
              <p className="text-gray-900 font-bold text-lg">₹{order.totalAmount.toFixed(2)}</p>
              <div className="flex items-center justify-end gap-1 mt-1 text-gray-600 text-xs">
                <CreditCard size={12} />
                <span>{order.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery details with improved visuals */}
        <div className="grid sm:grid-cols-7 gap-4">
          {/* Pickup/Dropoff with route visualization - takes 4 columns */}
          <div className="sm:col-span-4">
            <div className="relative pl-6">
              {/* Vertical route line */}
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200 z-0"></div>
              
              {/* Pickup point */}
              <div className="relative z-10 mb-6">
                <div className="flex items-start">
                  <div className="absolute left-[-22px] p-1 rounded-full bg-indigo-100 border-2 border-white">
                    <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                  </div>
                  <div className="pl-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pickup</p>
                    <p className="font-medium text-gray-800 mt-1">{order.pickupAddress?.street || 'No address'}</p>
                  </div>
                </div>
              </div>
              
              {/* Dropoff point */}
              <div className="relative z-10">
                <div className="flex items-start">
                  <div className="absolute left-[-22px] p-1 rounded-full bg-red-100 border-2 border-white">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  </div>
                  <div className="pl-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Dropoff</p>
                    <p className="font-medium text-gray-800 mt-1">{order.dropoffAddress?.street || 'No address'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order details - takes 3 columns */}
          <div className="sm:col-span-3 bg-gray-50 p-3 rounded-lg">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3 tracking-wide">Delivery Details</h4>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
              <div>
                <p className="text-xs text-gray-500">Distance</p>
                <p className="font-medium text-gray-800">{order.distance} km</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Est. Time</p>
                <p className="font-medium text-gray-800">{order.estimatedTime}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Type</p>
                <p className="font-medium text-gray-800">{order.deliveryType}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity gap-2">
           <Button variant="secondary" size="sm">Track Order</Button>
           <Button variant="ghost" size="sm">View Details</Button>
        </div>
      </div>
    </Card>
  );
};

// Profile Card Component
const ProfileCard: React.FC<{ partner: Partner }> = ({ partner }) => (
  <Card className="border border-gray-100 shadow-sm transition-all hover:shadow-md" padding="lg">
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex items-center gap-5">
        {partner.profileImage ? (
          <img
            src={partner.profileImage}
            alt={partner.fullName}
            className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            <span className="text-2xl font-bold">
              {partner.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{partner.fullName}</h3>
          <p className="text-gray-600">
            Joined {new Date(partner.createdAt).toLocaleDateString('en-GB', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
          <div className="mt-3">
             <Button variant="primary" size="sm">Edit Profile</Button>
          </div>
        </div>
      </div>

      <div className="md:ml-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border-l-2 border-indigo-100 pl-6">
          <h4 className="text-indigo-800 font-semibold mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Information
          </h4>
          <p className="text-gray-700">{partner.email}</p>
          <p className="text-gray-700">{partner.mobileNumber}</p>
        </div>

        <div className="border-l-2 border-indigo-100 pl-6">
          <h4 className="text-indigo-800 font-semibold mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
            Vehicle Information
          </h4>
          <p className="text-gray-700">Type: {partner.vehicleType}</p>
          <p className="text-gray-700">Reg #: {partner.registrationNumber}</p>
        </div>
      </div>
    </div>
  </Card>
);

// Main Component
const PartnerDetailView: React.FC<PartnerDetailViewProps> = ({ partnerId, onBack }) => {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    outForDelivery: 0,
    completed: 0,
    orderAmount: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);

  useEffect(() => {
    fetchPartnerDetails();
    fetchPartnerOrders();
  }, [partnerId]);

  const fetchPartnerDetails = async () => {
    try {
      const partnerRes = await adminService.getPartnerById(partnerId);
      // Ensure we handle the response structure correctly.
      setPartner(partnerRes.partner || partnerRes); 
    } catch (error) {
      console.error('Error fetching partner details:', error);
      toast.error('Failed to fetch partner details');
    } finally {
      if (stats.orderAmount !== undefined) setLoading(false); 
    }
  };

  const fetchPartnerOrders = async () => {
    try {
      const response = await adminService.getPartnerOrders(partnerId);
      const partnerOrders = response || [];
      setOrders(partnerOrders);

      // Calculate stats
      const pending = partnerOrders.filter((order: Order) => order.status === 'Pending').length;
      const outForDelivery = partnerOrders.filter((order: Order) => order.status === 'Out For Delivery').length;
      const completed = partnerOrders.filter((order: Order) => order.status === 'Delivered').length;
      const totalAmount = partnerOrders.reduce((sum: number, order: Order) => sum + (order.totalAmount || 0), 0);

      setStats({
        pending,
        outForDelivery,
        completed,
        orderAmount: totalAmount
      });
    } catch (error) {
      console.error('Error fetching partner orders:', error);
      toast.error('Failed to fetch partner orders');
    } finally {
        if (partner) setLoading(false);
    }
  };

  const handleFilter = () => {
    // Filter logic would go here
    toast.success('Filters applied');
    setFiltersVisible(false);
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader size="lg" text="Loading partner details..." /></div>;

  if (!partner) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="text-center p-8 max-w-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Partner Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find the partner details you're looking for.</p>
          <Button onClick={onBack} variant="primary">Go Back</Button>
        </Card>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={onBack}
              className="mr-4 rounded-full"
              leftIcon={<ArrowLeft size={20} />}
            >
            </Button>
            <h1 className="text-xl font-bold text-gray-800">
              Deliveryman Details
            </h1>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Card */}
        <div className="mb-8">
          <ProfileCard partner={partner} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Pending" 
            value={stats.pending} 
            icon={<Package size={22} />} 
            variant="warning"
          />
          <StatsCard 
            title="Out for Delivery" 
            value={stats.outForDelivery} 
            icon={<Truck size={22} />} 
            variant="info"
          />
          <StatsCard 
            title="Completed" 
            value={stats.completed} 
            icon={<CheckCircle size={22} />} 
            variant="success"
          />
          <StatsCard 
            title="Order Amount" 
            value={`₹${stats.orderAmount.toFixed(2)}`} 
            icon={<CreditCard size={22} />} 
            variant="primary"
          />
        </div>

        {/* Order List Section */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0">
              Orders <span className="text-sm font-normal text-gray-500 ml-1">({filteredOrders.length})</span>
            </h2>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0 w-full sm:w-64">
                <Input
                  placeholder="Search by order ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search size={18} />}
                  fullWidth
                />
              </div>

              <Button 
                variant="secondary"
                onClick={() => setFiltersVisible(!filtersVisible)} 
                leftIcon={<Filter size={18} />}
              >
                <span className="hidden sm:inline">Filters</span>
              </Button>

              <Button variant="primary" leftIcon={<Package size={20} />}>
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {filtersVisible && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="orderDate" className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      id="orderDate"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    id="status" 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Out For Delivery">Out For Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select 
                    id="paymentMethod" 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Methods</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-4 gap-2">
                <Button 
                  variant="secondary"
                  onClick={() => setFiltersVisible(false)} 
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary"
                  onClick={handleFilter}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          )}

          {/* Orders List */}
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderItem key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
          
          {filteredOrders.length > 0 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex items-center gap-1">
                <Button variant="ghost" disabled>Previous</Button>
                <Button variant="primary" size="sm">1</Button>
                <Button variant="ghost" size="sm">2</Button>
                <Button variant="ghost" size="sm">3</Button>
                <Button variant="ghost">Next</Button>
              </nav>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PartnerDetailView;