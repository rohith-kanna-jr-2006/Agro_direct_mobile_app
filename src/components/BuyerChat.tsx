import { motion } from 'framer-motion';
import {
    Cpu,
    Send,
    Sparkles,
    User,
    X
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderAPI, productAPI } from '../services/api';
import type { ChatContext } from '../services/chatService';
import { fetchBuyerAIResponse } from '../services/chatService';
import './BuyerChat.css';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: string;
}

interface BuyerChatProps {
    onClose: () => void;
}

const BuyerChat: React.FC<BuyerChatProps> = ({ onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: `Hi ${user?.name?.split(' ')[0] || ''}! I'm your Shopping Assistant. I can help you find fresh produce, track your orders, or check current market prices. How can I help?`,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [context, setContext] = useState<ChatContext>({
        buyerName: user?.name,
        location: user?.location,
        listings: [],
        orders: []
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadContext = async () => {
            try {
                const [productsRes, ordersRes] = await Promise.all([
                    productAPI.getAll(),
                    orderAPI.getAll()
                ]);

                // Filter orders for this user
                const userOrders = ordersRes.data.filter((o: any) =>
                    o.userId === user?.email || o.userId === user?.userId
                );

                setContext(prev => ({
                    ...prev,
                    listings: productsRes.data,
                    orders: userOrders
                }));
            } catch (err) {
                console.error("Failed to load buyer context:", err);
            }
        };
        loadContext();
    }, [user]);

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
            const response = await fetchBuyerAIResponse(text, 'en', context);

            const botMsg: Message = {
                id: Date.now() + 1,
                text: response,
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("AI Error:", error);
        } finally {
            setIsTyping(false);
        }
    };

    const quickActions = [
        { label: "📦 Track My Orders", query: "Where is my order?" },
        { label: "🍎 Recommended Today", query: "What should I buy today?" },
        { label: "💰 Tomato Prices", query: "Best price for Tomato?" },
        { label: "🥦 Nearby Farmers", query: "Show products from nearby farmers" }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="buyer-chat-container"
        >
            <header className="buyer-chat-header">
                <div className="buyer-bot-info">
                    <h1>
                        <div className="buyer-ai-icon-pulse">
                            <Cpu size={24} />
                        </div>
                        AgroDirect Assistant
                    </h1>
                </div>
                <button onClick={onClose} className="back-btn" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <X size={20} />
                </button>
            </header>

            <div className="buyer-chat-messages">
                {messages.map((msg) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id}
                        className={`message-wrapper ${msg.sender} buyer-message-wrapper`}
                    >
                        <div className="message-content">
                            <div className={`avatar ${msg.sender === 'user' ? 'user-avatar' : 'bot-avatar-premium'}`}>
                                {msg.sender === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                            </div>
                            <div className="bubble-wrapper">
                                <div className="bubble">
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
                            AgroDirect AI is thinking...
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="buyer-quick-actions">
                {quickActions.map((action, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSend(action.query)}
                        className="buyer-action-chip"
                    >
                        {action.label}
                    </button>
                ))}
            </div>

            <div className="buyer-chat-input-area">
                <div className="buyer-input-container">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="buyer-text-input"
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isTyping}
                        className="buyer-send-btn"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default BuyerChat;
