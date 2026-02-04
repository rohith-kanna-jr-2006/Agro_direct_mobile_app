import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "../context/AuthContext";
import LoginButton from "./LoginButton";

const Profile = () => {
    const { user, isAuthenticated, isLoading } = useAuth0();

    const { role } = useAuth();

    if (isLoading) {
        return <div className="loading-text">Loading profile...</div>;
    }

    if (!isAuthenticated || !user) {
        return (
            <div style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                marginTop: '1rem',
                color: 'var(--text)'
            }}>
                <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>🛡️</span>
                        Identity Verification
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                        Complete your profile verification using our secure Auth0 service.
                    </p>
                </div>
                <LoginButton role={role} />
            </div>
        );
    }

    return (
        <div style={{
            padding: '1rem',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            color: 'var(--text)'
        }}>
            {user.picture && <img src={user.picture} alt={user.name} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />}
            <div>
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{user.name}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {user.username && <p style={{ margin: 0, color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600 }}>@{user.username}</p>}
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.email}</p>
                </div>
                {user.email_verified && <span style={{ color: '#4CAF50', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>Verified via Auth0</span>}
            </div>
        </div>
    );
};

export default Profile;
