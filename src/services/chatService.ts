/**
 * Advanced Chat Service for Kisan AI.
 * Simulates sophisticated data analysis and multilingual responses.
 */

export interface ChatContext {
    farmerName?: string;
    buyerName?: string;
    location?: string;
    listings?: any[];
    analytics?: any;
    orders?: any[];
}

export interface AnalysisResult {
    diagnosis: string;
    recommendation: string;
    confidence: string;
}

export const fetchBuyerAIResponse = async (
    userMessage: string,
    language: string = 'en',
    context: ChatContext = {}
): Promise<string> => {
    // Simulate network & "thinking" delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const msg = userMessage.toLowerCase();
    const { listings = [], orders = [], buyerName = 'Buyer', location = 'your area' } = context;

    // --- BUYER ANALYSIS LOGIC ---

    // 1. Order History
    if (msg.includes("my orders") || msg.includes("previous purchases") || msg.includes("history")) {
        if (orders.length === 0) {
            return language === 'hi'
                ? "मुझे आपके कोई पिछले ऑर्डर नहीं मिले। क्या आप आज खरीदारी शुरू करना चाहेंगे?"
                : "I couldn't find any previous orders for you. Would you like to start shopping today?";
        }

        const lastOrder = orders[0];
        return language === 'hi'
            ? `आपका पिछला ऑर्डर ${lastOrder.productName} था, जिसकी कीमत ₹${lastOrder.totalPrice} थी। आप इसे अपनी 'माय ऑर्डर्स' टैब में देख सकते हैं।`
            : `Your last order was ${lastOrder.productName} for ₹${lastOrder.totalPrice}. You can track it in your 'My Orders' tab.`;
    }

    // 2. Recommendations / What to buy
    if (msg.includes("recommend") || msg.includes("suggest") || msg.includes("what should i buy") || msg.includes("popular")) {
        if (listings.length === 0) {
            return "I'm checking the fresh arrivals... Currently, Organic Tomatoes and Basmati Rice are trending in your area.";
        }
        const topProduct = listings[0];
        return language === 'hi'
            ? `मैं आज ${topProduct.name || topProduct.key} की सलाह देता हूं। यह ${topProduct.farm} से ताजा आया है!`
            : `I recommend checking out ${topProduct.name || topProduct.key} today. It's fresh from ${topProduct.farm || 'a local farm'} and very popular!`;
    }

    // 3. Price Checks
    if (msg.includes("price") || msg.includes("cost") || msg.includes("rate")) {
        let product = "Tomato";
        if (msg.includes("rice")) product = "Rice";
        if (msg.includes("onion")) product = "Onion";
        if (msg.includes("potato")) product = "Potato";

        const price = 20 + Math.floor(Math.random() * 60);
        return language === 'hi'
            ? `वर्तमान में ${product} की औसत कीमत ₹${price}/kg है। हमारे पास कुछ बेहतरीन विकल्प उपलब्ध हैं!`
            : `The current average price for ${product} is ₹${price}/kg. We have some great local listings available!`;
    }

    // 4. Delivery / Tracking
    if (msg.includes("track") || msg.includes("delivery") || msg.includes("where is my order")) {
        return language === 'hi'
            ? "आप अपने सक्रिय ऑर्डर्स को 'ट्रैक लाइव' बटन पर क्लिक करके देख सकते हैं। हमारे पार्टनर किसान सीधे आपके पते पर डिलीवरी कर रहे हैं।"
            : "You can track your active orders by clicking 'Track Live' in your orders tab. Our farmer partners deliver directly to your doorstep.";
    }

    // 5. Help / General
    if (msg.includes("help") || msg.includes("how") || msg.includes("what can you do")) {
        return language === 'hi'
            ? "मैं आदेशों को ट्रैक करने, नई उपज खोजने और सर्वोत्तम कीमतों का विश्लेषण करने में आपकी मदद कर सकता हूँ। बस मुझसे पूछें!"
            : "I can help you track orders, find fresh produce, and analyze the best prices. Just ask me!";
    }

    // Default "Smart Response"
    return language === 'hi'
        ? `नमस्ते ${buyerName}, मैं आपकी खरीदारी में कैसे मदद कर सकता हूँ? आज ${location} क्षेत्र में ताजी सब्जियां और अनाज उपलब्ध हैं।`
        : `Hello ${buyerName}, how can I assist with your shopping today? We have fresh vegetables and grains available near ${location} right now.`;
};

export const fetchAIResponse = async (
    userMessage: string,
    language: string = 'en',
    context: ChatContext = {}
): Promise<string> => {
    // Simulate network & "thinking" delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const msg = userMessage.toLowerCase();
    const { listings = [], analytics = {}, farmerName = 'Farmer', location = 'your area' } = context;

    // --- DATA ANALYSIS LOGIC ---

    // 1. Inventory Analysis
    if (msg.includes("my crops") || msg.includes("inventory") || msg.includes("stock")) {
        if (listings.length === 0) {
            return language === 'hi'
                ? "मुझे आपके कोई सक्रिय लिस्टिंग नहीं मिली। क्या आप आज कुछ फसलें जोड़ना चाहेंगे?"
                : "I couldn't find any active listings for you. Would you like to list some crops today?";
        }

        const cropNames = listings.map(l => l.name).join(", ");
        return language === 'hi'
            ? `आपके पास वर्तमान में ${listings.length} फसलें सूचीबद्ध हैं: ${cropNames}। आपका स्टॉक स्तर अच्छा दिख रहा है।`
            : `You currently have ${listings.length} crops listed: ${cropNames}. Your stock levels look healthy.`;
    }

    // 2. Revenue/Performance Analysis
    if (msg.includes("profit") || msg.includes("revenue") || msg.includes("performance") || msg.includes("sales")) {
        const revenue = analytics?.totalRevenue || "₹12,400";
        return language === 'hi'
            ? `इस सप्ताह आपका कुल राजस्व ${revenue} है। यह पिछले सप्ताह से 12% अधिक है! आप बहुत अच्छा कर रहे हैं।`
            : `Your total revenue this week is ${revenue}. That's up 12% from last week! You're doing excellent.`;
    }

    // 3. Smart Recommendations based on market data
    if (msg.includes("recommend") || msg.includes("suggestion") || msg.includes("planting")) {
        return language === 'hi'
            ? "बाजार के रुझानों के आधार पर, मैं अगले सीजन के लिए प्याज (Onion) की सलाह देता हूं। मांग 20% बढ़ने की उम्मीद है।"
            : "Based on market trends, I recommend planting more Onions for the next season. Demand is expected to rise by 20%.";
    }

    // 4. Tomato Price (Dynamic if possible, else mock)
    if (msg.includes("tomato price")) {
        const price = 35 + Math.floor(Math.random() * 5); // Slight variation for realism
        const responses: Record<string, string> = {
            en: `Market Analysis: The average price of Tomato in ${location} is ₹${price}/kg today. Trend: Stable.`,
            hi: `बाजार विश्लेषण: आज ${location} में टमाटर की औसत कीमत ₹${price}/किलो है। रुझान: स्थिर।`,
            ta: `சந்தை பகுப்பாய்வு: இன்று ${location} தக்காளியின் சராசரி விலை ஒரு கிலோ ₹${price} ஆகும். போக்கு: சீராக உள்ளது.`
        };
        return responses[language] || responses['en'];
    }

    // 5. Disease/Symptoms (Improved)
    if (msg.includes("leaf turns yellow") || msg.includes("yellow leaf")) {
        return language === 'hi'
            ? "यह नाइट्रोजन की कमी या अधिक पानी (over-watering) का संकेत हो सकता है। कृपया मिट्टी की नमी की जांच करें और 2:1 नाइट्रोजन मिश्रण का उपयोग करें।"
            : "This indicates Nitrogen deficiency or over-watering. Please check soil moisture levels and consider a 2:1 Nitrogen supplement.";
    }

    // 6. Weather (Simulated analysis)
    if (msg.includes("weather") || msg.includes("rain")) {
        return language === 'hi'
            ? `मौसम विश्लेषण: ${location} में कल दोपहर 2 बजे हल्की बारिश (2mm) की 80% संभावना है।`
            : `Weather Analysis: 80% chance of light rain (2mm) in ${location} tomorrow around 2:00 PM.`;
    }

    // Default "Smart Response"
    const response = language === 'hi'
        ? `नमस्ते ${farmerName}, मैं आपके फ़ार्म डेटा का विश्लेषण कर रहा हूँ... वर्तमान में आपके सभी ${listings.length} लिस्टिंग सक्रिय (Active) हैं। मैं और क्या विश्लेषण कर सकता हूँ?`
        : `Hello ${farmerName}, I'm analyzing your farm data... Currently, all your ${listings.length} listings are active. What else can I analyze for you?`;

    return response;
};

/**
 * Advanced Image Analysis Simulation
 * Uses "confidence scores" and detailed diagnostics
 */
export const analyzeLeafImage = async (imageFile: File): Promise<AnalysisResult> => {
    console.log("Analyzing image for disease:", imageFile.name);

    // Longer delay for "processing" feel
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Cycle through potential results for demo variety
    const results = [
        {
            diagnosis: "Early Blight (Alternaria solani) detected.",
            recommendation: "Apply Chlorothalonil or Copper-based fungicides. Prune lower leaves to improve airflow.",
            confidence: "94.2%"
        },
        {
            diagnosis: "Late Blight (Phytophthora infestans) detected.",
            recommendation: "Immediate application of Mancozeb is required. Avoid overhead irrigation.",
            confidence: "88.7%"
        },
        {
            diagnosis: "Bacterial Spot detected.",
            recommendation: "Use streptomycin or copper-oxychloride sprays. Ensure tools are sanitized.",
            confidence: "91.5%"
        }
    ];

    return results[Math.floor(Math.random() * results.length)];
};
