import { Leaf, MapPin, Mic, Search as SearchIcon, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { orderAPI, productAPI } from '../services/api';

const BuyerDashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const categoryKeys = ['all', 'vegetables', 'fruits', 'grains', 'pulses', 'oil_seeds', 'spices'];

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productAPI.getAll();
            if (response.data && response.data.length > 0) {
                setProducts(response.data);
            } else {
                // Fallback to mock data if DB is empty
                setProducts([
                    { key: 'tomato', farm: 'Green Valley Farms', dist: '12km', price: '₹40/kg', grade: 'Grade A', img: 'https://images.unsplash.com/photo-1546473427-e1ad6d66be85?auto=format&fit=crop&q=80&w=400' },
                    { key: 'potato', farm: 'Hillside Harvest', dist: '45km', price: '₹22/kg', grade: 'Grade A+', img: 'https://images.unsplash.com/photo-1518977676601-b53f02bad67b?auto=format&fit=crop&q=80&w=400' },
                    { key: 'paddy', farm: 'River Delta Mills', dist: '82km', price: '₹65/kg', grade: 'Grade S', img: 'https://images.unsplash.com/photo-1586201327693-866199f121df?auto=format&fit=crop&q=80&w=400' },
                    { key: 'corn', farm: 'Sunshine Acres', dist: '5km', price: '₹30/kg', grade: 'Grade B+', img: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=400' },
                ]);
            }
        } catch (err) {
            console.error("Failed to fetch products:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (product: any) => {
        const orderData = {
            productName: product.key ? t(`marketplace.products.${product.key}`) : product.name,
            totalPrice: parseInt((product.price || '0').replace(/[^0-9]/g, '')),
            quantity: 1,
            farmer: {
                name: product.farm || product.farmerName || "Verified Farmer",
                address: product.dist ? `${product.dist} away` : (product.farmerAddress || "Local"),
                rating: product.grade || product.rating || "5.0"
            },
            userId: user?.email,
            userName: user?.name,
            userAddress: user?.location || "Madurai, TN"
        };

        try {
            await toast.promise(
                orderAPI.create(orderData),
                {
                    loading: 'Processing order with MongoDB...',
                    success: 'Purchased successfully! Order saved to DB.',
                    error: 'Checkout failed. Please try again.',
                }
            );
        } catch (error) {
            console.error("Purchase error:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);



    return (
        <div className="buyer-dashboard" style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--background)' }}>
            {/* Secondary Nav/Search */}
            <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '1rem 0', position: 'sticky', top: '80px', zIndex: 900 }}>
                <div className="container" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <SearchIcon size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder={t('dashboard.search_placeholder')}
                            style={{
                                width: '100%',
                                padding: '0.8rem 1rem 0.8rem 3rem',
                                borderRadius: '12px',
                                background: 'var(--background)',
                                border: '1px solid var(--border)',
                                color: 'white'
                            }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Mic size={20} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', cursor: 'pointer' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                            <MapPin size={16} />
                            <span>Madurai, TN</span>
                        </div>
                        <button className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                            <ShoppingCart size={18} />
                            {t('dashboard.cart')} (3)
                        </button>
                    </div>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 0' }}>
                {/* Categories */}
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
                    {categoryKeys.map((key, i) => (
                        <button key={key} style={{
                            padding: '0.6rem 1.5rem',
                            borderRadius: '100px',
                            whiteSpace: 'nowrap',
                            background: i === 0 ? 'var(--primary)' : 'var(--surface)',
                            border: '1px solid ' + (i === 0 ? 'var(--primary)' : 'var(--border)'),
                            color: 'white',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}>
                            {t(`dashboard.categories.${key}`)}
                        </button>
                    ))}
                </div>

                {/* Featured Products */}
                <h2 style={{ fontSize: '2rem', margin: '2rem 0' }}>{t('dashboard.greeting')} {user?.name.split(' ')[0]}</h2>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {products.map((item, i) => (
                            <div key={i} className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ position: 'relative' }}>
                                    <img src={item.img || item.image} alt={item.key ? t(`marketplace.products.${item.key}`) : item.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--primary)', color: 'white', padding: '4px 10px', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem' }}>
                                        {item.grade || 'A'}
                                    </div>
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontSize: '1.2rem' }}>{item.key ? t(`marketplace.products.${item.key}`) : item.name}</h3>
                                        <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{item.price}</span>
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Leaf size={14} />
                                            <span>{item.farm || item.farmerName}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '4px' }}>
                                            <MapPin size={14} />
                                            <span>{item.dist || 'Local'} {item.dist ? t('dashboard.distance_away') : ''}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handlePurchase(item)}
                                        className="btn-primary"
                                        style={{ width: '100%', justifyContent: 'center' }}
                                    >
                                        {t('marketplace.buy_now') || 'Buy Now'}
                                    </button>
                                </div>
                            </div>

                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default BuyerDashboard;
