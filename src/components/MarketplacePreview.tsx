import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

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

    const products = [
        { key: 'tomato', price: '₹40/kg', image: 'https://images.unsplash.com/photo-1546473427-e1ad6d66be85?auto=format&fit=crop&q=80&w=400', grade: 'Grade A' },
        { key: 'potato', price: '₹25/kg', image: 'https://images.unsplash.com/photo-1518977676601-b53f02bad67b?auto=format&fit=crop&q=80&w=400', grade: 'Grade A+' },
        { key: 'corn', price: '₹30/kg', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=400', grade: 'Grade B+' },
        { key: 'paddy', price: '₹55/kg', image: 'https://images.unsplash.com/photo-1586201327693-866199f121df?auto=format&fit=crop&q=80&w=400', grade: 'Grade A' }
    ];

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
                            <img src={item.image} alt={t(`marketplace.products.${item.key}`)} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '4px', fontWeight: 700 }}>{item.grade}</span>
                                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.price}</span>
                                </div>
                                <h4 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>{t(`marketplace.products.${item.key}`)}</h4>
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
