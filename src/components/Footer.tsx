import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer style={{ padding: '6rem 0 4rem', borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                    <div className="logo" style={{ color: 'var(--primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src="/img/farmdirect-logo.jpeg" alt="FarmDirect Logo" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                        <span>FarmDirect</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>© 2026 FarmDirect Technologies. {t('footer.tagline')}</p>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>{t('footer.privacy')}</span>
                        <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>{t('footer.terms')}</span>
                        <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>{t('footer.contact')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
