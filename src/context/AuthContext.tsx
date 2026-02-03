import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { authAPI, profileAPI } from '../services/api';


type UserRole = 'farmer' | 'buyer' | null;

interface User {
    email: string;
    name: string;
    picture: string;
    role: UserRole;
    isOnboarded: boolean;
    userId?: string; // MongoDB _id
    location?: string;
    token?: string;
}


interface AuthContextType {
    user: User | null;
    role: UserRole;
    setRole: (role: UserRole) => void;
    login: (googleData: any, flow?: 'login' | 'signup') => Promise<boolean>;
    traditionalLogin: (credentials: any) => Promise<boolean>;
    register: (userData: any) => Promise<boolean>;
    logout: () => void;
    completeOnboarding: (details: any) => Promise<void>;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                setRole(parsedUser.role);

                // Optional: Sync with backend on load
                try {
                    const response = await profileAPI.get(parsedUser.email, parsedUser.role);
                    if (response.data) {
                        const updatedUser = { ...parsedUser, ...response.data, isOnboarded: true };
                        setUser(updatedUser);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                    }
                } catch (err) {
                    console.error("Failed to sync profile on load:", err);
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const refreshUser = async () => {
        if (user) {
            try {
                const response = await profileAPI.get(user.email, user.role || 'farmer');
                if (response.data) {
                    const updatedUser = { ...user, ...response.data, isOnboarded: true };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
            } catch (err) {
                console.error("Failed to refresh user:", err);
            }
        }
    };

    const login = async (googleData: any) => {
        setIsLoading(true);
        try {
            // Scenario C: Google Sign-In
            const response = await authAPI.googleLogin({
                email: googleData.email,
                name: googleData.name,
                googleId: googleData.sub || googleData.googleId, // handling both formats
                photo: googleData.picture,
                role: role
            });

            const { token, user: backendUser } = response.data;

            const newUser: User = {
                email: backendUser.email,
                name: backendUser.name,
                picture: googleData.picture,
                role: role || 'farmer',
                isOnboarded: false, // Will check profile next
                userId: backendUser.id,
                token: token
            };

            // Check if profile exists to set isOnboarded
            try {
                const profileRes = await profileAPI.get(backendUser.id, role || 'farmer');
                if (profileRes.data) {
                    newUser.isOnboarded = true;
                    newUser.role = profileRes.data.role;
                }
            } catch (pErr) {
                console.log("No profile found for Google user yet");
            }

            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
            if (newUser.role) setRole(newUser.role);

            setIsLoading(false);
            return true;
        } catch (err) {
            console.error("Google Login failed:", err);
            toast.error("Google login failed. Please try again.");
            setIsLoading(false);
            return false;
        }
    };

    const traditionalLogin = async (credentials: any) => {
        setIsLoading(true);
        try {
            // Scenario B: Existing User Login
            const response = await authAPI.login(credentials);
            const { token, user: backendUser } = response.data;

            const newUser: User = {
                email: backendUser.email,
                name: backendUser.name,
                picture: '',
                role: role || 'farmer',
                isOnboarded: false,
                userId: backendUser.id,
                token: token
            };

            // Check profile
            try {
                const profileRes = await profileAPI.get(backendUser.id, role || 'farmer');
                if (profileRes.data) {
                    newUser.isOnboarded = true;
                    newUser.role = profileRes.data.role;
                }
            } catch (pErr) {
                console.log("No profile found for user yet");
            }

            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
            if (newUser.role) setRole(newUser.role);

            toast.success("Login Successful!");
            setIsLoading(false);
            return true;
        } catch (err: any) {
            console.error("Login failed:", err);
            const message = err.response?.data?.error || "Invalid credentials";
            toast.error(message);
            setIsLoading(false);
            return false;
        }
    };

    const register = async (userData: any) => {
        setIsLoading(true);
        try {
            // Scenario A: New User Registration
            const response = await authAPI.register({ ...userData, role });
            const { token, user: backendUser } = response.data;

            const newUser: User = {
                email: backendUser.email,
                name: backendUser.name,
                picture: '',
                role: role || 'farmer',
                isOnboarded: false,
                userId: backendUser.id,
                token: token
            };

            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));

            toast.success("Account created successfully!");
            setIsLoading(false);
            return true;
        } catch (err: any) {
            console.error("Registration failed:", err);
            if (err.response?.status === 409) {
                // Show specific 409 error message
                toast.error("Already registered email, please signup with another email id.");
            } else {
                toast.error(err.response?.data?.error || "Registration failed");
            }
            setIsLoading(false);
            return false;
        }
    };


    const logout = () => {
        setUser(null);
        setRole(null);
        localStorage.removeItem('user');
    };

    const completeOnboarding = async (details: any) => {
        if (user) {
            const updatedUser = { ...user, ...details, isOnboarded: true };

            try {
                // Save to MongoDB
                const profileData = {
                    userId: user.email,
                    role: user.role || role,
                    name: user.name,
                    phone: details.phone,
                    location: details.location,
                    bio: details.bio || (user.role === 'farmer' ? `Farms ${details.acres} acres of ${details.crops?.join(', ')}` : ''),
                    photo: user.picture,
                    buyerDetails: user.role === 'buyer' ? {
                        subRole: details.businessName ? 'business' : 'consumer',
                        businessName: details.businessName,
                        interests: details.preferences,
                        weeklyRequirement: details.weeklyRequirement
                    } : undefined
                };

                await profileAPI.update(profileData);

                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            } catch (err) {
                console.error("Failed to save profile to MongoDB:", err);
                throw err;
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, role, setRole, login, traditionalLogin, register, logout, completeOnboarding, isLoading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (undefined === context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

