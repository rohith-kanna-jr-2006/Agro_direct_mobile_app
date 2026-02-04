import { AnimatePresence, motion } from 'framer-motion';
import { Bell, IndianRupee, LayoutDashboard, Mail, MapPin, Package, Phone, Plus, Printer, Settings, ShieldCheck, Sprout, TrendingUp, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { bankAPI, productAPI, profileAPI } from '../services/api';
import AddCrop from './AddCrop';
import Profile from './Profile';


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
            label: 'Total Revenue',
            value: '₹12,400',
            sub: '+12% from last week',
            color: 'var(--primary)',
            icon: <IndianRupee size={20} />
        },
        {
            label: 'Active Listings',
            value: `${listings.length} Crops`,
            sub: 'In Stock',
            color: '#2196F3',
            icon: <Package size={20} />
        },
        {
            label: 'Pending Orders',
            value: '12',
            sub: 'Action Required',
            color: '#FF9800',
            icon: <Bell size={20} />
        },
        {
            label: 'Avg. Rating',
            value: analytics?.averageRating || '4.8',
            sub: 'Excellent',
            color: '#9C27B0',
            icon: <TrendingUp size={20} />
        }
    ];

    const sidebarItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { icon: <Package size={20} />, label: 'My Listings' },
        { icon: <TrendingUp size={20} />, label: 'Sales Analytics' },
        { icon: <IndianRupee size={20} />, label: 'Payments' },
        { icon: <Settings size={20} />, label: 'Profile' },
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
                                <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.name?.split(' ')[0] || 'Farmer'}! Here's your farm overview.</p>
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
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                                        {stats.map((stat, i) => (
                                            <div key={i} className="premium-card" style={{ padding: '1.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{stat.label}</span>
                                                    <div style={{ color: stat.color }}>{stat.icon}</div>
                                                </div>
                                                <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>{stat.value}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stat.sub}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                                        {/* Recent Orders & Graph */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            {/* Sales Graph Placeholder */}
                                            <div className="premium-card" style={{ padding: '2rem', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, var(--surface), #0a0c10)' }}>
                                                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                                    <TrendingUp size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                                    <p>Sales Graph (Last 7 Days)</p>
                                                    <p style={{ fontSize: '0.8rem' }}>Chart visualization placeholder</p>
                                                </div>
                                            </div>

                                            {/* Recent Orders Table */}
                                            <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                                                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                                                    <h3 style={{ fontSize: '1.1rem' }}>Recent Orders</h3>
                                                </div>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                                        <tr>
                                                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Order ID</th>
                                                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Buyer</th>
                                                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Items</th>
                                                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status</th>
                                                            <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {[
                                                            { id: '#101', buyer: 'Ramesh Kumar', items: '50kg Onion', status: 'Pending' },
                                                            { id: '#102', buyer: 'Fresh Mart', items: '200kg Potato', status: 'Shipped' },
                                                            { id: '#103', buyer: 'Anita S.', items: '10kg Tomato', status: 'Delivered' },
                                                        ].map((order, i) => (
                                                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                                                <td style={{ padding: '1rem', fontWeight: 600 }}>{order.id}</td>
                                                                <td style={{ padding: '1rem' }}>{order.buyer}</td>
                                                                <td style={{ padding: '1rem' }}>{order.items}</td>
                                                                <td style={{ padding: '1rem' }}>
                                                                    <span style={{
                                                                        padding: '4px 10px',
                                                                        borderRadius: '100px',
                                                                        fontSize: '0.8rem',
                                                                        background: order.status === 'Pending' ? 'rgba(255, 152, 0, 0.1)' : order.status === 'Shipped' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                                                                        color: order.status === 'Pending' ? '#FF9800' : order.status === 'Shipped' ? '#2196F3' : '#4CAF50'
                                                                    }}>
                                                                        {order.status}
                                                                    </span>
                                                                </td>
                                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                                    <button style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                                        <Printer size={14} /> Print Label
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Right Column: Market/Insights */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            <div className="premium-card" style={{ padding: '2rem' }}>
                                                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Top Crops</h3>
                                                {['Onion', 'Potato', 'Tomato'].map((crop, i) => (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                                        <span style={{ fontWeight: 600 }}>{crop}</span>
                                                        <span style={{ color: '#4CAF50' }}>₹{(Math.random() * 50 + 20).toFixed(0)}/kg</span>
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

                            {activeTab === 'Profile' && (
                                <motion.div
                                    key="profile-tab"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="premium-card"
                                    style={{ padding: '2rem' }}
                                >
                                    <h3 style={{ marginBottom: '2rem' }}>Profile Settings</h3>
                                    <Profile />
                                    <ProfileForm user={user} role="farmer" />
                                </motion.div>
                            )}


                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
};

const ProfileForm = ({ user, role }: { user: any, role: string }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: user?.location || '',
        landSize: '',
        cropsGrown: '',
        aadhaarLast4: '',
        // Buyer fields
        type: 'household',
        shopName: '',
        preferences: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    const res = await profileAPI.getProfile(user.id || user.email || user._id, role); // Ensure we pass an ID if possible
                    if (res.data) {
                        const d = res.data;
                        setFormData(prev => ({
                            ...prev,
                            landSize: d.landSize?.toString() || '',
                            cropsGrown: d.cropsGrown?.join(', ') || '',
                            aadhaarLast4: d.kyc?.aadhaarLast4 || '',
                            // Buyer specific
                            type: d.type || 'household',
                            shopName: d.businessData?.shopName || '',
                            preferences: d.preferences?.join(', ') || ''
                        }));
                    }
                } catch (e) { console.error(e); }
            }
        };
        fetchProfile();
    }, [user, role]);

    const handleSave = async () => {
        try {
            const payload: any = {
                userId: user.id || user._id || user.email,
                role,
                name: formData.name,
                phone: formData.phone,
                email: formData.email, // Read only but sending back
            };

            if (role === 'farmer') {
                payload.landSize = Number(formData.landSize);
                payload.cropsGrown = formData.cropsGrown.split(',').map(s => s.trim()).filter(s => s);
                payload.aadhaarLast4 = formData.aadhaarLast4;
                // Coordinates placeholder - logic to convert location string to coords would go here or in backend
                payload.coordinates = [78.1198, 9.9252]; // Hardcoded Madurai for now
            } else if (role === 'buyer') {
                payload.type = formData.type;
                if (formData.type === 'retailer') payload.shopName = formData.shopName;
                payload.preferences = formData.preferences.split(',').map(s => s.trim()).filter(s => s);
            }

            await toast.promise(
                profileAPI.updateProfile(payload),
                {
                    loading: 'Saving Profile...',
                    success: 'Profile updated successfully!',
                    error: 'Failed to update profile.'
                }
            );
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Personal Details */}
            <div style={{ gridColumn: 'span 2' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={18} /> Personal Information
                </h4>
            </div>

            <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                    <User size={18} className="input-icon" />
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="premium-input with-icon" />
                </div>
            </div>

            <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                    <Mail size={18} className="input-icon" />
                    <input type="text" value={formData.email} disabled className="premium-input with-icon" style={{ opacity: 0.7 }} />
                </div>
            </div>

            <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                    <Phone size={18} className="input-icon" />
                    <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="premium-input with-icon" />
                </div>
            </div>

            <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Location</label>
                <div style={{ position: 'relative' }}>
                    <MapPin size={18} className="input-icon" />
                    <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="premium-input with-icon" />
                </div>
            </div>

            {role === 'farmer' && (
                <>
                    <div style={{ gridColumn: 'span 2', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sprout size={18} /> Farm Details
                        </h4>
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Land Size (Acres)</label>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={18} className="input-icon" />
                            <input type="number" value={formData.landSize} onChange={e => setFormData({ ...formData, landSize: e.target.value })} className="premium-input with-icon" placeholder="e.g. 5.2" />
                        </div>
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Aadhaar (Last 4)</label>
                        <div style={{ position: 'relative' }}>
                            <ShieldCheck size={18} className="input-icon" />
                            <input type="text" maxLength={4} value={formData.aadhaarLast4} onChange={e => setFormData({ ...formData, aadhaarLast4: e.target.value })} className="premium-input with-icon" placeholder="XXXX" />
                        </div>
                    </div>

                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Crops Grown (comma separated)</label>
                        <div style={{ position: 'relative' }}>
                            <Sprout size={18} className="input-icon" />
                            <input type="text" value={formData.cropsGrown} onChange={e => setFormData({ ...formData, cropsGrown: e.target.value })} className="premium-input with-icon" placeholder="e.g. Tomato, Potato, Onion" />
                        </div>
                    </div>
                </>
            )}

            {role === 'buyer' && (
                <>
                    <div style={{ gridColumn: 'span 2', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <LayoutDashboard size={18} /> Buyer Profile
                        </h4>
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Buyer Type</label>
                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="premium-input" style={{ width: '100%' }}>
                            <option value="household">Household Consumer</option>
                            <option value="retailer">Retailer / Business</option>
                        </select>
                    </div>

                    {formData.type === 'retailer' && (
                        <>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Shop Name</label>
                                <input type="text" value={formData.shopName} onChange={e => setFormData({ ...formData, shopName: e.target.value })} className="premium-input" />
                            </div>
                        </>
                    )}
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Buying Preferences (comma separated)</label>
                        <input type="text" value={formData.preferences} onChange={e => setFormData({ ...formData, preferences: e.target.value })} className="premium-input" placeholder="e.g. Tomato, Rice, Spices" />
                    </div>
                </>
            )}

            <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                <button className="btn-primary" onClick={handleSave} style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
                    Save Profile Changes
                </button>
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
