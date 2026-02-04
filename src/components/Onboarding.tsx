import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import { authAPI } from '../services/api'; // Not needed since no OTP

const Onboarding = () => {
    const { user, role, completeOnboarding } = useAuth();
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        phone: '',
        otp: '', // Kept for type stability, unused
        location: '',
        acres: '',
        crops: [] as string[],
        businessName: '',
        preferences: [] as string[]
    });

    // Pre-fill phone from user object if available
    useEffect(() => {
        if (user?.phone && user.phone !== '0000000000') {
            setFormData(prev => ({ ...prev, phone: user.phone || '' }));
        }
    }, [user]);

    const handleNext = async () => {
        // Step 1: Phone Information (Common for all roles)
        if (step === 1) {
            if (formData.phone.length < 10) {
                toast.error("Please enter a valid phone number");
                return;
            }
            // Proceed without OTP
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
                        <h3>Step 1: Contact Information</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Confirm your mobile number for secure transactions.</p>
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
                        <h3>Step 1: Identity & Contact</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your Personal name or contact details.</p>

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
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>What produce do you buy regularly?</p>
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
