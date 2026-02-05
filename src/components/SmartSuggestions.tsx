import { Plus, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    reason?: string;
}

const PRODUCT_DATABASE: Product[] = [
    { id: '1', name: 'Ginger', price: 120, image: 'https://images.unsplash.com/photo-1599940824399-b87987cb3c33?auto=format&fit=crop&w=200&h=200&q=80' },
    { id: '2', name: 'Garlic', price: 150, image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=200&h=200&q=80' },
    { id: '3', name: 'Curry Leaves', price: 20, image: 'https://images.unsplash.com/photo-1634125816999-3665651f478c?auto=format&fit=crop&w=200&h=200&q=80' },
    { id: '4', name: 'Onions', price: 40, image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=200&h=200&q=80' },
    { id: '5', name: 'Potatoes', price: 30, image: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&w=200&h=200&q=80' },
];

const SmartSuggestions: React.FC<{ cartItems: string[] }> = ({ cartItems }) => {
    const [recommendations, setRecommendations] = useState<Product[]>([]);

    useEffect(() => {
        // Mock AI Logic: Market Basket Analysis
        let suggested: Product[] = [];

        if (cartItems.some(item => item.toLowerCase().includes('potato'))) {
            const items = ['Ginger', 'Garlic', 'Curry Leaves'];
            suggested = PRODUCT_DATABASE.filter(p => items.includes(p.name)).map(p => ({
                ...p,
                reason: "Because you bought Potatoes..."
            }));
        } else if (cartItems.some(item => item.toLowerCase().includes('onion'))) {
            const items = ['Ginger', 'Garlic'];
            suggested = PRODUCT_DATABASE.filter(p => items.includes(p.name)).map(p => ({
                ...p,
                reason: "People often buy these with Onions"
            }));
        }

        setRecommendations(suggested);
    }, [cartItems]);

    if (recommendations.length === 0) return null;

    return (
        <div className="my-8 py-6 bg-emerald-50/50 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Sparkles className="text-emerald-600 fill-emerald-100" size={24} />
                        Recommended for You
                    </h3>
                    <p className="text-sm text-gray-500">Based on your current shopping habits</p>
                </div>
            </div>

            <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
                {recommendations.map((product) => (
                    <div
                        key={product.id}
                        className="flex-shrink-0 w-64 bg-white rounded-2xl shadow-lg border border-emerald-100/50 hover:shadow-xl transition-shadow overflow-hidden relative"
                    >
                        <div className="absolute top-3 left-3 z-10">
                            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                ✨ AI Pick
                            </span>
                        </div>

                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-32 object-cover"
                        />

                        <div className="p-4">
                            <p className="text-[10px] text-emerald-600 font-bold mb-1 uppercase tracking-wider">
                                {product.reason}
                            </p>
                            <h4 className="text-lg font-bold text-gray-800">{product.name}</h4>

                            <div className="flex items-center justify-between mt-3">
                                <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                                <button className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl transition-colors">
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SmartSuggestions;
