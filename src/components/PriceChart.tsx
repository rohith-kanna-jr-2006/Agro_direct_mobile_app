import React from 'react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

const data = [
    { month: 'Aug', price: 25, type: 'historical' },
    { month: 'Sep', price: 30, type: 'historical' },
    { month: 'Oct', price: 28, type: 'historical' },
    { month: 'Nov', price: 35, type: 'historical' },
    { month: 'Dec', price: 45, type: 'historical' },
    { month: 'Jan', price: 40, type: 'historical' },
    { month: 'Feb (Next Week)', price: 34, type: 'prediction' },
    { month: 'Feb (Week 2)', price: 30, type: 'prediction' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const isPrediction = payload[0].payload.type === 'prediction';
        return (
            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl backdrop-blur-md bg-opacity-90">
                <p className="font-bold text-gray-800">{label}</p>
                <p className="text-emerald-600">Price: ₹{payload[0].value}</p>
                {isPrediction && (
                    <p className="text-orange-500 font-semibold mt-1">
                        AI Confidence: 89%
                    </p>
                )}
            </div>
        );
    }
    return null;
};

const PriceChart: React.FC = () => {
    // Separate historical and prediction data for better visualization
    const historicalData = data.filter(d => d.type === 'historical');
    const predictionData = [
        data[data.length - 3], // Last historical point to connect lines
        ...data.filter(d => d.type === 'prediction')
    ];

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-2xl border border-gray-100">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="p-2 bg-emerald-100 rounded-lg">📈</span>
                    Market Price Forecast (AI Powered)
                </h2>
                <p className="text-gray-500 mt-1">Real-time analysis for Tomato Prices</p>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="top" height={36} />

                        {/* Historical Line */}
                        <Line
                            type="monotone"
                            dataKey="price"
                            stroke="#10b981"
                            strokeWidth={4}
                            dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                            name="Historical Price"
                            connectNulls
                            data={historicalData}
                        />

                        {/* Prediction Line */}
                        <Line
                            type="monotone"
                            dataKey="price"
                            stroke="#f97316"
                            strokeWidth={4}
                            strokeDasharray="8 5"
                            dot={{ r: 6, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                            name="AI Prediction"
                            data={predictionData}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="text-6xl">🤖</span>
                </div>
                <div className="relative z-10">
                    <h3 className="text-blue-800 font-bold flex items-center gap-2 mb-2">
                        💡 AI Insight
                    </h3>
                    <p className="text-blue-900 leading-relaxed">
                        Prices are expected to drop by <span className="font-bold">15%</span> next week due to high supply from southern regions.
                        <span className="block mt-2 font-semibold text-emerald-700">Recommendation: Sell Now for maximum profit.</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PriceChart;
