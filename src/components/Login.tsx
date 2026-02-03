import { GoogleLogin } from '@react-oauth/google';
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
        if ((roleParam === 'farmer' || roleParam === 'buyer') && role !== roleParam) {
            console.log("Login: Setting role from URL param:", roleParam);
            setRole(roleParam as 'farmer' | 'buyer');
            setStep(1);
        }
    }, [searchParams, role, setRole]);

    const handleSelectRole = (selectedRole: 'farmer' | 'buyer') => {
        setRole(selectedRole);
        setStep(1);
    };


    const handleFinishLogin = async (credentialResponse: any) => {
        // Decode the JWT token to get real user info
        const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));

        const realUser = {
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
            sub: payload.sub,
            token: credentialResponse.credential
        };

        const success = await login(realUser, isSignup ? 'signup' : 'login');

        if (success) {
            const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (savedUser.isOnboarded) {
                navigate(savedUser.role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard');
            } else {
                navigate('/onboarding');
            }
        }
    };

    const handleTraditionalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (isSignup) {
                // Scenario A: New User Registration (Sign Up)
                const success = await register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone
                });

                if (success) {
                    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
                    navigate(savedUser.role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard');
                }
            } else {
                // Scenario B: Existing User Login
                const success = await traditionalLogin({
                    email: formData.email,
                    password: formData.password
                });

                if (success) {
                    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
                    navigate(savedUser.role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard');
                }
            }
        } catch (error: any) {
            // Requirement: Show how to catch the 409 error and display specific alert
            if (error.response && error.response.status === 409) {
                toast.error("Already registered email, signup with another email id");
            } else {
                toast.error(error.response?.data?.error || "Authentication failed");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            {/* Left Side: Branding */}
            <div style={{ flex: 1, position: 'relative' }} className="login-image-side">
                <img
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200"
                    alt="Agriculture"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.8))', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <Sprout size={48} color="var(--primary)" />
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 800 }}>FarmDirect</h1>
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 600, maxWidth: '500px' }}>{t('hero.title')}</h2>
                </div>
            </div>

            {/* Right Side: Flow */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="premium-card" style={{ width: '100%', maxWidth: '450px', padding: '3rem' }}>

                    <AnimatePresence mode="wait">
                        {step === 0 ? (
                            <motion.div
                                key="step0"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
                                    {isSignup ? t('login.create_account') : t('login.welcome_back')}
                                </h2>
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '3rem' }}>{t('login.select_role')}</p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                                    <div
                                        onClick={() => handleSelectRole('farmer')}
                                        style={{ padding: '1.5rem', borderRadius: '16px', border: `2px solid ${role === 'farmer' ? 'var(--primary)' : 'var(--border)'}`, background: role === 'farmer' ? 'rgba(76, 175, 80, 0.1)' : 'transparent', cursor: 'pointer', textAlign: 'center' }}
                                    >
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👨‍🌾</div>
                                        <div style={{ fontWeight: 600 }}>{t('login.farmer')}</div>
                                    </div>
                                    <div
                                        onClick={() => handleSelectRole('buyer')}
                                        style={{ padding: '1.5rem', borderRadius: '16px', border: `2px solid ${role === 'buyer' ? 'var(--primary)' : 'var(--border)'}`, background: role === 'buyer' ? 'rgba(76, 175, 80, 0.1)' : 'transparent', cursor: 'pointer', textAlign: 'center' }}
                                    >
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛒</div>
                                        <div style={{ fontWeight: 600 }}>{t('login.buyer')}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <button
                                    onClick={() => setStep(0)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: 0 }}
                                >
                                    <ArrowLeft size={16} /> {t('login.back_to_roles')}
                                </button>

                                <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
                                    {role === 'farmer' ? t('login.farmer') : t('login.buyer')} {isSignup ? t('login.registration') : t('login.login_title')}
                                </h2>

                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '3rem' }}>
                                    {t('login.continue_google')} {role === 'farmer' ? t('login.farmer') : t('login.buyer')}
                                </p>

                                <form onSubmit={handleTraditionalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                                    {isSignup && (
                                        <div className="input-group">
                                            <div style={{ position: 'relative' }}>
                                                <UserIcon size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                <input
                                                    type="text"
                                                    placeholder={t('login.name_placeholder') || "Name"}
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text)' }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {isSignup && (
                                        <div className="input-group">
                                            <div style={{ position: 'relative' }}>
                                                <Phone size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                <input
                                                    type="tel"
                                                    placeholder={t('login.phone_placeholder') || "Phone Number"}
                                                    required
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text)' }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="input-group">
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input
                                                type="email"
                                                placeholder={t('login.email_placeholder') || "Email"}
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text)' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <div style={{ position: 'relative' }}>
                                            <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input
                                                type="password"
                                                placeholder={t('login.password_placeholder') || "Password"}
                                                required
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text)' }}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s ease', opacity: isSubmitting ? 0.7 : 1 }}
                                    >
                                        {isSubmitting ? (isSignup ? 'Creating Account...' : 'Logging In...') : (isSignup ? 'Create Account' : 'Login')}
                                    </button>
                                </form>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0', color: 'var(--text-muted)' }}>
                                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                                    <span style={{ fontSize: '0.875rem' }}>OR</span>
                                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <GoogleLogin
                                        onSuccess={handleFinishLogin}
                                        onError={() => toast.error('Google login failed')}
                                        useOneTap
                                        theme="outline"
                                        size="large"
                                        width="100%"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {isSignup ? t('login.already_have_account') : t('login.dont_have_account')}
                        <Link to={isSignup ? '/login' : '/signup'} style={{ color: 'var(--primary)', marginLeft: '10px', textDecoration: 'none', fontWeight: 600 }}>
                            {isSignup ? t('login.login_btn') : t('login.signup_btn')}
                        </Link>
                    </p>
                </div>
            </div>


            <style>{`
                @media (max-width: 768px) { .login-image-side { display: none !important; } }
            `}</style>
        </div>
    );
};

export default Login;
