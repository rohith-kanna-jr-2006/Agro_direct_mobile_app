import React, { createContext, useContext, useEffect, useState } from 'react';

type UserRole = 'farmer' | 'buyer' | null;

interface User {
    email: string;
    name: string;
    picture: string;
    role: UserRole;
    isOnboarded: boolean;
}

interface AuthContextType {
    user: User | null;
    role: UserRole;
    setRole: (role: UserRole) => void;
    login: (googleData: any) => void;
    logout: () => void;
    completeOnboarding: (details: any) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (googleData: any) => {
        // In a real app, this would be a backend call
        const newUser: User = {
            email: googleData.email,
            name: googleData.name,
            picture: googleData.picture,
            role: role, // Use the role selected in the UI
            isOnboarded: false, // Default to false for new users
        };

        // Check if user exists in "database" (localStorage for demo)
        const existingUsers = JSON.parse(localStorage.getItem('users_db') || '[]');
        const existingUser = existingUsers.find((u: any) => u.email === newUser.email);

        if (existingUser) {
            // If the user already selected a role, update it in their profile
            const updatedUser = {
                ...existingUser,
                role: role || existingUser.role,
                picture: googleData.picture || existingUser.picture,
                name: googleData.name || existingUser.name
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Sync with users_db immediately
            const updatedDB = existingUsers.map((u: any) => u.email === updatedUser.email ? updatedUser : u);
            localStorage.setItem('users_db', JSON.stringify(updatedDB));
        } else {
            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));

            // Add to users_db
            const updatedDB = [...existingUsers, newUser];
            localStorage.setItem('users_db', JSON.stringify(updatedDB));
        }
    };

    const logout = () => {
        setUser(null);
        setRole(null);
        localStorage.removeItem('user');
    };

    const completeOnboarding = (details: any) => {
        if (user) {
            const updatedUser = { ...user, ...details, isOnboarded: true };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Update "database"
            const existingUsers = JSON.parse(localStorage.getItem('users_db') || '[]');
            const userIndex = existingUsers.findIndex((u: any) => u.email === user.email);
            if (userIndex > -1) {
                existingUsers[userIndex] = updatedUser;
            } else {
                existingUsers.push(updatedUser);
            }
            localStorage.setItem('users_db', JSON.stringify(existingUsers));
        }
    };

    return (
        <AuthContext.Provider value={{ user, role, setRole, login, logout, completeOnboarding, isLoading }}>
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
