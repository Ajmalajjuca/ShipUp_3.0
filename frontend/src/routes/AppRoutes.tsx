import React, { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

// Lazy imports
const Homepage = lazy(() => import("../pages/user/Homepage"));
const SignInPage = lazy(() => import("../pages/auth/SignIn"));
const SignUpPage = lazy(() => import("../pages/auth/SignUp"));
const PasswordResetPage = lazy(() => import("../pages/auth/PasswordReset"));
const OTPVerificationPage = lazy(() => import("../pages/auth/OTPVerification"));

const Profile = lazy(() => import("../pages/user/Profile/Profile"));
const OrderBooking = lazy(() => import("../pages/user/book/OrderBooking"));

const PartnerRegistration = lazy(() => import("../pages/deliveryPartner/Registration/PartnerRegistration"));
const PartnerLogin = lazy(() => import("../pages/deliveryPartner/Registration/PartnerLogin"));
const PartnerVerificationPage = lazy(() => import("../pages/deliveryPartner/Registration/PartnerVerificationPage"));

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
        <Route path="/login" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/reset-password" element={<PasswordResetPage />} />
        <Route path="/otp-verification" element={<OTPVerificationPage />} />

        {/* User Profile + Address */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<Profile />} />
        <Route path="/address" element={<Profile />} />
        <Route path="/address/add" element={<Profile />} />
        <Route path="/address/edit/:addressId" element={<Profile />} />

        {/* Booking */}
        <Route path="/book" element={<OrderBooking />} />

        {/* Partner */}
        <Route path="/partner/register" element={<PartnerRegistration />} />
        <Route path="/partner/verification" element={<PartnerVerificationPage />} />
        <Route path="/partner/login" element={<PartnerLogin />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
