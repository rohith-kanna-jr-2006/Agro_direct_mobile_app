import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Onboarding = () => {
    const { user, role, completeOnboarding } = useAuth();
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const hasNavigated = useRef(false);

    const [formData, setFormData] = useState({
        username: '',
        phone: '',
        password: '',
        confirmPassword: '',
        otp: '', // Kept for type stability, unused
        location: '',
        acres: '',
        crops: [] as string[],
        businessName: '',
        buyerType: 'household' as 'household' | 'retailer' | 'hotel',
        preferences: [] as string[]
    });

    const [usernameError, setUsernameError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);

    // Pre-fill from user object if available
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                phone: (user.phone && user.phone !== '0000000000') ? user.phone : prev.phone,
                username: user.username || prev.username
            }));
        }
    }, [user]);

    // Redirect if already onboarded (only once)
    useEffect(() => {
        if (user?.isOnboarded && !hasNavigated.current) {
            console.log('[Onboarding] User already onboarded, redirecting to dashboard');
            hasNavigated.current = true;
            navigate(role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard', { replace: true });
        }
    }, [user?.isOnboarded, role, navigate]);

    const validateUsername = (username: string) => {
        if (username.length < 4) return "Minimum 4 characters required";
        if (!/[a-z]/.test(username)) return "Must include a lowercase letter";
        if (!/[A-Z]/.test(username)) return "Must include an uppercase letter";
        if (!/[0-9]/.test(username)) return "Must include a number";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(username)) return "Must include a special character";
        return "";
    };

    const validatePassword = (pass: string) => {
        if (!pass) return "Password is required";
        if (pass.length < 8) return "Password must be at least 8 characters";
        if (!/[a-z]/.test(pass)) return "Password must include a lowercase letter";
        if (!/[A-Z]/.test(pass)) return "Password must include an uppercase letter";
        if (!/[0-9]/.test(pass)) return "Password must include a number";
        if (!/[@$!%*?&]/.test(pass)) return "Password must include a special character (@, $, !, %, *, ?, &)";
        if (/\s/.test(pass)) return "Password cannot contain whitespace";
        return "";
    };

    const handleNext = async () => {
        // Step 1: Username & Phone Information (Common for all roles)
        if (step === 1) {
            const error = validateUsername(formData.username);
            if (error) {
                setUsernameError(error);
                toast.error(error);
                return;
            }

            try {
                const checkRes = await authAPI.checkUsername(formData.username);
                if (!checkRes.data.available && formData.username !== user?.username) {
                    setUsernameError("Username is already taken");
                    toast.error("Username is already taken");
                    return;
                }
            } catch (err) {
                console.error("Username check failed", err);
            }

            if (formData.phone.length < 10) {
                toast.error("Please enter a valid phone number");
                return;
            }

            const passError = validatePassword(formData.password);
            if (passError) {
                toast.error(passError);
                return;
            }

            // Strict case-sensitive password match validation
            if (formData.password !== formData.confirmPassword) {
                toast.error("Passwords do not match. Please ensure both passwords are exactly the same (case-sensitive).");
                return;
            }

            // Additional check: Ensure passwords are identical character by character
            if (formData.password.length !== formData.confirmPassword.length) {
                toast.error("Password length mismatch. Please re-enter your passwords.");
                return;
            }

            setUsernameError('');
            setStep(step + 1);
            return;
        }

        // Subsequent Steps
        if (step < 3) {
            setStep(step + 1);
        } else {
            submitProfile();
        }
    };

    const submitProfile = async () => {
        try {
            await completeOnboarding(formData);
            toast.success("Profile Setup Complete!");
            navigate(role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard');
        } catch (error) {
            toast.error("Failed to save profile. Please try again.");
            console.error(error);
        }
    }

    const handleCropToggle = (crop: string) => {
        if (formData.crops.includes(crop)) {
            setFormData({ ...formData, crops: formData.crops.filter(c => c !== crop) });
        } else {
            setFormData({ ...formData, crops: [...formData.crops, crop] });
        }
    };

    const renderFarmerSteps = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h3>Step 1: Account Setup</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Set your unique username and confirm your contact details.</p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
                            <input
                                type="text"
                                placeholder="e.g. FarmerJohn_24"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    background: 'var(--background)',
                                    border: `1px solid ${usernameError ? '#ff4444' : 'var(--border)'}`,
                                    color: 'white'
                                }}
                                value={formData.username}
                                onChange={(e) => {
                                    setFormData({ ...formData, username: e.target.value });
                                    setUsernameError('');
                                }}
                            />
                            {usernameError && <p style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '0.3rem' }}>{usernameError}</p>}
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                                4+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        required
                                        style={{ width: '100%', padding: '0.8rem', paddingRight: '2.5rem', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--border)', color: 'white' }}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        required
                                        style={{ width: '100%', padding: '0.8rem', paddingRight: '2.5rem', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--border)', color: 'white' }}
                                        value={formData.confirmPassword}
                                        onChange={(e) => {
                                            const newConfirmPassword = e.target.value;
                                            setFormData({ ...formData, confirmPassword: newConfirmPassword });
                                            // Real-time password match check (strict and case-sensitive)
                                            if (formData.password && newConfirmPassword) {
                                                setPasswordsMatch(formData.password === newConfirmPassword);
                                            } else {
                                                setPasswordsMatch(null);
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {formData.confirmPassword && (
                                    <p style={{
                                        color: passwordsMatch ? '#4CAF50' : '#ff4444',
                                        fontSize: '0.75rem',
                                        marginTop: '0.3rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        {passwordsMatch ? '✅ Passwords match' : '❌ Passwords do not match (case-sensitive)'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone Number</label>
                            <input
                                type="text"
                                placeholder="Insert 10 digits"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--border)', color: 'white' }}
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={handleNext}>Next Step <ArrowRight size={18} /></button>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h3>Step 2: Farm Details</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Tell us about your farm location and size.</p>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Location / Village</label>
                            <input
                                type="text"
                                placeholder="Enter village or district"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--border)', color: 'white' }}
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Total Farm Area (Acres)</label>
                            <input
                                type="number"
                                placeholder="e.g. 5"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--border)', color: 'white' }}
                                value={formData.acres}
                                onChange={(e) => setFormData({ ...formData, acres: e.target.value })}
                            />
                        </div>
                        <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={handleNext}>Next Step <ArrowRight size={18} /></button>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h3>Step 3: Crop Selection</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>What do you grow on your farm?</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                            {['Tomato', 'Potato', 'Onion', 'Rice', 'Wheat', 'Corn'].map(crop => (
                                <div
                                    key={crop}
                                    onClick={() => handleCropToggle(crop)}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: `1px solid ${formData.crops.includes(crop) ? 'var(--primary)' : 'var(--border)'}`,
                                        background: formData.crops.includes(crop) ? 'rgba(76, 175, 80, 0.1)' : 'var(--background)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <span>{crop}</span>
                                    {formData.crops.includes(crop) && <CheckCircle2 size={16} color="var(--primary)" />}
                                </div>
                            ))}
                        </div>
                        <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={handleNext}>Complete Setup <CheckCircle2 size={18} /></button>
                    </motion.div>
                );
        }
    };

    const renderBuyerSteps = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h3>Step 1: Account Setup</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your unique username and contact details.</p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
                            <input
                                type="text"
                                placeholder="e.g. BuyerJane_99"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    background: 'var(--background)',
                                    border: `1px solid ${usernameError ? '#ff4444' : 'var(--border)'}`,
                                    color: 'white'
                                }}
                                value={formData.username}
                                onChange={(e) => {
                                    setFormData({ ...formData, username: e.target.value });
                                    setUsernameError('');
                                }}
                            />
                            {usernameError && <p style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '0.3rem' }}>{usernameError}</p>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        required
                                        style={{ width: '100%', padding: '0.8rem', paddingRight: '2.5rem', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--border)', color: 'white' }}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        required
                                        style={{ width: '100%', padding: '0.8rem', paddingRight: '2.5rem', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--border)', color: 'white' }}
                                        value={formData.confirmPassword}
                                        onChange={(e) => {
                                            const newConfirmPassword = e.target.value;
                                            setFormData({ ...formData, confirmPassword: newConfirmPassword });
                                            // Real-time password match check (strict and case-sensitive)
                                            if (formData.password && newConfirmPassword) {
                                                setPasswordsMatch(formData.password === newConfirmPassword);
                                            } else {
                                                setPasswordsMatch(null);
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {formData.confirmPassword && (
                                    <p style={{
                                        color: passwordsMatch ? '#4CAF50' : '#ff4444',
                                        fontSize: '0.75rem',
                                        marginTop: '0.3rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        {passwordsMatch ? '✅ Passwords match' : '❌ Passwords do not match (case-sensitive)'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone Number</label>
                            <input
                                type="tel"
                                placeholder="Contact Number"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--border)', color: 'white' }}
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={handleNext}>Next Step <ArrowRight size={18} /></button>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h3>Step 2: Delivery Details</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Where should we deliver the produce?</p>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Full Address</label>
                            <textarea
                                placeholder="Enter your street and area details"
                                rows={3}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--border)', color: 'white', resize: 'none' }}
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={handleNext}>Next Step <ArrowRight size={18} /></button>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h3>Step 3: Purchasing Preferences</h3>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Buyer Entity Type</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                {[
                                    { id: 'household', label: 'Household', icon: '🏠' },
                                    { id: 'retailer', label: 'Retailer', icon: '🏪' },
                                    { id: 'hotel', label: 'Hotel', icon: '🏨' }
                                ].map(type => (
                                    <div
                                        key={type.id}
                                        onClick={() => setFormData({ ...formData, buyerType: type.id as any })}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            border: `1px solid ${formData.buyerType === type.id ? 'var(--primary)' : 'var(--border)'}`,
                                            background: formData.buyerType === type.id ? 'rgba(76, 175, 80, 0.1)' : 'var(--background)',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{type.icon}</div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{type.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {formData.buyerType !== 'household' && (
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>{formData.buyerType === 'hotel' ? 'Hotel/Restaurant Name' : 'Business/Shop Name'}</label>
                                <input
                                    type="text"
                                    placeholder={formData.buyerType === 'hotel' ? "e.g. Grand Plaza Hotel" : "e.g. Fresh Mart Retail"}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--border)', color: 'white' }}
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                />
                            </div>
                        )}

                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>What produce do you buy regularly?</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                            {['Vegetables', 'Fruits', 'Grains', 'Organic Only', 'Bulk Deals', 'Daily Fresh'].map(pref => (
                                <div
                                    key={pref}
                                    onClick={() => {
                                        const newPrefs = formData.preferences.includes(pref)
                                            ? formData.preferences.filter(p => p !== pref)
                                            : [...formData.preferences, pref];
                                        setFormData({ ...formData, preferences: newPrefs });
                                    }}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: `1px solid ${formData.preferences.includes(pref) ? 'var(--primary)' : 'var(--border)'}`,
                                        background: formData.preferences.includes(pref) ? 'rgba(76, 175, 80, 0.1)' : 'var(--background)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <span>{pref}</span>
                                    {formData.preferences.includes(pref) && <CheckCircle2 size={16} color="var(--primary)" />}
                                </div>
                            ))}
                        </div>
                        <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={handleNext}>Complete Registration <CheckCircle2 size={18} /></button>
                    </motion.div>
                );
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', padding: '2rem' }}>
            <div className="premium-card" style={{ width: '100%', maxWidth: '600px', padding: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Onboarding</span>
                        <h2 style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>Welcome, {user?.name?.split(' ')[0] || 'User'}!</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: i <= step ? 'var(--primary)' : 'var(--border)',
                                transition: 'all 0.3s ease'
                            }} />
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {role === 'farmer' ? renderFarmerSteps() : renderBuyerSteps()}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Onboarding;
