import { motion } from 'framer-motion';
import { ArrowRight, Globe, ShieldCheck, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Hero = () => {
    const { t } = useTranslation();

    return (
        <section style={{ paddingTop: '160px', paddingBottom: '100px', textAlign: 'center' }}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span style={{
                        color: 'var(--primary)',
                        fontWeight: 700,
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        fontSize: '0.9rem',
                        background: 'rgba(76, 175, 80, 0.1)',
                        padding: '8px 16px',
                        borderRadius: '100px',
                        border: '1px solid rgba(76, 175, 80, 0.2)'
                    }}>
                        {t('hero.badge')}
                    </span>
                    <h1 className="gradient-text" style={{
                        fontSize: 'clamp(3rem, 8vw, 5rem)',
                        fontWeight: 800,
                        marginTop: '1.5rem',
                        lineHeight: 1.1
                    }}>
                        {t('hero.title')}
                    </h1>
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '1.25rem',
                        maxWidth: '600px',
                        margin: '2rem auto',
                        lineHeight: 1.8
                    }}>
                        {t('hero.subtitle')}
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '3rem' }}>
                        <Link
                            to="/login?role=buyer"
                            className="btn-primary"
                            style={{
                                padding: '1.2rem 2.5rem',
                                fontSize: '1.1rem',
                                textDecoration: 'none'
                            }}
                        >
                            {t('hero.start_buying')} <ArrowRight size={20} />
                        </Link>
                        <Link
                            to="/signup?role=farmer"
                            style={{
                                background: 'transparent',
                                color: 'white',
                                border: '1px solid var(--border)',
                                padding: '1.2rem 2.5rem',
                                borderRadius: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                textDecoration: 'none'
                            }}>
                            {t('hero.join_farmer')}
                        </Link>
                    </div>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '2rem',
                    marginTop: '8rem'
                }}>
                    {[
                        { icon: <ShieldCheck size={32} color="var(--primary)" />, title: t('hero.feature1_title'), desc: t('hero.feature1_desc') },
                        { icon: <Zap size={32} color="var(--primary)" />, title: t('hero.feature2_title'), desc: t('hero.feature2_desc') },
                        { icon: <Globe size={32} color="var(--primary)" />, title: t('hero.feature3_title'), desc: t('hero.feature3_desc') }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            className="premium-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 * i, duration: 0.5 }}
                        >
                            <div style={{ marginBottom: '1.5rem' }}>{feature.icon}</div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{feature.title}</h3>
                            <p style={{ color: 'var(--text-muted)' }}>{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Hero;
