import React, { useState } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, } from "react-redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../../store/slices/authSlice";
import AuthLayout from "../../components/user/layout/AuthLayout";
import { toast } from "react-hot-toast";
import type { ErrorResponse, LoginCredentials, SignInFormErrors } from "../../types";
import { loginSchema, sanitizeInput, } from "../../utils/validation";
import { extractZodErrors } from "../../utils/zodUtils";
import { authService } from "../../services/auth";



const SignInPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<SignInFormErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (errors[name as keyof SignInFormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // Validate and sanitize using zod schema
      setLoading(true);
      dispatch(loginStart());

      const validationResult = loginSchema.safeParse(formData);
      console.log("Validation result:", validationResult);

      if (!validationResult.success) {
        setErrors(extractZodErrors(validationResult.error));
        toast.error("Please fix the errors below");
        setLoading(false);
        return;
      }

      const validatedData = validationResult.data;
      const sanitizedData = Object.keys(validatedData).reduce((acc, key) => {
        const value = validatedData[key as keyof LoginCredentials];
        acc[key as keyof LoginCredentials] = typeof value === 'string' ? sanitizeInput(value) : value;
        return acc;
      }, {} as LoginCredentials);


      // Uncomment when authService is available
      const response = await authService.login(sanitizedData);
      console.log("Login response:", response);
      dispatch(loginSuccess({ user: response }));
      toast.success("Successfully signed in!");
      navigate("/");
    } catch (error) {
      console.error("Sign in error:", error);
      const errorMessage = (error as ErrorResponse).response?.data?.message || "Sign in failed";
      dispatch(loginFailure(errorMessage));
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };



  const getInputClassName = (fieldName: keyof SignInFormErrors) => {
    return `w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 transition-all ${errors[fieldName]
        ? "border-2 border-red-500 focus:ring-red-500"
        : "focus:ring-indigo-500"
      }`;
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
          Sign In
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
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
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className={getInputClassName("password")}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                autoComplete="current-password"
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

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/reset-password")}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-900 text-white py-2 px-4 rounded-lg hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors font-medium text-lg ${loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {loading ? "Signing in..." : "Sign In"}
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
                text="signin_with"
                shape="rectangular"
              />
            </GoogleOAuthProvider>
          </div> */}
        </form>

        <div className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-blue-600 hover:underline font-medium"
          >
            Sign up!
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignInPage;
