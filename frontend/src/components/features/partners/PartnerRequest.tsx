import React, { useState, useEffect } from 'react';
import { Search, Eye, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminService } from '../../..//services/admin';
import type { PartnerUser } from '../../..//types';
import Card from '../../../components/common/Card/Card';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';
import Badge from '../../../components/common/Badge/Badge';
import Loader from '../../../components/common/Loader/Loader';

interface PartnerRequestProps {
  onViewPartner: (partnerId: string) => void;
}

const PartnerRequest: React.FC<PartnerRequestProps> = ({ onViewPartner }) => {
  const [requests, setRequests] = useState<PartnerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await adminService.getAllPartnersRequest()
      console.log('Fetched partner requests:', response);
      
      const pendingPartners = (response?.partners?.data || []).filter((partner: any) => 
        !partner.bankDetailsCompleted || 
        !partner.personalDocumentsCompleted || 
        !partner.vehicleDetailsCompleted
      );
      
      setRequests(pendingPartners);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching partner requests:', err);
      setError('Failed to fetch partner requests');
      setLoading(false);
    }
  };

  const handleView = (partnerId: string) => {
    onViewPartner(partnerId);
  };

  const handleDelete = async (partnerId: string) => {
      if (!window.confirm('Are you sure you want to delete this partner request?')) return;
      
      try {
          await adminService.deletePartner(partnerId);
          toast.success('Request deleted successfully');
          fetchRequests();
      } catch (error) {
          console.error('Error deleting request:', error);
          toast.error('Failed to delete request');
      }
  };

  const filteredRequests = requests.filter(request => 
    request.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.phone?.includes(searchTerm)
  );
  
  if (loading) return <div className="flex justify-center py-8"><Loader size="lg" /></div>;
  if (error) return (
      <Card className="p-6 text-center text-red-500">
          <p>{error}</p>
          <Button variant="secondary" onClick={fetchRequests} className="mt-4">Retry</Button>
      </Card>
  );

  return (
    <Card className="min-h-screen" padding="none">
       <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                 <h2 className="text-xl font-bold text-gray-800">New Joining Requests</h2>
                 <p className="text-gray-500 text-sm mt-1">Review and approve new driver partner applications ({requests.length})</p>
            </div>
            <div className="w-full md:w-64">
                <Input
                    placeholder="Search requests..."
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
              <th className="py-4 px-6 text-left">Applicant</th>
              <th className="py-4 px-6 text-left">Contact Info</th>
              <th className="py-4 px-6 text-left">Date</th>
              <th className="py-4 px-6 text-left">Bank Status</th>
              <th className="py-4 px-6 text-left">Docs Status</th>
              <th className="py-4 px-6 text-left">Vehicle Status</th>
              <th className="py-4 px-6 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRequests.map((request) => (
              <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    {request.profilePicture ? (
                      <img 
                        src={request.profilePicture} 
                        alt={request.fullName} 
                        className="w-10 h-10 rounded-full mr-3 object-cover shadow-sm"
                      />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3 font-bold shadow-sm">
                        {request.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium text-gray-900">{request.fullName}</span>
                  </div>
                </td>

                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-900">{request.email}</span>
                    <span className="text-xs text-gray-500">{request.phone}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-500 text-sm">
                  {new Date(request.createdAt).toLocaleDateString('en-GB')}
                </td>
                <td className="py-4 px-6">
                    <Badge variant={request.bankDetailsCompleted ? 'success' : 'warning'} dot>
                         {request.bankDetailsCompleted ? 'Completed' : 'Pending'}
                    </Badge>
                </td>
                <td className="py-4 px-6">
                    <Badge variant={request.personalDocumentsCompleted ? 'success' : 'warning'} dot>
                         {request.personalDocumentsCompleted ? 'Completed' : 'Pending'}
                    </Badge>
                </td>
                <td className="py-4 px-6">
                    <Badge variant={request.vehicleDetailsCompleted ? 'success' : 'warning'} dot>
                         {request.vehicleDetailsCompleted ? 'Completed' : 'Pending'}
                    </Badge>
                </td>
                <td className="py-4 px-6">
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost"
                      size="sm"
                      title="Review Application"
                      onClick={() => handleView(request._id)}
                    >
                      <Eye size={16} className="text-blue-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      title="Delete Request"
                      onClick={() => handleDelete(request.partnerId || request._id)}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
             {filteredRequests.length === 0 && (
                <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                        No pending requests found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default PartnerRequest;