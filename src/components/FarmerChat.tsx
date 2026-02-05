import { AnimatePresence, motion } from 'framer-motion';
import {
    BrainCircuit,
    Camera,
    ChevronLeft,
    FileSearch,
    Languages,
    Mic,
    Send,
    Sparkles,
    TrendingUp,
    User
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productAPI, profileAPI } from '../services/api';
import type { ChatContext } from '../services/chatService';
import { analyzeLeafImage, fetchAIResponse } from '../services/chatService';
import './FarmerChat.css';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: string;
    isImageAnalysis?: boolean;
    isDataAnalysis?: boolean;
}

const FarmerChat: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: `Namaste ${user?.name?.split(' ')[0] || ''}! I am Kisan AI, your farm data analyst. How can I help you today?`,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [language, setLanguage] = useState('en');
    const [isTyping, setIsTyping] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [showLanguages, setShowLanguages] = useState(false);

    // Data Context for "Improved Model"
    const [context, setContext] = useState<ChatContext>({
        farmerName: user?.name,
        location: user?.location,
        listings: [],
        analytics: null
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch actual data on mount to feed the "AI Model"
    useEffect(() => {
        const loadFarmerContext = async () => {
            try {
                const [productsRes, analyticsRes] = await Promise.all([
                    productAPI.getAll(),
                    profileAPI.getAnalytics()
                ]);

                // Filter for this farmer's products
                const farmerListings = productsRes.data.filter((p: any) =>
                    p.farmerName === user?.name || p.farmerContact === user?.email
                );

                setContext(prev => ({
                    ...prev,
                    listings: farmerListings,
                    analytics: analyticsRes.data
                }));

                console.log("[KisanAI] Context Loaded:", farmerListings.length, "listings found.");
            } catch (err) {
                console.error("Failed to load AI context:", err);
            }
        };

        loadFarmerContext();
    }, [user]);

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'Hindi (हिन्दी)' },
        { code: 'ta', label: 'Tamil (தமிழ்)' }
    ];

    const quickActions = [
        { label: "📊 Analyze My Inventory", query: "Analyze my crops" },
        { label: "📈 Sales Performance", query: "Show my sales performance" },
        { label: "💡 Recommendations", query: "Give me planting recommendations" },
        { label: "🍅 Tomato Price", query: "What is the tomato price today?" }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: Date.now(),
            text: text,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Enhanced fetchAIResponse with actual Farmer data
            const response = await fetchAIResponse(text, language, context);

            const botMsg: Message = {
                id: Date.now() + 1,
                text: response,
                sender: 'bot',
                isDataAnalysis: text.toLowerCase().includes('analyze') || text.toLowerCase().includes('performance'),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("AI Error:", error);
        } finally {
            setIsTyping(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);

        setTimeout(async () => {
            try {
                const result = await analyzeLeafImage(file);

                const diagnosisMsg: Message = {
                    id: Date.now(),
                    text: `� **Advanced Pathological Analysis Complete**\n\n**Diagnosis:** ${result.diagnosis}\n\n**Scientific Cure:** ${result.recommendation}\n\n**AI Confidence Level:** ${result.confidence}`,
                    sender: 'bot',
                    isImageAnalysis: true,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };

                setMessages(prev => [...prev, diagnosisMsg]);
            } catch (error) {
                console.error("Image analysis failed");
            } finally {
                setIsScanning(false);
            }
        }, 2000);
    };

    return (
        <div className="chat-container">
            {/* Header */}
            <header className="chat-header">
                <div className="header-left">
                    <button onClick={() => navigate(-1)} className="back-btn">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="bot-info">
                        <h1>
                            <div className="ai-icon-pulse">
                                <BrainCircuit size={22} />
                            </div>
                            Kisan AI
                        </h1>
                        <div className="bot-status">
                            <span className="status-dot"></span>
                            Multimodal Data Engine Active
                        </div>
                    </div>
                </div>

                <div className="lang-selector">
                    <button onClick={() => setShowLanguages(!showLanguages)} className="lang-btn">
                        <Languages size={18} />
                        {languages.find(l => l.code === language)?.label || 'English'}
                    </button>

                    <AnimatePresence>
                        {showLanguages && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="lang-dropdown"
                            >
                                {languages.map(lang => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setLanguage(lang.code);
                                            setShowLanguages(false);
                                        }}
                                        className={`lang-option ${language === lang.code ? 'active' : ''}`}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            {/* Chat Messages */}
            <div className="chat-messages">
                {messages.map((msg) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        key={msg.id}
                        className={`message-wrapper ${msg.sender}`}
                    >
                        <div className="message-content">
                            <div className={`avatar ${msg.sender === 'user' ? 'user-avatar' : 'bot-avatar-premium'}`}>
                                {msg.sender === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                            </div>

                            <div className="bubble-wrapper">
                                <div className={`bubble ${msg.isDataAnalysis ? 'analysis-bubble' : ''} ${msg.isImageAnalysis ? 'image-analysis-bubble' : ''}`}>
                                    {msg.isDataAnalysis && <div className="analysis-tag"><TrendingUp size={14} /> AI Analysis</div>}
                                    {msg.isImageAnalysis && <div className="analysis-tag"><FileSearch size={14} /> Diagnostic Scan</div>}
                                    <div className="bubble-text">{msg.text}</div>
                                </div>
                                <span className="timestamp">{msg.timestamp}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="message-wrapper bot">
                        <div className="typing-indicator-premium">
                            <div className="typing-dots">
                                <span></span><span></span><span></span>
                            </div>
                            Kisan AI is analyzing farm data...
                        </div>
                    </motion.div>
                )}

                {isScanning && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="scanning-box"
                    >
                        <div className="scan-image-wrapper">
                            <img
                                src="https://images.unsplash.com/photo-1597361830840-2023a77764d7?auto=format&fit=crop&q=80"
                                alt="Leaf being scanned"
                                className="scan-image"
                            />
                            <div className="scan-line-v2"></div>
                            <div className="scanning-overlay">
                                <BrainCircuit size={48} className="scan-icon" />
                            </div>
                        </div>
                        <div className="scanning-status-text">
                            <Sparkles className="animate-pulse" />
                            Deep Learning Diagnostic Analysis...
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-v2">
                {quickActions.map((action, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSend(action.query)}
                        className="action-chip-v2"
                    >
                        {action.label}
                    </button>
                ))}
            </div>

            {/* Input Area */}
            <div className="chat-input-area-v2">
                <div className="input-container-v2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                        style={{ display: 'none' }}
                    />
                    <button onClick={() => fileInputRef.current?.click()} className="icon-btn-v2" title="Upload Photo">
                        <Camera size={24} />
                    </button>

                    <button className="icon-btn-v2" title="Voice Input">
                        <Mic size={24} />
                    </button>

                    <div className="text-input-wrapper-v2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask Kisan AI to analyze your farm..."
                            className="text-input-v2"
                        />
                    </div>

                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim()}
                        className="send-btn-v2"
                    >
                        <Send size={24} />
                    </button>
                </div>

                <div className="ai-warning">
                    <BrainCircuit size={12} />
                    Powered by Kisan Multimodal Engine v2.0
                </div>
            </div>
        </div>
    );
};

export default FarmerChat;
