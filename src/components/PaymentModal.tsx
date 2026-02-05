import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, CreditCard, DollarSign, ShieldCheck, Smartphone, X } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';

interface PaymentModalProps {
    product: any;
    quantity: number;
    onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ product, quantity, onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [method, setMethod] = useState<'upi' | 'card' | 'cod'>('upi');
    const [loading, setLoading] = useState(false);
    const [successOrder, setSuccessOrder] = useState<any>(null);

    const priceNum = parseInt((product.price || '0').replace(/[^0-9]/g, ''));
    const total = priceNum * quantity;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const orderData = {
                productName: product.name || product.key,
                totalPrice: total,
                quantity: quantity,
                paymentMethod: method,
                farmer: {
                    name: product.farm || 'Local Farmer',
                    address: product.dist || 'Madurai region',
                    rating: '4.8'
                },
                userId: user?.userId,
                userName: user?.name,
                userAddress: '123, Anna Nagar, Madurai, TN', // Mock address for demo
                destLocation: {
                    lat: 9.9252 + (Math.random() - 0.5) * 0.1, // Randomly near Madurai
                    lng: 78.1198 + (Math.random() - 0.5) * 0.1
                }
            };

            const res = await orderAPI.create(orderData);
            setSuccessOrder(res.data);
            toast.success("Order Placed Successfully!");
        } catch (err) {
            toast.error("Payment failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="premium-card"
                    style={{ width: '90%', maxWidth: '500px', padding: '3rem', zIndex: 1, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                >
                    {!successOrder ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Secure Checkout</h2>
                                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '0.8rem' }}>Summary</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700 }}>
                                    <span>{product.name} x {quantity}kg</span>
                                    <span>₹{total}</span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '3rem' }}>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Select Payment Method</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {[
                                        { id: 'upi', label: 'UPI (GPay, PhonePe)', icon: Smartphone },
                                        { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
                                        { id: 'cod', label: 'Cash on Delivery', icon: DollarSign },
                                    ].map((m) => (
                                        <div
                                            key={m.id}
                                            onClick={() => setMethod(m.id as any)}
                                            style={{
                                                padding: '1.2rem', borderRadius: '16px', border: `2px solid ${method === m.id ? 'var(--primary)' : 'var(--border)'}`,
                                                background: method === m.id ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {method === m.id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'white' }} />}
                                            </div>
                                            <m.icon size={20} />
                                            <span style={{ fontWeight: 600 }}>{m.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className="btn-primary"
                                style={{ width: '100%', justifyContent: 'center', height: '60px', fontSize: '1.2rem', gap: '0.8rem' }}
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        <ShieldCheck size={22} /> Confirm & Pay ₹{total}
                                    </>
                                )}
                            </button>
                            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                🔒 Your transaction is secured with TLS encryption
                            </p>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                            <div style={{ width: '100px', height: '100px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 0 30px var(--primary-glow)' }}>
                                <CheckCircle2 size={56} color="white" />
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Order Confirmed!</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.2rem' }}>
                                Your unique tracking ID is:<br />
                                <strong style={{ color: 'white', fontSize: '2rem', display: 'block', marginTop: '0.5rem' }}>{successOrder.trackingId}</strong>
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <button
                                    onClick={() => navigate('/track-order')}
                                    className="btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', height: '54px' }}
                                >
                                    Track Live Location
                                </button>
                                <button
                                    onClick={onClose}
                                    style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', color: 'white', padding: '1rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    View Dashboard
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PaymentModal;
