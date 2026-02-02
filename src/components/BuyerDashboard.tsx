import { Leaf, MapPin, Mic, Search as SearchIcon, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BuyerDashboard = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="buyer-dashboard" style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--background)' }}>
            {/* Secondary Nav/Search */}
            <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '1rem 0', position: 'sticky', top: '80px', zIndex: 900 }}>
                <div className="container" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <SearchIcon size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search fresh produce (e.g. 'Red Onions from Madurai')..."
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
                            Cart (3)
                        </button>
                    </div>
                </div>
            </div>

            <div className="container" style={{ padding: '2rem 0' }}>
                {/* Categories */}
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
                    {['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Oil Seeds', 'Spices'].map((cat, i) => (
                        <button key={i} style={{
                            padding: '0.6rem 1.5rem',
                            borderRadius: '100px',
                            whiteSpace: 'nowrap',
                            background: i === 0 ? 'var(--primary)' : 'var(--surface)',
                            border: '1px solid ' + (i === 0 ? 'var(--primary)' : 'var(--border)'),
                            color: 'white',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}>
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Featured Products */}
                <h2 style={{ fontSize: '2rem', margin: '2rem 0' }}>Fresh Produce for {user?.name.split(' ')[0]}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                    {[
                        { name: 'Organic Hybrid Tomato', farm: 'Green Valley Farms', dist: '12km', price: '₹40/kg', grade: 'Grade A', img: 'https://images.unsplash.com/photo-1546473427-e1ad6d66be85?auto=format&fit=crop&q=80&w=400' },
                        { name: 'Mountain Spunta Potato', farm: 'Hillside Harvest', dist: '45km', price: '₹22/kg', grade: 'Grade A+', img: 'https://images.unsplash.com/photo-1518977676601-b53f02bad67b?auto=format&fit=crop&q=80&w=400' },
                        { name: 'Premium Basmati Paddy', farm: 'River Delta Mills', dist: '82km', price: '₹65/kg', grade: 'Grade S', img: 'https://images.unsplash.com/photo-1586201327693-866199f121df?auto=format&fit=crop&q=80&w=400' },
                        { name: 'Sweet Golden Corn', farm: 'Sunshine Acres', dist: '5km', price: '₹30/kg', grade: 'Grade B+', img: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=400' },
                    ].map((item, i) => (
                        <div key={i} className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ position: 'relative' }}>
                                <img src={item.img} alt={item.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--primary)', color: 'white', padding: '4px 10px', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem' }}>
                                    {item.grade}
                                </div>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.2rem' }}>{item.name}</h3>
                                    <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{item.price}</span>
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Leaf size={14} />
                                        <span>{item.farm}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '4px' }}>
                                        <MapPin size={14} />
                                        <span>{item.dist} away</span>
                                    </div>
                                </div>
                                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Add to Cart</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BuyerDashboard;
