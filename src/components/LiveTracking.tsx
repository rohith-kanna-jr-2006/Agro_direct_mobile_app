import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import io from 'socket.io-client';

// Fix for default marker icon in Leaflet + React

const driverIcon = L.divIcon({
    className: 'custom-driver-icon',
    html: `
        <div style="
            width: 40px; 
            height: 40px; 
            background: #4CAF50; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg); 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.5);
            border: 3px solid white;
        ">
            <div style="transform: rotate(45deg); color: white;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

// Helper component to auto-center the map when position updates
const RecenterMap = ({ lat, lng }: { lat: number, lng: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], map.getZoom(), { animate: true });
    }, [lat, lng, map]);
    return null;
};

interface LiveTrackingProps {
    orderId: string;
    initialPosition?: { lat: number; lng: number };
}

const socket = io("http://localhost:5000");

const LiveTracking: React.FC<LiveTrackingProps> = ({ orderId, initialPosition = { lat: 12.9716, lng: 77.5946 } }) => {
    const [position, setPosition] = useState(initialPosition);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
            socket.emit("join_order_room", orderId);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on("receive_location", (data: { lat: number; lng: number }) => {
            console.log("New Location Received:", data);
            setPosition({ lat: data.lat, lng: data.lng });
            setLastUpdate(new Date());
        });

        if (socket.connected) {
            setIsConnected(true);
            socket.emit("join_order_room", orderId);
        }

        return () => {
            socket.off("receive_location");
            socket.off('connect');
            socket.off('disconnect');
        };
    }, [orderId]);

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(22, 27, 34, 0.7)',
                backdropFilter: 'blur(12px)',
                padding: '1.25rem',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: isConnected ? '#4CAF50' : '#f44336',
                        boxShadow: isConnected ? '0 0 10px #4CAF50' : 'none',
                        animation: isConnected ? 'pulse 2s infinite' : 'none'
                    }} />
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>Driver Location</h3>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>ID: {orderId}</p>
                    </div>
                </div>
                {lastUpdate && (
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Last update</p>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#4CAF50', margin: 0 }}>{lastUpdate.toLocaleTimeString()}</p>
                    </div>
                )}
            </div>

            <div style={{
                position: 'relative',
                flex: 1,
                minHeight: '400px',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <MapContainer
                    center={[position.lat, position.lng]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    <RecenterMap lat={position.lat} lng={position.lng} />
                    <Marker position={[position.lat, position.lng]} icon={driverIcon}>
                        <Popup className="custom-popup">
                            <div style={{ padding: '0.5rem' }}>
                                <p style={{ fontWeight: 800, color: '#4CAF50', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Navigation size={14} /> Driver is here
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                </MapContainer>

                <div style={{
                    position: 'absolute',
                    bottom: '1.5rem',
                    left: '1.5rem',
                    right: '1.5rem',
                    zIndex: 1000,
                    background: 'rgba(22, 27, 34, 0.95)',
                    backdropFilter: 'blur(20px)',
                    padding: '1.25rem',
                    borderRadius: '20px',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'rgba(76, 175, 80, 0.1)',
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#4CAF50'
                        }}>
                            <MapPin size={24} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#4CAF50', margin: 0, letterSpacing: '0.05em' }}>Delivery Status</p>
                            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'white', margin: 0 }}>Out for Delivery</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(0.95); opacity: 0.7; }
                    50% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.7; }
                }
                .leaflet-container {
                    background: #111 !important;
                }
                .custom-popup .leaflet-popup-content-wrapper {
                    background: #161b22;
                    color: white;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .custom-popup .leaflet-popup-tip {
                    background: #161b22;
                }
            `}</style>
        </div>
    );
};

export default LiveTracking;
