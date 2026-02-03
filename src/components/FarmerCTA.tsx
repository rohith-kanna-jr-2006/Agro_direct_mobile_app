import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const FarmerCTA = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleRegisterClick = (e: React.MouseEvent) => {
        e.preventDefault();
        console.log("FarmerCTA: Register clicked -> /signup?role=farmer");
        navigate('/signup?role=farmer');
    };

    return (
        <section style={{ padding: '100px 0' }}>
            <div className="container">
                <div className="premium-card" style={{
                    background: 'linear-gradient(rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05))',
                    display: 'flex',
                    padding: '4rem',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '4rem',
                    flexWrap: 'wrap'
                } as any}>
                    <div style={{ flex: '1 1 450px' }}>
                        <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{t('farmer_cta.title')}</h2>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>{t('farmer_cta.subtitle')}</p>
                        <button
                            onClick={handleRegisterClick}
                            className="btn-primary"
                            style={{ padding: '1.2rem 2.5rem', cursor: 'pointer', border: 'none' }}
                        >
                            {t('farmer_cta.register_btn')}
                        </button>
                    </div>
                    <div style={{ flex: '1 1 300px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {[
                            { label: t('farmer_cta.stats.earned'), val: '₹25Cr+' },
                            { label: t('farmer_cta.stats.orders'), val: '500k+' },
                            { label: t('farmer_cta.stats.buyers'), val: '10k+' },
                            { label: t('farmer_cta.stats.delivery'), val: '24h' }
                        ].map((stat, i) => (
                            <div key={i} style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '15px' }}>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{stat.val}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FarmerCTA;
