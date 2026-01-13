import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import AdminRoutes from "./AdminRoutes";

// Lazy imports
const Homepage = lazy(() => import("../pages/admin/Homepage"));
const AdminLoginPage = lazy(() => import("../pages/admin/AdminLoginPage"));

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
        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        
        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        {/* Admin Dashboard with nested routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Fallback Route */}
        <Route path="*" element={<>Not Found</>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
