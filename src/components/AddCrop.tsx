import { AnimatePresence, motion } from 'framer-motion';
import {
    Camera,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    MapPin,
    Mic,
    Navigation,
    Package,
    Rocket,
    ShieldCheck,
    TrendingUp,
    Truck
} from 'lucide-react';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { productAPI } from '../services/api';

interface AddCropProps {
    onBack: () => void;
    onSuccess: () => void;
    productToEdit?: any;
}

const MOCK_CROPS = [
    { id: '1', name: 'Tomato', image: 'https://img.icons8.com/color/96/tomato.png', marketPrice: 20 },
    { id: '2', name: 'Potato', image: 'https://img.icons8.com/color/96/potato.png', marketPrice: 15 },
    { id: '3', name: 'Onion', image: 'https://img.icons8.com/color/96/onion.png', marketPrice: 30 },
    { id: '4', name: 'Rice', image: 'https://img.icons8.com/color/96/rice-bowl.png', marketPrice: 50 },
    { id: '5', name: 'Wheat', image: 'https://img.icons8.com/color/96/wheat.png', marketPrice: 40 },
    { id: '6', name: 'Carrot', image: 'https://img.icons8.com/color/96/carrot.png', marketPrice: 35 },
    { id: '7', name: 'Egg', image: 'https://img.icons8.com/color/96/egg.png', marketPrice: 8 },
];

const AddCrop = ({ onBack, onSuccess, productToEdit }: AddCropProps) => {
    const { user } = useAuth();
    const [step, setStep] = useState(productToEdit ? 5 : 1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [crop, setCrop] = useState<any>(productToEdit ? MOCK_CROPS.find(c => c.name === productToEdit.name) || { name: productToEdit.name, image: productToEdit.image } : null);
    const [image, setImage] = useState<string | null>(productToEdit?.image || null);
    const [quality, setQuality] = useState<string | null>(productToEdit?.quality || null);
    const [quantity, setQuantity] = useState(productToEdit?.quantity?.split(' ')[0] || '50');
    const [unit, setUnit] = useState(productToEdit?.quantity?.split(' ')[1] || 'KG');
    const [price, setPrice] = useState(productToEdit?.price?.replace(/[^0-9]/g, '') || '');
    const [locationText, setLocationText] = useState(productToEdit?.farmerAddress || '');
    const [deliveryType, setDeliveryType] = useState(productToEdit?.deliveryType || 'FARM_PICKUP');

    // Simulation States
    const [isListening, setIsListening] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Audio context for haptic-like sound
    const audioCtx = useRef<AudioContext | null>(null);

    const playHapticSound = (frequency = 440, type: OscillatorType = 'sine', duration = 0.1) => {
        if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.current.createOscillator();
        const gain = audioCtx.current.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, audioCtx.current.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.current.destination);
        osc.start();
        osc.stop(audioCtx.current.currentTime + duration);
    };

    const handleNext = () => {
        playHapticSound(523.25, 'sine'); // Do
        setStep(step + 1);
    };
    const handleBack = () => {
        playHapticSound(392, 'sine'); // So
        if (step === 1) onBack(); else setStep(step - 1);
    };

    // Step 1: Voice Logic
    const toggleVoice = () => {
        setIsListening(true);
        playHapticSound(880, 'square', 0.1);

        // Mock Voice Logic
        setTimeout(() => {
            setIsListening(false);
            setCrop(MOCK_CROPS[0]); // Simulate "Tomato" detected
            toast.success("Crop Recognized: Tomato", { icon: '🍅' });
            playHapticSound(659.25, 'sine', 0.2); // Mi
        }, 2000);
    };

    // Step 2: Camera Logic
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setCameraStream(stream);
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            toast.error("Camera access denied");
            // Simulation fallback
            setImage("https://images.unsplash.com/photo-1518977676601-b53f02bad67b?auto=format&fit=crop&q=80&w=800");
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    const capturePhoto = () => {
        runAIAnalysis();
    };

    const runAIAnalysis = () => {
        setIsAnalyzing(true);
        playHapticSound(1000, 'square', 0.05);

        setTimeout(() => {
            setIsAnalyzing(false);
            setQuality('Grade A');
            stopCamera();
            // Pricing logic
            if (crop) setPrice((crop.marketPrice - 2).toString());
            toast.success("AI Quality Grade: A", { icon: '✨' });
            playHapticSound(659.25, 'sine', 0.2);
        }, 2000);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
                runAIAnalysis();
            };
            reader.readAsDataURL(file);
        }
    };

    // Step 4: Geolocation
    const fetchLocation = () => {
        setLoading(true);
        playHapticSound(440, 'triangle');

        if (!navigator.geolocation) {
            setTimeout(() => {
                setLocationText("Village: Melur, Dist: Madurai");
                setLoading(false);
            }, 1500);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                console.log(pos);
                setTimeout(() => {
                    setLocationText("Village: Melur, Dist: Madurai");
                    setLoading(false);
                    toast.success("Location Sync Complete");
                    playHapticSound(523.25, 'sine');
                }, 1500);
            },
            () => {
                setTimeout(() => {
                    setLocationText("Village: Melur, Dist: Madurai");
                    setLoading(false);
                }, 1500);
            }
        );
    };

    // Step 5: Submit
    const handleSubmit = async () => {
        setLoading(true);

        // const village = locationText.split(',')[0] || "Local Village"; // Removed unused variable

        const productData = {
            name: crop.name,
            price: `₹${price}/${unit}`,
            img: image || crop.image, // Map to schema 'img'
            farm: user?.name || "Ramesh Farm", // Set farm name for buyer view
            dist: "Local", // Simple default or calculate from location
            grade: quality?.split(' ')[1] || "A", // Map 'Grade A' to 'A'
            category: crop.category || "vegetables",
            farmerName: user?.name || "Ramesh Farm",
            farmerContact: user?.email || "+91 98765 43210",
            farmerAddress: locationText || "Coimbatore, TN",
            userId: user?.email || user?.userId, // Added for reliable filtering
            quality: quality,
            quantity: `${quantity} ${unit}`,
            deliveryType: deliveryType,
            rating: '5.0'
        };

        console.log("Submitting Product Data:", productData);
        console.log("Current User in AddCrop:", user);

        try {
            if (productToEdit) {
                await productAPI.update(productToEdit._id, productData);
                toast.success("Product Updated!", {
                    icon: '✅',
                    duration: 4000,
                    style: { background: 'var(--primary)', color: 'white' }
                });
            } else {
                await productAPI.create(productData);
                toast.success("Product is now LIVE!", {
                    icon: '🚀',
                    duration: 4000,
                    style: { background: 'var(--primary)', color: 'white' }
                });
            }
            playHapticSound(880, 'sine', 0.5);
            onSuccess();
        } catch (e) {
            toast.error(productToEdit ? "Failed to update product" : "Failed to list product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', color: 'white' }}>
            {/* Nav & Progress */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <button
                    onClick={handleBack}
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', padding: '0.8rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ChevronLeft size={20} />
                    <span>{step === 1 ? 'Cancel' : 'Back'}</span>
                </button>

                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Add New Crop</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Step {step} of 5</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '3rem' }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <motion.div
                        key={i}
                        initial={false}
                        animate={{ background: i <= step ? 'var(--primary)' : 'var(--border)' }}
                        style={{ flex: 1, height: '4px', borderRadius: '2px' }}
                    />
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* STEP 1: CROP SELECT */}
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>What are you selling today?</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Search by voice or select from the list below</p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleVoice}
                                style={{
                                    width: '100px', height: '100px', borderRadius: '50%', background: isListening ? '#ff4b2b' : 'var(--primary)',
                                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: isListening ? '0 0 30px rgba(255, 75, 43, 0.5)' : '0 0 20px rgba(76, 175, 80, 0.3)'
                                }}
                            >
                                {isListening ? (
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    >
                                        <Mic size={40} color="white" />
                                    </motion.div>
                                ) : <Mic size={40} color="white" />}
                            </motion.button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1.5rem' }}>
                            {MOCK_CROPS.map(c => (
                                <motion.div
                                    key={c.id}
                                    whileHover={{ y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setCrop(c)}
                                    style={{
                                        padding: '1.5rem', borderRadius: '16px', background: 'var(--surface)', border: crop?.id === c.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease',
                                        boxShadow: crop?.id === c.id ? '0 10px 20px rgba(76, 175, 80, 0.1)' : 'none'
                                    }}
                                >
                                    <img src={c.image} alt={c.name} style={{ width: '60px', height: '60px', marginBottom: '1rem' }} />
                                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                                </motion.div>
                            ))}
                        </div>

                        {crop && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={handleNext}
                                className="btn-primary"
                                style={{ width: '100%', marginTop: '3rem', height: '60px', fontSize: '1.2rem', justifyContent: 'center', gap: '1rem' }}
                            >
                                <span>Continue to Quality Scan</span>
                                <ChevronRight size={24} />
                            </motion.button>
                        )}
                    </motion.div>
                )}

                {/* STEP 2: QUALITY SCAN */}
                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>AI Quality Grading</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Scan your {crop?.name} for instant certification</p>
                        </div>

                        <div style={{
                            width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '24px', overflow: 'hidden', position: 'relative',
                            border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', marginBottom: '2rem'
                        }}>
                            {/* Scanning Overlay */}
                            {isAnalyzing && (
                                <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
                                    <motion.div
                                        animate={{ y: [-100, 300] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                        style={{ position: 'absolute', left: 0, right: 0, height: '4px', background: 'var(--primary)', boxShadow: '0 0 20px var(--primary)', opacity: 0.8 }}
                                    />
                                    <div style={{ textAlign: 'center' }}>
                                        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 1.5rem' }}></div>
                                        <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Analyzing Produce...</p>
                                    </div>
                                </div>
                            )}

                            {quality ? (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                        style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '20px', border: '2px solid var(--primary)', textAlign: 'center' }}
                                    >
                                        <ShieldCheck size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)' }}>{quality}</div>
                                        <div style={{ color: 'var(--text-muted)' }}>Certified High Quality</div>
                                    </motion.div>
                                </div>
                            ) : (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    {!cameraStream && (
                                        <button onClick={startCamera} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '1rem 2rem', borderRadius: '12px', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
                                            Enable Camera
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
                            <button
                                onClick={handleBack}
                                style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Back
                            </button>
                            {!quality ? (
                                <div style={{ flex: 2, display: 'flex', gap: '1rem' }}>
                                    <button onClick={capturePhoto} disabled={isAnalyzing} className="btn-primary" style={{ flex: 1, justifyContent: 'center', height: '60px', opacity: isAnalyzing ? 0.7 : 1 }}>
                                        <Camera size={24} style={{ marginRight: '1rem' }} />
                                        <span>{isAnalyzing ? 'Processing...' : 'Start Scan'}</span>
                                    </button>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isAnalyzing}
                                        style={{
                                            flex: 1, background: 'var(--surface)', border: '1px solid var(--border)',
                                            color: 'white', borderRadius: '12px', cursor: 'pointer', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
                                            fontWeight: 600, transition: 'all 0.2s'
                                        }}
                                    >
                                        <ImageIcon size={20} />
                                        <span>Import Image</span>
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                            ) : (
                                <button onClick={handleNext} className="btn-primary" style={{ flex: 2, justifyContent: 'center', height: '60px' }}>
                                    <span>Next: Pricing & Quantity</span>
                                    <ChevronRight size={24} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: ECONOMICS */}
                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Quantity & Price</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Maximize your earnings with AI-driven pricing</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                            <div>
                                <div className="premium-card" style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '1rem' }}>Available Quantity</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <button
                                            onClick={() => setQuantity((Math.max(0, parseInt(quantity) - 10)).toString())}
                                            style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--background)', border: '1px solid var(--border)', color: 'white', cursor: 'pointer' }}
                                        >-</button>
                                        <div style={{ flex: 1, position: 'relative' }}>
                                            <input
                                                type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
                                                style={{ width: '100%', background: 'var(--background)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '12px', color: 'white', fontSize: '1.5rem', textAlign: 'center' }}
                                            />
                                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{unit}</span>
                                        </div>
                                        <button
                                            onClick={() => setQuantity((parseInt(quantity) + 10).toString())}
                                            style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--background)', border: '1px solid var(--border)', color: 'white', cursor: 'pointer' }}
                                        >+</button>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                        {['KG', '1/2KG', 'Per Item', '100g'].map(u => (
                                            <button
                                                key={u}
                                                onClick={() => setUnit(u)}
                                                style={{
                                                    flex: 1, padding: '0.5rem', borderRadius: '8px',
                                                    background: unit === u ? 'var(--primary)' : 'var(--background)',
                                                    border: `1px solid ${unit === u ? 'var(--primary)' : 'var(--border)'}`,
                                                    color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {u}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="premium-card">
                                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '1rem' }}>Your Asking Price (per {unit})</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>₹</span>
                                        <input
                                            type="number" value={price} onChange={e => setPrice(e.target.value)}
                                            style={{ flex: 1, background: 'var(--background)', border: 'none', borderBottom: '2px solid var(--primary)', padding: '0.5rem', color: 'white', fontSize: '2.5rem', fontWeight: 800 }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="premium-card" style={{ background: 'rgba(76, 175, 80, 0.05)', border: '1px solid var(--primary)' }}>
                                    <TrendingUp style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Market Index</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>₹{crop?.marketPrice} / {unit}</div>
                                    <div style={{ color: 'var(--primary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Trend: Moderate High</div>
                                </div>
                                <div className="premium-card" style={{ background: 'rgba(33, 150, 243, 0.05)', border: '1px solid #2196f3' }}>
                                    <Rocket style={{ color: '#2196f3', marginBottom: '1rem' }} />
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fast Sell Recommendation</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>₹{crop?.marketPrice - 2} / {unit}</div>
                                    <div style={{ color: '#2196f3', fontSize: '0.8rem', marginTop: '0.5rem' }}>High probability of sale within 24h</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem' }}>
                            <button
                                onClick={handleBack}
                                style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Back
                            </button>
                            <button onClick={handleNext} className="btn-primary" style={{ flex: 2, height: '60px', justifyContent: 'center' }}>
                                Continue to Logistics
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 4: LOGISTICS */}
                {step === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Logistics & Pickup</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Specify how the produce will reach the buyer</p>
                        </div>

                        <div className="premium-card" style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1.2rem' }}>Pickup Location</h4>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enable GPS for precise warehouse coordinates</p>
                                </div>
                                <button
                                    onClick={fetchLocation}
                                    style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    {loading ? 'Fetching...' : <><Navigation size={18} /> Sync GPS</>}
                                </button>
                            </div>

                            <div style={{ position: 'relative' }}>
                                <MapPin size={24} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                <input
                                    style={{ width: '100%', padding: '1.2rem 1rem 1.2rem 3.5rem', background: 'var(--background)', border: '1px solid var(--border)', color: 'white', borderRadius: '15px', fontSize: '1.1rem' }}
                                    placeholder="Enter full pickup address..."
                                    value={locationText}
                                    onChange={e => setLocationText(e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div
                                onClick={() => setDeliveryType('FARM_PICKUP')}
                                style={{
                                    padding: '2rem', borderRadius: '20px', border: deliveryType === 'FARM_PICKUP' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    background: deliveryType === 'FARM_PICKUP' ? 'rgba(76, 175, 80, 0.05)' : 'var(--surface)', cursor: 'pointer', textAlign: 'center'
                                }}
                            >
                                <Package size={32} style={{ color: deliveryType === 'FARM_PICKUP' ? 'var(--primary)' : 'var(--text-muted)', marginBottom: '1rem' }} />
                                <h4 style={{ margin: '0 0 0.5rem' }}>Buyer Pickup</h4>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Buyer handles all logistics costs</p>
                            </div>
                            <div
                                onClick={() => setDeliveryType('MARKET_DROP')}
                                style={{
                                    padding: '2rem', borderRadius: '20px', border: deliveryType === 'MARKET_DROP' ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    background: deliveryType === 'MARKET_DROP' ? 'rgba(76, 175, 80, 0.05)' : 'var(--surface)', cursor: 'pointer', textAlign: 'center'
                                }}
                            >
                                <Truck size={32} style={{ color: deliveryType === 'MARKET_DROP' ? 'var(--primary)' : 'var(--text-muted)', marginBottom: '1rem' }} />
                                <h4 style={{ margin: '0 0 0.5rem' }}>I will Drop</h4>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Faster sales, direct to buyer hub</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem' }}>
                            <button
                                onClick={handleBack}
                                style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Back
                            </button>
                            <button
                                disabled={!locationText}
                                onClick={handleNext}
                                className="btn-primary"
                                style={{ flex: 2, height: '60px', justifyContent: 'center', opacity: locationText ? 1 : 0.5 }}
                            >
                                Next: Final Confirmation
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 5: CONFIRMATION */}
                {step === 5 && (
                    <motion.div
                        key="step5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Final Confirmation</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Review your listing details before going live</p>
                        </div>

                        <div className="premium-card" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', padding: '1.5rem' }}>
                            <img
                                src={image || crop.image}
                                alt="Produce"
                                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Crop Name</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{crop?.name}</div>
                                </div>
                                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Quality Grade</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary)' }}>{quality}</div>
                                </div>
                                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Quantity</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{quantity} {unit}</div>
                                </div>
                                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Price per kg</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>₹{price}</div>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Pickup Address</div>
                                    <div style={{ fontSize: '1rem', fontWeight: 500 }}><MapPin size={14} style={{ color: 'var(--primary)' }} /> {locationText}</div>
                                </div>
                            </div>
                        </div>

                        <div className="premium-card" style={{ marginTop: '1.5rem', background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>Total Expected Earnings</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900 }}>₹{(parseFloat(price) * parseFloat(quantity)).toLocaleString()}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>Buyer Marketplace</div>
                                <div style={{ fontWeight: 600 }}>Direct Listing</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
                            <button
                                onClick={handleBack}
                                style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn-primary"
                                style={{ flex: 2, height: '70px', fontSize: '1.2rem', justifyContent: 'center', gap: '1rem', background: '#FF9800', border: 'none' }}
                            >
                                {loading ? <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div> : (
                                    <>
                                        <CheckCircle2 size={24} />
                                        <span>SELL NOW (GO LIVE)</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddCrop;
