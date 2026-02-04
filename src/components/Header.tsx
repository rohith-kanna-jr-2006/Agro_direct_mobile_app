import { LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSafeAuth0 } from '../hooks/useSafeAuth0';
import LanguageSelector from './LanguageSelector';

const Header = () => {
    const { user, logout } = useAuth();
    const { isAuthenticated, logout: auth0Logout } = useSafeAuth0();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        if (isAuthenticated) {
            auth0Logout({ logoutParams: { returnTo: window.location.origin } });
        } else {
            navigate('/login');
        }
    };

    const handleFarmerLogin = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate('/login?role=farmer');
        setIsMobileMenuOpen(false);
    };

    const handleBuyerLogin = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate('/login?role=buyer');
        setIsMobileMenuOpen(false);
    };

    return (
        <nav style={{ position: 'relative' }}>
            <div className="container nav-content">
                <Link to="/" className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img src="/img/farmdirect-logo.jpeg" alt="FarmDirect Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                    <span>FarmDirect</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="desktop-only" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginRight: 'auto', marginLeft: '2rem' }}>
                    <Link to="/" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>{t('nav.home') || 'Home'}</Link>
                    <Link to="/marketplace" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>{t('nav.marketplace') || 'Marketplace'}</Link>
                    <a href="#" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>About</a>
                    <a href="#" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>Contact</a>
                </div>

                <div className="desktop-only" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <LanguageSelector />

                    {!user ? (
                        <>
                            <button
                                onClick={handleFarmerLogin}
                                className="btn-primary"
                                style={{ background: '#4CAF50', border: 'none', cursor: 'pointer', padding: '0.6rem 1.2rem', fontWeight: 600 }}
                            >
                                Login as Farmer
                            </button>
                            <button
                                onClick={handleBuyerLogin}
                                className="btn-primary"
                                style={{ background: '#FF9800', border: 'none', cursor: 'pointer', padding: '0.6rem 1.2rem', fontWeight: 600 }}
                            >
                                Login as Buyer
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
                                title={t('nav.logout')}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="mobile-only">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer' }}
                    >
                        {isMobileMenuOpen ? <LogOut size={28} style={{ transform: 'rotate(45deg)' }} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="mobile-only" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--surface)',
                    borderBottom: '1px solid var(--border)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    zIndex: 1001
                }}>
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--text)', textDecoration: 'none', padding: '0.5rem', fontWeight: 500 }}>{t('nav.home') || 'Home'}</Link>
                    <Link to="/marketplace" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--text)', textDecoration: 'none', padding: '0.5rem', fontWeight: 500 }}>{t('nav.marketplace') || 'Marketplace'}</Link>
                    <a href="#" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--text)', textDecoration: 'none', padding: '0.5rem', fontWeight: 500 }}>About</a>
                    <a href="#" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--text)', textDecoration: 'none', padding: '0.5rem', fontWeight: 500 }}>Contact</a>

                    <div style={{ padding: '0.5rem' }}>
                        <LanguageSelector />
                    </div>

                    {!user ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
                            <button
                                onClick={handleFarmerLogin}
                                className="btn-primary"
                                style={{ background: '#4CAF50', border: 'none', cursor: 'pointer', padding: '0.8rem', fontWeight: 600, width: '100%', justifyContent: 'center' }}
                            >
                                Login as Farmer
                            </button>
                            <button
                                onClick={handleBuyerLogin}
                                className="btn-primary"
                                style={{ background: '#FF9800', border: 'none', cursor: 'pointer', padding: '0.8rem', fontWeight: 600, width: '100%', justifyContent: 'center' }}
                            >
                                Login as Buyer
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                            <Link
                                to={user.role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard'}
                                onClick={() => setIsMobileMenuOpen(false)}
                                style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 600 }}
                            >
                                <span>{user.name}</span> (Dashboard)
                            </Link>
                            <button
                                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                style={{ background: 'rgba(255, 100, 100, 0.1)', color: '#ff6b6b', border: '1px solid rgba(255, 100, 100, 0.2)', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                            >
                                <LogOut size={18} /> {t('nav.logout')}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Header;
