import React, { useState, useEffect } from 'react';
import { Search, Edit2, Eye, Trash2, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import EditPartnerModal from './EditPartnerModal';
import { adminService } from '../../..//services/admin';
import Card from '../../../components/common/Card/Card';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';
import Badge from '../../../components/common/Badge/Badge';
import Loader from '../../../components/common/Loader/Loader';

interface Partner {
  partnerId: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
  status: boolean;
  totalOrders: number;
  completedOrders: number;
  canceledOrders: number;
  totalAmount?: number;
  availablePoints?: number;
  bankDetailsCompleted: boolean;
  personalDocumentsCompleted: boolean;
  vehicleDetailsCompleted: boolean;
}

interface PartnerListProps {
  onViewPartner: (partnerId: string) => void;
}

const PartnerList: React.FC<PartnerListProps> = ({ onViewPartner }) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await adminService.getAllPartners();
      console.log('Fetched partners:', response.partners.data);

      const verifiedPartners = (response.partners.data || []).filter((partner: Partner) =>
        partner.bankDetailsCompleted === true &&
        partner.personalDocumentsCompleted === true &&
        partner.vehicleDetailsCompleted === true
      );

      setPartners(verifiedPartners);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching partners:', err);
      setError('Failed to fetch partners');
      setLoading(false);
    }
  };

  const handleView = (partnerId: string) => {
    onViewPartner(partnerId);
  };

  const handleStatusToggle = async (partner: Partner) => {
      if (!window.confirm(`Are you sure you want to ${partner.status ? 'deactivate' : 'activate'} this partner?`)) return;
      
      try {
          await adminService.updatePartner(partner.partnerId, { status: !partner.status });
          toast.success(`Partner ${partner.status ? 'deactivated' : 'activated'} successfully`);
          fetchPartners();
      } catch (error) {
          console.error('Error updating partner status:', error);
          toast.error('Failed to update partner status');
      }
  };

  const handleDelete = async (partnerId: string) => {
      if (!window.confirm('Are you sure you want to delete this partner? This action cannot be undone.')) return;
      
      try {
          await adminService.deletePartner(partnerId);
          toast.success('Partner deleted successfully');
          fetchPartners();
      } catch (error) {
          console.error('Error deleting partner:', error);
          toast.error('Failed to delete partner');
      }
  };

  const filteredPartners = partners.filter(partner =>
    partner.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.phone?.includes(searchTerm) ||
    partner.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPartners.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <div className="flex justify-center py-8"><Loader size="lg" /></div>;
  if (error) return (
      <Card className="p-6 text-center text-red-500">
          <p>{error}</p>
          <Button variant="secondary" onClick={fetchPartners} className="mt-4">Retry</Button>
      </Card>
  );

  return (
    <Card className="min-h-screen" padding="none">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                 <h2 className="text-xl font-bold text-gray-800">Verified Partners</h2>
                 <p className="text-gray-500 text-sm mt-1">Manage and view all verified partner accounts ({partners.length})</p>
            </div>
            <div className="w-full md:w-64">
                <Input
                    placeholder="Search partners..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={<Search size={18} />}
                    fullWidth
                />
            </div>
        </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
              <th className="py-4 px-6 text-left">Partner</th>
              <th className="py-4 px-6 text-left">Contact</th>
              <th className="py-4 px-6 text-left">Orders</th>
              <th className="py-4 px-6 text-left">Revenue</th>
              <th className="py-4 px-6 text-left">Points</th>
              <th className="py-4 px-6 text-left">Status</th>
              <th className="py-4 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentItems.map((partner) => (
              <tr key={partner.partnerId} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    {partner.profileImage ? (
                      <img
                        src={partner.profileImage}
                        alt={partner.fullName}
                        className="w-10 h-10 rounded-full mr-3 object-cover shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 font-bold shadow-sm">
                        {partner.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium text-gray-900">{partner.fullName}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-900">{partner.email}</span>
                    <span className="text-xs text-gray-500">{partner.phone}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                    <div className="flex flex-col text-sm">
                        <span className="font-medium">{partner.totalOrders || 0} Total</span>
                        <div className="flex gap-2 text-xs mt-1">
                            <span className="text-green-600">{partner.completedOrders || 0} Done</span>
                            <span className="text-red-500">{partner.canceledOrders || 0} Cancel</span>
                        </div>
                    </div>
                </td>
                <td className="py-4 px-6 font-medium text-gray-900">₹{(partner.totalAmount || 0).toFixed(2)}</td>
                <td className="py-4 px-6 text-gray-600">{partner.availablePoints || 0}</td>
                <td className="py-4 px-6">
                    <Badge variant={partner.status ? 'success' : 'danger'} dot>
                        {partner.status ? 'Active' : 'Inactive'}
                    </Badge>
                </td>
                <td className="py-4 px-6">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusToggle(partner)}
                      title={partner.status ? 'Deactivate' : 'Activate'}
                    >
                      {partner.status ? <Ban size={16} className="text-red-500" /> : <CheckCircle size={16} className="text-green-500" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPartner(partner);
                        setIsEditModalOpen(true);
                      }}
                      title="Edit"
                    >
                      <Edit2 size={16} className="text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(partner.partnerId)}
                      title="View Details"
                    >
                      <Eye size={16} className="text-green-600" />
                    </Button>
                     <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(partner.partnerId)}
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {currentItems.length === 0 && (
                <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                        No partners found matching your search.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Edit Modal (placeholder integration) */}
       {selectedPartner && (
        <EditPartnerModal
          partner={selectedPartner}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPartner(null);
          }}
          onSave={(updated) => {
              // Handle update logic locally or refresh
              console.log('Update partner', updated);
              fetchPartners(); 
              setIsEditModalOpen(false); 
          }}
        />
      )}
    </Card>
  );
};

export default PartnerList;