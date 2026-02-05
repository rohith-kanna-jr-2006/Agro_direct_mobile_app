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
    isProfileComplete: boolean;
    isMfaVerified: boolean;
    username?: string;
    userId?: string; // MongoDB _id
    location?: string;
    token?: string;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    role: UserRole;
    setRole: (role: UserRole) => void;
    login: (googleData: any, flow?: 'login' | 'signup') => Promise<any>;
    traditionalLogin: (credentials: any) => Promise<any>;
    register: (userData: any) => Promise<boolean>;
    logout: () => void;
    completeOnboarding: (details: any) => Promise<void>;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
    verifyOtpLogin: (phoneNumber: string, code: string) => Promise<boolean>;
    verifyMfa: (identifier: string, code: string) => Promise<boolean>;
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
                    // Skip if user is already synced with same email and has a role
                    if (user && user.email === auth0User.email && user.role) {
                        setIsLoading(false);
                        return;
                    }

                    console.log("[Auth0] Syncing User Identity:", auth0User.email);

                    // 1. Try to get role from Local State, then LocalStorage, then Default
                    const savedIntendedRole = localStorage.getItem('intended_role') as UserRole;
                    let detectedRole: UserRole = role || savedIntendedRole || 'farmer';

                    let existingProfile = null;
                    try {
                        const profileRes = await profileAPI.getProfile(auth0User.email!, detectedRole);
                        if (profileRes.data) {
                            existingProfile = profileRes.data;
                            detectedRole = profileRes.data.role || detectedRole;
                        } else {
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
                        role: detectedRole || 'farmer',
                        isOnboarded: !!existingProfile,
                        isProfileComplete: !!existingProfile,
                        isMfaVerified: false,
                        userId: auth0User.sub,
                        token: "auth0-token",
                        phone: auth0User.phone_number
                    };

                    setUser(newUser);
                    setRole(newUser.role);
                    localStorage.setItem('user', JSON.stringify(newUser));
                    localStorage.removeItem('intended_role');

                    console.log("[Auth0] Identity Synced Successfully:", { role: newUser.role, onboarded: newUser.isOnboarded });
                } catch (err) {
                    console.error("[Auth0] Sync Error:", err);
                } finally {
                    setIsLoading(false);
                }
            } else if (!auth0Loading && !isAuthenticated) {
                // Not logged in via Auth0, check local storage ONLY if user is not already set
                if (!user) {
                    const savedUser = localStorage.getItem('user');
                    if (savedUser) {
                        try {
                            const parsedUser = JSON.parse(savedUser);
                            if (parsedUser && parsedUser.email) {
                                console.log("[AuthContext] Loading user from localStorage:", parsedUser.email, parsedUser.role);
                                setUser(parsedUser);
                                setRole(parsedUser.role || 'farmer');
                            }
                        } catch (err) {
                            console.error("[AuthContext] Error parsing saved user:", err);
                            localStorage.removeItem('user');
                        }
                    }
                }
                setIsLoading(false);
            } else if (!auth0Loading) {
                setIsLoading(false);
            }
        };
        syncAuth0();
    }, [isAuthenticated, auth0User, auth0Loading]);



    const refreshUser = async () => {
        if (user) {
            try {
                const response = await profileAPI.get(user.userId || user.email, user.role || 'farmer');
                if (response.data) {
                    const profile = response.data;
                    const backendUser = profile.user || {};
                    const updatedUser = {
                        ...user,
                        ...backendUser,
                        isOnboarded: true,
                        phone: backendUser.mobileNumber || user.phone,
                        location: backendUser.location || user.location
                    };
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
            // Ensure role is set - use the current role state or default to farmer
            const userRole = role || 'farmer';
            console.log(`[Login] Google login with role: ${userRole}`);

            // Scenario C: Google Sign-In
            const response = await authAPI.googleLogin({
                email: googleData.email,
                name: googleData.name,
                googleId: googleData.sub || googleData.googleId, // handling both formats
                photo: googleData.picture,
                role: userRole
            });

            if (response.data.requiresMFA) {
                console.log("[GoogleLogin] MFA required for:", response.data.mfaIdentifier);
                setIsLoading(false);
                return { requiresMFA: true, mfaIdentifier: response.data.mfaIdentifier, role: userRole };
            }

            const { token, user: backendUser } = response.data;

            const newUser: User = {
                email: backendUser.email,
                name: backendUser.name,
                picture: googleData.picture,
                role: backendUser.role || userRole,
                isOnboarded: backendUser.isOnboarded || false,
                isProfileComplete: backendUser.isProfileComplete || false,
                isMfaVerified: backendUser.isMfaVerified || false,
                username: backendUser.username,
                userId: backendUser.id,
                token: token,
                phone: backendUser.phone
            };

            // Check if profile exists to set isOnboarded
            try {
                const profileRes = await profileAPI.get(backendUser.id, newUser.role || 'farmer');
                if (profileRes.data) {
                    newUser.isOnboarded = true;
                    if (profileRes.data.role) newUser.role = profileRes.data.role;
                } else {
                    console.log(`[Google Auth] No profile for role: ${newUser.role}.`);
                    newUser.isOnboarded = false;
                }
            } catch (pErr) {
                console.log("No profile found for Google user yet");
                newUser.isOnboarded = false;
            }

            setUser(newUser);
            setRole(newUser.role || 'farmer');
            localStorage.setItem('user', JSON.stringify(newUser));

            console.log(`[Login] User logged in successfully with role: ${newUser.role}`);
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
            // Ensure role is set - use the explicit role from passed credentials if available, else context state
            const targetRole = credentials.role || role || 'farmer';
            console.log(`[TraditionalLogin] Logging in with role attempt: ${targetRole}`);

            // Scenario B: Existing User Login
            const response = await authAPI.login({
                email: credentials.email,
                password: credentials.password,
                role: targetRole
            });

            if (response.data.requiresMFA) {
                console.log("[TraditionalLogin] MFA required for:", response.data.mfaIdentifier);
                setIsLoading(false);
                return { requiresMFA: true, mfaIdentifier: response.data.mfaIdentifier, role: targetRole };
            }

            const { token, user: backendUser } = response.data;

            const newUser: User = {
                email: backendUser.email,
                name: backendUser.name,
                picture: '',
                role: backendUser.role || targetRole,
                isOnboarded: backendUser.isOnboarded || false,
                isProfileComplete: backendUser.isProfileComplete || false,
                isMfaVerified: backendUser.isMfaVerified || false,
                username: backendUser.username,
                userId: backendUser.id,
                token: token,
                phone: backendUser.phone
            };

            // Double check profile for the SPECIFIC role we just established
            try {
                // newUser.role is guaranteed at this point but TS needs a string
                const profileRes = await profileAPI.get(backendUser.id, newUser.role as string);
                if (profileRes.data) {
                    newUser.isOnboarded = true;
                    // If profile has a role, use it as source of truth
                    if (profileRes.data.role) newUser.role = profileRes.data.role;
                } else {
                    // IMPORTANT: If they logged in with a role but have no profile for it, 
                    // they are NOT onboarded as that role yet.
                    console.log(`[Auth] No profile found for role: ${newUser.role}. Flagging as not onboarded.`);
                    newUser.isOnboarded = false;
                }
            } catch (pErr) {
                console.log("No profile found for role:", newUser.role);
                newUser.isOnboarded = false; // Fallback to onboarding
            }

            setUser(newUser);
            setRole(newUser.role);
            localStorage.setItem('user', JSON.stringify(newUser));

            console.log(`[TraditionalLogin] User logged in as: ${newUser.role}`);
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
            // Ensure role is set
            const userRole = role || 'farmer';
            console.log(`[Register] Creating account with role: ${userRole}`);

            // Scenario A: New User Registration
            const response = await authAPI.register({ ...userData, role: userRole });
            const { token, user: backendUser } = response.data;

            const newUser: User = {
                email: backendUser.email,
                name: backendUser.name,
                picture: '',
                role: backendUser.role || userRole,
                isOnboarded: backendUser.isOnboarded || false,
                isProfileComplete: backendUser.isProfileComplete || false,
                isMfaVerified: backendUser.isMfaVerified || false,
                username: backendUser.username,
                userId: backendUser.id,
                token: token,
                phone: backendUser.phone
            };

            setUser(newUser);
            setRole(newUser.role || 'farmer');
            localStorage.setItem('user', JSON.stringify(newUser));

            console.log(`[Register] Account created successfully with role: ${newUser.role}`);
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
                isOnboarded: backendUser?.isOnboarded || !!profile,
                isProfileComplete: backendUser?.isProfileComplete || !!profile,
                isMfaVerified: backendUser?.isMfaVerified || true,
                username: backendUser?.username,
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

    const verifyMfa = async (identifier: string, code: string) => {
        setIsLoading(true);
        try {
            console.log(`[AuthContext] Verifying MFA for: ${identifier}`);
            const response = await authAPI.verifyMfa({ identifier, code });
            const { token, user: backendUser } = response.data;

            const newUser: User = {
                email: backendUser.email,
                name: backendUser.name,
                picture: '',
                role: backendUser.role,
                isOnboarded: backendUser.isOnboarded || false,
                isProfileComplete: backendUser.isProfileComplete || false,
                isMfaVerified: backendUser.isMfaVerified || false,
                username: backendUser.username,
                userId: backendUser.id,
                token: token,
                phone: backendUser.phone
            };

            // Check profile
            try {
                const profileRes = await profileAPI.get(backendUser.id, newUser.role as string);
                if (profileRes.data) {
                    newUser.isOnboarded = true;
                    if (profileRes.data.role) newUser.role = profileRes.data.role;
                }
            } catch (pErr) {
                console.log("No profile found for MFA user yet");
            }

            setUser(newUser);
            setRole(newUser.role);
            localStorage.setItem('user', JSON.stringify(newUser));

            toast.success("MFA Verified! Login Successful.");
            setIsLoading(false);
            return true;
        } catch (err: any) {
            console.error("MFA Verification failed:", err);
            toast.error(err.response?.data?.error || "Invalid MFA code");
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
                const profileData: any = {
                    userId: backendUserId,
                    role: backendRole,
                    email: user.email,
                    name: user.name,
                    phone: details.phone,
                    location: details.location,
                    username: details.username,
                    password: details.password, // Will be hashed on backend
                    bio: details.bio || (backendRole === 'farmer' ? `Farms ${details.acres} acres of ${details.crops?.join(', ')}` : ''),
                    photo: user.picture
                };

                if (backendRole === 'farmer') {
                    profileData.landSize = details.acres;
                    profileData.cropsGrown = details.crops;
                } else if (backendRole === 'buyer') {
                    profileData.shopName = details.businessName;
                    profileData.preferences = details.preferences;
                    profileData.type = details.buyerType || (details.businessName ? 'retailer' : 'household');
                }

                await profileAPI.update(profileData);

                // CRITICAL: Ensure we keep the role and update onboarding status
                const finalizedUser = {
                    ...user,
                    ...details,
                    role: backendRole, // Keep the role that was just saved
                    isOnboarded: true,
                    isProfileComplete: true,
                    username: details.username || user.username
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
        <AuthContext.Provider value={{ user, role, setRole, login, traditionalLogin, register, logout, completeOnboarding, isLoading, refreshUser, verifyOtpLogin, verifyMfa }}>
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

