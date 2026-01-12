import React, { useState, useEffect } from 'react';
import { Search, Edit2, Eye, Trash2, X, Users, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { adminService } from '../../../../services/admin';
import type { User } from '../../../../types';





const UserList = ({ onViewUser = () => {} }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const pagination = { page: 1, limit: 10 };
      const filter = { role: 'customer', };

      const response = await adminService.getAllUsers(pagination, filter);      
      setUsers(response.data.users.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = (id, currentStatus) => {

    adminService.updateUser(id, { isActive: !currentStatus })
    setUsers(users.map(user =>
      user.id === id ? { ...user, isActive: !currentStatus } : user
    ));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };



  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOrders = users.reduce((sum, user) => sum + user.totalOrders, 0);
  const totalRevenue = users.reduce((sum, user) => sum + user.totalAmount, 0);
  const activeUsers = users.filter(u => u.isActive).length;

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
          <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="bg-gray-200 rounded-2xl p-4 w-16 h-16"></div>
      </div>
    </div>
  );

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="py-4 px-6">
        <div className="h-4 bg-gray-200 rounded w-8"></div>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-40"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="h-6 bg-gray-200 rounded-full w-12"></div>
      </td>
      <td className="py-4 px-6">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="py-4 px-6">
        <div className="h-7 bg-gray-200 rounded-full w-14"></div>
      </td>
      <td className="py-4 px-6">
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          .animate-scaleIn {
            animation: scaleIn 0.3s ease-out;
          }
          .animate-slideUp {
            animation: slideUp 0.5s ease-out;
          }
        `}</style>
        
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-10 bg-gray-300 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200 animate-pulse">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded-xl w-80"></div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left"><div className="h-3 bg-gray-300 rounded w-8"></div></th>
                  <th className="py-4 px-6 text-left"><div className="h-3 bg-gray-300 rounded w-20"></div></th>
                  <th className="py-4 px-6 text-left"><div className="h-3 bg-gray-300 rounded w-16"></div></th>
                  <th className="py-4 px-6 text-left"><div className="h-3 bg-gray-300 rounded w-16"></div></th>
                  <th className="py-4 px-6 text-left"><div className="h-3 bg-gray-300 rounded w-12"></div></th>
                  <th className="py-4 px-6 text-left"><div className="h-3 bg-gray-300 rounded w-16"></div></th>
                  <th className="py-4 px-6 text-left"><div className="h-3 bg-gray-300 rounded w-16"></div></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-8 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Users</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchUsers}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
      `}</style>
      
      {/* Header */}
      <div className="mb-8 animate-slideUp">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          User Management
        </h1>
        <p className="text-gray-600">Manage and monitor your customer base</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slideUp">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-800">{users.length}</p>
              <p className="text-green-600 text-sm mt-1 font-semibold">{activeUsers} Active</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4">
              <Users className="text-white" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-gray-800">{totalOrders || 0}</p>
              <p className="text-blue-600 text-sm mt-1 font-semibold">All time</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4">
              <TrendingUp className="text-white" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-800">₹{totalRevenue.toFixed(2) ||0}</p>
              <p className="text-emerald-600 text-sm mt-1 font-semibold">Lifetime value</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4">
              <DollarSign className="text-white" size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slideUp">
        {/* Header with Search */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Customer Directory
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {filteredUsers.length} {filteredUsers.length === 1 ? 'customer' : 'customers'} found
              </p>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-3 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 w-full md:w-80 transition-all"
              />
              <Search size={20} className="absolute top-3.5 left-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">#</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Orders</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Spent</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user, index) => (
                
                <tr key={user.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all cursor-pointer" onClick={() => onViewUser(user.id)}>
                  <td className="py-4 px-6">
                    <span className="text-gray-600 font-medium">{index + 1}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={user.profilePicture} 
                          alt={user.fullName} 
                          className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover"
                        />
                        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{user.fullName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-800">{user.email}</p>
                      <p className="text-sm text-gray-500">{user.phone}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                      {user.totalOrders || 0}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-emerald-600 font-bold">₹{user.totalAmount?.toFixed(2) || 0}</span>
                  </td>
                  <td className="py-4 px-6">
                    <label className="relative inline-flex items-center cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={user.isActive} 
                        onChange={() => handleStatusToggle(user.id, user.isActive)}
                        className="sr-only peer" 
                      />
                      <div className={`w-14 h-7 rounded-full transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-400 peer-checked:to-green-500 bg-gradient-to-r from-gray-300 to-gray-400 shadow-inner`}>
                        <div className={`absolute top-0.5 left-0.5 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${user.isActive ? 'translate-x-7' : 'translate-x-0'}`} />
                      </div>
                    </label>
                  </td>
                  <td className="py-4 px-6 ">
                    <div className="inline-flex items-center px-3 py-1">
                      
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:scale-110"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No customers found</p>
          </div>
        )}
      </div>

      
    </div>
  );
};

export default UserList;