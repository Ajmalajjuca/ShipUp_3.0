import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, RefreshCw, Truck } from 'lucide-react';
import { toast } from 'react-hot-toast';

import VehicleForm from './VehicleForm';
import type { VehicleType } from '../../..//types/vehicle.types';
import { vehicleService } from '../../..//services/vehicle.service';
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Loader from '../../../components/common/Loader/Loader';
import Badge from '../../../components/common/Badge/Badge';

const VehicleList: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusUpdating, setStatusUpdating] = useState<{[key: string]: boolean}>({});
  
  useEffect(() => {
    fetchVehicles();
  }, []);
  
  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const response = await vehicleService.getVehicles();
      if (response.success) {
        setVehicles(response.vehicles);
      } else {
        toast.error(response.message || 'Failed to fetch vehicles');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('An error occurred while fetching vehicles');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEdit = (vehicle: VehicleType) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };
  
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }
    
    try {
      const response = await vehicleService.deleteVehicle(id);
      if (response.success) {
        toast.success('Vehicle deleted successfully');
        fetchVehicles();
      } else {
        toast.error(response.message || 'Failed to delete vehicle');
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('An error occurred while deleting the vehicle');
    }
  };
  
  const handleFormClose = () => {
    setShowForm(false);
    setEditingVehicle(null);
  };
  
  const handleFormSubmit = async () => {
    fetchVehicles();
    handleFormClose();
  };

  const handleToggleStatus = async (vehicle: VehicleType, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!vehicle._id) return;
    
    setStatusUpdating(prev => ({ ...prev, [vehicle._id!]: true }));
    
    try {
      const response = await vehicleService.toggleVehicleStatus(vehicle._id);
      
      if (response.success) {
        toast.success(`Vehicle status ${vehicle.isActive ? 'deactivated' : 'activated'} successfully`);
        // Update the vehicle in the list
        setVehicles(prevVehicles => 
          prevVehicles.map(v => 
            v._id === vehicle._id ? { ...v, isActive: !v.isActive } : v
          )
        );
      } else {
        toast.error(response.message || 'Failed to update vehicle status');
      }
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      toast.error('An error occurred while updating the vehicle status');
    } finally {
      setStatusUpdating(prev => ({ ...prev, [vehicle._id!]: false }));
    }
  };

  const handleViewVehicle = (_id: string) => {
      toast('View functionality is not available', {
        icon: '👁️',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
  };

  // Apply filters and search
  const filteredVehicles = vehicles.filter(v => {
    // Apply search filter
    const matchesSearch = !searchTerm || 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesSearch;
  });

  return (
    <div>
      {showForm ? (
        <VehicleForm 
          vehicle={editingVehicle} 
          onClose={handleFormClose} 
          onSubmit={handleFormSubmit}
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Vehicle Management</h2>
              <p className="text-gray-600">Manage the vehicles available for delivery</p>
            </div>
            <div className="mt-3 sm:mt-0">
                <Button
                    onClick={() => setShowForm(true)}
                    variant="primary"
                    leftIcon={<Plus size={18} />}
                >
                    Add New Vehicle
                </Button>
            </div>
          </div>
          
          <Card padding="none" className="overflow-hidden mb-6">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <div className="text-lg font-medium text-gray-700">Vehicle List</div>
              <div className="flex items-center w-full sm:w-auto space-x-2">
                <div className="flex-grow sm:flex-grow-0 w-full sm:w-64">
                    <Input
                        placeholder="Search vehicles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        leftIcon={<Search size={18} />}
                        fullWidth
                    />
                </div>

                <Button
                  onClick={fetchVehicles}
                  variant="secondary"
                  leftIcon={<RefreshCw size={18} />}
                  className="bg-white border text-gray-700 hover:bg-gray-50"
                />
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                   <Loader size="lg" />
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="p-6 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Truck size={24} className="text-gray-400" />
                </div>
                <h3 className="text-gray-800 font-medium mb-1">No vehicles found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 'No vehicles match your search criteria.' : 
                   'You have not added any vehicles yet.'}
                </p>
                {searchTerm && (
                  <Button
                    variant="ghost"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehicle Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Max Weight
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price/km
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredVehicles.map((vehicle) => (
                      <tr key={vehicle._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewVehicle(vehicle._id!)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 mr-3 bg-gray-100 rounded-full flex items-center justify-center">
                              {vehicle.imageUrl ? (
                                <img
                                  src={vehicle.imageUrl}
                                  alt={vehicle.name}
                                  className="h-8 w-8 object-contain"
                                />
                              ) : (
                                <Truck size={20} className="text-gray-500" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {vehicle.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {vehicle.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {vehicle.maxWeight}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₹{vehicle.pricePerKm}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div 
                            className={`cursor-pointer ${statusUpdating[vehicle._id!] ? 'opacity-50' : ''}`}
                            onClick={(e) => handleToggleStatus(vehicle, e)}
                          >
                             <Badge 
                                variant={vehicle.isActive ? 'success' : 'default'} 
                                dot
                                className="cursor-pointer"
                             >
                                {statusUpdating[vehicle._id!] ? 'Updating...' : (vehicle.isActive ? 'Active' : 'Inactive')}
                             </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleEdit(vehicle); }}
                                leftIcon={<Edit size={16} />}
                                className="text-indigo-600 hover:text-indigo-900"
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDelete(vehicle._id!, e)}
                                leftIcon={<Trash2 size={16} />}
                                className="text-red-600 hover:text-red-900"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default VehicleList; 