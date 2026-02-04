import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Lock, Mail, Phone, Sprout, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { role, setRole, login, traditionalLogin, register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const isSignup = location.pathname === '/signup';
    const { t } = useTranslation();

    // 0: Select Role, 1: Auth Flow
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const roleParam = searchParams.get('role');
        if (roleParam === 'farmer' || roleParam === 'buyer') {
            setRole(roleParam);
            setStep(1);
        }
    }, [searchParams, setRole]);

    const handleSelectRole = (r: 'farmer' | 'buyer') => {
        setRole(r);
        setStep(1);
    };

    const handleTraditionalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (isSignup) {
                const success = await register({ ...formData, role });
                if (success) {
                    navigate('/onboarding');
                }
            } else {
                const success = await traditionalLogin({ email: formData.email, password: formData.password });
                if (success) {
                    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
                    if (savedUser.isOnboarded) {
                        navigate(savedUser.role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard');
                    } else {
                        navigate('/onboarding');
                    }
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Custom Google Login Hook
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                console.log("Google OAuth Success, fetching profile...");
                const userInfo = await axios.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
                );

                const payload = userInfo.data;
                console.log("Google Profile Fetched:", payload.email);

                const success = await login({
                    email: payload.email,
                    name: payload.name,
                    picture: payload.picture,
                    sub: payload.sub,
                    role: role
                });

                if (success) {
                    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
                    if (savedUser.isOnboarded) {
                        navigate(savedUser.role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard');
                    } else {
                        navigate('/onboarding');
                    }
                }
            } catch (error) {
                console.error("Google User Info Fetch Error:", error);
                toast.error('Failed to retrieve Google profile.');
            }
        },
        onError: (errorResponse) => {
            console.error("Google Login Failed:", errorResponse);
            toast.error('Google login failed. See console for details.');
        }
    });

    return (
        <div className="login-split">
            {/* Left Side: Branding */}
            <div className="login-branding">
                <img
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200"
                    alt="Agriculture"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="brand-overlay">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}
                    >
                        <div style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
                            <img src="/img/farmdirect-logo.jpeg" alt="FarmDirect Logo" style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }} />
                        </div>
                        <h1 className="brand-text-large">FarmDirect</h1>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{ fontSize: '2.5rem', fontWeight: 600, maxWidth: '600px', lineHeight: 1.2, color: 'rgba(255,255,255,0.9)' }}
                    >
                        {t('hero.title')}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{ fontSize: '1.2rem', marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)', maxWidth: '500px' }}
                    >
                        Join thousands of farmers and buyers in the most transparent agricultural marketplace.
                    </motion.p>
                </div>
            </div>

            {/* Right Side: Flow */}
            <div className="login-content">
                <div className="login-card">
                    <AnimatePresence mode="wait">
                        {step === 0 ? (
                            <motion.div
                                key="step0"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                        {isSignup ? t('login.create_account') : t('login.welcome_back')}
                                    </h2>
                                    <p style={{ color: 'var(--text-muted)' }}>{t('login.select_role')}</p>
                                </div>

                                <div className="role-grid">
                                    <div
                                        onClick={() => handleSelectRole('farmer')}
                                        className={`role-card ${role === 'farmer' ? 'active' : ''}`}
                                    >
                                        <span className="role-icon">👨‍🌾</span>
                                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{t('login.farmer')}</div>
                                        {role === 'farmer' && (
                                            <motion.div layoutId="outline" style={{ position: 'absolute', inset: 0, border: '2px solid var(--primary)', borderRadius: '20px' }} />
                                        )}
                                    </div>
                                    <div
                                        onClick={() => handleSelectRole('buyer')}
                                        className={`role-card ${role === 'buyer' ? 'active' : ''}`}
                                    >
                                        <span className="role-icon">🛒</span>
                                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{t('login.buyer')}</div>
                                        {role === 'buyer' && (
                                            <motion.div layoutId="outline" style={{ position: 'absolute', inset: 0, border: '2px solid var(--primary)', borderRadius: '20px' }} />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <button
                                    onClick={() => setStep(0)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', padding: 0, fontSize: '0.9rem', fontWeight: 500 }}
                                >
                                    <ArrowLeft size={16} /> {t('login.back_to_roles')}
                                </button>

                                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                        {role === 'farmer' ? t('login.farmer') : t('login.buyer')} {isSignup ? t('login.registration') : t('login.login_title')}
                                    </h2>
                                    <p style={{ color: 'var(--text-muted)' }}>
                                        {t('login.continue_google')} {role === 'farmer' ? t('login.farmer') : t('login.buyer')}
                                    </p>
                                </div>

                                <form onSubmit={handleTraditionalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {isSignup && (
                                        <div className="input-group">
                                            <UserIcon className="input-icon" size={20} />
                                            <input
                                                className="premium-input with-icon"
                                                type="text"
                                                placeholder={t('login.name_placeholder') || "Name"}
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    {isSignup && (
                                        <div className="input-group">
                                            <Phone className="input-icon" size={20} />
                                            <input
                                                className="premium-input with-icon"
                                                type="tel"
                                                placeholder={t('login.phone_placeholder') || "Phone Number"}
                                                required
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    <div className="input-group">
                                        <Mail className="input-icon" size={20} />
                                        <input
                                            className="premium-input with-icon"
                                            type="email"
                                            placeholder={t('login.email_placeholder') || "Email"}
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="input-group">
                                        <Lock className="input-icon" size={20} />
                                        <input
                                            className="premium-input with-icon"
                                            type="password"
                                            placeholder={t('login.password_placeholder') || "Password"}
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-primary"
                                        style={{ justifyContent: 'center', padding: '1rem', marginTop: '0.5rem', width: '100%' }}
                                    >
                                        {isSubmitting ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Sprout size={20} />
                                            </motion.div>
                                        ) : (
                                            <>
                                                {isSignup ? t('login.create_account') : t('login.login_btn')}
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="or-divider">
                                    <div className="divider-line"></div>
                                    <span>OR CONTINUE WITH</span>
                                    <div className="divider-line"></div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                                    <button
                                        type="button"
                                        onClick={() => googleLogin()}
                                        className="premium-input"
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '12px',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            background: 'white',
                                            color: 'black',
                                            marginTop: '0.5rem',
                                            border: 'none',
                                            padding: '12px'
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                                            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.23856)">
                                                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                                                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                                                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.049 -21.864 51.249 C -21.864 50.449 -21.734 49.689 -21.484 48.969 L -21.484 45.879 L -25.464 45.879 C -26.284 47.509 -26.754 49.329 -26.754 51.249 C -26.754 53.169 -26.284 54.989 -25.464 56.619 L -21.484 53.529 Z" />
                                                <path fill="#EA4335" d="M -14.754 44.009 C -12.984 44.009 -11.404 44.619 -10.154 45.809 L -6.734 42.389 C -8.804 40.459 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.879 L -21.484 48.969 C -20.534 46.119 -17.884 44.009 -14.754 44.009 Z" />
                                            </g>
                                        </svg>
                                        Continue with Google
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <p style={{ marginTop: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        {isSignup ? t('login.already_have_account') : t('login.dont_have_account')}
                        <Link
                            to={isSignup ? '/login' : '/signup'}
                            style={{ color: 'var(--primary)', marginLeft: '8px', textDecoration: 'none', fontWeight: 600, transition: 'var(--transition-smooth)' }}
                            onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'}
                            onMouseOut={(e) => e.currentTarget.style.color = 'var(--primary)'}
                        >
                            {isSignup ? t('login.login_btn') : t('login.signup_btn')}
                        </Link>
                    </p>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) { .login-branding { display: none !important; } }
            `}</style>
        </div>
    );
};

export default Login;
