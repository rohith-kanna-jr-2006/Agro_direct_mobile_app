import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChevronLeft, Edit, Leaf, MapPin, ShieldCheck, ShoppingBag, Star, Trash, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productAPI } from '../services/api';
import PaymentModal from './PaymentModal.tsx';

const farmIcon = L.divIcon({
    className: 'custom-farm-icon',
    html: `<div style="background: #4CAF50; padding: 6px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

const ProductDetail: React.FC = () => {
    const { user } = useAuth();
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

    const isOwner = user && (product?.farmerContact === user.email || product?.farmerName === user.name);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this listing?")) {
            try {
                await productAPI.delete(product._id);
                toast.success("Listing removed successfully");
                navigate('/farmer-dashboard');
            } catch (err) {
                toast.error("Failed to delete listing");
            }
        }
    };

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
                                <span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: 700 }}>{product.quality || product.grade || 'Grade A'}</span>
                                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '0.5rem 1rem', borderRadius: '12px' }}>{product.category || 'Vegetables'}</span>
                                <span className="badge" style={{ background: 'rgba(255,193,7,0.1)', color: '#FFC107', padding: '0.5rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Star size={14} fill="#FFC107" /> {product.rating || '5.0'} Rating</span>
                            </div>

                            <div className="premium-card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'rgba(76, 175, 80, 0.05)', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
                                <h4 style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                                    <ShieldCheck size={18} /> Verified AI Quality Audit
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                                    {[
                                        { label: 'Freshness', value: product.qualityDetails?.freshness ? `${product.qualityDetails.freshness}%` : '98%', color: '#4CAF50' },
                                        { label: 'Ripeness', value: product.qualityDetails?.ripeness ? `${product.qualityDetails.ripeness}%` : '92%', color: '#FFC107' },
                                        { label: 'Texture', value: product.qualityDetails?.texture ? `${product.qualityDetails.texture}%` : '95%', color: '#2196F3' },
                                        { label: 'Shelf Life', value: product.qualityDetails?.shelfLife || '8 Days', color: '#9C27B0' }
                                    ].map((m, idx) => (
                                        <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border)', textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{m.label}</div>
                                            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>{m.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                                Freshly harvested from the local farms. This {product.name || product.key} is grown using sustainable organic practices, ensuring the highest nutrient content and natural taste. Available quantity: {product.quantity || 'In Stock'}.
                            </p>
                        </div>
                    </div>

                    {/* Right: Farmer Profile & Mini Map */}
                    <div className="animate-fade-in" style={{ animationDelay: '0.2s', display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '120px' }}>
                        <div className="premium-card">
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><User size={22} color="var(--primary)" /> Farmer Profile</h3>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {product.farmerImg ? (
                                        <img src={product.farmerImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <User size={40} color="var(--text-muted)" />
                                    )}
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.2rem' }}>{product.farmerName || product.farm || 'Verified Farmer'}</h4>
                                    <p style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}>
                                        <ShieldCheck size={16} /> Verified Producer
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{product.farmerContact || 'Contact Verified'}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <MapPin size={18} color="var(--primary)" />
                                    <span>{product.farmerAddress || 'Coimbatore, Tamil Nadu'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <Leaf size={18} color="var(--primary)" />
                                    <span>{product.deliveryType === 'FARM_PICKUP' ? 'Farm Pickup Available' : 'Direct Hub Delivery'}</span>
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
                                {isOwner ? (
                                    <>
                                        <button
                                            onClick={() => navigate('/farmer-dashboard')}
                                            className="btn-primary"
                                            style={{ flex: 1, justifyContent: 'center', height: '54px', fontSize: '1.1rem', background: 'var(--surface)', border: '1px solid var(--border)' }}
                                        >
                                            <Edit size={20} /> Edit Listing
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="btn-primary"
                                            style={{ flex: 1, justifyContent: 'center', height: '54px', fontSize: '1.1rem', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', color: '#ff6b6b' }}
                                        >
                                            <Trash size={20} /> Delete
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', background: 'var(--background)', padding: '0.8rem', borderRadius: '12px' }}>
                                            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>-</button>
                                            <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{qty} {product.quantity?.split(' ')[1] || 'KG'}</span>
                                            <button onClick={() => setQty(q => q + 1)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>+</button>
                                        </div>
                                        <button
                                            onClick={() => setShowPaymentModal(true)}
                                            className="btn-primary"
                                            style={{ flex: 1.5, justifyContent: 'center', height: '54px', fontSize: '1.1rem' }}
                                        >
                                            <ShoppingBag size={20} /> Buy Now
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="premium-card" style={{ padding: '1.5rem', background: 'var(--primary-glow)' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 600 }}>
                                🚚 {product.deliveryType === 'MARKET_DROP' ? 'This product is delivered to our central hub for faster last-mile delivery.' : 'Direct Handover: This product will be picked up directly from the farm to ensure maximum freshness.'}
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
