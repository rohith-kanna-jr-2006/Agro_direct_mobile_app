import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const THEME_COLOR = '#00897B'; // Teal for Smart Order

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
};

type OrderState = {
    location?: string;
    product?: string;
    quantity?: string;
    payment?: string;
};

// Mock Data for Logic
const AVAILABLE_LOCATIONS = ["Madurai", "Chennai", "Trichy"];
const PRODUCTS_BY_LOCATION: Record<string, string[]> = {
    Madurai: ["Tomatoes", "Onions", "Jasmine"],
    Chennai: ["Carrots", "Beans", "Spinach"],
    Trichy: ["Bananas", "Rice", "Coconut"]
};

export default function SmartOrderScreen() {
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hi! I'm your Smart Assistant.\nTell me what you need (e.g., 'I want vegetables' or '50kg Tomatoes to Madurai via UPI').",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Order State
    const [orderState, setOrderState] = useState<OrderState>({});
    const [currentStep, setCurrentStep] = useState<'IDLE' | 'SELECT_LOCATION' | 'SELECT_PRODUCT' | 'SELECT_QUANTITY' | 'SELECT_PAYMENT' | 'CONFIRM' | 'COMPLETED'>('IDLE');
    const [chips, setChips] = useState<string[]>([]);

    // Auto-scroll
    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages, isProcessing]);

    const addMessage = (text: string, sender: 'user' | 'bot') => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text,
            sender,
            timestamp: new Date()
        }]);
    };

    const handleSend = () => {
        if (!inputText.trim()) return;
        const text = inputText;
        setInputText('');
        addMessage(text, 'user');

        setIsProcessing(true);
        setChips([]); // Clear chips while thinking

        // Simulate AI Latency
        setTimeout(() => {
            processInput(text);
            setIsProcessing(false);
        }, 800);
    };

    const handleChipPress = (chip: string) => {
        setInputText(chip);
        // Hack: trigger send immediately for smoother flow
        setTimeout(() => handleSend(), 100);
        // Note: In real app, we might call processInput directly or just fill input
        // Using handleSend to simulate user "confirming" the selection via text bubble
    };

    // --- SMART LOGIC ---

    const processInput = (text: string) => {
        let newState = { ...orderState };
        let nextStep = currentStep;
        let response = "";
        let nextChips: string[] = [];

        // 1. One-Shot Extraction (Simulated NLP)
        // If we are IDLE, try to grab everything
        if (currentStep === 'IDLE') {
            const lower = text.toLowerCase();

            // Extract Location
            const loc = AVAILABLE_LOCATIONS.find(l => lower.includes(l.toLowerCase()));
            if (loc) newState.location = loc;

            // Extract Product (Naive)
            const allProducts = Object.values(PRODUCTS_BY_LOCATION).flat();
            const prod = allProducts.find(p => lower.includes(p.toLowerCase()) || lower.includes(p.toLowerCase().slice(0, -1))); // simple plural check
            if (prod) newState.product = prod;

            // Extract Qty (Digits + kg)
            const qtyMatch = text.match(/(\d+)\s?kg/i) || text.match(/(\d+)/);
            if (qtyMatch && !text.includes('UPI')) newState.quantity = qtyMatch[0].includes('kg') ? qtyMatch[0] : `${qtyMatch[0]}kg`;

            // Extract Payment
            if (lower.includes("upi")) newState.payment = "UPI";
            else if (lower.includes("cash")) newState.payment = "Cash";
        }

        // 2. Step-by-Step Filling
        else {
            // We are answering a specific question
            if (currentStep === 'SELECT_LOCATION') {
                const loc = AVAILABLE_LOCATIONS.find(l => text.toLowerCase().includes(l.toLowerCase()));
                if (loc) newState.location = loc;
                else newState.location = text; // Just fallback to input
            }
            else if (currentStep === 'SELECT_PRODUCT') {
                // Try match from list
                const prods = PRODUCTS_BY_LOCATION[newState.location || 'Madurai'] || [];
                const match = prods.find(p => text.toLowerCase().includes(p.toLowerCase()));
                newState.product = match || text;
            }
            else if (currentStep === 'SELECT_QUANTITY') {
                newState.quantity = text;
            }
            else if (currentStep === 'SELECT_PAYMENT') {
                newState.payment = text;
            }
            else if (currentStep === 'CONFIRM') {
                if (text.toLowerCase().includes('confirm') || text.toLowerCase().includes('yes')) {
                    nextStep = 'COMPLETED';
                    response = "Order Placed Successfully! 🎉\nWe will notify you when it ships.";
                    setOrderState({}); // Reset
                    setChips(["New Order", "Home"]);
                    setCurrentStep('COMPLETED');
                    addMessage(response, 'bot');
                    return;
                } else {
                    response = "Order Cancelled. Type anything to start over.";
                    setOrderState({});
                    setCurrentStep('IDLE');
                    addMessage(response, 'bot');
                    return;
                }
            }
        }

        // 3. Determine Missing Slots (The "Manager")

        if (!newState.location) {
            nextStep = 'SELECT_LOCATION';
            response = "Which location would you like delivery to?";
            nextChips = AVAILABLE_LOCATIONS;
        }
        else if (!newState.product) {
            nextStep = 'SELECT_PRODUCT';
            response = `In ${newState.location}, we have the following fresh stock. Which one?`;
            nextChips = PRODUCTS_BY_LOCATION[newState.location] || [];
        }
        else if (!newState.quantity) {
            nextStep = 'SELECT_QUANTITY';
            response = `How many kg of ${newState.product}?`;
            nextChips = ["10kg", "50kg", "100kg"];
        }
        else if (!newState.payment) {
            nextStep = 'SELECT_PAYMENT';
            response = `Payment via UPI or Cash?`;
            nextChips = ["UPI", "Cash"];
        }
        else {
            // All slots filled
            nextStep = 'CONFIRM';
            response = `Order Summary:\n📦 ${newState.product} (${newState.quantity})\n📍 ${newState.location}\n💳 ${newState.payment}\n\nShall I confirm this order?`;
            nextChips = ["Confirm", "Cancel"];
        }

        // Update State
        setOrderState(newState);
        setCurrentStep(nextStep);
        addMessage(response, 'bot');
        setChips(nextChips);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Smart Market Assistant</Text>
                    <Text style={styles.headerSubtitle}>AI-Powered Order Entry</Text>
                </View>
                <Ionicons name="bulb-outline" size={24} color="#FFF" />
            </View>

            {/* Chat Area */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.chatContainer}
                    contentContainerStyle={styles.chatContent}
                >
                    {messages.map((msg) => (
                        <View key={msg.id} style={[
                            styles.bubble,
                            msg.sender === 'user' ? styles.userBubble : styles.botBubble
                        ]}>
                            <Text style={[
                                styles.messageText,
                                msg.sender === 'user' ? styles.userText : styles.botText
                            ]}>
                                {msg.text}
                            </Text>
                        </View>
                    ))}

                    {isProcessing && (
                        <View style={[styles.bubble, styles.botBubble, { width: 60, alignItems: 'center' }]}>
                            <ActivityIndicator size="small" color={THEME_COLOR} />
                        </View>
                    )}
                </ScrollView>

                {/* Input Area */}
                <View style={styles.inputArea}>
                    {/* Suggestions */}
                    {chips.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                            {chips.map((chip, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.chip}
                                    onPress={() => handleChipPress(chip)}
                                >
                                    <Text style={styles.chipText}>{chip}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {/* Text Field */}
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Type here..."
                            placeholderTextColor="#999"
                            value={inputText}
                            onChangeText={setInputText}
                            onSubmitEditing={handleSend}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, !inputText.trim() && styles.sendDisabled]}
                            onPress={handleSend}
                            disabled={!inputText.trim()}
                        >
                            <Ionicons name="send" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#EFF2F5' },
    header: {
        backgroundColor: THEME_COLOR,
        paddingTop: 45,
        paddingBottom: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 4
    },
    backBtn: { marginRight: 10 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
    headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },

    chatContainer: { flex: 1 },
    chatContent: { padding: 20, paddingBottom: 20 },

    bubble: {
        maxWidth: '80%',
        padding: 14,
        borderRadius: 18,
        marginBottom: 12,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: THEME_COLOR,
        borderBottomRightRadius: 4,
    },
    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#E0E0E0'
    },
    messageText: { fontSize: 15, lineHeight: 22 },
    userText: { color: '#FFF' },
    botText: { color: '#333' },

    inputArea: {
        backgroundColor: '#FFF',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#EEE'
    },
    chipsScroll: { maxHeight: 50, marginBottom: 10, paddingHorizontal: 15 },
    chip: {
        backgroundColor: '#E0F2F1',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#80CBC4'
    },
    chipText: { color: '#00695C', fontWeight: '600' },

    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 5
    },
    textInput: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 25,
        paddingHorizontal: 20,
        height: 50,
        fontSize: 16,
        color: '#333'
    },
    sendButton: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: THEME_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        elevation: 2
    },
    sendDisabled: { backgroundColor: '#B0BEC5' }
});
