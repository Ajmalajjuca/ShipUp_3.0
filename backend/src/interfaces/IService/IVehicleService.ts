export interface IVehicleService {
    getVehicleById(id: string): Promise<any>;
    getVehicles({ page, limit, status, search, sort }: any, filter?: any): Promise<{ vehicles: any[], total: number }>;
    createVehicle(data: any): Promise<any>;
    updateVehicle(id: string, data: any): Promise<any>;
    deleteVehicle(id: string): Promise<any>;
    toggleVehicleStatus(id: string): Promise<any>;
}