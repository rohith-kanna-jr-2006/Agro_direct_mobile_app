import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Calendar, Download, Edit, Eye, EyeOff, FileText, IndianRupee, LayoutDashboard, Mail, MapPin, Package, Phone, Plus, Printer, Settings, ShieldCheck, ShoppingBag, Sprout, Trash, TrendingUp, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api, { authAPI, bankAPI, orderAPI, productAPI, profileAPI } from '../services/api';

import AddCrop from './AddCrop';

import Profile from './Profile';


const FarmerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Dashboard');

    const [view, setView] = useState('main'); // 'main' or 'add-crop'
    const [productToEdit, setProductToEdit] = useState<any>(null);
    const [listings, setListings] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [demandRequests, setDemandRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchFarmerData = async () => {
        try {
            setLoading(true);
            const [productsRes, analyticsRes, ordersRes, demandRes] = await Promise.all([
                productAPI.getAll(),
                api.get('/analytics', { params: { farmer: user?.email || user?.name } }),
                orderAPI.getAll(),
                orderAPI.getDemandRequests({ farmer: user?.email || user?.name })
            ]);

            console.log("All Products from API:", productsRes.data);
            console.log("Current User:", user?.name, user?.email);

            // Filter listings for this farmer (priority: userId, fallback: contact/name)
            const farmerListings = productsRes.data.filter((p: any) => {
                const userKey = user?.email || user?.userId;
                const isMatch = p.userId === userKey || p.farmerContact === user?.email || p.farmerName === user?.name;
                console.log(`Checking match for product ${p.name}: ${isMatch} (ProductUserID: ${p.userId}, UserKey: ${userKey})`);
                return isMatch;
            });

            console.log("Filtered Listings:", farmerListings);
            setListings(farmerListings);

            // Filter orders for this farmer
            const farmerOrders = ordersRes.data.filter((o: any) =>
                o.farmer?.name === user?.name || o.farmer?.id === user?.email
            );
            setOrders(farmerOrders);

            setAnalytics(analyticsRes.data);
            setDemandRequests(demandRes.data);
        } catch (err) {
            console.error("Failed to fetch farmer data:", err);
        } finally {
            setLoading(false);
        }
    };

    const chartData = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return {
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                fullDate: d.toLocaleDateString(),
                amount: 0
            };
        }).reverse();

        orders.forEach(order => {
            const orderDate = new Date(order.date).toLocaleDateString();
            const dayEntry = last7Days.find(d => d.fullDate === orderDate);
            if (dayEntry) {
                dayEntry.amount += order.totalPrice;
            }
        });

        return last7Days;
    }, [orders]);

    const handlePrintLabel = (order: any) => {
        const printWindow = window.open('', '_blank', 'width=800,height=800');
        if (!printWindow) {
            toast.error("Popup blocked! Please allow popups to print labels.");
            return;
        }

        const labelHtml = `
            <html>
                <head>
                    <title>Shipping Label - ${order.trackingId || order._id}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; display: flex; justify-content: center; }
                        .label-container { border: 3px solid #000; padding: 40px; border-radius: 0; width: 500px; background: white; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
                        .logo { font-size: 28px; font-weight: 900; color: #2e7d32; }
                        .tracking-section { border: 2px solid #000; padding: 20px; text-align: center; margin-bottom: 30px; }
                        .tracking-id { font-family: 'monospace'; font-size: 32px; font-weight: bold; letter-spacing: 2px; }
                        .address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
                        .address-box h4 { margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #555; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                        .address-box p { margin: 3px 0; line-height: 1.4; font-size: 16px; }
                        .item-details { border-top: 2px dashed #000; padding-top: 20px; font-size: 18px; }
                        .barcode-sim { height: 60px; background: repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 5px); margin-top: 20px; }
                        @media print {
                            body { padding: 0; }
                            .label-container { border: 3px solid #000; box-shadow: none; width: 100%; height: auto; }
                        }
                    </style>
                </head>
                <body>
                    <div class="label-container">
                        <div class="header">
                            <div class="logo">AGRO DIRECT</div>
                            <div style="text-align: right">
                                <div style="font-weight: 800; font-size: 14px">PRIORITY SHIPPING</div>
                                <div style="font-size: 12px">${new Date(order.date).toLocaleDateString()}</div>
                            </div>
                        </div>

                        <div class="tracking-section">
                            <div style="font-size: 12px; margin-bottom: 8px; font-weight: bold">AIR WAYBILL / TRACKING ID</div>
                            <div class="tracking-id">${order.trackingId || 'KD-' + order._id.slice(-6).toUpperCase()}</div>
                            <div class="barcode-sim"></div>
                        </div>

                        <div class="address-grid">
                            <div class="address-box">
                                <h4>SHIP FROM</h4>
                                <p><strong>${order.farmer?.name || user?.name}</strong></p>
                                <p>${order.farmer?.address || user?.location || 'Registered Farm'}</p>
                                <p>${user?.phone || ''}</p>
                            </div>
                            <div class="address-box">
                                <h4>SHIP TO</h4>
                                <p><strong>${order.userName || 'Buyer'}</strong></p>
                                <p style="font-size: 14px; color: #666; margin-top: -5px; margin-bottom: 8px;">@${order.userUsername || order.userId?.split('@')[0] || 'unknown'}</p>
                                <p>${order.userAddress || 'Recipient Address'}</p>
                                <p>${order.userId || ''}</p>
                            </div>
                        </div>

                        <div class="item-details">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span><strong>Product:</strong></span>
                                <span>${order.productName}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span><strong>Quantity:</strong></span>
                                <span>${order.quantity} KG</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span><strong>Payment:</strong></span>
                                <span>${(order.paymentMethod || 'COD').toUpperCase()} - ₹${order.totalPrice}</span>
                            </div>
                        </div>

                        <div style="margin-top: 40px; text-align: center; border-top: 1px solid #000; padding-top: 10px; font-size: 10px; font-weight: bold;">
                            VERIFIED BY KISANSMART AI SYSTEMS
                        </div>
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(() => { window.close(); }, 500);
                        };
                    </script>
                </body>
            </html>
        `;

        printWindow.document.write(labelHtml);
        printWindow.document.close();
    };

    useEffect(() => {
        fetchFarmerData();

        // --- Real-time Notifications ---
        if (user) {
            const socket = io('http://localhost:5000');
            const farmerId = user.email || user.name;

            socket.emit('join_farmer_room', farmerId);

            socket.on('notification', (data: any) => {
                console.log("Notification received:", data);

                // Show visual toast
                toast(
                    () => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ fontSize: '1.5rem' }}>
                                {data.type === 'success' ? '📦' : data.type === 'error' ? '⚠️' : '🔔'}
                            </div>
                            <div>
                                <b style={{ display: 'block', marginBottom: '4px' }}>{data.title}</b>
                                <span style={{ fontSize: '0.85rem' }}>{data.message}</span>
                            </div>
                        </div>
                    ),
                    {
                        duration: 6000,
                        position: 'top-right',
                        style: {
                            background: '#1a1c23',
                            color: 'white',
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            padding: '1rem'
                        }
                    }
                );

                // Play notification sound
                playHapticSound(880, 'sine', 0.2);

                // Refresh data
                fetchFarmerData();
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [user, view]);

    const playHapticSound = (frequency = 440, type: OscillatorType = 'sine', duration = 0.1) => {
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            console.warn("Audio Context failed:", e);
        }
    };

    const stats = [
        {
            label: 'Total Revenue',
            value: `₹${analytics?.revenue?.toLocaleString() || '0'}`,
            sub: '+100% (New User)',
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
            value: orders.filter(o => o.status === 'Placed' || o.status === 'Pending').length.toString(),
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
        },
        {
            label: 'Unmet Demand',
            value: `${demandRequests.reduce((sum, r) => sum + (r.requestedQty - r.availableQty), 0)} kg`,
            sub: `${demandRequests.length} Requests`,
            color: '#E91E63',
            icon: <ShoppingBag size={20} />
        }
    ];

    const sidebarItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { icon: <Package size={20} />, label: 'My Listings' },
        { icon: <IndianRupee size={20} />, label: 'Payments' },
        { icon: <ShoppingBag size={20} />, label: 'Market Demand' },
        { icon: <FileText size={20} />, label: 'Statement' },
        { icon: <User size={20} />, label: 'Profile' },
        { icon: <Settings size={20} />, label: 'Settings' },
    ];


    if (view === 'add-crop') {
        return (
            <div className="farmer-dashboard" style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--background)' }}>
                <div className="container">
                    <AddCrop
                        productToEdit={productToEdit}
                        onBack={() => setView('main')}
                        onSuccess={() => {
                            setView('main');
                            setProductToEdit(null);
                            setActiveTab('My Listings');
                            fetchFarmerData(); // Force refresh immediately
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
                            <button
                                onClick={() => navigate('/farmer-chat')}
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                                Chat with AI Assistant
                            </button>

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
                                    onClick={() => {
                                        setProductToEdit(null);
                                        setView('add-crop');
                                    }}
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
                                            {/* Sales Graph */}
                                            <div className="premium-card" style={{ padding: '2rem', height: '350px', background: 'var(--surface)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                    <h3 style={{ fontSize: '1.1rem' }}>Revenue Trends (Last 7 Days)</h3>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>
                                                        Total: ₹{chartData.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div style={{ width: '100%', height: '230px' }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={chartData}>
                                                            <defs>
                                                                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                            <XAxis
                                                                dataKey="day"
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                                            />
                                                            <YAxis
                                                                hide
                                                            />
                                                            <Tooltip
                                                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                                                                itemStyle={{ color: 'var(--primary)' }}
                                                                formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="amount"
                                                                stroke="var(--primary)"
                                                                strokeWidth={3}
                                                                fillOpacity={1}
                                                                fill="url(#colorAmt)"
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
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
                                                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Address</th>
                                                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Items</th>
                                                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status</th>
                                                            <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {orders.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No recent orders.</td>
                                                            </tr>
                                                        ) : (
                                                            orders.slice(0, 5).map((order, i) => (
                                                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                                                    <td style={{ padding: '1rem', fontWeight: 600 }}>#{order.trackingId || order._id.slice(-6).toUpperCase()}</td>
                                                                    <td style={{ padding: '1rem' }}>
                                                                        <div style={{ fontWeight: 600 }}>{order.userName || 'Generic Buyer'}</div>
                                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{order.userUsername || order.userId?.split('@')[0] || 'unknown'}</div>
                                                                    </td>
                                                                    <td style={{ padding: '1rem' }}>
                                                                        <div style={{ fontSize: '0.85rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={order.userAddress}>
                                                                            {order.userAddress || 'No Address'}
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ padding: '1rem' }}>{order.productName} ({order.quantity}kg)</td>
                                                                    <td style={{ padding: '1rem' }}>
                                                                        <span style={{
                                                                            padding: '4px 10px',
                                                                            borderRadius: '100px',
                                                                            fontSize: '0.8rem',
                                                                            background: order.status === 'Pending' ? 'rgba(255, 152, 0, 0.1)' : order.status === 'Shipped' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                                                                            color: order.status === 'Pending' ? '#FF9800' : order.status === 'Shipped' ? '#2196F3' : '#4CAF50'
                                                                        }}>
                                                                            {order.status || 'Placed'}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                                        <button
                                                                            onClick={() => handlePrintLabel(order)}
                                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'white', cursor: 'pointer', fontSize: '0.85rem' }}
                                                                        >
                                                                            <Printer size={14} /> Print Label
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Right Column: Market/Insights */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            <div className="premium-card" style={{ padding: '2rem' }}>
                                                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <TrendingUp size={18} style={{ color: '#4CAF50' }} /> Best Selling Crops
                                                </h3>
                                                {(() => {
                                                    const cropSales: { [key: string]: { qty: number, price: string } } = {};
                                                    orders.forEach(o => {
                                                        const name = o.productName || 'Unknown Crop';
                                                        if (!cropSales[name]) cropSales[name] = { qty: 0, price: '' };
                                                        cropSales[name].qty += parseInt(o.quantity) || 1;
                                                        // Use the latest price from the most recent order as a fallback
                                                        cropSales[name].price = `₹${(o.totalPrice / (parseInt(o.quantity) || 1)).toFixed(0)}/kg`;
                                                    });

                                                    // Try to get current listing prices
                                                    listings.forEach(l => {
                                                        if (cropSales[l.name]) cropSales[l.name].price = l.price;
                                                    });

                                                    const topCrops = Object.entries(cropSales)
                                                        .sort((a, b) => b[1].qty - a[1].qty)
                                                        .slice(0, 5);

                                                    if (topCrops.length === 0) {
                                                        return (
                                                            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                                No sales data available yet.
                                                            </div>
                                                        );
                                                    }

                                                    return topCrops.map(([name, data], i) => (
                                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: i === topCrops.length - 1 ? 'none' : '1px solid var(--border)' }}>
                                                            <div>
                                                                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{name}</div>
                                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{data.qty} kg sold</div>
                                                            </div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                <div style={{ color: '#4CAF50', fontWeight: 800 }}>{data.price}</div>
                                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Current Price</div>
                                                            </div>
                                                        </div>
                                                    ));
                                                })()}
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
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                                <div>
                                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>Managing {listings.length} Listings</h3>
                                                    <p style={{ color: 'var(--text-muted)' }}>Overview of all your active produce on the marketplace.</p>
                                                </div>
                                                {listings.length > 0 && (
                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm("ARE YOU SURE? This will permanently delete ALL your product listings. This action cannot be undone.")) {
                                                                try {
                                                                    await productAPI.deleteAll(user?.email || user?.name);
                                                                    toast.success("All listings cleared successfully");
                                                                    fetchFarmerData();
                                                                } catch (err) {
                                                                    toast.error("Failed to clear listings");
                                                                }
                                                            }
                                                        }}
                                                        style={{ padding: '0.8rem 1.5rem', background: 'rgba(255, 100, 100, 0.1)', border: '1px solid rgba(255, 100, 100, 0.2)', color: '#ff6b6b', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                                                    >
                                                        <Trash size={18} /> Clear All Listings
                                                    </button>
                                                )}
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                                                {listings.length === 0 ? (
                                                    <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                                        <Package size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                                        <p>No listings found for your account.</p>
                                                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)', display: 'inline-block', textAlign: 'left' }}>
                                                            <h4 style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '1rem', textTransform: 'uppercase' }}>Account Debug Info</h4>
                                                            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                                <div><strong>Name:</strong> {user?.name || 'Not Set'}</div>
                                                                <div><strong>Email:</strong> {user?.email || 'Not Set'}</div>
                                                                <div><strong>ID:</strong> {user?.userId || 'Not Set'}</div>
                                                            </div>
                                                            <button
                                                                onClick={() => fetchFarmerData()}
                                                                style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', background: 'var(--primary)', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer' }}
                                                            >
                                                                Retry Sync
                                                            </button>
                                                        </div>
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
                                                                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{item.quantity || '0'}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
                                                                <button
                                                                    onClick={() => {
                                                                        setProductToEdit(item);
                                                                        setView('add-crop');
                                                                    }}
                                                                    style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                                                >
                                                                    <Edit size={16} /> Edit
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        if (window.confirm("Delete this listing?")) {
                                                                            await productAPI.delete(item._id);
                                                                            fetchFarmerData();
                                                                        }
                                                                    }}
                                                                    style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', color: '#ff6b6b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                                                >
                                                                    <Trash size={16} /> Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )
                                                }
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'Payments' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <motion.div
                                        key="payments-tab"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="premium-card"
                                        style={{ padding: '2rem' }}
                                    >
                                        <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <ShieldCheck size={20} color="var(--primary)" /> Bank & Payment Details
                                        </h3>
                                        <BankDetailsForm />
                                    </motion.div>

                                    <motion.div
                                        key="payments-history-tab"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="premium-card"
                                        style={{ padding: '0', overflow: 'hidden' }}
                                    >
                                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <TrendingUp size={20} color="var(--primary)" /> Transaction History
                                            </h3>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Wallet Balance</span>
                                                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>₹{analytics?.revenue?.toLocaleString() || '0'}</p>
                                            </div>
                                        </div>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                                <tr>
                                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Date</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Reference</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Type</th>
                                                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions yet.</td>
                                                    </tr>
                                                ) : (
                                                    orders.map((order, i) => (
                                                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                                            <td style={{ padding: '1rem' }}>{new Date(order.date).toLocaleDateString()}</td>
                                                            <td style={{ padding: '1rem', fontWeight: 600 }}>#{order.trackingId || order._id.slice(-6).toUpperCase()}</td>
                                                            <td style={{ padding: '1rem' }}>
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4CAF50', fontSize: '0.9rem' }}>
                                                                    <Plus size={14} /> Sale Credit
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: 'white' }}>+₹{order.totalPrice}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </motion.div>
                                </div>
                            )}

                            {activeTab === 'Statement' && (
                                <motion.div
                                    key="statement-tab"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="premium-card"
                                    style={{ padding: '2rem' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Account Statements</h3>
                                            <p style={{ color: 'var(--text-muted)' }}>Export your transaction history for accounting.</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button
                                                onClick={() => {
                                                    const filtered = orders.filter(o => {
                                                        const d = new Date(o.date);
                                                        const s = startDate ? new Date(startDate) : null;
                                                        const e = endDate ? new Date(endDate) : null;
                                                        if (s && d < s) return false;
                                                        if (e && d > e) return false;
                                                        return true;
                                                    });

                                                    const csv = "Date,Order ID,Product,Quantity,Amount,Buyer\n" +
                                                        filtered.map(o => `${new Date(o.date).toLocaleDateString()},${o.trackingId || o._id},${o.productName},${o.quantity},₹${o.totalPrice},${o.userName}`).join("\n");

                                                    const blob = new Blob([csv], { type: 'text/csv' });
                                                    const url = window.URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `Statement_${startDate || 'All'}_to_${endDate || 'Present'}.csv`;
                                                    a.click();
                                                    window.URL.revokeObjectURL(url);
                                                }}
                                                className="btn-primary"
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}
                                            >
                                                <Download size={18} /> CSV
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const filtered = orders.filter(o => {
                                                        const d = new Date(o.date);
                                                        const s = startDate ? new Date(startDate) : null;
                                                        const e = endDate ? new Date(endDate) : null;
                                                        if (s && d < s) return false;
                                                        if (e && d > e) return false;
                                                        return true;
                                                    });

                                                    const printWindow = window.open('', '_blank');
                                                    if (!printWindow) return;

                                                    const html = `
                                                        <html>
                                                            <head>
                                                                <title>Account Statement - ${user?.name}</title>
                                                                <style>
                                                                    body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
                                                                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #4CAF50; padding-bottom: 20px; margin-bottom: 30px; }
                                                                    .title { font-size: 24px; font-weight: 800; color: #4CAF50; }
                                                                    .period { color: #666; font-size: 14px; }
                                                                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                                                    th { background: #f8f9fa; text-align: left; padding: 12px; border-bottom: 1px solid #ddd; color: #555; }
                                                                    td { padding: 12px; border-bottom: 1px solid #eee; }
                                                                    .total-row { font-weight: 800; font-size: 18px; color: #000; }
                                                                    .footer { margin-top: 50px; font-size: 12px; color: #999; text-align: center; }
                                                                </style>
                                                            </head>
                                                            <body>
                                                                <div class="header">
                                                                    <div>
                                                                        <div class="title">FarmDirect - Farmer Statement</div>
                                                                        <div>${user?.name}</div>
                                                                        <div class="period">Period: ${startDate || 'inception'} to ${endDate || 'present'}</div>
                                                                    </div>
                                                                    <div style="text-align: right">
                                                                        <div>Generated: ${new Date().toLocaleDateString()}</div>
                                                                        <div>Total Earnings: ₹${filtered.reduce((sum, o) => sum + (o.totalPrice || 0), 0)}</div>
                                                                    </div>
                                                                </div>
                                                                <table>
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Date</th>
                                                                            <th>Order ID</th>
                                                                            <th>Product</th>
                                                                            <th>Qty</th>
                                                                            <th>Buyer</th>
                                                                            <th style="text-align: right">Amount</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        ${filtered.map(o => `
                                                                            <tr>
                                                                                <td>${new Date(o.date).toLocaleDateString()}</td>
                                                                                <td>#${o.trackingId || o._id.slice(-6).toUpperCase()}</td>
                                                                                <td>${o.productName}</td>
                                                                                <td>${o.quantity}kg</td>
                                                                                <td>${o.userName}</td>
                                                                                <td style="text-align: right">₹${o.totalPrice}</td>
                                                                            </tr>
                                                                        `).join('')}
                                                                        <tr class="total-row">
                                                                            <td colspan="5" style="text-align: right; padding-top: 20px;">Net Revenue</td>
                                                                            <td style="text-align: right; padding-top: 20px;">₹${filtered.reduce((sum, o) => sum + (o.totalPrice || 0), 0)}</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                                <div class="footer">
                                                                    This is a system generated statement from FarmDirect.
                                                                </div>
                                                                <script>
                                                                    window.onload = () => { window.print(); setTimeout(() => window.close(), 500); };
                                                                </script>
                                                            </body>
                                                        </html>
                                                    `;
                                                    printWindow.document.write(html);
                                                    printWindow.document.close();
                                                }}
                                                className="btn-primary"
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                <Printer size={18} /> PDF
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>From Date</label>
                                            <div style={{ position: 'relative' }}>
                                                <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: 'var(--background)', border: '1px solid var(--border)', color: 'white', borderRadius: '10px' }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>To Date</label>
                                            <div style={{ position: 'relative' }}>
                                                <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                                <input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: 'var(--background)', border: '1px solid var(--border)', color: 'white', borderRadius: '10px' }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ borderBottom: '2px solid var(--border)' }}>
                                                <tr>
                                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Date</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Order ID</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Product</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Quantity</th>
                                                    <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)' }}>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders
                                                    .filter(o => {
                                                        const d = new Date(o.date);
                                                        const s = startDate ? new Date(startDate) : null;
                                                        const e = endDate ? new Date(endDate) : null;
                                                        if (s && d < s) return false;
                                                        if (e && d > e) return false;
                                                        return true;
                                                    })
                                                    .map((o, i) => (
                                                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                                            <td style={{ padding: '1rem' }}>{new Date(o.date).toLocaleDateString()}</td>
                                                            <td style={{ padding: '1rem', fontWeight: 600 }}>#{o.trackingId || o._id.slice(-6).toUpperCase()}</td>
                                                            <td style={{ padding: '1rem' }}>{o.productName}</td>
                                                            <td style={{ padding: '1rem' }}>{o.quantity}kg</td>
                                                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700 }}>₹{o.totalPrice}</td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
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


                            {activeTab === 'Market Demand' && (
                                <motion.div
                                    key="demand-tab"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="premium-card"
                                    style={{ padding: '2rem' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>High Demand & Unmet Requests</h3>
                                            <p style={{ color: 'var(--text-muted)' }}>Buyers requested more stock than you currently have.</p>
                                        </div>
                                        <div style={{ background: 'rgba(233, 30, 99, 0.1)', color: '#E91E63', padding: '0.8rem 1.2rem', borderRadius: '12px', fontWeight: 700 }}>
                                            Total Gap: {demandRequests.reduce((sum, r) => sum + (r.requestedQty - r.availableQty), 0)} kg
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {demandRequests.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                                <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                                <p>No unmet demand requests yet.</p>
                                            </div>
                                        ) : (
                                            demandRequests.map((req, i) => (
                                                <div key={i} className="premium-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '1.5rem' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                                                        <div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Produce</div>
                                                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{req.productName}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Buyer</div>
                                                            <div style={{ fontWeight: 600 }}>{req.buyer?.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{req.buyer?.username || req.buyer?.id?.split('@')[0]}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Requested vs Stock</div>
                                                            <div style={{ color: '#E91E63', fontWeight: 800 }}>{req.requestedQty}kg <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>(You had {req.availableQty}kg)</span></div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <button
                                                                onClick={() => {
                                                                    setProductToEdit(listings.find(p => p._id === req.productId));
                                                                    setView('add-crop');
                                                                }}
                                                                style={{ padding: '0.6rem 1rem', borderRadius: '8px', background: 'var(--primary)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                                                            >
                                                                Update Stock
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div >
    );
};

const ProfileForm = ({ user, role }: { user: any, role: string }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: user?.location || '',
        password: '',
        confirmPassword: '',
        landSize: '',
        cropsGrown: '',
        aadhaarLast4: '',
        // Buyer fields
        type: 'household',
        shopName: '',
        preferences: '',
        isMfaVerified: user?.isMfaVerified || false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    const res = await profileAPI.getProfile(user.id || user.email || user._id, role); // Ensure we pass an ID if possible
                    if (res.data) {
                        const d = res.data;
                        setFormData(prev => ({
                            ...prev,
                            name: d.user?.name || prev.name,
                            username: d.user?.username || prev.username,
                            phone: d.user?.mobileNumber || prev.phone,
                            location: d.user?.location || prev.location,
                            landSize: d.landSize?.toString() || '',
                            cropsGrown: d.cropsGrown?.join(', ') || '',
                            aadhaarLast4: d.kyc?.aadhaarLast4 || '',
                            // Buyer specific
                            type: d.type || 'household',
                            shopName: d.businessData?.shopName || '',
                            preferences: d.preferences?.join(', ') || '',
                            isMfaVerified: d.user?.isMfaVerified || false
                        }));
                    }
                } catch (e) { console.error(e); }
            }
        };
        fetchProfile();
    }, [user, role]);

    const handleVerifyMFA = async () => {
        if (formData.isMfaVerified) {
            toast.success("MFA is already verified!");
            return;
        }
        try {
            const userId = user.id || user._id || user.userId || user.email;

            if (!userId) {
                toast.error("User session expired. Please login again.");
                return;
            }


            // Call backend to persist MFA verification
            await authAPI.toggleMfa({ userId, enable: true });

            toast.success("MFA Verified successfully! Reloading profile...");

            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (err) {
            console.error("MFA Error:", err);
            toast.error("MFA Verification failed. Please try again.");
        }
    };


    const validateUsername = (username: string) => {
        if (username.length < 4) return "Minimum 4 characters required";
        if (!/[a-z]/.test(username)) return "Must include a lowercase letter";
        if (!/[A-Z]/.test(username)) return "Must include an uppercase letter";
        if (!/[0-9]/.test(username)) return "Must include a number";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(username)) return "Must include a special character";
        return "";
    };

    const validatePassword = (pass: string) => {
        if (!pass) return ""; // Password change is optional
        if (pass.length < 8) return "Password must be at least 8 characters";
        if (!/[a-z]/.test(pass)) return "Password must include a lowercase letter";
        if (!/[A-Z]/.test(pass)) return "Password must include an uppercase letter";
        if (!/[0-9]/.test(pass)) return "Password must include a number";
        if (!/[@$!%*?&]/.test(pass)) return "Password must include a special character (@, $, !, %, *, ?, &)";
        if (/\s/.test(pass)) return "Password cannot contain whitespace";
        return "";
    };

    const handleSave = async () => {
        const usernameError = validateUsername(formData.username);
        if (usernameError) {
            toast.error(usernameError);
            return;
        }

        if (formData.password) {
            const passError = validatePassword(formData.password);
            if (passError) {
                toast.error(passError);
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                toast.error("Passwords do not match");
                return;
            }
        }

        try {
            const payload: any = {
                userId: user.userId || user.id || user._id || user.email,
                role,
                name: formData.name,
                username: formData.username,
                phone: formData.phone,
                email: formData.email,
                location: formData.location,
                isMfaVerified: formData.isMfaVerified,
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            if (role === 'farmer') {
                payload.landSize = Number(formData.landSize);
                payload.cropsGrown = formData.cropsGrown.split(',').map(s => s.trim()).filter(s => s);
                payload.aadhaarLast4 = formData.aadhaarLast4;
                // Coordinates placeholder - logic to convert location string to coords would go here or in backend
                payload.coordinates = [78.1198, 9.9252]; // Hardcoded Madurai for now
            } else if (role === 'buyer') {
                payload.type = formData.type;
                if (formData.type === 'retailer' || formData.type === 'hotel') payload.shopName = formData.shopName;
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
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Username</label>
                <div style={{ position: 'relative' }}>
                    <User size={18} className="input-icon" style={{ color: 'var(--primary)' }} />
                    <input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="premium-input with-icon" placeholder="Unique username" />
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>4+ chars, A-Z, a-z, 0-9, special char</p>
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

            <div style={{ gridColumn: 'span 2', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={18} /> Account Security
                </h4>
            </div>

            <div className="input-group" style={{
                gridColumn: 'span 2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: formData.isMfaVerified ? 'rgba(76, 175, 80, 0.08)' : 'rgba(255, 152, 0, 0.05)',
                padding: '1.2rem',
                borderRadius: '16px',
                border: formData.isMfaVerified ? '1px solid rgba(76, 175, 80, 0.2)' : '1px solid rgba(255, 152, 0, 0.1)',
                marginBottom: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: formData.isMfaVerified ? 'var(--primary)' : 'rgba(255, 152, 0, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h5 style={{ fontWeight: 700, marginBottom: '0.2rem', fontSize: '1rem' }}>
                            {formData.isMfaVerified ? 'Account Identity Secured' : 'Secure Your Account'}
                        </h5>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {formData.isMfaVerified
                                ? 'Your identity is verified via Multi-Factor Authentication.'
                                : 'Enable MFA to protect your account from unauthorized access.'}
                        </p>
                    </div>
                </div>

                {!formData.isMfaVerified ? (
                    <button
                        type="button"
                        onClick={handleVerifyMFA}
                        className="btn-primary"
                        style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
                    >
                        Verify Now
                    </button>
                ) : (
                    <div style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                        Verified ✅
                    </div>
                )}
            </div>

            <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                    <ShieldCheck size={18} className="input-icon" />
                    <input type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="premium-input with-icon" placeholder="Leave blank to keep current" style={{ paddingRight: '2.5rem' }} />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Min 8 chars, A-Z, a-z, 0-9, @$!%*?&</p>
            </div>

            <div className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                    <ShieldCheck size={18} className="input-icon" />
                    <input type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} className="premium-input with-icon" style={{ paddingRight: '2.5rem' }} />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                    >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
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
                            <option value="hotel">Hotel / Restaurant</option>
                        </select>
                    </div>

                    {(formData.type === 'retailer' || formData.type === 'hotel') && (
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
                <button className="btn-primary" onClick={handleSave}>Secure Save</button>
            </div>
        </div>
    );
};

export default FarmerDashboard;
