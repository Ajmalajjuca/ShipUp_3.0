import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vehicleService } from '../../services/vehicle.service';
import type { VehicleType } from '../../types/vehicle.types';

export interface VehiclesState {
    vehicles: VehicleType[];
    selectedVehicle: VehicleType | null;
    loading: boolean;
    error: string | null;
}

const initialState: VehiclesState = {
    vehicles: [],
    selectedVehicle: null,
    loading: false,
    error: null,
};

// Async thunks
export const fetchVehicles = createAsyncThunk(
    'vehicles/fetchVehicles',
    async (_, { rejectWithValue }) => {
        try {
            const response = await vehicleService.getVehicles();
            return response.vehicles || [];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicles');
        }
    }
);

export const fetchVehicleById = createAsyncThunk(
    'vehicles/fetchVehicleById',
    async (vehicleId: string, { rejectWithValue }) => {
        try {
            const response = await vehicleService.getVehicleById(vehicleId);
            return response.vehicle;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicle');
        }
    }
);

export const addVehicle = createAsyncThunk(
    'vehicles/addVehicle',
    async (data: Partial<VehicleType>, { rejectWithValue }) => {
        try {
            const response = await vehicleService.createVehicle(data as any);
            return response.vehicle;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add vehicle');
        }
    }
);

export const updateVehicle = createAsyncThunk(
    'vehicles/updateVehicle',
    async ({ vehicleId, data }: { vehicleId: string; data: Partial<VehicleType> }, { rejectWithValue }) => {
        try {
            const response = await vehicleService.updateVehicle(vehicleId, data as any);
            return response.vehicle;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update vehicle');
        }
    }
);

export const deleteVehicle = createAsyncThunk(
    'vehicles/deleteVehicle',
    async (vehicleId: string, { rejectWithValue }) => {
        try {
            await vehicleService.deleteVehicle(vehicleId);
            return vehicleId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete vehicle');
        }
    }
);

const vehiclesSlice = createSlice({
    name: 'vehicles',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedVehicle: (state) => {
            state.selectedVehicle = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Vehicles
        builder
            .addCase(fetchVehicles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVehicles.fulfilled, (state, action) => {
                state.loading = false;
                state.vehicles = action.payload;
            })
            .addCase(fetchVehicles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch Vehicle By ID
        builder
            .addCase(fetchVehicleById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVehicleById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedVehicle = action.payload || null;
            })
            .addCase(fetchVehicleById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Add Vehicle
        builder
            .addCase(addVehicle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addVehicle.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.vehicles.push(action.payload);
                }
            })
            .addCase(addVehicle.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Update Vehicle
        builder
            .addCase(updateVehicle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateVehicle.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    const index = state.vehicles.findIndex((v) => v._id === action.payload?._id);
                    if (index !== -1) {
                        state.vehicles[index] = action.payload;
                    }
                    if (state.selectedVehicle?._id === action.payload._id) {
                        state.selectedVehicle = action.payload;
                    }
                }
            })
            .addCase(updateVehicle.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Delete Vehicle
        builder
            .addCase(deleteVehicle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteVehicle.fulfilled, (state, action) => {
                state.loading = false;
                state.vehicles = state.vehicles.filter((v) => v._id !== action.payload);
                if (state.selectedVehicle?._id === action.payload) {
                    state.selectedVehicle = null;
                }
            })
            .addCase(deleteVehicle.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearSelectedVehicle } = vehiclesSlice.actions;
export default vehiclesSlice.reducer;
