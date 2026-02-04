import { useAuth0 } from "@auth0/auth0-react";
import { Lock } from "lucide-react";

const LoginButton = ({ role }: { role?: string | null }) => {
    const { loginWithRedirect } = useAuth0();

    const handleLogin = () => {
        if (role) {
            localStorage.setItem('intended_role', role);
        }
        loginWithRedirect({
            appState: { targetRole: role }
        });
    };

    return (
        <button
            onClick={handleLogin}
            className="premium-input"
            style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer',
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text)',
                marginTop: '0.5rem'
            }}
        >
            <Lock size={18} />
            Login with Auth0 (MFA)
        </button>
    );
};

export default LoginButton;
