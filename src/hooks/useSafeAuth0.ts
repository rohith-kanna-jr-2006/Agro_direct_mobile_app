import { useAuth0 } from '@auth0/auth0-react';

export const useSafeAuth0 = () => {
    try {
        return useAuth0();
    } catch {
        return {
            user: null,
            isAuthenticated: false,
            isLoading: false,
            logout: () => { window.location.href = '/login'; },
            loginWithRedirect: async () => { },
            getAccessTokenSilently: async () => ''
        } as any;
    }
};
