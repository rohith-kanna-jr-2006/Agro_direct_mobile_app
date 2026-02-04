import { Filter, Leaf, Mail, MapPin, Mic, Phone, Search as SearchIcon, ShoppingCart, User, X } from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { orderAPI, productAPI, profileAPI } from '../services/api';
import Profile from './Profile';

const BuyerDashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('marketplace'); // 'marketplace' or 'profile'
    const [showCart, setShowCart] = useState(false);
    const [cartItems, setCartItems] = useState<any[]>([]);

    // Filter States
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState(500);
    const [showNearest, setShowNearest] = useState(false);

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

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAddToCart = (product: any) => {
        setCartItems([...cartItems, product]);
        toast.success(`Added ${product.name || product.key} to cart!`);
        setShowCart(true);
    };

    const handlePurchase = async () => {
        // Simplified checkout for demo
        const orderPromises = cartItems.map(item => {
            const orderData = {
                productName: item.name || item.key,
                totalPrice: parseInt((item.price || '0').replace(/[^0-9]/g, '')),
                quantity: 1,
                farmer: {
                    name: item.farm || item.farmerName || "Verified Farmer",
                    address: item.dist ? `${item.dist} away` : "Local",
                    rating: item.grade || "5.0"
                },
                userId: user?.email,
                userName: user?.name,
                userAddress: user?.location || "Madurai, TN"
            };
            return orderAPI.create(orderData);
        });

        try {
            await toast.promise(
                Promise.all(orderPromises),
                {
                    loading: 'Processing checkout...',
                    success: 'Order placed successfully!',
                    error: 'Checkout failed.',
                }
            );
            setCartItems([]);
            setShowCart(false);
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
                            onClick={() => setView(view === 'marketplace' ? 'profile' : 'marketplace')}
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
                                        <div key={i} className="premium-card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                                            <div className="product-image-container" style={{ position: 'relative', overflow: 'hidden' }}>
                                                <img src={item.img || item.image} alt={item.name} style={{ width: '100%', height: '200px', objectFit: 'cover', transition: 'transform 0.3s ease' }} />
                                                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--primary)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem' }}>
                                                    {item.grade || 'A'}
                                                </div>
                                                <div className="quick-view-overlay" style={{
                                                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s',
                                                    cursor: 'pointer'
                                                }}>
                                                    <button style={{ padding: '0.5rem 1rem', background: 'white', border: 'none', borderRadius: '20px', fontWeight: 600 }}>Quick View</button>
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
                                                <button
                                                    onClick={() => handleAddToCart(item)}
                                                    className="btn-primary"
                                                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.9rem', padding: '0.6rem' }}
                                                >
                                                    {t('Add to Cart')}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
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
                                    <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                        <img src={item.img || item.image || "https://placeholder.com/50x50"} alt="" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                                        <div>
                                            <h4>{item.name || item.key}</h4>
                                            <div style={{ color: 'var(--primary)', fontWeight: 600 }}>{item.price}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 700, fontSize: '1.2rem' }}>
                                    <span>Total</span>
                                    <span>₹{cartItems.reduce((acc, item) => acc + parseInt((item.price || '0').replace(/[^0-9]/g, '')), 0)}</span>
                                </div>
                                <button className="btn-primary" onClick={handlePurchase} style={{ width: '100%', padding: '1rem', justifyContent: 'center' }}>Checkout Now</button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </div >
    );
};


const BuyerProfileForm = ({ user, role }: { user: any, role: string }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: user?.location || '',
        // Buyer fields
        type: 'household',
        shopName: '',
        gstNumber: '',
        preferences: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    const res = await profileAPI.getProfile(user.id || user.email || user._id, role);
                    if (res.data) {
                        const d = res.data;
                        setFormData(prev => ({
                            ...prev,
                            type: d.type || 'household',
                            shopName: d.businessData?.shopName || '',
                            gstNumber: d.businessData?.gstNumber || '',
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
                email: formData.email,
                location: formData.location,
                type: formData.type,
                preferences: formData.preferences.split(',').map(s => s.trim()).filter(s => s)
            };

            if (formData.type === 'retailer') {
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
                    <ShoppingCart size={18} /> Buyer Details
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
