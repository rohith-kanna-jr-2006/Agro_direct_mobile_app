import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSafeAuth0 } from '../hooks/useSafeAuth0';
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
    phone?: string;
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
    verifyOtpLogin: (phoneNumber: string, code: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [isLoading, setIsLoading] = useState(true);



    // Auth0 Integration
    const { user: auth0User, isAuthenticated, isLoading: auth0Loading } = useSafeAuth0();

    useEffect(() => {
        const syncAuth0 = async () => {
            if (!auth0Loading && isAuthenticated && auth0User) {
                try {
                    if (user && user.email === auth0User.email && user.role) {
                        return;
                    }

                    console.log("[Auth0] Syncing User Identity:", auth0User.email);

                    // 1. Try to get role from Local State, then LocalStorage, then Default
                    const savedIntendedRole = localStorage.getItem('intended_role') as UserRole;
                    let detectedRole: UserRole = role || savedIntendedRole || 'farmer';

                    let existingProfile = null;
                    try {
                        // Check profile for BOTH roles if we aren't sure
                        const profileRes = await profileAPI.getProfile(auth0User.email!, detectedRole);
                        if (profileRes.data) {
                            existingProfile = profileRes.data;
                            detectedRole = profileRes.data.role || detectedRole; // Don't lose existing role if profile.role is null
                        } else {
                            // Try the OTHER role just in case they switched
                            const otherRole = detectedRole === 'farmer' ? 'buyer' : 'farmer';
                            const otherRes = await profileAPI.getProfile(auth0User.email!, otherRole);
                            if (otherRes.data) {
                                existingProfile = otherRes.data;
                                detectedRole = otherRes.data.role || otherRole;
                            }
                        }
                    } catch (e) {
                        console.log("[Auth0] Profile check skipped or failed.");
                    }

                    const newUser: User = {
                        email: auth0User.email!,
                        name: auth0User.name!,
                        picture: auth0User.picture!,
                        role: detectedRole || 'farmer', // Guaranteed not undefined
                        isOnboarded: !!existingProfile,
                        userId: auth0User.sub,
                        token: "auth0-token",
                        phone: auth0User.phone_number
                    };

                    setUser(newUser);
                    setRole(newUser.role);
                    localStorage.setItem('user', JSON.stringify(newUser));
                    localStorage.removeItem('intended_role'); // Clean up

                    console.log("[Auth0] Identity Synced Successfully:", { role: newUser.role, onboarded: newUser.isOnboarded });
                } catch (err) {
                    console.error("[Auth0] Sync Error:", err);
                } finally {
                    setIsLoading(false);
                }
            } else if (!auth0Loading && !isAuthenticated) {
                // Not logged in via Auth0, check local storage
                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                    const parsedUser = JSON.parse(savedUser);
                    if (parsedUser && parsedUser.email) {
                        setUser(parsedUser);
                        setRole(parsedUser.role || 'farmer');
                    }
                }
                setIsLoading(false);
            }
        };
        syncAuth0();
    }, [isAuthenticated, auth0User, auth0Loading]);

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
                token: token,
                phone: backendUser.phone
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
                token: token,
                phone: backendUser.phone
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
                token: token,
                phone: backendUser.phone
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

    const verifyOtpLogin = async (phoneNumber: string, code: string) => {
        setIsLoading(true);
        try {
            const response = await authAPI.verifyOtp({ phoneNumber, code, role: role || undefined });
            const { token, user: backendUser, profile, isNewUser } = response.data;

            // Normalize user data (backend sends different structure sometimes)
            const newUser: User = {
                email: backendUser?.email || '',
                name: backendUser?.name || 'User',
                picture: profile?.photo || '',
                role: role || 'farmer',
                isOnboarded: !!profile, // If profile exists, they are onboarded
                userId: backendUser?._id || backendUser?.id || profile?.userId,
                token: token,
                phone: phoneNumber
            };

            if (isNewUser) {
                // If it's a new user properly identified by backend
                newUser.isOnboarded = false;
            }

            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
            if (newUser.role) setRole(newUser.role);

            toast.success("Login Successful!");
            setIsLoading(false);
            return true;
        } catch (err: any) {
            console.error("OTP Verification failed:", err);
            const message = err.response?.data?.message || err.response?.data?.error || "Invalid OTP";
            toast.error(message);
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
            try {
                // Ensure we have a valid identifier for the backend
                const backendUserId = (user.userId && user.userId.includes('|')) ? user.email : (user.userId || user.email);
                const backendRole = user.role || role || 'farmer';

                console.log("[Onboarding] Submitting Profile Data:", { userId: backendUserId, role: backendRole });

                // Save to MongoDB
                const profileData = {
                    userId: backendUserId,
                    role: backendRole,
                    email: user.email,
                    name: user.name,
                    phone: details.phone,
                    location: details.location,
                    bio: details.bio || (backendRole === 'farmer' ? `Farms ${details.acres} acres of ${details.crops?.join(', ')}` : ''),
                    photo: user.picture,
                    buyerDetails: backendRole === 'buyer' ? {
                        subRole: details.businessName ? 'business' : 'consumer',
                        businessName: details.businessName,
                        interests: details.preferences,
                        weeklyRequirement: details.weeklyRequirement
                    } : undefined
                };

                await profileAPI.update(profileData);

                // CRITICAL: Ensure we keep the role and update onboarding status
                const finalizedUser = {
                    ...user,
                    ...details,
                    role: backendRole, // Keep the role that was just saved
                    isOnboarded: true
                };

                setUser(finalizedUser);
                setRole(backendRole);
                localStorage.setItem('user', JSON.stringify(finalizedUser));
                console.log("[Onboarding] Profile Saved & State Updated:", finalizedUser);
            } catch (err) {
                console.error("Failed to save profile to MongoDB:", err);
                throw err;
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, role, setRole, login, traditionalLogin, register, logout, completeOnboarding, isLoading, refreshUser, verifyOtpLogin }}>
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

