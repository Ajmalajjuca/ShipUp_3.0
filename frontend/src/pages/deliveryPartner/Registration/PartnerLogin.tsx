import { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom'
import Layout from "../Layout";
import { deliveryPartnerAuthService } from "../../../services/deliveryPartnerAuth";


const PartnerLogin: React.FC = () => {
  // State management
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate()

  const dispatch = useDispatch()



  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate email
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      setIsSubmitting(false);
      return;
    }
    try {
      const response = await deliveryPartnerAuthService.requestLoginOtp(email);
      setMessage(response.message)
      setStep("otp");
      setIsSubmitting(false);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      setErrors(prev => ({ ...prev, email: (error as any).response?.data.message }));
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate OTP
    if (!otp) {
      setErrors(prev => ({ ...prev, otp: 'OTP is required' }));
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await deliveryPartnerAuthService.verifyLoginOtp(email, otp);
      navigate('/partner/verification', {replace: true, state: { email: response.user.email }})
      setIsSubmitting(false);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      setErrors(prev => ({ ...prev, otp: (error as any).response?.data.message }));
    }
  };


  // Request new OTP


  // Render email step
  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Partner Login</h2>
        <p className="text-gray-600">Enter your registered email to receive an OTP</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-600 mb-1">Email Address</label>
        <input
          type="email"
          name="email"
          placeholder="e.g. partner@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full px-4 py-3 text-sm rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'
            } focus:border-red-400 focus:ring-1 focus:ring-red-200 outline-none transition-all`}
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-xs text-red-500 mt-1">{errors.email}</p>
        )}
      </div>

      <button
        type="submit"
        className={`w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Sending OTP...' : 'Next'}
      </button>

      {/* Register Link */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Don't have a partner account?
          <a onClick={() => navigate('/partner/register')} className="text-red-500 hover:underline ml-1 cursor-pointer">
            Register here
          </a>
        </p>
      </div>
    </form>
  );

  // Render OTP step
  const renderOtpStep = () => (
    <form onSubmit={handleOtpSubmit}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">Enter the 6-digit code sent to {email}</p>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
          {message}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm text-gray-600 mb-1">OTP Code</label>
        <input
          type="text"
          name="otp"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
          className={`w-full px-4 py-3 text-sm rounded-lg border ${errors.otp ? 'border-red-500' : 'border-gray-300'
            } focus:border-red-400 focus:ring-1 focus:ring-red-200 outline-none transition-all`}
          disabled={isSubmitting}
          maxLength={6}
        />
        {errors.otp && (
          <p className="text-xs text-red-500 mt-1">{errors.otp}</p>
        )}
      </div>

      <button
        type="submit"
        className={`w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Verifying...' : 'Verify & Login'}
      </button>

      <div className="mt-4 flex justify-between items-center">
        <button
          type="button"
          className="text-sm text-red-500 hover:text-red-700"
          onClick={() => setStep("email")}
          disabled={isSubmitting}
        >
          Back to Email
        </button>

        <button
          type="button"
          className="text-sm text-blue-500 hover:text-blue-700"
          // onClick={handleResendOtp}
          disabled={isSubmitting}
        >
          Resend OTP
        </button>
      </div>
    </form>
  );

  // Render success step
  const renderSuccessStep = () => (
    <div className="text-center">
      <div className="mb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Login Successful!</h2>
      <p className="text-gray-600 mb-4">Redirecting to your dashboard...</p>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-red-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );

  return (
   
      <Layout>
        <div className="bg-white p-8 flex items-center justify-center overflow-y-auto max-h-[90vh] lg:max-h-[90vh]">
          <div className="w-full max-w-md">
            {step === "email" && renderEmailStep()}
            {step === "otp" && renderOtpStep()}
            {step === "success" && renderSuccessStep()}
          </div>
        </div>
      </Layout>
    
  );
};

export default PartnerLogin;
