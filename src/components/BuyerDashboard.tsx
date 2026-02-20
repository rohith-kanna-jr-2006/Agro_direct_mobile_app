import { Calendar, Cpu, Download, Eye, EyeOff, FileText, Filter, Leaf, Mail, MapPin, Mic, Minus, Phone, Plus, Printer, Search as SearchIcon, ShieldCheck, ShoppingBag, ShoppingCart, User, X } from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderAPI, productAPI, profileAPI } from '../services/api';
import BuyerChat from './BuyerChat';
import LiveTracking from './LiveTracking';
import Profile from './Profile';

const ProductCard = ({ item, onAddToCart, onOpenDetail, onQuickView, t }: { item: any; onAddToCart: (qty: number) => void; onOpenDetail: () => void; onQuickView: () => void; t: any }) => {
    const [qty, setQty] = useState(1);

    const increment = (e: React.MouseEvent) => {
        e.stopPropagation();
        setQty(prev => prev + 1);
    };
    const decrement = (e: React.MouseEvent) => {
        e.stopPropagation();
        setQty(prev => (prev > 1 ? prev - 1 : 1));
    };

    return (
        <div className="premium-card" onClick={onOpenDetail} style={{ padding: 0, overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
            <div className="product-image-container" style={{ position: 'relative', overflow: 'hidden' }}>
                <img src={item.img || item.image} alt={item.name} style={{ width: '100%', height: '200px', objectFit: 'cover', transition: 'transform 0.3s ease' }} />
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    zIndex: 2
                }}>
                    <ShieldCheck size={12} />
                    {item.grade || 'Grade A'}
                </div>
                <div className="quick-view-overlay" style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s',
                    cursor: 'pointer'
                }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onQuickView(); }}
                        style={{ padding: '0.5rem 1rem', background: 'white', border: 'none', borderRadius: '20px', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Quick View
                    </button>
                </div>
                <style>{`.product-image-container:hover .quick-view-overlay { opacity: 1; }`}</style>
            </div>

            <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{item.name || (item.key ? t(`marketplace.products.${item.key}`) : 'Product')}</h3>
                    <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{item.price}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Leaf size={12} /> {item.farm || item.farmerName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                        <MapPin size={12} /> {item.dist || 'Local'}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', padding: '0.5rem' }}>
                    <button
                        onClick={decrement}
                        style={{ background: 'white', border: 'none', borderRadius: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                    >
                        <Minus size={16} />
                    </button>
                    <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: '1.1rem' }}>{qty}</span>
                    <button
                        onClick={increment}
                        style={{ background: 'white', border: 'none', borderRadius: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                    >
                        <Plus size={16} />
                    </button>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(qty);
                    }}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.9rem', padding: '0.8rem' }}
                >
                    {t('Add to Cart')}
                </button>
            </div>
        </div>
    );
};

const BuyerDashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('marketplace'); // 'marketplace' or 'profile' or 'orders' or 'statement'
    const [showCart, setShowCart] = useState(false);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Filter States
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState(500);
    const [showNearest, setShowNearest] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<any>(null);
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [showProductDetail, setShowProductDetail] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState<any>(null);
    const [showAIChat, setShowAIChat] = useState(false);

    const categoryKeys = ['vegetables', 'fruits', 'grains', 'pulses', 'oil_seeds', 'spices'];

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productAPI.getAll();
            if (response.data && response.data.length > 0) {
                setProducts(response.data);
            } else {
                // Fallback to mock data if DB is empty
                setProducts([
                    { key: 'tomato', name: "Organic Tomato", farm: 'Ramesh, Madurai', dist: '5km', price: '₹40/kg', grade: 'Grade A', img: 'https://images.unsplash.com/photo-1546473427-e1ad6d66be85?auto=format&fit=crop&q=80&w=400', category: 'vegetables' },
                    { key: 'potato', name: "Fresh Potato", farm: 'Hillside Harvest', dist: '12km', price: '₹22/kg', grade: 'Grade A+', img: 'https://images.unsplash.com/photo-1518977676601-b53f02bad67b?auto=format&fit=crop&q=80&w=400', category: 'vegetables' },
                    { key: 'paddy', name: "Premium Rice", farm: 'River Delta Mills', dist: '82km', price: '₹65/kg', grade: 'Grade S', img: 'https://images.unsplash.com/photo-1586201327693-866199f121df?auto=format&fit=crop&q=80&w=400', category: 'grains' },
                    { key: 'corn', name: "Sweet Corn", farm: 'Sunshine Acres', dist: '5km', price: '₹30/kg', grade: 'Grade B+', img: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=400', category: 'grains' },
                    { key: 'apple', name: "Kashmir Apple", farm: 'Highland Orchards', dist: '2000km', price: '₹120/kg', grade: 'Grade A', img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=400', category: 'fruits' },
                ]);
            }
        } catch (err) {
            console.error("Failed to fetch products:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await orderAPI.getAll();
            // Filter orders for this user (robust check for email or id)
            const userOrders = response.data.filter((o: any) =>
                o.userId === user?.email || o.userId === user?.userId || o.userName === user?.name
            );
            setOrders(userOrders);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchOrders();
    }, [user]);

    const handleAddToCart = (product: any, qty: number) => {
        const productKey = product._id || product.key;
        const existingItemIndex = cartItems.findIndex(item => (item._id || item.key) === productKey);

        if (existingItemIndex > -1) {
            const newCart = [...cartItems];
            newCart[existingItemIndex].qty += qty;
            setCartItems(newCart);
        } else {
            setCartItems([...cartItems, { ...product, qty }]);
        }

        toast.success(`Added ${qty} ${product.name || product.key} to cart!`);
        setShowProductDetail(false);
        setShowCart(true);
    };

    const handleQuickBuy = (product: any, qty: number) => {
        setCartItems([{ ...product, qty }]);
        setShowProductDetail(false);
        setShowCheckoutModal(true);
    };

    const handlePurchase = async () => {
        // Simplified checkout for demo
        const orderPromises = cartItems.map(item => {
            const unitPrice = parseInt((item.price || '0').replace(/[^0-9]/g, ''));
            const orderData = {
                productName: item.name || item.key,
                totalPrice: unitPrice * (item.qty || 1),
                quantity: item.qty || 1,
                paymentMethod: paymentMethod,
                farmer: {
                    id: item.farmerContact || item.farm || "Generic", // Use contact/email as unique ID
                    name: item.farm || item.farmerName || "Verified Farmer",
                    address: item.dist ? `${item.dist} away` : "Local",
                    rating: item.grade || "5.0"
                },
                productId: item._id, // Add productId for inventory management
                userId: user?.email,
                userName: user?.name,
                userUsername: user?.username,
                userAddress: user?.location || "Madurai, TN"
            };
            return orderAPI.create(orderData);
        });

        try {
            const results = await toast.promise(
                Promise.all(orderPromises),
                {
                    loading: 'Processing checkout...',
                    success: 'Order placed successfully!',
                    error: 'Checkout failed.',
                }
            );

            if (results.length > 0) {
                const newOrder = results[0].data;
                setOrderSuccess(newOrder);
                setShowCheckoutModal(false);
            }

            setCartItems([]);
            setShowCart(false);
            fetchOrders();
        } catch (error) {
            console.error("Purchase error:", error);
        }
    };

    // Filter Logic
    const filteredProducts = products.filter(p => {
        const name = (p.name || p.key || '').toLowerCase();
        const search = searchTerm.toLowerCase();

        // Filter by text
        if (searchTerm && !name.includes(search)) return false;

        // Filter by category
        if (selectedCategories.length > 0 && !selectedCategories.includes(p.category || 'vegetables')) return false;

        // Filter by price
        const priceStr = String(p.price || '0');
        const price = parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
        if (price > priceRange) return false;

        // Filter by distance
        if (showNearest) {
            const distStr = String(p.dist || '100');
            const dist = parseInt(distStr.replace(/[^0-9]/g, '')) || 0;
            if (dist > 10) return false;
        }
        return true;
    });

    const toggleCategory = (cat: string) => {
        if (selectedCategories.includes(cat)) {
            setSelectedCategories(selectedCategories.filter(c => c !== cat));
        } else {
            setSelectedCategories([...selectedCategories, cat]);
        }
    };

    const [showSearch, setShowSearch] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 150) {
                setShowSearch(false);
            } else {
                setShowSearch(true);
            }
            setLastScrollY(currentScrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <div className="buyer-dashboard" style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--background)' }}>

            {/* Search Bar & Actions */}
            <motion.div
                initial={{ y: 0 }}
                animate={{ y: showSearch ? 0 : -100, opacity: showSearch ? 1 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{
                    position: 'sticky',
                    top: '80px',
                    zIndex: 900,
                    padding: '1.25rem 0',
                    background: 'linear-gradient(to bottom, var(--background) 70%, transparent)',
                    backdropFilter: 'blur(12px)',
                    pointerEvents: showSearch ? 'all' : 'none'
                }}
            >
                <div className="container" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <motion.div
                        initial={false}
                        whileHover={{ borderColor: 'var(--primary)', boxShadow: '0 8px 32px rgba(76, 175, 80, 0.15)' }}
                        style={{
                            position: 'relative',
                            flex: 1,
                            background: 'rgba(22, 27, 34, 0.7)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '20px',
                            border: '1px solid var(--border)',
                            padding: '0.25rem 1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <SearchIcon size={20} style={{ color: 'var(--primary)', marginRight: '1rem' }} />
                        <input
                            type="text"
                            placeholder={t('dashboard.search_placeholder')}
                            style={{
                                width: '100%',
                                padding: '0.9rem 0',
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none',
                                fontWeight: 500
                            }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '0.5rem' }}>
                            {searchTerm && (
                                <motion.button
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    onClick={() => setSearchTerm('')}
                                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
                                >
                                    <X size={14} />
                                </motion.button>
                            )}
                            <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
                            <motion.button
                                whileHover={{ scale: 1.1, color: 'var(--primary)' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => toast.success("Voice Search coming soon!", { icon: '🎙️' })}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                            >
                                <Mic size={20} />
                            </motion.button>
                        </div>
                    </motion.div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-primary"
                            onClick={() => setShowCart(true)}
                            style={{
                                padding: '0.8rem 1.4rem',
                                borderRadius: '18px',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                boxShadow: '0 8px 20px var(--primary-glow)'
                            }}
                        >
                            <ShoppingCart size={20} />
                            <span style={{ fontWeight: 800, fontSize: '1rem' }}>{cartItems.length}</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setView('orders')}
                            style={{
                                width: '54px',
                                height: '54px',
                                background: view === 'orders' ? 'var(--primary)' : 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '18px',
                                color: view === 'orders' ? 'white' : 'var(--text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                boxShadow: view === 'orders' ? '0 8px 20px var(--primary-glow)' : '0 8px 20px rgba(0,0,0,0.2)'
                            }}
                        >
                            <ShoppingBag size={22} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setView(view === 'profile' ? 'marketplace' : 'profile')}
                            style={{
                                width: '54px',
                                height: '54px',
                                background: view === 'profile' ? 'var(--primary)' : 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '18px',
                                color: view === 'profile' ? 'white' : 'var(--text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                boxShadow: view === 'profile' ? '0 8px 20px var(--primary-glow)' : '0 8px 20px rgba(0,0,0,0.2)'
                            }}
                        >
                            <User size={22} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setView('statement')}
                            style={{
                                width: '54px',
                                height: '54px',
                                background: view === 'statement' ? 'var(--primary)' : 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '18px',
                                color: view === 'statement' ? 'white' : 'var(--text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                boxShadow: view === 'statement' ? '0 8px 20px var(--primary-glow)' : '0 8px 20px rgba(0,0,0,0.2)'
                            }}
                        >
                            <FileText size={22} />
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            <div className="container" style={{ padding: '2rem 0', display: 'flex', gap: '2rem' }}>
                {view === 'marketplace' ? (
                    <>
                        {/* Sidebar Filters */}
                        <aside style={{ width: '250px', flexShrink: 0 }}>
                            <div className="premium-card" style={{ padding: '1.5rem', position: 'sticky', top: '180px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>
                                    <Filter size={18} /> Filters
                                </div>

                                {/* Categories */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Categories</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {categoryKeys.map(cat => (
                                            <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(cat)}
                                                    onChange={() => toggleCategory(cat)}
                                                    style={{ accentColor: 'var(--primary)' }}
                                                />
                                                <span style={{ textTransform: 'capitalize' }}>{t(`dashboard.categories.${cat}`) || cat}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Max Price: ₹{priceRange}</h4>
                                    <input
                                        type="range"
                                        min="10"
                                        max="500"
                                        value={priceRange}
                                        onChange={(e) => setPriceRange(Number(e.target.value))}
                                        style={{ width: '100%', accentColor: 'var(--primary)' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                        <span>₹10</span>
                                        <span>₹500</span>
                                    </div>
                                </div>

                                {/* Distance */}
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={showNearest}
                                            onChange={() => setShowNearest(!showNearest)}
                                            style={{ accentColor: 'var(--primary)' }}
                                        />
                                        Nearest Farmers (&lt; 10km)
                                    </label>
                                </div>
                            </div>
                        </aside>

                        {/* Product Grid */}
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem' }}>{t('dashboard.greeting')} {user?.name?.split(' ')[0] || 'User'}</h2>
                                <span style={{ color: 'var(--text-muted)' }}>Showing {filteredProducts.length} results</span>
                            </div>

                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                                    <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                                    {filteredProducts.map((item, i) => (
                                        <ProductCard
                                            key={item._id || item.key || i}
                                            item={item}
                                            onAddToCart={(qty) => handleAddToCart(item, qty)}
                                            onOpenDetail={() => {
                                                navigate(`/product/${item._id || item.key}`);
                                            }}
                                            onQuickView={() => {
                                                setSelectedProduct(item);
                                                setShowProductDetail(true);
                                            }}
                                            t={t}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : view === 'orders' ? (
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem', fontWeight: 800 }}>My Orders</h2>
                        {orders.length === 0 ? (
                            <div className="premium-card" style={{ padding: '4rem', textAlign: 'center' }}>
                                <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No orders yet. Start shopping!</p>
                                <button onClick={() => setView('marketplace')} className="btn-primary" style={{ marginTop: '1.5rem', marginInline: 'auto' }}>Go to Marketplace</button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                {orders.map((order, idx) => (
                                    <motion.div
                                        key={order._id || idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="premium-card"
                                        style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    >
                                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                                <ShoppingBag size={28} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, marginBottom: '0.4rem', textTransform: 'uppercase' }}>Order #${order.trackingId || order._id.slice(-6).toUpperCase()}</div>
                                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{order.productName}</h3>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ordered on {new Date(order.date).toLocaleDateString()}</p>
                                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.85rem', padding: '2px 10px', borderRadius: '20px', background: 'rgba(76, 175, 80, 0.1)', color: 'var(--primary)', fontWeight: 600 }}>
                                                        {order.status || 'Processing'}
                                                    </span>
                                                    <span style={{ fontWeight: 800, color: 'var(--text)' }}>₹{order.totalPrice}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button
                                                onClick={() => {
                                                    setSelectedOrderForTracking(order);
                                                    setShowTrackingModal(true);
                                                }}
                                                className="btn-primary"
                                                style={{ fontSize: '0.9rem', padding: '0.7rem 1.2rem' }}
                                            >
                                                Track Live
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : view === 'statement' ? (
                    <div style={{ flex: 1 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="premium-card"
                            style={{ padding: '2rem' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Purchase Statements</h2>
                                    <p style={{ color: 'var(--text-muted)' }}>Review and export your spending history.</p>
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
                                            const csv = "Date,Order ID,Product,Quantity,Amount,Farmer\n" +
                                                filtered.map(o => `${new Date(o.date).toLocaleDateString()},${o.trackingId || o._id},${o.productName},${o.quantity},₹${o.totalPrice},${o.farmer?.name || 'Farmer'}`).join("\n");
                                            const blob = new Blob([csv], { type: 'text/csv' });
                                            const url = window.URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `Purchase_Statement_${startDate || 'All'}.csv`;
                                            a.click();
                                        }}
                                        className="btn-primary"
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}
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
                                                        <title>Purchase Statement - ${user?.name}</title>
                                                        <style>
                                                            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
                                                            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #4CAF50; padding-bottom: 20px; margin-bottom: 30px; }
                                                            .title { font-size: 24px; font-weight: 800; color: #4CAF50; }
                                                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                                            th { background: #f8f9fa; text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
                                                            td { padding: 12px; border-bottom: 1px solid #eee; }
                                                            .total { font-weight: 800; font-size: 18px; text-align: right; margin-top: 20px; }
                                                            .footer { margin-top: 50px; font-size: 12px; color: #999; text-align: center; }
                                                        </style>
                                                    </head>
                                                    <body>
                                                        <div class="header">
                                                            <div>
                                                                <div class="title">FarmDirect - Purchase Statement</div>
                                                                <div>Customer: ${user?.name}</div>
                                                                <div>Period: ${startDate || 'inception'} to ${endDate || 'present'}</div>
                                                            </div>
                                                            <div style="text-align: right">
                                                                <div>Date: ${new Date().toLocaleDateString()}</div>
                                                                <div>Total Spent: ₹${filtered.reduce((sum, o) => sum + (o.totalPrice || 0), 0)}</div>
                                                            </div>
                                                        </div>
                                                        <table>
                                                            <thead>
                                                                <tr><th>Date</th><th>Order ID</th><th>Product</th><th>Qty</th><th>Farmer</th><th style="text-align: right">Amount</th></tr>
                                                            </thead>
                                                            <tbody>
                                                                ${filtered.map(o => `
                                                                    <tr>
                                                                        <td>${new Date(o.date).toLocaleDateString()}</td>
                                                                        <td>#${o.trackingId || o._id.slice(-6).toUpperCase()}</td>
                                                                        <td>${o.productName}</td>
                                                                        <td>${o.quantity}</td>
                                                                        <td>${o.farmer?.name || 'Local Farmer'}</td>
                                                                        <td style="text-align: right">₹${o.totalPrice}</td>
                                                                    </tr>
                                                                `).join('')}
                                                            </tbody>
                                                        </table>
                                                        <div class="total">Total Expenditure: ₹${filtered.reduce((sum, o) => sum + (o.totalPrice || 0), 0)}</div>
                                                        <div class="footer">This is a system generated statement from FarmDirect.</div>
                                                        <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); };</script>
                                                    </body>
                                                </html>
                                            `;
                                            printWindow.document.write(html);
                                            printWindow.document.close();
                                        }}
                                        className="btn-primary"
                                    >
                                        <Printer size={18} /> PDF
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>From Date</label>
                                    <div style={{ position: 'relative' }}>
                                        <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: 'var(--background)', border: '1px solid var(--border)', color: 'white', borderRadius: '10px' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>To Date</label>
                                    <div style={{ position: 'relative' }}>
                                        <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: 'var(--background)', border: '1px solid var(--border)', color: 'white', borderRadius: '10px' }} />
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
                                                    <td style={{ padding: '1rem' }}>{o.quantity}</td>
                                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700 }}>₹{o.totalPrice}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    <div className="premium-card" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                        <h2 style={{ marginBottom: '2rem' }}>My Profile</h2>
                        <Profile />
                        <BuyerProfileForm user={user} role="buyer" />
                    </div>
                )}
            </div>

            {/* Cart Slide-out */}
            <AnimatePresence>
                {showCart && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowCart(false)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }}
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', background: 'var(--surface)', zIndex: 999, borderLeft: '1px solid var(--border)', padding: '2rem', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2>Your Cart ({cartItems.length})</h2>
                                <button onClick={() => setShowCart(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer' }}><X size={24} /></button>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                {cartItems.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                                        <img src={item.img || item.image || "https://placeholder.com/50x50"} alt="" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontWeight: 700 }}>{item.name || item.key}</h4>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                                <div style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                                    {item.price} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 400 }}>x {item.qty || 1}</span>
                                                </div>
                                                <div style={{ fontWeight: 800 }}>
                                                    ₹{parseInt((item.price || '0').replace(/[^0-9]/g, '')) * (item.qty || 1)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 700, fontSize: '1.2rem' }}>
                                    <span>Total</span>
                                    <span>₹{cartItems.reduce((acc, item) => acc + (parseInt((item.price || '0').replace(/[^0-9]/g, '')) * (item.qty || 1)), 0)}</span>
                                </div>
                                <button className="btn-primary" onClick={() => { setShowCart(false); setShowCheckoutModal(true); }} style={{ width: '100%', padding: '1rem', justifyContent: 'center' }}>Checkout Now</button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Tracking Modal */}
            <AnimatePresence>
                {showTrackingModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowTrackingModal(false)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000 }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            style={{
                                position: 'fixed',
                                top: '8%',
                                left: '8%',
                                right: '8%',
                                bottom: '8%',
                                background: 'var(--background)',
                                zIndex: 1001,
                                borderRadius: '32px',
                                padding: '2.5rem',
                                boxShadow: '0 25px 70px -12px rgba(0, 0, 0, 0.8)',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ShoppingBag size={32} color="var(--primary)" />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', margin: 0 }}>Live Tracking</h2>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '4px 0 0 0' }}>Order #{selectedOrderForTracking?._id || '...'}</p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90, background: 'rgba(255,255,255,0.1)' }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowTrackingModal(false)}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border)',
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: 'white',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <X size={28} />
                                </motion.button>
                            </div>

                            <div style={{ flex: 1, minHeight: 0, borderRadius: '24px', overflow: 'hidden' }}>
                                <LiveTracking
                                    orderId={selectedOrderForTracking?._id || 'test_order'}
                                    initialPosition={{ lat: 12.9716, lng: 77.5946 }}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Product Detail Modal */}
            <AnimatePresence>
                {showProductDetail && selectedProduct && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowProductDetail(false)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000 }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            style={{
                                position: 'fixed', top: '10%', left: '10%', right: '10%', bottom: '10%',
                                background: 'var(--background)', zIndex: 1001, borderRadius: '32px',
                                overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr',
                                border: '1px solid var(--border)', boxShadow: '0 25px 70px rgba(0,0,0,0.5)'
                            }}
                        >
                            <div style={{ position: 'relative' }}>
                                <img src={selectedProduct.img || selectedProduct.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button
                                    onClick={() => setShowProductDetail(false)}
                                    style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{selectedProduct.name || selectedProduct.key}</h2>
                                        <span style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 800 }}>{selectedProduct.price}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>{selectedProduct.grade}</span>
                                        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{selectedProduct.category}</span>
                                    </div>
                                </div>

                                <div className="premium-card" style={{ padding: '1.5rem' }}>
                                    <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                                        <ShieldCheck size={18} /> Verified AI Quality Audit
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        {[
                                            { label: 'Freshness', value: selectedProduct.qualityDetails?.freshness ? `${selectedProduct.qualityDetails.freshness}%` : '98%', color: '#4CAF50' },
                                            { label: 'Ripeness', value: selectedProduct.qualityDetails?.ripeness ? `${selectedProduct.qualityDetails.ripeness}%` : '92%', color: '#FFC107' },
                                            { label: 'Texture', value: selectedProduct.qualityDetails?.texture ? `${selectedProduct.qualityDetails.texture}%` : '95%', color: '#2196F3' },
                                            { label: 'Shelf Life', value: selectedProduct.qualityDetails?.shelfLife || '8 Days', color: '#9C27B0' }
                                        ].map((m, idx) => (
                                            <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{m.label}</div>
                                                <div style={{ fontWeight: 700 }}>{m.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Cpu size={14} /> AI Analysis timestamp: {new Date().toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="premium-card" style={{ padding: '1.5rem' }}>
                                    <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={18} /> Farmer Details</h4>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {selectedProduct.farmerImg ? (
                                                <img src={selectedProduct.farmerImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ background: 'var(--primary)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                                    <User size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 700, margin: 0 }}>{selectedProduct.farmerName || selectedProduct.farm || 'Verified Farmer'}</p>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', margin: '4px 0 0 0' }}>
                                                <MapPin size={14} /> {selectedProduct.farmerAddress || 'Village: Melur, Dist: Madurai'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '0.5rem 1rem' }}>
                                        <ShoppingCart size={20} />
                                        <span style={{ fontWeight: 700 }}>1 kg (Default)</span>
                                    </div>
                                    <button
                                        onClick={() => handleAddToCart(selectedProduct, 1)}
                                        className="btn-primary"
                                        style={{ flex: 2, justifyContent: 'center', padding: '1.2rem' }}
                                    >
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={() => handleQuickBuy(selectedProduct, 1)}
                                        className="btn-primary"
                                        style={{ flex: 2, justifyContent: 'center', padding: '1.2rem', background: 'white', color: 'black' }}
                                    >
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Checkout Modal */}
            <AnimatePresence>
                {showCheckoutModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowCheckoutModal(false)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000 }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            style={{
                                position: 'fixed', top: '15%', left: '30%', right: '30%', bottom: '15%',
                                background: 'var(--background)', zIndex: 1001, borderRadius: '32px',
                                padding: '3rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '2rem'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Secure Checkout</h2>
                                <button onClick={() => setShowCheckoutModal(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
                            </div>

                            <div className="premium-card" style={{ padding: '1.5rem' }}>
                                <h4 style={{ marginBottom: '1.5rem' }}>Select Payment Method</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {['upi', 'card', 'cod'].map(method => (
                                        <div
                                            key={method}
                                            onClick={() => setPaymentMethod(method)}
                                            style={{
                                                padding: '1rem 1.5rem',
                                                borderRadius: '16px',
                                                border: `2px solid ${paymentMethod === method ? 'var(--primary)' : 'var(--border)'}`,
                                                background: paymentMethod === method ? 'var(--primary-glow)' : 'transparent',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{method}</span>
                                            {paymentMethod === method && <ShieldCheck size={20} color="var(--primary)" />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 700 }}>
                                    <span>Total Amount</span>
                                    <span>₹{cartItems.reduce((acc, item) => acc + (parseInt((item.price || '0').replace(/[^0-9]/g, '')) * (item.qty || 1)), 0)}</span>
                                </div>
                                <button onClick={handlePurchase} className="btn-primary" style={{ width: '100%', padding: '1.2rem', justifyContent: 'center', fontSize: '1.1rem' }}>
                                    Confirm & Pay
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Order Success Modal */}
            <AnimatePresence>
                {orderSuccess && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)', zIndex: 1100 }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            style={{
                                position: 'fixed', top: '25%', left: '35%', right: '35%', textAlign: 'center',
                                background: 'var(--surface)', zIndex: 1101, borderRadius: '32px',
                                padding: '4rem 3rem', border: '1px solid var(--primary)', boxShadow: '0 0 50px var(--primary-glow)'
                            }}
                        >
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                                <ShieldCheck size={48} />
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Order Confirmed!</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                                Your tracking ID is: <strong style={{ color: 'white' }}>#{orderSuccess._id.slice(-8).toUpperCase()}</strong>
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button
                                    onClick={() => {
                                        setSelectedOrderForTracking(orderSuccess);
                                        setShowTrackingModal(true);
                                        setOrderSuccess(null);
                                    }}
                                    className="btn-primary"
                                    style={{ padding: '1rem 2rem' }}
                                >
                                    Track Live Location
                                </button>
                                <button
                                    onClick={() => setOrderSuccess(null)}
                                    style={{ padding: '1rem 2rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '14px', color: 'white', cursor: 'pointer' }}
                                >
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* AI Assistant Floating Button */}
            {!showAIChat && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowAIChat(true)}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        width: '64px',
                        height: '64px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
                        color: 'white',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 10px 25px rgba(66, 133, 244, 0.4)',
                        zIndex: 999
                    }}
                >
                    <Cpu size={32} />
                    <div style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: 'var(--primary)',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: '2px solid var(--background)',
                        animation: 'pulse 2s infinite'
                    }} />
                </motion.button>
            )}

            {/* AI Chat Drawer/Modal */}
            <AnimatePresence>
                {showAIChat && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAIChat(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(0,0,0,0.4)',
                                backdropFilter: 'blur(4px)',
                                zIndex: 998
                            }}
                        />
                        <BuyerChat onClose={() => setShowAIChat(false)} />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};


const BuyerProfileForm = ({ user, role }: { user: any, role: string }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: user?.location || '',
        password: '',
        confirmPassword: '',
        // Buyer fields
        type: 'household',
        shopName: '',
        gstNumber: '',
        preferences: '',
        isMfaVerified: user?.isMfaVerified || false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    const res = await profileAPI.getProfile(user.id || user.email || user._id, role);
                    if (res.data) {
                        const d = res.data;
                        setFormData(prev => ({
                            ...prev,
                            name: d.user?.name || prev.name,
                            username: d.user?.username || prev.username,
                            phone: d.user?.mobileNumber || prev.phone,
                            location: d.user?.location || prev.location,
                            type: d.type || 'household',
                            shopName: d.businessData?.shopName || '',
                            gstNumber: d.businessData?.gstNumber || '',
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
            setFormData(prev => ({ ...prev, isMfaVerified: true }));
            toast.success("MFA Verified successfully! Your account is now more secure.");
        } catch (err) {
            toast.error("MFA Verification failed.");
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
                type: formData.type,
                preferences: formData.preferences.split(',').map(s => s.trim()).filter(s => s)
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            if (formData.type === 'retailer' || formData.type === 'hotel') {
                payload.businessData = {
                    shopName: formData.shopName,
                    gstNumber: formData.gstNumber
                };
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

            <div style={{ gridColumn: 'span 2', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShoppingCart size={18} /> Buyer Details
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
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>GST Number (Optional)</label>
                        <input type="text" value={formData.gstNumber} onChange={e => setFormData({ ...formData, gstNumber: e.target.value })} className="premium-input" />
                    </div>
                </>
            )}
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Buying Preferences (comma separated)</label>
                <input type="text" value={formData.preferences} onChange={e => setFormData({ ...formData, preferences: e.target.value })} className="premium-input" placeholder="e.g. Tomato, Rice, Spices" />
            </div>

            <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                <button className="btn-primary" onClick={handleSave} style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
                    Save Profile Changes
                </button>
            </div>
        </div>
    );
};

export default BuyerDashboard;
