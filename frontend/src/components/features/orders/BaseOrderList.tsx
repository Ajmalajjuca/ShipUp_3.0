import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import FilterSection from './FilterSection';
import StatusCard from './StatusCard';
import OrderTable from './OrderTable';
import { getStatusColor, getPaymentStatusColor, formatDate, formatTime } from './orderUtils';
import { adminService } from '../../../services/admin';
import Loader from '../../common/Loader/Loader';
import Card from '../../common/Card/Card';

export interface Order {
  id: string;
  createdAt: string;
  customerId: string;
  deliveryType: string;
  distance: number;
  driverId: string;
  dropoffAddress: { street: string; latitude: number; longitude: number };
  estimatedTime: string;
  paymentMethod: string;
  pickupAddress: { street: string; latitude: number; longitude: number };
  status: string;
  totalAmount: number;
  updatedAt: string;
  vehicleId: string;
  vehicleName: string;
  customerName?: string;
  driverName?: string;
  customerPhone?: number;
  driverPhone?: number;
  branch?: string;
}

interface StatusCounts {
  pending: number;
  confirmed: number;
  processing: number;
  outForDelivery: number;
  delivered: number;
  canceled: number;
  returned: number;
  failed: number;
}

interface BaseOrderListProps {
  title: string;
  statusFilter?: string | string[]; // Single status or array of statuses to filter
  statusCountsConfig?: Partial<StatusCounts>; // Which status counts to display
  onViewOrder?: (id: string) => void;
}

const BaseOrderList: React.FC<BaseOrderListProps> = ({
  title,
  statusFilter,
  statusCountsConfig,
  onViewOrder,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    pending: 0,
    confirmed: 0,
    processing: 0,
    outForDelivery: 0,
    delivered: 0,
    canceled: 0,
    returned: 0,
    failed: 0,
  });
  const [branch, setBranch] = useState('All Branch');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true); 
    try {
      const ordersData = await adminService.getAllOrders();
      
      if (ordersData && Array.isArray(ordersData)) {
        // Fetch customer and driver details for each order
        const enrichedOrders = await Promise.all(
          ordersData.map(async (order: Order) => {
            try {
              if (order.customerId || order.driverId) {
                // Determine names based on available IDs. 
                // Note: adminService might return different structure, but we assume similar behavior
                // or we improve this by creating a dedicated method if needed.
                let customerName = 'Unknown Customer';
                let customerPhone = undefined;
                let driverName = 'Unknown Driver';
                let driverPhone = undefined;

                if (order.customerId) {
                   try {
                     const userResponse = await adminService.getUserById(order.customerId);
                     if (userResponse && userResponse.user) {
                        customerName = userResponse.user.fullName;
                        customerPhone = userResponse.user.phone;
                     }
                   } catch (e) { /* ignore */ }
                }

                if (order.driverId) {
                   try {
                        const driverResponse = await adminService.getPartnerById(order.driverId);
                        if (driverResponse && driverResponse.partner) {
                            driverName = driverResponse.partner.fullName;
                            driverPhone = driverResponse.partner.mobileNumber;
                        }
                   } catch (e) { /* ignore */ }
                }

                return {
                  ...order,
                  customerName,
                  customerPhone,
                  driverName,
                  driverPhone,
                };
              }
              return order;
            } catch (error) {
              console.error(`Error fetching details for order ${order.id}:`, error);
              return {
                ...order,
                customerName: 'Unknown Customer',
                driverName: 'Unknown Driver',
              };
            }
          })
        );

        // Filter orders by status if specified
        const filteredOrders = statusFilter
          ? enrichedOrders.filter((order) =>
              Array.isArray(statusFilter)
                ? statusFilter.includes(order.status.toLowerCase())
                : order.status.toLowerCase() === statusFilter
            )
          : enrichedOrders;

        setOrders(filteredOrders);

        // Update status counts
        const counts = enrichedOrders.reduce(
          (acc, order) => {
            switch (order.status.toLowerCase()) {
              case 'pending':
                acc.pending += 1;
                break;
              case 'confirmed':
                acc.confirmed += 1;
                break;
              case 'processing':
                acc.processing += 1;
                break;
              case 'out for delivery':
                acc.outForDelivery += 1;
                break;
              case 'completed':
                acc.delivered += 1;
                break;
              case 'canceled':
                acc.canceled += 1;
                break;
              case 'returned':
                acc.returned += 1;
                break;
              case 'failed':
                acc.failed += 1;
                break;
              default:
                break;
            }
            return acc;
          },
          {
            pending: 0,
            confirmed: 0,
            processing: 0,
            outForDelivery: 0,
            delivered: 0,
            canceled: 0,
            returned: 0,
            failed: 0,
          }
        );

        setStatusCounts(counts);
      } else {
        toast.error('Failed to fetch Orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('An error occurred while fetching orders');
    } finally {
        setIsLoading(false);
      }
  };

  // Filter orders based on search, branch, and date range
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === '' ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.status.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch = branch === 'All Branch' || order.branch === branch;

    const orderDate = new Date(order.createdAt);
    const matchesDate =
      (!startDate || orderDate >= new Date(startDate)) &&
      (!endDate || orderDate <= new Date(endDate));

    return matchesSearch && matchesBranch && matchesDate;
  });

  return (
    <Card className="border-gray-100" padding="lg">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-green-500" />
        <h1 className="text-lg font-semibold">{title}</h1>
        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-sm">{filteredOrders.length}</span>
      </div>

      <FilterSection
        branch={branch}
        setBranch={setBranch}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onShowData={fetchOrders}
      />

      {statusCountsConfig && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {statusCountsConfig.pending !== undefined && (
            <StatusCard
              icon={
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-500 text-sm">⏳</span>
                </div>
              }
              label="Pending"
              count={statusCounts.pending}
              color="text-blue-500"
            />
          )}
          {statusCountsConfig.confirmed !== undefined && (
            <StatusCard
              icon={<CheckCircle className="w-6 h-6 text-green-500" />}
              label="Confirmed"
              count={statusCounts.confirmed}
              color="text-green-500"
            />
          )}
          {statusCountsConfig.processing !== undefined && (
            <StatusCard
              icon={
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-500">🏭</span>
                </div>
              }
              label="Processing"
              count={statusCounts.processing}
              color="text-purple-500"
            />
          )}
          {statusCountsConfig.outForDelivery !== undefined && (
            <StatusCard
              icon={
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-orange-500">🚚</span>
                </div>
              }
              label="Out For Delivery"
              count={statusCounts.outForDelivery}
              color="text-orange-500"
            />
          )}
          {statusCountsConfig.delivered !== undefined && (
            <StatusCard
              icon={
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-500">📦</span>
                </div>
              }
              label="Delivered"
              count={statusCounts.delivered}
              color="text-green-400"
            />
          )}
          {statusCountsConfig.canceled !== undefined && (
            <StatusCard
              icon={
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-500">❌</span>
                </div>
              }
              label="Canceled"
              count={statusCounts.canceled}
              color="text-red-400"
            />
          )}
          {statusCountsConfig.returned !== undefined && (
            <StatusCard
              icon={
                <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                  <span className="text-yellow-500">↩️</span>
                </div>
              }
              label="Returned"
              count={statusCounts.returned}
              color="text-yellow-500"
            />
          )}
          {statusCountsConfig.failed !== undefined && (
            <StatusCard
              icon={<XCircle className="w-6 h-6 text-red-500" />}
              label="Failed To Deliver"
              count={statusCounts.failed}
              color="text-red-500"
            />
          )}
        </div>
      )}

      {isLoading ? (
           <Loader size="lg" />
      ) : (
        <OrderTable
            orders={filteredOrders}
            isLoading={false}
            onViewOrder={onViewOrder}
            getStatusColor={getStatusColor}
            getPaymentStatusColor={getPaymentStatusColor}
            formatDate={formatDate}
            formatTime={formatTime}
        />
      )}
    </Card>
  );
};

export default BaseOrderList;