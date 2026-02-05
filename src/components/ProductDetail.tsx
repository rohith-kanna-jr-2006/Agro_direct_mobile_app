import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChevronLeft, Leaf, MapPin, ShieldCheck, ShoppingBag, Star, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { useNavigate, useParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import PaymentModal from './PaymentModal';

const farmIcon = L.divIcon({
    className: 'custom-farm-icon',
    html: `<div style="background: #4CAF50; padding: 6px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

const ProductDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await productAPI.getAll();
                const found = res.data.find((p: any) => p._id === id || p.key === id);
                if (found) setProduct(found);
                else throw new Error("Not found");
            } catch (err) {
                toast.error("Product not found");
                navigate('/buyer-dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, navigate]);

    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div></div>;

    if (!product) return null;

    // Default coordinates if not provided (Madurai region)
    const farmCoords: [number, number] = [9.9252, 78.1198];

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--background)' }}>
            <div className="container">
                <button onClick={() => navigate(-1)} className="back-to-home" style={{ marginBottom: '2rem' }}>
                    <ChevronLeft size={20} /> Back to Marketplace
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem', alignItems: 'start' }}>
                    {/* Left: Product Info */}
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="premium-card" style={{ padding: 0, overflow: 'hidden', height: '500px' }}>
                            <img src={product.img || product.image || 'https://images.unsplash.com/photo-1546473427-e1ad6d66be85?auto=format&fit=crop&q=80&w=800'}
                                alt={product.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h1 style={{ fontSize: '3.5rem', fontWeight: 800 }}>{product.name || product.key}</h1>
                                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{product.price}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                <span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: 700 }}>{product.grade || 'Grade A'}</span>
                                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '0.5rem 1rem', borderRadius: '12px' }}>{product.category || 'Vegetables'}</span>
                                <span className="badge" style={{ background: 'rgba(255,193,7,0.1)', color: '#FFC107', padding: '0.5rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Star size={14} fill="#FFC107" /> 4.8 Rating</span>
                            </div>
                            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                                Freshly harvested from the local farms of {product.farm || 'Madurai'}. This {product.name} is grown using sustainable organic practices, ensuring the highest nutrient content and natural taste. Perfect for daily consumption and bulk orders.
                            </p>
                        </div>
                    </div>

                    {/* Right: Farmer Profile & Mini Map */}
                    <div className="animate-fade-in" style={{ animationDelay: '0.2s', display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '120px' }}>
                        <div className="premium-card">
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><User size={22} color="var(--primary)" /> Farmer Profile</h3>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--border)', overflow: 'hidden' }}>
                                    <img src={`https://i.pravatar.cc/150?u=${product.farm}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.2rem' }}>{product.farm || 'Ramesh Kumar'}</h4>
                                    <p style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}>
                                        <ShieldCheck size={16} /> Verified Farmer
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Experience: 12 Years in Farming</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <MapPin size={18} color="var(--primary)" />
                                    <span>{product.dist || '5km'} away from you</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <Leaf size={18} color="var(--primary)" />
                                    <span>Sustainable Farming Certificate</span>
                                </div>
                            </div>

                            {/* Mini Map */}
                            <div style={{ height: '200px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '2rem' }}>
                                <MapContainer center={farmCoords} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false} scrollWheelZoom={false}>
                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                    <Marker position={farmCoords} icon={farmIcon} />
                                </MapContainer>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', background: 'var(--background)', padding: '0.8rem', borderRadius: '12px' }}>
                                    <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>-</button>
                                    <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{qty} kg</span>
                                    <button onClick={() => setQty(q => q + 1)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>+</button>
                                </div>
                                <button
                                    onClick={() => setShowPaymentModal(true)}
                                    className="btn-primary"
                                    style={{ flex: 1.5, justifyContent: 'center', height: '54px', fontSize: '1.1rem' }}
                                >
                                    <ShoppingBag size={20} /> Buy Now
                                </button>
                            </div>
                        </div>

                        <div className="premium-card" style={{ padding: '1.5rem', background: 'var(--primary-glow)' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 600 }}>
                                🚚 Direct Handover: This product will be delivered directly from the farm to your doorstep within 24 hours of harvest.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {showPaymentModal && (
                <PaymentModal
                    product={product}
                    quantity={qty}
                    onClose={() => setShowPaymentModal(false)}
                />
            )}
        </div>
    );
};

export default ProductDetail;
