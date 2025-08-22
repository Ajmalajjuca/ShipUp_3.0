import type { Address, AddressResponse, ApiResponse, User } from "../types";
import api from "./api";

class UserService {
  async editProfile(data: any): Promise<ApiResponse<any>>{
    const response = await api.put(`/users/profile`, data,{
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }
  addAddress = async (addressData: any): Promise<ApiResponse<any>> => {
    console.log("Adding address with data:", addressData);
    
    const response = await api.post('/users/addresses', addressData);
    return response.data;
  }
  getAddresses = async (): Promise<ApiResponse<AddressResponse>> => {
    const response = await api.get('/users/addresses');    
    return response.data;
  }
  getAddress = async (addressId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/users/addresses/${addressId}`);    
    return response.data;
  }
  updateAddress = async (addressId: string, addressData: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/users/addresses/${addressId}`, addressData);    
    return response.data;
  }
  deleteAddress = async (addressId: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/users/addresses/${addressId}`);    
    return response.data;
  }
  setDefaultAddress = async (addressId: string): Promise<ApiResponse<any>> => {
    const response = await api.put(`/users/addresses/${addressId}/set-default`);    
    return response.data;
  }
}

export const userService = new UserService();