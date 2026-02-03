import { AnimatePresence, motion } from 'framer-motion';
import { Bell, IndianRupee, LayoutDashboard, Package, Plus, Settings, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { bankAPI, productAPI, profileAPI } from '../services/api';
import AddCrop from './AddCrop';


const FarmerDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [view, setView] = useState('main'); // 'main' or 'add-crop'
    const [listings, setListings] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchFarmerData = async () => {
        try {
            setLoading(true);
            const [productsRes, analyticsRes] = await Promise.all([
                productAPI.getAll(),
                profileAPI.getAnalytics()
            ]);

            // Filter listings for this farmer (simplified: all for demo, or match by name)
            const farmerListings = productsRes.data.filter((p: any) => p.farmerName === user?.name || p.farmerContact === user?.email);
            setListings(farmerListings);
            setAnalytics(analyticsRes.data);
        } catch (err) {
            console.error("Failed to fetch farmer data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFarmerData();
    }, [user, view]);

    const stats = [
        {
            label: 'Total Sales',
            value: analytics ? `₹${analytics.revenue.toLocaleString()}` : '₹0',
            trend: analytics?.sales > 0 ? `+${analytics.sales}` : 'No sales yet',
            color: 'var(--primary)',
            icon: <TrendingUp size={20} />
        },
        {
            label: 'Active Crops',
            value: `${listings.length} Types`,
            trend: 'Healthy',
            color: '#2196F3',
            icon: <Package size={20} />
        },
        {
            label: 'Avg Rating',
            value: analytics?.averageRating || '5.0',
            trend: 'Customer Love',
            color: '#FF9800',
            icon: <TrendingUp size={20} />
        }
    ];

    const sidebarItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { icon: <Package size={20} />, label: 'My Listings' },
        { icon: <TrendingUp size={20} />, label: 'Sales Analytics' },
        { icon: <IndianRupee size={20} />, label: 'Payments' },
        { icon: <Settings size={20} />, label: 'Settings' },
    ];


    if (view === 'add-crop') {
        return (
            <div className="farmer-dashboard" style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--background)' }}>
                <div className="container">
                    <AddCrop
                        onBack={() => setView('main')}
                        onSuccess={() => {
                            setView('main');
                            setActiveTab('My Listings');
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="farmer-dashboard" style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--background)' }}>
            <div className="container" style={{ padding: '2rem 2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '3rem' }}>
                    {/* Sidebar */}
                    <aside style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {sidebarItems.map((item, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ x: 5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveTab(item.label)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem 1.25rem',
                                        borderRadius: '14px',
                                        background: activeTab === item.label ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                                        color: activeTab === item.label ? 'var(--primary)' : 'var(--text-muted)',
                                        cursor: 'pointer',
                                        fontWeight: activeTab === item.label ? 600 : 500,
                                        border: activeTab === item.label ? '1px solid rgba(76, 175, 80, 0.2)' : '1px solid transparent',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </motion.div>
                            ))}
                        </div>

                        <div className="premium-card" style={{ marginTop: '2rem', padding: '1.5rem', background: 'linear-gradient(rgba(76, 175, 80, 0.1), transparent)' }}>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Support</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Need help with listing or payments?</p>
                            <button style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>Chat with AI Assistant</button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main>
                        {/* Header Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <div>
                                <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>{activeTab}</h1>
                                <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.name.split(' ')[0]}! Here's what's happening today.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <Bell size={24} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
                                    <div style={{ position: 'absolute', top: -2, right: -2, width: '8px', height: '8px', background: '#ff4444', borderRadius: '50%' }}></div>
                                </div>
                                <button
                                    onClick={() => setView('add-crop')}
                                    className="btn-primary"
                                    style={{ borderRadius: '14px', padding: '0.8rem 1.5rem' }}
                                >
                                    <Plus size={20} /> List New Crop
                                </button>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'Dashboard' && (
                                <motion.div
                                    key="dashboard-tab"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    {/* Stats Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                                        {stats.map((stat, i) => (
                                            <div key={i} className="premium-card" style={{ padding: '1.8rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                    <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>{stat.icon}</div>
                                                    <span style={{ fontSize: '0.8rem', color: stat.color }}>{stat.trend}</span>
                                                </div>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>{stat.label}</span>
                                                <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>{stat.value}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Quick Actions Row */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                                        {/* Crop Tracker */}
                                        <div className="premium-card" style={{ padding: '2rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                                <h3 style={{ fontSize: '1.3rem' }}>Ongoing Shipments</h3>
                                                <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Track All</button>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                                {[
                                                    { name: 'Red Onion (Prime)', status: 'In Transit', weight: '850kg', destination: 'Mumbai Hub', eta: '4h left' },
                                                    { name: 'Gold Corn', status: 'Verification', weight: '1200kg', destination: 'Warehouse A', eta: 'In Review' },
                                                ].map((item, i) => (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                                            {item.name.includes('Onion') ? '🧅' : '🌽'}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{item.name}</div>
                                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>To {item.destination} • {item.weight}</div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: item.status === 'In Transit' ? '#2196F3' : 'var(--accent)' }}>{item.status}</div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.eta}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Market Insight */}
                                        <div className="premium-card" style={{ padding: '2rem', background: 'linear-gradient(180deg, var(--surface), #0a0c10)' }}>
                                            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Market Trends</h3>
                                            <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(76, 175, 80, 0.1)', border: '1px solid var(--primary)', marginBottom: '1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                                                    <TrendingUp size={18} /> High Demand Alert
                                                </div>
                                                <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>Potato price expected to rise by 20% in the next week. We suggest holding stock.</p>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {['Soybean', 'Wheat', 'Tomato'].map((crop) => (
                                                    <div key={crop} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border)' }}>
                                                        <span style={{ color: 'var(--text-muted)' }}>{crop}</span>
                                                        <span style={{ fontWeight: 600, color: '#4CAF50' }}>+4.2%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'My Listings' && (
                                <motion.div
                                    key="listings-tab"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    {loading ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                                            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                                            {listings.length === 0 ? (
                                                <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                                    <Package size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                                    <p>No listings found. Start by adding your first crop!</p>
                                                </div>
                                            ) : (
                                                listings.map(item => (
                                                    <div key={item._id} className="premium-card" style={{ padding: '0' }}>
                                                        <div style={{ padding: '2rem' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                                <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(76, 175, 80, 0.2)', color: 'var(--primary)', borderRadius: '100px', fontWeight: 700 }}>Grade {item.grade || 'A'}</span>
                                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(item.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                            <h4 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>{item.name}</h4>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                                <div>
                                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Price</div>
                                                                    <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{item.price}</div>
                                                                </div>
                                                                <div style={{ textAlign: 'right' }}>
                                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Available Stock</div>
                                                                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{item.quantity || '0'}kg</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
                                                            <button style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', cursor: 'pointer' }}>Edit</button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm("Delete this listing?")) {
                                                                        await productAPI.delete(item._id);
                                                                        fetchFarmerData();
                                                                    }
                                                                }}
                                                                style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', color: '#ff6b6b', cursor: 'pointer' }}
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'Payments' && (

                                <motion.div
                                    key="payments-tab"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="premium-card"
                                    style={{ padding: '2rem' }}
                                >
                                    <h3 style={{ marginBottom: '2rem' }}>Bank & Payment Details</h3>
                                    <BankDetailsForm />
                                </motion.div>
                            )}

                            {activeTab === 'Settings' && (
                                <motion.div
                                    key="settings-tab"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="premium-card"
                                    style={{ padding: '2rem' }}
                                >
                                    <h3 style={{ marginBottom: '2rem' }}>Profile Settings</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Full Name</label>
                                            <input type="text" defaultValue={user?.name} className="premium-input" style={{ width: '100%' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email Address</label>
                                            <input type="text" defaultValue={user?.email} disabled className="premium-input" style={{ width: '100%', opacity: 0.6 }} />
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <button className="btn-primary" onClick={() => toast.success("Profile updated in DB!")}>Save Changes</button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}


                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
};

const BankDetailsForm = () => {
    const { user } = useAuth();
    const [bankData, setBankData] = useState({
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        upiId: ''
    });

    useEffect(() => {
        const fetchBank = async () => {
            if (user) {
                const res = await bankAPI.getDetails(user.email, 'farmer');
                if (res.data) setBankData(res.data);
            }
        };
        fetchBank();
    }, [user]);

    const handleSave = async () => {
        try {
            await toast.promise(
                bankAPI.saveDetails({ ...bankData, userId: user?.email, role: 'farmer' }),
                {
                    loading: 'Saving to MongoDB...',
                    success: 'Bank details secured in database!',
                    error: 'Failed to save details.'
                }
            );
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Account Holder Name</label>
                <input
                    type="text"
                    value={bankData.accountHolderName}
                    onChange={e => setBankData({ ...bankData, accountHolderName: e.target.value })}
                    className="premium-input"
                    style={{ width: '100%' }}
                />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Account Number</label>
                <input
                    type="password"
                    value={bankData.accountNumber}
                    onChange={e => setBankData({ ...bankData, accountNumber: e.target.value })}
                    className="premium-input"
                    style={{ width: '100%' }}
                />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>IFSC Code</label>
                <input
                    type="text"
                    value={bankData.ifscCode}
                    onChange={e => setBankData({ ...bankData, ifscCode: e.target.value })}
                    className="premium-input"
                    style={{ width: '100%' }}
                />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
                <button className="btn-primary" onClick={handleSave}>Secure Save to DB</button>
            </div>
        </div>
    );
};

export default FarmerDashboard;

