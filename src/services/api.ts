import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const authAPI = {
    login: (credentials: any) => api.post('/users/login', credentials),
    register: (userData: any) => api.post('/users/register', userData),
    googleLogin: (userData: any) => api.post('/users/google-login', userData),
    registerPhone: (userData: any) => api.post('/users/register-phone', userData),
    sendOtp: (phoneNumber: string) => api.post('/send-otp', { phoneNumber }),
    verifyOtp: (data: { phoneNumber: string, code: string, role?: string }) => api.post('/verify-otp', data),
    checkUsername: (username: string) => api.post('/users/check-username', { username }),
    updatePassword: (data: { userId: string, currentPassword: string, newPassword: string }) => api.post('/users/update-password', data),
    toggleMfa: (data: { userId: string, enable: boolean }) => api.post('/users/toggle-mfa', data),
    verifyMfa: (data: { identifier: string, code: string }) => api.post('/users/verify-mfa', data),
    getUser: (userId: string) => api.get(`/users/${userId}`),
};

export const productAPI = {
    getAll: () => api.get('/products'),
    create: (productData: any) => api.post('/products', productData),
    update: (id: string, productData: any) => api.put(`/products/${id}`, productData),
    delete: (id: string) => api.delete(`/products/${id}`),
};

export const profileAPI = {
    get: (userId: string, role: string) => api.get(`/profile/${userId}/${role}`),
    update: (profileData: any) => api.post('/profile', profileData),
    getProfile: (userId: string, role: string) => api.get(`/profile/${userId}/${role}`),
    updateProfile: (profileData: any) => api.post('/profile', profileData),
    getAnalytics: () => api.get('/analytics'),
};

export const bankAPI = {
    verifyIfsc: (ifsc: string) => api.post('/verify-ifsc', { ifsc }),
    saveDetails: (data: any) => api.post('/bank-details', data),
    getDetails: (userId: string, role: string) => api.get(`/bank-details/${userId}/${role}`),
};

export const orderAPI = {
    getAll: () => api.get('/orders'),
    create: (orderData: any) => api.post('/orders', orderData),
    trackByTrackingId: (trackingId: string) => api.get(`/orders/track/${trackingId}`),
    rate: (id: string, rating: number) => api.post(`/orders/${id}/rate`, { rating }),
};

export default api;

