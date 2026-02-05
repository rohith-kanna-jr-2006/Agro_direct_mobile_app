import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CheckCircle, Package, Search, Truck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { orderAPI } from '../services/api';

// Custom icons
const truckIcon = L.divIcon({
    className: 'custom-truck-icon',
    html: `<div style="background: #4CAF50; padding: 8px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3m0 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0m9 0h3l3-3V11h-9v6h3m0 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/></svg>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const farmIcon = L.divIcon({
    className: 'custom-farm-icon',
    html: `<div style="background: #2E7D32; padding: 6px; border-radius: 8px; border: 2px solid white; display: flex; align-items: center; justify-content: center;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 22 1-1h3l9-9 3 3-9 9H2Z"/><path d="M9 14 4 9"/><path d="m15 8 5 5"/><path d="m18 8-3-3"/><path d="M22 22 2 2"/></svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

const homeIcon = L.divIcon({
    className: 'custom-home-icon',
    html: `<div style="background: #1976D2; padding: 6px; border-radius: 8px; border: 2px solid white; display: flex; align-items: center; justify-content: center;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

const RecenterMap = ({ center, zoom }: { center: [number, number], zoom: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom, { animate: true });
    }, [center, zoom, map]);
    return null;
};

const TrackOrder: React.FC = () => {
    const [trackingId, setTrackingId] = useState('');
    const [order, setOrder] = useState<any>(null);
    const [truckPos, setTruckPos] = useState<[number, number] | null>(null);
    const [progress, setProgress] = useState(0); // 0 to 100
    const [status, setStatus] = useState('Placed');
    const [loading, setLoading] = useState(false);

    const handleTrack = async () => {
        if (!trackingId.trim()) return;
        setLoading(true);
        try {
            const res = await orderAPI.trackByTrackingId(trackingId);
            setOrder(res.data);
            setTruckPos([res.data.currentLocation.lat, res.data.currentLocation.lng]);
            setProgress(0);
            setStatus('Placed');
            toast.success("Order Found!");
        } catch (err) {
            toast.error("Order not found. Check ID.");
        } finally {
            setLoading(false);
        }
    };

    // Simulation logic
    useEffect(() => {
        if (!order || progress >= 100) return;

        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + 10;
                if (next >= 100) {
                    setStatus('Arriving');
                    return 100;
                }

                // Update status based on progress
                if (next >= 70) setStatus('In Transit');
                else if (next >= 30) setStatus('Picked Up');

                return next;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [order, progress]);

    // Update truck position based on progress
    useEffect(() => {
        if (!order || !truckPos) return;

        const start = [order.currentLocation.lat, order.currentLocation.lng];
        const end = [order.destLocation.lat, order.destLocation.lng];

        const lat = start[0] + (end[0] - start[0]) * (progress / 100);
        const lng = start[1] + (end[1] - start[1]) * (progress / 100);

        setTruckPos([lat, lng]);
    }, [progress, order]);

    const statuses = ['Placed', 'Picked Up', 'In Transit', 'Arriving'];

    return (
        <div style={{ padding: '4rem 0', minHeight: '100vh', background: 'var(--background)' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }} className="gradient-text">Track Your Fresh Delivery</h1>
                    <div style={{ display: 'flex', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}>
                        <div className="premium-input-wrapper" style={{ flex: 1 }}>
                            <Search className="input-icon" />
                            <input
                                type="text"
                                placeholder="Enter Tracking ID (e.g. KD-1234)"
                                className="premium-input"
                                value={trackingId}
                                onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                                onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                            />
                        </div>
                        <button onClick={handleTrack} className="btn-primary" disabled={loading}>
                            {loading ? 'Searching...' : 'Track'}
                        </button>
                    </div>
                </div>

                {order ? (
                    <div className="premium-card" style={{ padding: '1rem', overflow: 'hidden' }}>
                        <div style={{ height: '500px', width: '100%', position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
                            <MapContainer
                                center={[order.currentLocation.lat, order.currentLocation.lng]}
                                zoom={10}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={false}
                            >
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                />

                                {/* Farm Marker */}
                                <Marker position={[order.currentLocation.lat, order.currentLocation.lng]} icon={farmIcon}>
                                    <Popup>Farm Location: {order.farmer?.address || 'Local'}</Popup>
                                </Marker>

                                {/* Buyer Marker */}
                                <Marker position={[order.destLocation.lat, order.destLocation.lng]} icon={homeIcon}>
                                    <Popup>Your Location: {order.userAddress || 'Home'}</Popup>
                                </Marker>

                                {/* Moving Truck */}
                                {truckPos && (
                                    <>
                                        <Marker position={truckPos} icon={truckIcon}>
                                            <Popup>Live Tracking: {status}</Popup>
                                        </Marker>
                                        <Polyline
                                            positions={[
                                                [order.currentLocation.lat, order.currentLocation.lng],
                                                truckPos
                                            ]}
                                            color="var(--primary)"
                                            dashArray="10, 10"
                                            weight={3}
                                            opacity={0.6}
                                        />
                                        <RecenterMap center={truckPos} zoom={progress < 100 ? 12 : 12} />
                                    </>
                                )}
                            </MapContainer>

                            {/* Floating Map Info */}
                            <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000, background: 'rgba(22, 27, 34, 0.9)', backdropFilter: 'blur(12px)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)', minWidth: '200px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></div>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{status}</span>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Arrival: Today, 6:00 PM</p>
                            </div>
                        </div>

                        {/* Status Timeline */}
                        <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.03)', marginTop: '1rem', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                                {/* Timeline Line */}
                                <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', background: 'var(--border)', zIndex: 0 }}></div>
                                <div style={{ position: 'absolute', top: '15px', left: '0', width: `${(statuses.indexOf(status) / (statuses.length - 1)) * 100}%`, height: '2px', background: 'var(--primary)', transition: 'width 0.5s ease', zIndex: 0 }}></div>

                                {statuses.map((s, idx) => {
                                    const isCompleted = statuses.indexOf(status) >= idx;
                                    const isCurrent = status === s;

                                    return (
                                        <div key={idx} style={{ position: 'relative', zIndex: 1, textAlign: 'center', flex: 1 }}>
                                            <div style={{
                                                width: '32px', height: '32px', margin: '0 auto 1rem', borderRadius: '50%',
                                                background: isCompleted ? 'var(--primary)' : 'var(--surface)',
                                                border: `2px solid ${isCompleted ? 'var(--primary)' : 'var(--border)'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', transition: 'all 0.3s ease',
                                                boxShadow: isCurrent ? '0 0 15px var(--primary-glow)' : 'none'
                                            }}>
                                                {isCompleted ? <CheckCircle size={18} /> : idx + 1}
                                            </div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: isCompleted ? 700 : 500, color: isCompleted ? 'white' : 'var(--text-muted)' }}>{s}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2.5rem' }}>
                                <div className="premium-card" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)' }}>
                                    <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={16} /> Order Details</h4>
                                    <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{order.productName}</p>
                                    <p style={{ color: 'var(--text-muted)' }}>Quantity: {order.quantity} units</p>
                                </div>
                                <div className="premium-card" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)' }}>
                                    <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Truck size={16} /> Delivery At</h4>
                                    <p style={{ fontWeight: 700 }}>{order.userName}</p>
                                    <p style={{ color: 'var(--text-muted)' }}>{order.userAddress}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '5rem', opacity: 0.5 }}>
                        <Truck size={64} style={{ marginBottom: '1.5rem', marginInline: 'auto' }} />
                        <p style={{ fontSize: '1.2rem' }}>Enter your tracking ID to see live movement</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;
