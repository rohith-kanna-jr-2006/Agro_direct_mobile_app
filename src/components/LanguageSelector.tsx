import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'kn', name: 'ಕನ್ನಡ' }
];

const LanguageSelector = () => {
    const { i18n } = useTranslation();

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                style={{
                    appearance: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    padding: '0.4rem 2rem 0.4rem 1rem',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                }}
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code} style={{ background: 'var(--background)', color: 'white' }}>
                        {lang.name}
                    </option>
                ))}
            </select>
            <div style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', alignItems: 'center', opacity: 0.6 }}>
                <Languages size={14} />
            </div>
        </div>
    );
};

export default LanguageSelector;
