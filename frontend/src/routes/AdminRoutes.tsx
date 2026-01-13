import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout';

// Import page components
import DashboardHome from '../pages/admin/Dashboard';
import { UsersPage, UserDetailPage } from '../pages/admin/Users';
import { PartnersPage, PartnerRequestsPage, PartnerDetailPage } from '../pages/admin/Partners';
import { VehiclesPage } from '../pages/admin/Vehicles';
import { OrdersPage, PendingOrdersPage, CompletedOrdersPage } from '../pages/admin/Orders';
import AnalyticsPage from '../pages/admin/Analytics';
import SettingsPage from '../pages/admin/Settings';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        {/* Redirect /admin/dashboard to /admin/dashboard (index) */}
        <Route index element={<Navigate to="dashboard" replace />} />
        
        {/* Dashboard Home */}
        <Route path="dashboard" element={<DashboardHome />} />

        {/* Users Routes */}
        <Route path="dashboard/users" element={<UsersPage />} />
        <Route path="dashboard/users/:userId" element={<UserDetailPage />} />

        {/* Partners Routes */}
        <Route path="dashboard/partners" element={<PartnersPage />} />
        <Route path="dashboard/partners/requests" element={<PartnerRequestsPage />} />
        <Route path="dashboard/partners/:partnerId" element={<PartnerDetailPage />} />

        {/* Vehicles Routes */}
        <Route path="dashboard/vehicles" element={<VehiclesPage />} />

        {/* Orders Routes */}
        <Route path="dashboard/orders" element={<OrdersPage />} />
        <Route path="dashboard/orders/pending" element={<PendingOrdersPage />} />
        <Route path="dashboard/orders/completed" element={<CompletedOrdersPage />} />

        {/* Analytics */}
        <Route path="dashboard/analytics" element={<AnalyticsPage />} />

        {/* Route Management - Placeholder */}
        <Route
          path="dashboard/route-management"
          element={
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Route Management</h2>
              <p className="text-gray-600">Route management features will be displayed here</p>
            </div>
          }
        />

        {/* Settings */}
        <Route path="dashboard/settings" element={<SettingsPage />} />

        {/* Security - Placeholder */}
        <Route
          path="dashboard/security"
          element={
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Security</h2>
              <p className="text-gray-600">Security settings will be displayed here</p>
            </div>
          }
        />

        {/* Help & Support - Placeholder */}
        <Route
          path="dashboard/help"
          element={
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Help & Support</h2>
              <p className="text-gray-600">Help and support resources will be displayed here</p>
            </div>
          }
        />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
