import api from "./api";

class AdminService {
    // Add admin-specific methods here


    async getAllUsers(pagination?: { page: number; limit: number }, filter?: { role?: string; status?: string; search?: string }): Promise<any> {
        // Build query string
        const params = {
            page: pagination?.page || 1,
            limit: pagination?.limit || 10,
            ...filter
        };

        const response = await api.get('/admin/users', { params });
        return response.data;
    }

    async getUserById(userId: string): Promise<any> {
        const response = await api.get(`/admin/users/${userId}`);
        return response.data;
    }

    async updateUser(userId: string, userData: any): Promise<any> {
        const response = await api.put(`/admin/users/${userId}`, userData);
        return response.data;
    }

    async deleteUser(userId: string): Promise<any> {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    }

    async getAllPartners(): Promise<any> {
        const response = await api.get('/admin/partners');
        return response.data;
    }

    async getAllPartnersRequest(): Promise<any> {
        const response = await api.get('/admin/partners/requests');
        return response.data;
    }

    async getPartnerById(partnerId: string): Promise<any> {
        const response = await api.get(`/admin/partners/${partnerId}`);
        return response.data;
    }

    async updatePartner(partnerId: string, partnerData: any): Promise<any> {
        const response = await api.put(`/admin/partners/${partnerId}`, partnerData);
        return response.data;
    }

    async deletePartner(partnerId: string): Promise<any> {
        const response = await api.delete(`/admin/partners/${partnerId}`);
        return response.data;
    }

    async getAllOrders(): Promise<any> {
        const response = await api.get('/admin/orders');
        return response.data;
    }

    async getOrderById(orderId: string): Promise<any> {
        const response = await api.get(`/admin/orders/${orderId}`);
        return response.data;
    }

    async updateOrder(orderId: string, orderData: any): Promise<any> {
        const response = await api.put(`/admin/orders/${orderId}`, orderData);
        return response.data;
    }

    async deleteOrder(orderId: string): Promise<any> {
        const response = await api.delete(`/admin/orders/${orderId}`);
        return response.data;
    }

    async getAllVehicles(): Promise<any> {
        const response = await api.get('/admin/vehicles');
        return response.data;
    }

    async getVehicleById(vehicleId: string): Promise<any> {
        const response = await api.get(`/admin/vehicles/${vehicleId}`);
        return response.data;
    }

    async updateVehicle(vehicleId: string, vehicleData: any): Promise<any> {
        const response = await api.put(`/admin/vehicles/${vehicleId}`, vehicleData);
        return response.data;
    }

    async deleteVehicle(vehicleId: string): Promise<any> {
        const response = await api.delete(`/admin/vehicles/${vehicleId}`);
        return response.data;
    }
    async addVehicle(vehicleData: any): Promise<any> {
        const response = await api.post('/admin/vehicles', vehicleData);
        return response.data;
    }

    async verifyDocument(partnerId: string, field: string): Promise<any> {
        const response = await api.put(`/admin/partners/${partnerId}/verify/${field}`);
        return response.data;
    }

    async getPartnerOrders(partnerId: string): Promise<any> {
        const response = await api.get(`/admin/partners/${partnerId}/orders`);
        return response.data;
    }
}

export const adminService = new AdminService();