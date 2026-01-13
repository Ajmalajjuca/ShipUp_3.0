import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { adminService } from '../../services/admin';

export interface Order {
    id: string;
    userId: string;
    partnerId?: string;
    vehicleId?: string;
    pickupLocation: string;
    deliveryLocation: string;
    status: 'pending' | 'confirmed' | 'processing' | 'out-for-delivery' | 'delivered' | 'cancelled' | 'returned' | 'failed';
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
}

export interface OrderStats {
    pending: number;
    confirmed: number;
    processing: number;
    outForDelivery: number;
    delivered: number;
    cancelled: number;
    returned: number;
    failed: number;
}

export interface OrderFilters {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
}

export interface OrdersState {
    orders: Order[];
    selectedOrder: Order | null;
    stats: OrderStats | null;
    loading: boolean;
    error: string | null;
    filters: OrderFilters;
}

const initialState: OrdersState = {
    orders: [],
    selectedOrder: null,
    stats: null,
    loading: false,
    error: null,
    filters: {},
};

// Async thunks
export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async (_filters: OrderFilters = {}, { rejectWithValue }) => {
        try {
            const response = await adminService.getAllOrders();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
        }
    }
);

export const fetchOrderById = createAsyncThunk(
    'orders/fetchOrderById',
    async (orderId: string, { rejectWithValue }) => {
        try {
            const response = await adminService.getOrderById(orderId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
        }
    }
);

export const fetchOrderStats = createAsyncThunk(
    'orders/fetchOrderStats',
    async (_, { rejectWithValue }) => {
        try {
            // Note: getOrderStats method needs to be added to adminService
            // For now, return mock stats
            return {
                pending: 0,
                confirmed: 0,
                processing: 0,
                outForDelivery: 0,
                delivered: 0,
                cancelled: 0,
                returned: 0,
                failed: 0,
            };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch order stats');
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    'orders/updateOrderStatus',
    async ({ orderId, status }: { orderId: string; status: Order['status'] }, { rejectWithValue }) => {
        try {
            const response = await adminService.updateOrder(orderId, { status });
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
        }
    }
);

const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedOrder: (state) => {
            state.selectedOrder = null;
        },
        setFilters: (state, action: PayloadAction<OrderFilters>) => {
            state.filters = action.payload;
        },
        clearFilters: (state) => {
            state.filters = {};
        },
    },
    extraReducers: (builder) => {
        // Fetch Orders
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch Order By ID
        builder
            .addCase(fetchOrderById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedOrder = action.payload;
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch Order Stats
        builder
            .addCase(fetchOrderStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchOrderStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Update Order Status
        builder
            .addCase(updateOrderStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.orders.findIndex((o) => o.id === action.payload.id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
                if (state.selectedOrder?.id === action.payload.id) {
                    state.selectedOrder = action.payload;
                }
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearSelectedOrder, setFilters, clearFilters } = ordersSlice.actions;
export default ordersSlice.reducer;
