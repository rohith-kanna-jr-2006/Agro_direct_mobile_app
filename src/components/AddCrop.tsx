import { AnimatePresence, motion } from 'framer-motion';
import { Camera, LayoutDashboard, Scale, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface AddCropProps {
    onBack: () => void;
    onSuccess: () => void;
}

const AddCrop = ({ onBack, onSuccess }: AddCropProps) => {
    const [step, setStep] = useState(1);
    const [cropData, setCropData] = useState({
        type: '',
        variety: '',
        quantity: '',
        unit: 'kg',
        harvestDate: '',
        quality: null as string | null,
    });
    const [isScanning, setIsScanning] = useState(false);

    const handleNext = () => setStep(step + 1);
    const handleBack = () => step === 1 ? onBack() : setStep(step - 1);

    const simulateScanning = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            setCropData({ ...cropData, quality: 'Grade A+' });
            setStep(3);
            toast.success("AI Analysis Complete: Grade A+ Quality!");
        }, 3000);
    };

    const handleSubmit = () => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 2000)),
            {
                loading: 'Publishing listing...',
                success: 'Crop listed successfully!',
                error: 'Failed to list crop.',
            }
        );
        setTimeout(onSuccess, 2100);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={handleBack}
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                    <LayoutDashboard size={20} />
                </button>
                <div>
                    <h2 style={{ fontSize: '1.8rem' }}>List New Crop</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Step {step} of 3: {step === 1 ? 'Details' : step === 2 ? 'AI Grading' : 'Confirm Listing'}</p>
                </div>
            </div>

            {/* Steps Progress */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '3rem' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ flex: 1, height: '4px', background: i <= step ? 'var(--primary)' : 'var(--border)', borderRadius: '2px' }}></div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="premium-card"
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Crop Type</label>
                                <select
                                    style={{ width: '100%', padding: '1rem', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--border)', color: 'white' }}
                                    value={cropData.type}
                                    onChange={(e) => setCropData({ ...cropData, type: e.target.value })}
                                >
                                    <option value="">Select Crop</option>
                                    <option value="onion">Red Onion</option>
                                    <option value="wheat">Durum Wheat</option>
                                    <option value="corn">Hybrid Corn</option>
                                    <option value="tomato">Organic Tomato</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Quantity</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="number"
                                        placeholder="500"
                                        style={{ width: '100%', padding: '1rem', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--border)', color: 'white' }}
                                        value={cropData.quantity}
                                        onChange={(e) => setCropData({ ...cropData, quantity: e.target.value })}
                                    />
                                    <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>kg</span>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Harvest Date</label>
                                <input
                                    type="date"
                                    style={{ width: '100%', padding: '1rem', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--border)', color: 'white' }}
                                    value={cropData.harvestDate}
                                    onChange={(e) => setCropData({ ...cropData, harvestDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            disabled={!cropData.type || !cropData.quantity}
                            onClick={handleNext}
                            className="btn-primary"
                            style={{ width: '100%', marginTop: '2rem', justifyContent: 'center', opacity: (!cropData.type || !cropData.quantity) ? 0.5 : 1 }}
                        >
                            Continue to AI Grading
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="premium-card"
                        style={{ textAlign: 'center' }}
                    >
                        <div style={{
                            width: '100%',
                            aspectRatio: '16/9',
                            background: '#000',
                            borderRadius: '16px',
                            marginBottom: '2rem',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {isScanning ? (
                                <>
                                    <motion.div
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'var(--primary)', boxShadow: '0 0 15px var(--primary)', zIndex: 2 }}
                                    />
                                    <img
                                        src="https://images.unsplash.com/photo-1518977676601-b53f02bad67b?auto=format&fit=crop&q=80&w=800"
                                        alt="Crops"
                                        style={{ opacity: 0.5, width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{ position: 'absolute', color: 'white', zIndex: 3 }}>
                                        <Camera className="animate-pulse" size={48} />
                                        <div style={{ marginTop: '1rem', fontWeight: 600 }}>Analyzing Texture & Color...</div>
                                    </div>
                                </>
                            ) : (
                                <div style={{ color: 'var(--text-muted)' }}>
                                    <Camera size={64} style={{ marginBottom: '1rem' }} />
                                    <p>Camera ready for AI Analysis</p>
                                </div>
                            )}
                        </div>

                        {!isScanning && (
                            <button onClick={simulateScanning} className="btn-primary" style={{ width: '100%', justifyContent: 'center', gap: '1rem' }}>
                                <Camera size={24} />
                                Start AI Verification
                            </button>
                        )}
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="premium-card" style={{ gridColumn: 'span 2', border: '1px solid var(--primary)', background: 'rgba(76, 175, 80, 0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.5rem' }}>Quality Result: {cropData.quality}</h3>
                                        <p style={{ color: 'var(--text-muted)' }}>High premium grade expected for this harvest.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="premium-card">
                                <TrendingUp style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                                <h4 style={{ color: 'var(--text-muted)' }}>Suggested Price</h4>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>₹28.5 / kg</div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>+15% above market average</p>
                            </div>

                            <div className="premium-card">
                                <Scale style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                                <h4 style={{ color: 'var(--text-muted)' }}>Commission Fee</h4>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>2.5%</div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lowest in the industry</p>
                            </div>
                        </div>

                        <button onClick={handleSubmit} className="btn-primary" style={{ width: '100%', marginTop: '2rem', height: '60px', fontSize: '1.2rem', justifyContent: 'center' }}>
                            List Crop to Marketplace
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddCrop;
