import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Home, Lock, Mail, Phone, Sprout, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const Login = () => {
    const { role, setRole, login, traditionalLogin, register, verifyMfa } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const isSignup = location.pathname === '/signup';
    const { t } = useTranslation();

    // 0: Select Role, 1: Auth Flow
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '', phone: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [showMfa, setShowMfa] = useState(false);
    const [mfaIdentifier, setMfaIdentifier] = useState('');
    const [mfaCode, setMfaCode] = useState('');

    useEffect(() => {
        const roleParam = searchParams.get('role');
        if (roleParam === 'farmer' || roleParam === 'buyer') {
            setRole(roleParam);
            setStep(1);
        }
    }, [searchParams, setRole]);

    const handleSelectRole = (r: 'farmer' | 'buyer') => {
        console.log(`[Login] Role selected: ${r}`);
        setRole(r);
        setStep(1);
    };

    const handleTraditionalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log(`[Login] Form submitted - isSignup: ${isSignup}, role: ${role}`);

        if (isSignup) {
            const pass = formData.password;
            const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!strongRegex.test(pass)) {
                toast.error("Password does not meet strong policy requirements.");
                return;
            }
        }

        setIsSubmitting(true);
        try {
            if (isSignup) {
                console.log(`[Login] Registering user with role: ${role}`);
                const success = await register({ ...formData, role });
                if (success) {
                    console.log(`[Login] Registration successful, navigating to onboarding`);
                    navigate('/onboarding', { replace: true });
                }
            } else {
                console.log(`[Login] Logging in user with role attempt: ${role}`);
                const result = await traditionalLogin({ email: formData.email, password: formData.password, role: role });

                if (result && result.requiresMFA) {
                    setMfaIdentifier(result.mfaIdentifier);
                    setShowMfa(true);
                    toast.success("MFA Required. Please check your phone/email for the code.");
                    return;
                }

                if (result === true) {
                    // Critical: Get the most updated user from localStorage (it was just set by context)
                    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
                    const userRole = savedUser.role || role || 'farmer';

                    console.log(`[Login] Successful - Role: ${userRole}, Onboarded: ${savedUser.isOnboarded}`);

                    if (savedUser.isOnboarded) {
                        const targetRoute = userRole === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard';
                        console.log(`[Login] Navigating to: ${targetRoute}`);
                        navigate(targetRoute, { replace: true });
                    } else {
                        navigate('/onboarding', { replace: true });
                    }
                }
            }
        } catch (error) {
            console.error("[Login] Error during form submission:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Custom Google Login Hook
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                console.log(`[Login] Google OAuth Success with role: ${role}, fetching profile...`);
                const userInfo = await axios.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
                );

                const payload = userInfo.data;
                console.log(`[Login] Google Profile Fetched: ${payload.email}`);

                const result = await login({
                    email: payload.email,
                    name: payload.name,
                    picture: payload.picture,
                    sub: payload.sub,
                    role: role
                });

                if (result && result.requiresMFA) {
                    setMfaIdentifier(result.mfaIdentifier);
                    setShowMfa(true);
                    toast.success("MFA Required for Google Account.");
                    return;
                }

                if (result === true) {
                    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
                    const userRole = savedUser.role || role || 'farmer';

                    console.log(`[Google Login] Successful - Role: ${userRole}, Onboarded: ${savedUser.isOnboarded}`);

                    if (savedUser.isOnboarded) {
                        const targetRoute = userRole === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard';
                        console.log(`[Login] Navigating to: ${targetRoute}`);
                        navigate(targetRoute, { replace: true });
                    } else {
                        navigate('/onboarding', { replace: true });
                    }
                }
            } catch (error) {
                console.error("[Login] Google User Info Fetch Error:", error);
                toast.error('Failed to retrieve Google profile.');
            }
        },
        onError: (errorResponse) => {
            console.error("[Login] Google Login Failed:", errorResponse);
            toast.error('Google authorization failed.');
        }
    });

    const handleMfaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mfaCode) return;

        setIsSubmitting(true);
        try {
            const success = await verifyMfa(mfaIdentifier, mfaCode);
            if (success) {
                const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
                const userRole = savedUser.role || role || 'farmer';

                if (savedUser.isOnboarded) {
                    navigate(userRole === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard', { replace: true });
                } else {
                    navigate('/onboarding', { replace: true });
                }
            }
        } catch (error) {
            console.error("[Login] MFA Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-split">
            {/* Left Side: Branding */}
            <div className="login-branding">
                <div className="branding-image-container">
                    <img
                        src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200"
                        alt="Agriculture"
                        className="branding-bg"
                    />
                    <div className="branding-glass-overlay" />
                </div>

                <div className="brand-overlay">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="brand-logo-section"
                    >
                        <div className="brand-logo-wrapper">
                            <img src="/img/farmdirect-logo.jpeg" alt="FarmDirect Logo" className="brand-logo-img" />
                        </div>
                        <h1 className="brand-text-large">FarmDirect</h1>
                    </motion.div>

                    <div className="branding-content">
                        <motion.h2
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="branding-title"
                        >
                            {t('hero.title')}
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="branding-description"
                        >
                            Connect directly with producers, ensure fair prices, and experience the future of agricultural commerce.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="branding-stats"
                        >
                            <div className="stat-item">
                                <span className="stat-value">50k+</span>
                                <span className="stat-label">Farmers</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat-item">
                                <span className="stat-value">120+</span>
                                <span className="stat-label">Crops</span>
                            </div>
                            <div className="stat-divider" />
                            <div className="stat-item">
                                <span className="stat-value">Direct</span>
                                <span className="stat-label">Market</span>
                            </div>
                        </motion.div>
                    </div>
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
                                {/* Home Button */}
                                <button
                                    onClick={() => navigate('/')}
                                    className="back-to-home"
                                >
                                    <Home size={16} /> Back to Home
                                </button>

                                <div className="login-header">
                                    <h2 className="login-title">
                                        {isSignup ? t('login.create_account') : t('login.welcome_back')}
                                    </h2>
                                    <p className="login-subtitle">{t('login.select_role')}</p>
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
                                key="auth-flow"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="auth-container"
                            >
                                {showMfa ? (
                                    <div className="mfa-flow">
                                        <div className="auth-step-header">
                                            <button
                                                onClick={() => setShowMfa(false)}
                                                className="back-icon-btn"
                                            >
                                                <ArrowLeft size={20} />
                                            </button>
                                            <h2 className="auth-step-title">MFA Verification</h2>
                                        </div>

                                        <p className="auth-step-subtitle">
                                            Verification required for <strong>{mfaIdentifier}</strong>.
                                            Please enter the 6-digit code sent to your device.
                                        </p>

                                        <form onSubmit={handleMfaSubmit} className="auth-form">
                                            <div className="input-group">
                                                <div className="premium-input-wrapper">
                                                    <Lock className="input-icon" size={20} />
                                                    <input
                                                        type="text"
                                                        placeholder="Enter 6-digit code"
                                                        className="premium-input"
                                                        value={mfaCode}
                                                        onChange={(e) => setMfaCode(e.target.value)}
                                                        maxLength={6}
                                                        required
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="btn-primary"
                                                style={{ justifyContent: 'center', padding: '1rem', width: '100%', marginTop: '0.5rem' }}
                                            >
                                                {isSubmitting ? 'Verifying...' : 'Verify & Login'}
                                            </button>
                                        </form>

                                        <p className="auth-footer-text">
                                            Didn't receive code? <button type="button" className="text-btn">Resend</button>
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="auth-step-header">
                                            <button
                                                onClick={() => setStep(0)}
                                                className="back-icon-btn"
                                            >
                                                <ArrowLeft size={20} />
                                            </button>
                                            <h2 className="auth-step-title">
                                                {isSignup ? t('login.create_account') : t('login.login_btn')}
                                            </h2>
                                        </div>

                                        <p className="auth-step-subtitle">
                                            {isSignup ? t('login.signup_sub') : t('login.login_sub')} as <span className="highlight-text">{role}</span>
                                        </p>

                                        <form onSubmit={handleTraditionalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            {isSignup && (
                                                <div className="input-group">
                                                    <div className="premium-input-wrapper">
                                                        <UserIcon className="input-icon" size={20} />
                                                        <input
                                                            type="text"
                                                            placeholder={t('login.name_placeholder')}
                                                            className="premium-input"
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {isSignup && (
                                                <div className="input-group">
                                                    <div className="premium-input-wrapper">
                                                        <UserIcon className="input-icon" size={20} />
                                                        <input
                                                            className="premium-input"
                                                            type="text"
                                                            placeholder="Username"
                                                            required
                                                            value={formData.username}
                                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {isSignup && (
                                                <div className="input-group">
                                                    <div className="premium-input-wrapper">
                                                        <Phone className="input-icon" size={20} />
                                                        <input
                                                            className="premium-input"
                                                            type="tel"
                                                            placeholder={t('login.phone_placeholder') || "Phone Number"}
                                                            required
                                                            value={formData.phone}
                                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="input-group">
                                                <div className="premium-input-wrapper">
                                                    <Mail className="input-icon" size={20} />
                                                    <input
                                                        type="text"
                                                        placeholder={isSignup ? t('login.email_placeholder') : "Email or Username"}
                                                        className="premium-input"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="input-group">
                                                <div className="premium-input-wrapper">
                                                    <Lock className="input-icon" size={20} />
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder={t('login.password_placeholder')}
                                                        className="premium-input"
                                                        value={formData.password}
                                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        className="password-toggle"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                            </div>

                                            {isSignup && formData.password && (
                                                <div className="password-requirements" style={{ margin: '-0.5rem 0 0.5rem 0' }}>
                                                    <p style={{ fontSize: '0.8rem', color: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password) ? '#4CAF50' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                                                        {t('login.password_requirement')}
                                                    </p>
                                                </div>
                                            )}

                                            {!isSignup && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '-0.5rem 0 0.5rem 0' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={rememberMe}
                                                            onChange={(e) => setRememberMe(e.target.checked)}
                                                            style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                                                        />
                                                        Remember for 7 days
                                                    </label>
                                                    <button type="button" style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>
                                                        Forgot Password?
                                                    </button>
                                                </div>
                                            )}

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
                                                className="google-login-btn"
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
                                    </>
                                )}
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
