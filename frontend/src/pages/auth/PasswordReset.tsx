import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/user/layout/AuthLayout';
import { passwordResetSchema } from '../../utils/validation';
import type { PasswordResetCredentials, PasswordResetFormErrors } from '../../types';
// import { authService } from '../../../services/auth.service';





const PasswordResetPage: React.FC = () => {
  const [formData, setFormData] = useState<PasswordResetCredentials>({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<PasswordResetFormErrors>({});
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name as keyof PasswordResetFormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate and sanitize using zod schema
      // const validatedData = validateAndSanitize(formData, passwordResetSchema);
      
      setIsLoading(true);
      
      // Uncomment when authService is available
      // const response = await authService.forgotPassword(validatedData.email);
      
      // if (response.success) {
      //   toast.success('OTP sent successfully!');
      //   navigate('/otp-verification', { 
      //     state: { 
      //       email: validatedData.email,
      //       newPassword: validatedData.newPassword,
      //       isPasswordReset: true 
      //     } 
      //   });
      // }
      
      toast.success('OTP sent successfully!');
      // navigate('/otp-verification', { 
      //   state: { 
      //     email: validatedData.email,
      //     newPassword: validatedData.newPassword,
      //     isPasswordReset: true 
      //   } 
      // });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const newErrors: PasswordResetFormErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof PasswordResetFormErrors] = err.message;
          }
        });
        setErrors(newErrors);
        toast.error('Please fix the errors below');
      } else {
        console.error('Reset Error:', error);
        toast.error(error.response?.data?.message || 'Something went wrong!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClassName = (fieldName: keyof PasswordResetCredentials) => {
    return `w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 ${
      errors[fieldName] 
        ? 'border-2 border-red-500 focus:ring-red-500' 
        : 'focus:ring-indigo-500'
    }`;
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-4">Reset Password</h2>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              className={getInputClassName('email')}
              placeholder="example.email@gmail.com"
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                className={getInputClassName('newPassword')}
                placeholder="Enter at least 8+ characters"
                value={formData.newPassword}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                className={getInputClassName('confirmPassword')}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-indigo-900 text-white py-2 px-4 rounded-lg hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors font-medium text-lg ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending OTP...
              </div>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-gray-600">
          Back to{' '}
          <button 
            onClick={() => navigate('/login')} 
            className="text-blue-600 hover:underline font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default PasswordResetPage;