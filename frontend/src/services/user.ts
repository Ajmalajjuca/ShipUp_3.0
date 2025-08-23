import type { Address, AddressResponse, ApiResponse, User } from "../types";
import api from "./api";

class UserService {
  async editProfile(data: Partial<unknown>): Promise<ApiResponse<User>>{
    const response = await api.put(`/users/profile`, data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  }
  addAddress = async (addressData: Address): Promise<ApiResponse<Address>> => {
    console.log("Adding address with data:", addressData);
    
    const response = await api.post('/users/addresses', addressData);
    return response.data;
  }
  getAddresses = async (): Promise<ApiResponse<AddressResponse>> => {
    const response = await api.get('/users/addresses');    
    return response.data;
  }
  getAddress = async (addressId: string): Promise<ApiResponse<AddressResponse>> => {
    const response = await api.get(`/users/addresses/${addressId}`);    
    return response.data;
  }
  updateAddress = async (addressId: string, addressData: Address): Promise<ApiResponse<AddressResponse>> => {
    const response = await api.put(`/users/addresses/${addressId}`, addressData);    
    return response.data;
  }
  deleteAddress = async (addressId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/users/addresses/${addressId}`);    
    return response.data;
  }
  setDefaultAddress = async (addressId: string): Promise<ApiResponse<Address>> => {
    const response = await api.put(`/users/addresses/${addressId}/set-default`);    
    return response.data;
  }
}

export const userService = new UserService();