import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../../store/slices/authSlice";
import type { RootState } from "../../store";
import { toast } from "react-hot-toast";
import AuthLayout from "../../components/user/layout/AuthLayout";
import { registerSchema, sanitizeInput,  } from "../../utils/validation";
import {
  UserRole,
  type RegisterCredentials,
  type SignUpFormErrors,
} from "../../types";
import { authService } from "../../services/auth";
import { z, ZodError } from 'zod';
import { extractZodErrors } from "../../utils/zodUtils";

const SignUpPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterCredentials>({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<SignUpFormErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error } = useSelector((state: RootState) => state.auth);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (errors[name as keyof SignUpFormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      dispatch(loginStart());

      const validationResult = registerSchema.safeParse(formData);

      if (!validationResult.success) {
      setErrors(extractZodErrors<RegisterCredentials>(validationResult.error));
      toast.error("Please fix the errors below");
      setLoading(false);
      return;
}

    const validatedData = validationResult.data;
    const sanitizedData = Object.keys(validatedData).reduce((acc, key) => {
      const value = (validatedData as any)[key];
      (acc as any)[key] = typeof value === 'string' ? sanitizeInput(value) : value;
      return acc;
    }, {} as typeof validatedData);

      // Prepare data to send (excluding confirmPassword)
      const { confirmPassword, ...requestData } = sanitizedData;
      const dataToSend = { ...requestData, role: UserRole.CUSTOMER };

      const response = await authService.register(dataToSend);
      console.log("Registration response:", response);

      dispatch(loginSuccess({ user: response }));

      toast.success("Registration successful! Please verify your email.");
      navigate("/otp-verification", { state: { email: formData.email } });
    } catch (error: any) {
    console.log("Registration error:", error);
    
    const errorMessage = error.response?.data?.message || "Registration failed";
    dispatch(loginFailure(errorMessage));
    toast.error(errorMessage);
  } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google sign up was unsuccessful");
    dispatch(loginFailure("Google sign up failed"));
  };

  const getInputClassName = (fieldName: keyof RegisterCredentials) => {
    return `w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 transition-all ${
      errors[fieldName]
        ? "border-2 border-red-500 focus:ring-red-500"
        : "focus:ring-indigo-500"
    }`;
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
          Create an Account
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              className={getInputClassName("fullName")}
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleInputChange}
              autoComplete="name"
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              className={getInputClassName("phone")}
              placeholder="+91 1234567890"
              value={formData.phone}
              onChange={handleInputChange}
              autoComplete="tel"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              className={getInputClassName("email")}
              placeholder="example.email@gmail.com"
              value={formData.email}
              onChange={handleInputChange}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className={getInputClassName("password")}
                placeholder="Enter at least 8+ characters"
                value={formData.password}
                onChange={handleInputChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className={getInputClassName("confirmPassword")}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-900 text-white py-2 px-4 rounded-lg hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors font-medium text-lg ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* <div className="mb-4">
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                width="100%"
                text="signup_with"
                shape="rectangular"
              />
            </GoogleOAuthProvider>
          </div> */}
        </form>

        <div className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:underline font-medium"
          >
            Sign in!
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignUpPage;
