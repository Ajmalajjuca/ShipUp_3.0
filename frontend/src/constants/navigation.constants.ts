import {
    Home,
    Users,
    Truck,
    Car,
    Package,
    BarChart2,
    Compass,
    Settings,
    Shield,
    HelpCircle,
} from 'lucide-react';
import { ADMIN_ROUTES } from './routes.constants';

export interface NavigationItem {
    id: string;
    title: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    path?: string;
    children?: NavigationSubItem[];
}

export interface NavigationSubItem {
    id: string;
    title: string;
    path: string;
    badge?: number;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        icon: Home,
        path: ADMIN_ROUTES.DASHBOARD,
    },
];

export const MANAGEMENT_ITEMS: NavigationItem[] = [
    {
        id: 'users',
        title: 'Users',
        icon: Users,
        children: [
            {
                id: 'user-list',
                title: 'User List',
                path: ADMIN_ROUTES.USERS,
            },
        ],
    },
    {
        id: 'partners',
        title: 'Partners',
        icon: Truck,
        children: [
            {
                id: 'partner-list',
                title: 'Partner List',
                path: ADMIN_ROUTES.PARTNERS,
            },
            {
                id: 'partner-requests',
                title: 'Requests',
                path: ADMIN_ROUTES.PARTNER_REQUESTS,
            },
        ],
    },
    {
        id: 'vehicles',
        title: 'Vehicles',
        icon: Car,
        children: [
            {
                id: 'vehicle-list',
                title: 'Vehicle List',
                path: ADMIN_ROUTES.VEHICLES,
            },
        ],
    },
    {
        id: 'orders',
        title: 'Orders',
        icon: Package,
        children: [
            {
                id: 'all-orders',
                title: 'All Orders',
                path: ADMIN_ROUTES.ORDERS,
            },
            {
                id: 'pending-orders',
                title: 'Pending Orders',
                path: ADMIN_ROUTES.ORDERS_PENDING,
            },
            {
                id: 'completed-orders',
                title: 'Completed Orders',
                path: ADMIN_ROUTES.ORDERS_COMPLETED,
            },
        ],
    },
];

export const ANALYTICS_ITEMS: NavigationItem[] = [
    {
        id: 'analytics',
        title: 'Analytics',
        icon: BarChart2,
        path: ADMIN_ROUTES.ANALYTICS,
    },
    {
        id: 'route-management',
        title: 'Route Management',
        icon: Compass,
        path: ADMIN_ROUTES.ROUTE_MANAGEMENT,
    },
];

export const SYSTEM_ITEMS: NavigationItem[] = [
    {
        id: 'settings',
        title: 'Settings',
        icon: Settings,
        path: ADMIN_ROUTES.SETTINGS,
    },
    {
        id: 'security',
        title: 'Security',
        icon: Shield,
        path: ADMIN_ROUTES.SECURITY,
    },
    {
        id: 'help',
        title: 'Help & Support',
        icon: HelpCircle,
        path: ADMIN_ROUTES.HELP,
    },
];
