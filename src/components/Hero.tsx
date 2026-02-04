import { motion } from 'framer-motion';
import { Scan, Search, Tag, Truck } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const Hero = () => {

    const navigate = useNavigate();

    return (
        <div style={{ width: '100%', overflow: 'hidden' }}>
            {/* Live Ticker */}
            <div style={{ background: '#333', color: 'white', padding: '0.5rem 0', whiteSpace: 'nowrap', overflow: 'hidden', position: 'relative' }}>
                <div style={{ display: 'inline-block', animation: 'marquee 20s linear infinite' }}>
                    <span style={{ marginRight: '2rem' }}>🍅 Tomato: ₹20/kg</span>
                    <span style={{ marginRight: '2rem' }}>🥔 Potato: ₹25/kg</span>
                    <span style={{ marginRight: '2rem' }}>🧅 Onion: ₹30/kg</span>
                    <span style={{ marginRight: '2rem' }}>🌽 Corn: ₹18/kg</span>
                    <span style={{ marginRight: '2rem' }}>🥦 Broccoli: ₹45/kg</span>
                    <span style={{ marginRight: '2rem' }}>🥕 Carrot: ₹40/kg</span>
                    <span style={{ marginRight: '2rem' }}>🍅 Tomato: ₹20/kg</span>
                    <span style={{ marginRight: '2rem' }}>🥔 Potato: ₹25/kg</span>
                    <span style={{ marginRight: '2rem' }}>🧅 Onion: ₹30/kg</span>
                </div>
                <style>{`
                    @keyframes marquee {
                        0% { transform: translateX(100%); }
                        100% { transform: translateX(-100%); }
                    }
                `}</style>
            </div>

            {/* Hero Section */}
            <section
                className="hero"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '80vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: 'white',
                    padding: '0 1rem'
                }}
            >
                <div className="container" style={{ maxWidth: '800px' }}>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}
                    >
                        From Farm to Fork: <span style={{ color: '#4CAF50' }}>Zero Middlemen</span>.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ fontSize: '1.2rem', marginBottom: '3rem', opacity: 0.9 }}
                    >
                        The AI-powered marketplace connecting India's farmers directly with households.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{ display: 'flex', background: 'white', padding: '0.5rem', borderRadius: '50px', maxWidth: '600px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                    >
                        <input
                            type="text"
                            placeholder="Search for fresh vegetables..."
                            style={{ flex: 1, border: 'none', outline: 'none', padding: '1rem 1.5rem', fontSize: '1rem', borderRadius: '50px 0 0 50px' }}
                        />
                        <button
                            onClick={() => navigate('/marketplace')}
                            style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '50px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Search size={20} /> Search
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section style={{ padding: '5rem 0', background: 'var(--background)' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {[
                            { icon: <Scan size={40} color="#4CAF50" />, title: "AI Grading", desc: "Quality Certified by AI." },
                            { icon: <Tag size={40} color="#FF9800" />, title: "Fair Pricing", desc: "Best Prices for Everyone." },
                            { icon: <Truck size={40} color="#2196F3" />, title: "Fast Delivery", desc: "Farm to Home in 12 Hours." }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="premium-card"
                                style={{ textAlign: 'center', padding: '3rem 2rem', border: '1px solid var(--border)' }}
                            >
                                <div style={{ marginBottom: '1.5rem', display: 'inline-block', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                                    {feature.icon}
                                </div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{feature.title}</h3>
                                <p style={{ color: 'var(--text-muted)' }}>{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Hero;
