export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        VERIFY: '/api/auth/verify',
    },

    // Users
    USERS: {
        LIST: '/api/users',
        BY_ID: (id: string) => `/api/users/${id}`,
        UPDATE: (id: string) => `/api/users/${id}`,
        DELETE: (id: string) => `/api/users/${id}`,
    },

    // Partners
    PARTNERS: {
        LIST: '/api/partners',
        REQUESTS: '/api/partners/requests',
        BY_ID: (id: string) => `/api/partners/${id}`,
        APPROVE: (id: string) => `/api/partners/${id}/approve`,
        REJECT: (id: string) => `/api/partners/${id}/reject`,
        UPDATE: (id: string) => `/api/partners/${id}`,
    },

    // Vehicles
    VEHICLES: {
        LIST: '/api/vehicles',
        BY_ID: (id: string) => `/api/vehicles/${id}`,
        CREATE: '/api/vehicles',
        UPDATE: (id: string) => `/api/vehicles/${id}`,
        DELETE: (id: string) => `/api/vehicles/${id}`,
    },

    // Orders
    ORDERS: {
        LIST: '/api/orders',
        BY_ID: (id: string) => `/api/orders/${id}`,
        STATS: '/api/orders/stats',
        UPDATE_STATUS: (id: string) => `/api/orders/${id}/status`,
    },
} as const;
