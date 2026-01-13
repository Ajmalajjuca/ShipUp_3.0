import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from '../../services/admin';

export interface Partner {
    id: string;
    name: string;
    email: string;
    phone: string;
    vehicleType?: string;
    licenseNumber?: string;
    status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
    createdAt: string;
}

export interface PartnersState {
    partners: Partner[];
    requests: Partner[];
    selectedPartner: Partner | null;
    loading: boolean;
    error: string | null;
}

const initialState: PartnersState = {
    partners: [],
    requests: [],
    selectedPartner: null,
    loading: false,
    error: null,
};

// Async thunks
export const fetchPartners = createAsyncThunk(
    'partners/fetchPartners',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminService.getAllPartners();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch partners');
        }
    }
);

export const fetchPartnerRequests = createAsyncThunk(
    'partners/fetchPartnerRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminService.getAllPartnersRequest();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch partner requests');
        }
    }
);

export const fetchPartnerById = createAsyncThunk(
    'partners/fetchPartnerById',
    async (partnerId: string, { rejectWithValue }) => {
        try {
            const response = await adminService.getPartnerById(partnerId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch partner');
        }
    }
);

export const approvePartner = createAsyncThunk(
    'partners/approvePartner',
    async (partnerId: string, { rejectWithValue }) => {
        try {
            // Note: approvePartner method needs to be added to adminService
            const response = await adminService.updatePartner(partnerId, { status: 'approved' });
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to approve partner');
        }
    }
);

export const rejectPartner = createAsyncThunk(
    'partners/rejectPartner',
    async ({ partnerId, reason }: { partnerId: string; reason?: string }, { rejectWithValue }) => {
        try {
            // Note: rejectPartner method needs to be added to adminService
            const response = await adminService.updatePartner(partnerId, { status: 'rejected', rejectionReason: reason });
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to reject partner');
        }
    }
);

export const updatePartner = createAsyncThunk(
    'partners/updatePartner',
    async ({ partnerId, data }: { partnerId: string; data: Partial<Partner> }, { rejectWithValue }) => {
        try {
            const response = await adminService.updatePartner(partnerId, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update partner');
        }
    }
);

const partnersSlice = createSlice({
    name: 'partners',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedPartner: (state) => {
            state.selectedPartner = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Partners
        builder
            .addCase(fetchPartners.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPartners.fulfilled, (state, action) => {
                state.loading = false;
                state.partners = action.payload;
            })
            .addCase(fetchPartners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch Partner Requests
        builder
            .addCase(fetchPartnerRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPartnerRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.requests = action.payload;
            })
            .addCase(fetchPartnerRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch Partner By ID
        builder
            .addCase(fetchPartnerById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPartnerById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedPartner = action.payload;
            })
            .addCase(fetchPartnerById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Approve Partner
        builder
            .addCase(approvePartner.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approvePartner.fulfilled, (state, action) => {
                state.loading = false;
                // Remove from requests and add to partners
                state.requests = state.requests.filter((p) => p.id !== action.payload.id);
                state.partners.push(action.payload);
            })
            .addCase(approvePartner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Reject Partner
        builder
            .addCase(rejectPartner.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectPartner.fulfilled, (state, action) => {
                state.loading = false;
                state.requests = state.requests.filter((p) => p.id !== action.payload.id);
            })
            .addCase(rejectPartner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Update Partner
        builder
            .addCase(updatePartner.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePartner.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.partners.findIndex((p) => p.id === action.payload.id);
                if (index !== -1) {
                    state.partners[index] = action.payload;
                }
                if (state.selectedPartner?.id === action.payload.id) {
                    state.selectedPartner = action.payload;
                }
            })
            .addCase(updatePartner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearSelectedPartner } = partnersSlice.actions;
export default partnersSlice.reducer;
