import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';

const MarketplacePreview = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleViewAll = (e: React.MouseEvent) => {
        e.preventDefault();
        console.log("MarketplacePreview: View All clicked -> /login?role=buyer");
        navigate('/login?role=buyer');
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        console.log("MarketplacePreview: Add to Cart clicked -> /login?role=buyer");
        navigate('/login?role=buyer');
    };

    const [products, setProducts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await productAPI.getAll();
                // Show only first 4 for preview
                setProducts(res.data.slice(0, 4));
            } catch (err) {
                console.error("Failed to fetch preview products", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) return null;

    return (
        <section style={{ padding: '100px 0', background: 'rgba(255,255,255,0.02)' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{t('marketplace.title')}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>{t('marketplace.subtitle')}</p>
                    </div>
                    <button
                        onClick={handleViewAll}
                        style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '1.1rem' }}
                    >
                        {t('marketplace.view_all')}
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    {products.map((item, i) => (
                        <div key={i} className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                            <img src={item.img || item.image} alt={item.name} style={{ width: '100%', height: '230px', objectFit: 'cover' }} />
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '4px', fontWeight: 700 }}>{item.grade}</span>
                                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.price}</span>
                                </div>
                                <h4 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>{item.name}</h4>
                                <button
                                    onClick={handleAddToCart}
                                    className="btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                                >
                                    {t('marketplace.add_to_cart')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MarketplacePreview;
