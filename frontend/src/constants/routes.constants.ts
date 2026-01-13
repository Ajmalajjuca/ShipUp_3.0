// Admin Routes
export const ADMIN_ROUTES = {
    ROOT: '/admin',
    LOGIN: '/admin/login',
    DASHBOARD: '/admin/dashboard',

    // Users
    USERS: '/admin/dashboard/users',
    USER_DETAIL: (userId: string) => `/admin/dashboard/users/${userId}`,

    // Partners
    PARTNERS: '/admin/dashboard/partners',
    PARTNER_REQUESTS: '/admin/dashboard/partners/requests',
    PARTNER_DETAIL: (partnerId: string) => `/admin/dashboard/partners/${partnerId}`,

    // Vehicles
    VEHICLES: '/admin/dashboard/vehicles',
    VEHICLE_DETAIL: (vehicleId: string) => `/admin/dashboard/vehicles/${vehicleId}`,

    // Orders
    ORDERS: '/admin/dashboard/orders',
    ORDERS_PENDING: '/admin/dashboard/orders/pending',
    ORDERS_COMPLETED: '/admin/dashboard/orders/completed',
    ORDER_DETAIL: (orderId: string) => `/admin/dashboard/orders/${orderId}`,

    // Other sections
    ANALYTICS: '/admin/dashboard/analytics',
    ROUTE_MANAGEMENT: '/admin/dashboard/route-management',
    SETTINGS: '/admin/dashboard/settings',
    SECURITY: '/admin/dashboard/security',
    HELP: '/admin/dashboard/help',
} as const;

// Public Routes
export const PUBLIC_ROUTES = {
    HOME: '/',
} as const;
