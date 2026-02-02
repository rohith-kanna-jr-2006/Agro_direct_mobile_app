import { LogOut, Menu, Sprout } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleJoinClick = (e: React.MouseEvent) => {
        e.preventDefault();
        console.log("Header: Join Now clicked -> /signup?role=farmer");
        navigate('/signup?role=farmer');
    };

    const handleMarketplaceClick = (e: React.MouseEvent) => {
        e.preventDefault();
        console.log("Header: Marketplace clicked -> /login?role=buyer");
        navigate('/login?role=buyer');
    };

    const handleLoginClick = (e: React.MouseEvent) => {
        e.preventDefault();
        console.log("Header: Login clicked -> /login");
        navigate('/login');
    };

    return (
        <nav>
            <div className="container nav-content">
                <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
                    <Sprout size={32} />
                    <span>FarmDirect</span>
                </Link>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <button
                        onClick={handleMarketplaceClick}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontWeight: 500, cursor: 'pointer', fontSize: '1rem', padding: '0.5rem' }}
                    >
                        Marketplace
                    </button>

                    {!user ? (
                        <>
                            <button
                                onClick={handleLoginClick}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontWeight: 500, cursor: 'pointer', fontSize: '1rem', padding: '0.5rem' }}
                            >
                                Login
                            </button>
                            <button
                                onClick={handleJoinClick}
                                className="btn-primary"
                                style={{ background: 'var(--secondary)', border: '1px solid var(--primary)', cursor: 'pointer' }}
                            >
                                Join Now
                            </button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <Link
                                to={user.role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard'}
                                style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 600 }}
                            >
                                <span>{user.name}</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    )}
                    <Menu className="mobile-only" style={{ display: 'none' }} />
                </div>
            </div>
        </nav>
    );
};

export default Header;
