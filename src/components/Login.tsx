import { GoogleLogin } from '@react-oauth/google';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Sprout } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { role, setRole, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const isSignup = location.pathname === '/signup';

    // 0: Select Role, 1: Google Flow
    const [step, setStep] = useState(0);

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


    const handleFinishLogin = (credentialResponse: any) => {
        // Decode the JWT token to get real user info
        const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));

        const realUser = {
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
            token: credentialResponse.credential
        };

        login(realUser);

        // Check if user is onboarded
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (savedUser.isOnboarded) {
            navigate(savedUser.role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard');
        } else {
            navigate('/onboarding');
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
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 600, maxWidth: '500px' }}>Direct from Farm to Table.</h2>
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
                                    {isSignup ? 'Create Account' : 'Welcome Back'}
                                </h2>
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '3rem' }}>Select your role to continue</p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                                    <div
                                        onClick={() => handleSelectRole('farmer')}
                                        style={{ padding: '1.5rem', borderRadius: '16px', border: `2px solid ${role === 'farmer' ? 'var(--primary)' : 'var(--border)'}`, background: role === 'farmer' ? 'rgba(76, 175, 80, 0.1)' : 'transparent', cursor: 'pointer', textAlign: 'center' }}
                                    >
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👨‍🌾</div>
                                        <div style={{ fontWeight: 600 }}>Farmer</div>
                                    </div>
                                    <div
                                        onClick={() => handleSelectRole('buyer')}
                                        style={{ padding: '1.5rem', borderRadius: '16px', border: `2px solid ${role === 'buyer' ? 'var(--primary)' : 'var(--border)'}`, background: role === 'buyer' ? 'rgba(76, 175, 80, 0.1)' : 'transparent', cursor: 'pointer', textAlign: 'center' }}
                                    >
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛒</div>
                                        <div style={{ fontWeight: 600 }}>Buyer</div>
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
                                    <ArrowLeft size={16} /> Back to roles
                                </button>

                                <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
                                    {role === 'farmer' ? 'Farmer' : 'Buyer'} {isSignup ? 'Registration' : 'Login'}
                                </h2>

                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '3rem' }}>
                                    Continue with your Google account as a {role}
                                </p>

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
                        {isSignup ? 'Already have an account?' : "Don't have an account?"}
                        <Link to={isSignup ? '/login' : '/signup'} style={{ color: 'var(--primary)', marginLeft: '10px', textDecoration: 'none', fontWeight: 600 }}>
                            {isSignup ? 'Log in' : 'Sign up'}
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
