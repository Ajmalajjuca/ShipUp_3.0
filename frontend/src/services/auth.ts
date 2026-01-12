import { jwtDecode } from 'jwt-decode';
import type { User, LoginCredentials, ApiResponse, RegisterCredentials } from '../types';
import api from './api';

class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';

  async login(credentials: LoginCredentials): Promise<User> {
    const response = await api.post<ApiResponse<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>>('/auth/login', credentials);
    console.log('response in auth', response);
    

    const { user, accessToken, refreshToken } = response.data.data;
    this.setRefreshToken(refreshToken);
    this.setTokens(accessToken);
    return user;
  }

  async adminLoginService(email: string, password: string): Promise<User> {
    const response = await api.post<ApiResponse<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>>('/admin/login', { email, password });
    console.log('Admin login response:', response);
    
    const { user, accessToken, refreshToken } = response.data.data;
    this.setRefreshToken(refreshToken);
    this.setTokens(accessToken);
    return user;
  }

  async register(userData: RegisterCredentials): Promise<User> {
    const response = await api.post<ApiResponse<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>>('/auth/register', userData);
    console.log('rwsiatration ',response);
    

    const { user, accessToken, refreshToken } = response.data.data;
    this.setRefreshToken(refreshToken);
    this.setTokens(accessToken);
    return user;
  }

  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      try {
        const response = await api.post('/auth/logout', { refreshToken });
        return response.data;
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }
    this.clearTokens();
  }

  async verifyOtp(data: { code: string; type: string; newPassword?: string }): Promise<{ massege: string; }> {
    const response = await api.post<ApiResponse<{
      massege: string;
    }>>('/auth/verify-otp', data);
    console.log('OTP verification response:', response);
    return response.data.data;
  }

  async resendOtp(type: string): Promise<{ massage: string; }> {
    const response = await api.post<ApiResponse<{ massage: string; }>>('/auth/resend-otp', { type });
    console.log('Resend OTP response:', response);
    return response.data.data;
  }

  async getCurrentUser(): Promise<User | null> {
    const token = this.getAccessToken();
    if (!token || this.isTokenExpired(token)) {
      return null;
    }

    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      return response.data.data;
    } catch (error) {
      console.log('Failed to fetch current user:', error);
      
      this.clearTokens();
      return null;
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    
    try {
      const response = await api.post<ApiResponse<{
        accessToken: string;
      }>>('/auth/refresh-token');
      console.log('Token refresh response:', response);
      const { accessToken} = response.data.data;
      this.setTokens(accessToken);
      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
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
}

export const authService = new AuthService();