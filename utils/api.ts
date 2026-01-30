import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulator, localhost for iOS/Web.
// For physical device, replace with your machine's local IP (e.g., http://192.168.1.X:5000/api)
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

export const fetchProducts = async () => {
    try {
        const res = await fetch(`${API_URL}/products`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("API Error fetching products:", error);
        return [];
    }
};

export const saveProduct = async (product: any) => {
    try {
        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        return await res.json();
    } catch (error) {
        console.error("API Error saving product:", error);
        throw error;
    }
};

export const updateProduct = async (id: string, product: any) => {
    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        return await res.json();
    } catch (error) {
        console.error("API Error updating product:", error);
        throw error;
    }
};

export const deleteProduct = async (id: string) => {
    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE'
        });
        return await res.json();
    } catch (error) {
        console.error("API Error deleting product:", error);
        throw error;
    }
};

export const fetchOrders = async () => {
    try {
        const res = await fetch(`${API_URL}/orders`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("API Error fetching orders:", error);
        return [];
    }
};

export const saveOrder = async (order: any) => {
    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });
        return await res.json();
    } catch (error) {
        console.error("API Error saving order:", error);
        throw error;
    }
};

export const rateOrder = async (id: string, rating: number) => {
    try {
        const res = await fetch(`${API_URL}/orders/${id}/rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating })
        });
        return await res.json();
    } catch (error) {
        console.error("API Error rating order:", error);
        throw error;
    }
};

export const fetchProfile = async (role: string) => {
    try {
        const res = await fetch(`${API_URL}/profile/${role}`);
        if (!res.ok) {
            // If 404 or other, return null to trigger default handling in UI
            return null;
        }
        return await res.json();
    } catch (error) {
        console.error("API Error fetching profile:", error);
        return null; // Return null on error to fallback to defaults
    }
};

export const saveProfile = async (profile: any) => {
    try {
        const res = await fetch(`${API_URL}/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile)
        });
        return await res.json();
    } catch (error) {
        console.error("API Error saving profile:", error);
        throw error;
    }
};

export const fetchAnalytics = async () => {
    try {
        const res = await fetch(`${API_URL}/analytics`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("API Error fetching analytics:", error);
        return null;
    }
};
