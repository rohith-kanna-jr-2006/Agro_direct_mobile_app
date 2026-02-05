import { Bot, CheckCircle2, RotateCcw, Send } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface Product {
    name: string;
    price: number;
}

const PRODUCT_DATABASE: Record<string, Product> = {
    'rice': { name: 'Basmati Rice', price: 80 },
    'dal': { name: 'Toor Dal', price: 140 },
    'wheat': { name: 'Premium Wheat', price: 45 },
    'oil': { name: 'Sunflower Oil', price: 160 },
};

const AICommandCenter: React.FC = () => {
    const [command, setCommand] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [autoDebit, setAutoDebit] = useState(false);

    const handleAICommand = (e: React.FormEvent) => {
        e.preventDefault();
        if (!command.trim()) return;

        setIsProcessing(true);

        // Simulation Logic
        setTimeout(() => {
            const lowerCommand = command.toLowerCase();
            const addedItems: string[] = [];

            // Basic Regex Logic: Find numbers and keywords
            Object.keys(PRODUCT_DATABASE).forEach(key => {
                const regex = new RegExp(`(\\d+)\\s*(kg|l|liter)?\\s*${key}`, 'i');
                const match = lowerCommand.match(regex);

                if (match) {
                    const qty = match[1];
                    const unit = match[2] || 'unit';
                    addedItems.push(`${qty}${unit} ${PRODUCT_DATABASE[key].name}`);
                }
            });

            if (addedItems.length > 0) {
                toast.success(
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">🤖 AI: Items Added!</span>
                        <span className="text-sm">{addedItems.join(', ')}</span>
                    </div>,
                    { duration: 4000, position: 'top-center' }
                );
                setCommand('');
            } else {
                toast.error("🤖 AI: I couldn't understand that command. Try 'Buy 5kg Rice and 2kg Dal'");
            }

            setIsProcessing(false);
        }, 800);
    };

    return (
        <div className="max-w-4xl mx-auto my-8 space-y-4 px-4">
            {/* AI Hub Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                    <Bot size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">AI Command Center</h2>
                    <p className="text-gray-500 font-medium">Type what you need, I'll build your cart.</p>
                </div>
            </div>

            {/* Input Section */}
            <form
                onSubmit={handleAICommand}
                className="relative group transition-all duration-300"
            >
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-white rounded-[1.8rem] shadow-sm border border-gray-100 overflow-hidden pr-2">
                    <input
                        type="text"
                        className="flex-1 py-5 px-8 outline-none text-lg text-gray-700 placeholder:text-gray-400"
                        placeholder="Example: Buy 5kg Rice and 2kg Dal..."
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        disabled={isProcessing}
                    />
                    <button
                        type="submit"
                        disabled={isProcessing || !command.trim()}
                        className={`
              p-4 rounded-2xl transition-all duration-300
              ${command.trim()
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
            `}
                    >
                        {isProcessing ? (
                            <RotateCcw className="animate-spin" size={24} />
                        ) : (
                            <Send size={24} />
                        )}
                    </button>
                </div>
            </form>

            {/* Quick Subscription Toggle */}
            <div className="mt-6 flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className={`
                w-12 h-12 rounded-2xl flex items-center justify-center transition-colors
                ${autoDebit ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}
            `}>
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">Smart Recurring Order</p>
                        <p className="text-sm text-gray-500">Repeat this order automatically every month</p>
                    </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={autoDebit}
                        onChange={(e) => setAutoDebit(e.target.checked)}
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
            </div>

            <p className="text-center text-xs text-gray-400 mt-4 px-12">
                My AI engine analyzes your commands to find the best quality products at current market rates.
                Subscription terms and conditions apply.
            </p>
        </div>
    );
};

export default AICommandCenter;
