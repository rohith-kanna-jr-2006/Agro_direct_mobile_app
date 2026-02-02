import { Sprout } from 'lucide-react';

const Footer = () => (
    <footer style={{ padding: '6rem 0 4rem', borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                <div className="logo" style={{ color: 'var(--primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sprout size={24} />
                    <span>FarmDirect</span>
                </div>
                <p style={{ color: 'var(--text-muted)' }}>© 2026 FarmDirect Technologies. Built for the future of farming.</p>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>Privacy</span>
                    <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>Terms</span>
                    <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>Contact</span>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
