import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { deliveryPartnerAuthService } from "../../../services/deliveryPartnerAuth";
import Layout from "../Layout";

// Types
interface VerificationData {
  personalInformation: boolean;
  personalDocuments: boolean;
  vehicalDocuments: boolean;
  bankingDetails: boolean;
}



// Verification Status Component
const VerificationStatus: React.FC<{
  onLogout: () => void;
  onContactSupport: () => void;
  userEmail?: string;
}> = ({ onLogout, onContactSupport, userEmail }) => {
  const [verificationData, setVerificationData] = useState<VerificationData>({
    personalInformation: false, // Personal info is usually auto-approved
    personalDocuments: false,
    vehicalDocuments: false,
    bankingDetails: false,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
    const navigate = useNavigate();


  const documentSteps = [
    { id: "personalInformation", title: "Personal Information", icon: "👤" },
    { id: "personalDocuments", title: "Personal Documents", icon: "🆔" },
    { id: "vehicalDocuments", title: "Vehical Documents", icon: "🚚" },
    { id: "bankingDetails", title: "Banking Details", icon: "🏦" },
  ];

  
  // Simulate fetching verification status
  useEffect(() => {
    
    fetchVerificationStatus();
  }, []);
  const fetchVerificationStatus = async () => {

    const response = await deliveryPartnerAuthService.getVerificationStatus();
    console.log("Verification Status:", response);

    if (response) {
      setVerificationData(response.verificationStatus);
    }

  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      // Fetch updated verification status
      fetchVerificationStatus();
      setIsRefreshing(false);
    }, 2000);
  };

  const getStatusColor = (status: boolean) => {
    return status ? "text-green-600" : "text-yellow-600";
  };

  const getStatusText = (status: boolean) => {
    return status ? "Approved" : "Verification Pending";
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <svg
        className="w-5 h-5 text-green-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ) : (
      <svg
        className="w-5 h-5 text-yellow-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  };

  const approvedCount = Object.values(verificationData).filter(Boolean).length;
  const totalCount = Object.keys(verificationData).length;
  const isFullyVerified = approvedCount === totalCount;

  useEffect(() => {
  if (isFullyVerified) {
    const toastId = toast.loading("Redirecting to dashboard...");

    const timer = setTimeout(() => {
      toast.dismiss(toastId);

      navigate("/partner/dashboard", { replace: true });
    }, 2000);

    return () => {
      clearTimeout(timer);
      toast.dismiss(toastId); // Clean up toast if component unmounts
    };
  }
}, [isFullyVerified, navigate]);

  return (
    <div className="w-full max-w-md mx-auto p-4">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-3">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            Verification Status
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Logged in as: <span className="font-medium">{userEmail}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>
              {approvedCount}/{totalCount} Completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(approvedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Status Alert */}
      {!isFullyVerified ? (
        <div className="bg-yellow-50 border border-yellow-200 text-gray-800 p-2 rounded-lg mb-6">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-yellow-600 mr-2 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h3 className="font-semibold mb-1">
                Your application is under review
              </h3>
              <p className="text-sm text-gray-700">
                Our team will verify your documents within 48 hours. You'll
                receive an email notification once approved.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 text-gray-800 p-2 rounded-lg mb-6">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-green-600 mr-2 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold mb-1 text-green-800">
                Verification Complete!
              </h3>
              <p className="text-sm text-green-700">
                All your documents have been approved. You can now access your
                dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Document Status List */}
      <div className="space-y-3 mb-4">
        {documentSteps.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100"
          >
            <div className="flex items-center">
              <span className="text-lg mr-3">{doc.icon}</span>
              <span className="text-sm font-medium text-gray-800">
                {doc.title}
              </span>
            </div>
            <div className="flex items-center">
              {getStatusIcon(
                verificationData[doc.id as keyof VerificationData]
              )}
              <span
                className={`text-xs ml-2 font-medium ${getStatusColor(verificationData[doc.id as keyof VerificationData])}`}
              >
                {getStatusText(
                  verificationData[doc.id as keyof VerificationData]
                )}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="flex flex-col md:flex-row md:space-x-3 space-y-3 md:space-y-0 mb-4">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isRefreshing ? "Refreshing..." : "Refresh Status"}
        </button>

        <button
          onClick={onLogout}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          Sign Out
        </button>

        
     
      </div>

      {/* Contact Support */}
      <div className="text-center mb-2">
        <button
          onClick={onContactSupport}
          className="text-red-500 text-sm hover:underline"
        >
          Need Help? Contact Support
        </button>
      </div>

      {/* Action Buttons */}

      {/* Last Updated */}
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// Main Layout Component
const PartnerVerificationPage: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email;

  if(!email){
    return <Navigate to="/partner/register" />
  }

  const handleLogout = () => {
    // Clear session storage
    // sessionManager.clearDriverSession();
    toast.success("Logged out successfully");
    // In real app: navigate('/partner/login');
  };

  const handleContactSupport = () => {
    // Open support modal or navigate to support page
    toast.success("Contact support");
    // In real app: navigate('/partner/support');
  };

  return (
    

      <Layout>
        <div className="bg-white p-4 md:p-6 flex items-center justify-center">
          <VerificationStatus
            userEmail={email}
            onLogout={handleLogout}
            onContactSupport={handleContactSupport}
            />
        </div>
      </Layout>
      
  );
};

export default PartnerVerificationPage;
