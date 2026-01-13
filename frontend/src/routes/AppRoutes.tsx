import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

// Lazy imports
const Homepage = lazy(() => import("../pages/admin/Homepage"));
const AdminLoginPage = lazy(() => import("../pages/admin/AdminLoginPage"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
// Fallback UI while components load
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Fallback Route */}
        <Route path="*" element={<>Not Found</>} />

        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard/>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
