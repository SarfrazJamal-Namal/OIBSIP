// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';

export const API_ENDPOINTS = {
    // Health
    HEALTH: `${API_BASE_URL}/api/health`,
    
    // Auth
    AUTH_REGISTER: `${API_BASE_URL}/api/auth/register`,
    AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
    AUTH_VERIFY_CODE: `${API_BASE_URL}/api/auth/verify-code`,
    
    // Orders
    ORDERS: `${API_BASE_URL}/api/orders`,
    ORDER_BY_ID: (id) => `${API_BASE_URL}/api/orders/${id}`,
    
    // Inventory
    INVENTORY: `${API_BASE_URL}/api/inventory`,
    INVENTORY_BY_ID: (id) => `${API_BASE_URL}/api/inventory/${id}`,
    
    // Admin
    ADMIN_ORDERS: `${API_BASE_URL}/api/admin/orders`,
    ADMIN_UPDATE_ORDER: (id) => `${API_BASE_URL}/api/admin/orders/${id}`,
};

export default API_BASE_URL;
