import { Platform } from 'react-native';

import Constants from 'expo-constants';

// Automatically detect the backend URL based on where the app is running
// Automatically detect the backend URL based on where the app is running
const getApiUrl = () => {
    // MANUAL OVERRIDE: Use the specific LAN IP found via ipconfig (Wi-Fi Interface)
    const MANUAL_IP = '10.178.132.211';
    if (MANUAL_IP) return `http://${MANUAL_IP}:5000/api`;

    // If running in Expo Go or Build, this gives the IP of the machine running Metro
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost?.split(':')[0];

    if (localhost) {
        return `http://${localhost}:5000/api`;
    }

    // Fallback: Use LAN IP for Physical Device (APK), 10.0.2.2 for Emulator
    return Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
}

const API_URL = getApiUrl();
console.log("Using API URL:", API_URL);

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

export const fetchProfile = async (userId: string, role: string) => {
    try {
        const res = await fetch(`${API_URL}/profile/${userId}/${role}`);
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

export const sendOtp = async (phone: string) => {
    try {
        // Ensure +91 format
        const formattedNumber = phone.startsWith('+91') ? phone : `+91${phone}`;

        console.log(`Sending OTP to ${formattedNumber} via ${API_URL}/send-otp`);

        const res = await fetch(`${API_URL}/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: formattedNumber })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || data.error || 'Failed to send OTP');
        return data;
    } catch (error) {
        console.error("API Error sending OTP:", error);
        throw error;
    }
};

export const verifyOtp = async (phone: string, code: string, role?: string) => {
    try {
        const formattedNumber = phone.startsWith('+91') ? phone : `+91${phone}`;

        const res = await fetch(`${API_URL}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: formattedNumber, code, role })
        });
        const data = await res.json();
        // Backend determines success, but even with success=true, we might have logical issues to handle
        if (!data.success) throw new Error(data.error || data.message || 'Failed to verify OTP');
        return data;
    } catch (error) {
        console.error("API Error verifying OTP:", error);
        throw error;
    }
};


export const registerUserPhone = async (data: any) => {
    try {
        const res = await fetch(`${API_URL}/users/register-phone`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to register');
        return result;
    } catch (error) {
        console.error("API Error registering user:", error);
        throw error;
    }
};

// --- Bank APIs ---

export const verifyIfsc = async (ifsc: string) => {
    try {
        const res = await fetch(`${API_URL}/verify-ifsc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ifsc })
        });
        const data = await res.json();
        return data; // { success, details: { bank, branch } }
    } catch (error) {
        console.error("API Error verifying IFSC:", error);
        throw error;
    }
};

export const saveBankDetails = async (details: any) => {
    try {
        const res = await fetch(`${API_URL}/bank-details`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(details)
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to save bank details");
        return data;
    } catch (error) {
        console.error("API Error saving bank details:", error);
        throw error;
    }
};

export const fetchBankDetails = async (userId: string, role: string) => {
    try {
        const res = await fetch(`${API_URL}/bank-details/${userId}/${role}`);
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("API Error fetching bank details:", error);
        return null;
    }
};

export const verifyPmKisan = async (aadhaar: string) => {
    try {
        const res = await fetch(`${API_URL}/external/verify-pm-kisan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aadhaar })
        });
        const data = await res.json();
        return data; // Returns { success: true, valid: boolean, message: string }
    } catch (error) {
        console.error("API Error verifying Aadhaar:", error);
        throw error;
    }
};
