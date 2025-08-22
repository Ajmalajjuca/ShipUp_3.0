import { jwtDecode } from 'jwt-decode';
import type { ApiResponse, DriverRegistrationData, PartnerUser } from '../types'; // Add this type to your types file
import api from './api';
import { UploadService, type UploadProgress } from './uploadService';



class DeliveryPartnerAuthService {
  private readonly TOKEN_KEY = 'partnerAuthToken';
  private readonly REFRESH_TOKEN_KEY = 'partnerRefreshToken';

  async requestLoginOtp(email: string): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{
      message: string;
    }>>('/partner/request-login-otp', { email });
    console.log('OTP request response:', response);
    
    return response.data.data;
  }

  async verifyLoginOtp(email: string, otp: string): Promise<{
    user: PartnerUser;
    accessToken: string;
    refreshToken: string;
  }> {
    const response = await api.post<ApiResponse<{
      user: PartnerUser;
      accessToken: string;
      refreshToken: string;
    }>>('/partner/verify-login-otp', { email, otp });
    console.log('OTP verification response:', response);
    
    const { user, accessToken, refreshToken } = response.data.data;
    this.setRefreshToken(refreshToken);
    this.setTokens(accessToken);
    return { user, accessToken, refreshToken };
  }

  async register(
    registrationData: DriverRegistrationData,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{
    user: PartnerUser;
    message: string;
  }> {
    // Create FormData to handle file uploads
    const formData = new FormData();
    
 formData.append('fullName', registrationData.fullName || '');
  formData.append('email', registrationData.email || '');
  formData.append('phone', registrationData.phone || '');
  formData.append('dateOfBirth', registrationData.dateOfBirth || '');
  
  // Add banking details (nested structure)
  formData.append('bankingDetails[accountHolderName]', registrationData.accountHolderName || '');
  formData.append('bankingDetails[accountNumber]', registrationData.accountNumber || '');
  formData.append('bankingDetails[ifscCode]', registrationData.ifscCode || '');
  formData.append('bankingDetails[upiId]', registrationData.upiId || '');
  
  // Add vehicle documents (nested structure)
  formData.append('vehicalDocuments[registrationNumber]', registrationData.registrationNumber || '');
  formData.append('vehicalDocuments[vehicleType]', registrationData.vehicleType || '');
  
  
  // Add files (same as before)
  const fileFields = [
    'profilePicture', 'aadharFront', 'aadharBack', 'panFront', 'panBack',
    'licenseFront', 'licenseBack', 'insuranceDocument', 'pollutionDocument'
  ];
  
  fileFields.forEach(field => {
    const file = registrationData[field as keyof DriverRegistrationData] as File;
    if (file) {
      formData.append(field, file);
    }
  });

  console.log('Starting registration upload...');
    
    const result = await UploadService.uploadWithProgress<ApiResponse<{
      user: PartnerUser;
      accessToken: string;
      refreshToken: string;
      message: string;
    }>>(
      '/partner/register',
      formData,
      onProgress,
      180000 // 3 minutes timeout
    );
    console.log('Registration response:', result);
        const { user, message, accessToken, refreshToken } = result.data
        this.setTokens(accessToken);
        this.setRefreshToken(refreshToken);


    
    return { user, message };
  }

  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      try {
        const response = await api.post('/partner/logout', { refreshToken });
        return response.data;
      } catch (error) {
        console.error('Partner logout API call failed:', error);
      }
    }
    this.clearTokens();
  }

  async getCurrentPartner(): Promise<PartnerUser | null> {
    const token = this.getAccessToken();
    if (!token || this.isTokenExpired(token)) {
      return null;
    }

    try {
      const response = await api.get<ApiResponse<PartnerUser>>('/partner/me');
      return response.data.data;
    } catch (error) {
      this.clearTokens();
      return null;
    }
  }

  async getVerificationStatus(): Promise<{
    isVerified: boolean;
    verificationStatus: {
      personalInformation: boolean;
  personalDocuments: boolean;
  vehicalDocuments: boolean;
  bankingDetails: boolean;
    };
  } | null> {
    const token = this.getAccessToken();
    if (!token || this.isTokenExpired(token)) {
      return null;
    }

    try {
      const response = await api.get<ApiResponse<{
        isVerified: boolean;
        verificationStatus: {
          personalInformation: boolean;
  personalDocuments: boolean;
  vehicalDocuments: boolean;
  bankingDetails: boolean;
        };
      }>>('/partner/verification-status');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get verification status:', error);
      return null;
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    try {
      const response = await api.post<ApiResponse<{
        accessToken: string;
      }>>('/partner/refresh-token');
      console.log('Partner token refresh response:', response);
      
      const { accessToken } = response.data.data;
      this.setTokens(accessToken);
      return accessToken;
    } catch (error) {
      this.clearTokens();
      return null;
    }
  }

  private setTokens(accessToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
  }

  private setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // Session manager compatibility methods
  getDriverSession() {
    const token = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    return { 
      token, 
      refreshToken,
      // Add other session data if needed
    };
  }

  setDriverSession(token: string, userData: any) {
    this.setTokens(token);
    if (userData.refreshToken) {
      this.setRefreshToken(userData.refreshToken);
    }
  }

  clearDriverSession() {
    this.clearTokens();
  }
}

export const deliveryPartnerAuthService = new DeliveryPartnerAuthService();