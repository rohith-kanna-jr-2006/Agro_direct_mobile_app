import { fetchProducts, saveOrder } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    LayoutAnimation,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';

const THEME_COLOR = '#4CAF50';
const BG_COLOR = '#F4F6F9';
const BOT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png'; // Example or use Icon
const USER_COLOR = '#2E7D32';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
};

// Simulation Steps for the Demo
// Real-Types for Logic
type Product = {
    _id: string;
    name: string;
    price: string;
    grade: string;
    location: string;
    farmerName: string;
    image: string;
};

export default function ChatOrderScreen() {
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm your Agro Assistant. I can help you find products and place orders. Try saying 'I want Tomatoes' or 'Show products in Madurai'.",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [inputText, setInputText] = useState('');

    // State for Real Flow
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [orderQuantity, setOrderQuantity] = useState<string>('');
    const [orderTotal, setOrderTotal] = useState<string>('');
    const [orderStep, setOrderStep] = useState<'IDLE' | 'SELECT_PRODUCT' | 'CONFIRM_QTY' | 'CONFIRM_PAYMENT'>('IDLE');
    const [quickReplies, setQuickReplies] = useState<string[]>([]);

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    useEffect(() => {
        // Fetch products on mount
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await fetchProducts();
            if (Array.isArray(data)) {
                setProducts(data);
                // Extract unique categories/names for quick replies
                const names = Array.from(new Set(data.map((p: any) => p.name)));
                setQuickReplies(names.slice(0, 4));
            }
        } catch (e) {
            console.error("Failed to load products for chat", e);
        }
    };


    useEffect(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages, isListening, isProcessing]);

    const addMessage = (text: string, sender: 'user' | 'bot') => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text,
            sender,
            timestamp: new Date()
        }]);
    };

    const handleMicPress = () => {
        setIsListening(true);
        // Simulate listening time then "hear" a generic prompt for demo if needed
        // But better to just let user type if no real STT
        setTimeout(() => {
            setIsListening(false);
            Alert.alert("Voice Not Configured", "For this demo, please type your request or select a chip.");
        }, 1000);
    };

    const processUserMove = async (userText: string) => {
        addMessage(userText, 'user');
        setIsProcessing(true);
        setQuickReplies([]);

        const lowerText = userText.toLowerCase();

        // SIMULATED NLP LOGIC with REAL DATA
        setTimeout(async () => {
            setIsProcessing(false);

            // 1. Reset / Start Over
            if (lowerText.includes('cancel') || lowerText.includes('hi') || lowerText.includes('hello')) {
                setOrderStep('IDLE');
                setSelectedProduct(null);
                setFilteredProducts([]);
                addMessage("How can I help you today? You can search for crops like 'Tomato' or 'Rice'.", 'bot');
                // load suggestions
                const names = Array.from(new Set(products.map(p => p.name)));
                setQuickReplies(names.slice(0, 5));
                return;
            }

            // 2. Question Answering Phase
            if (orderStep === 'IDLE') {
                // Price Query
                if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('rate')) {
                    const found = products.find(p => lowerText.includes(p.name.toLowerCase()));
                    if (found) {
                        addMessage(`The price of ${found.name} is ${found.price} per kg/unit.`, 'bot');
                    } else {
                        addMessage("Which product's price are you looking for? (e.g., 'Price of Tomato')", 'bot');
                    }
                    return;
                }

                // Location/Availability Query
                if (lowerText.includes('where') || lowerText.includes('location') || lowerText.includes('available')) {
                    const found = products.find(p => lowerText.includes(p.name.toLowerCase()));
                    if (found) {
                        addMessage(`${found.name} is available in ${found.location} (Farmer: ${found.farmerName}).`, 'bot');
                    } else {
                        addMessage("Which product are you looking for? (e.g., 'Where is Rice available')", 'bot');
                    }
                    return;
                }

                // General Help
                if (lowerText.includes('help') || lowerText.includes('what can you do')) {
                    addMessage("I can help you check prices, find products by location, and place orders. Try:\n- 'Price of Tomato'\n- 'Where is Rice available'\n- 'I want to buy Onions'", 'bot');
                    return;
                }
            }

            // 3. Order Flow Handling
            if (orderStep === 'IDLE') {
                // Search for product in text
                const matches = products.filter(p => userText.toLowerCase().includes(p.name.toLowerCase()));

                if (matches.length === 1) {
                    // Exact match found (or only one result)
                    const p = matches[0];
                    setSelectedProduct(p);
                    setOrderStep('CONFIRM_QTY');
                    addMessage(`Found ${p.name} (${p.grade}) from ${p.farmerName} in ${p.location} for ${p.price}. \n\nHow many kg do you need?`, 'bot');
                    setQuickReplies(["10 kg", "50 kg", "100 kg"]);
                }
                else if (matches.length > 1) {
                    // Multiple matches -> Ask to clarify
                    setFilteredProducts(matches);
                    setOrderStep('SELECT_PRODUCT');
                    addMessage(`I found multiple options for ${userText}. Which one?`, 'bot');
                    // Show chips for specific variants/farmers
                    setQuickReplies(matches.map(p => `${p.name} ($${p.price})`));
                }
                else {
                    // No match
                    addMessage(`Sorry, I couldn't find "${userText}". We have: ${Array.from(new Set(products.map(p => p.name))).join(', ')}.`, 'bot');
                    setQuickReplies(Array.from(new Set(products.map(p => p.name))).slice(0, 4));
                }
            }

            else if (orderStep === 'SELECT_PRODUCT') {
                // User selects a specific product from chips or text
                const selected = filteredProducts.find(p => lowerText.includes(p.name.toLowerCase()) || lowerText.includes(p.price));
                if (selected) {
                    setSelectedProduct(selected);
                    setOrderStep('CONFIRM_QTY');
                    addMessage(`Good choice! ${selected.name} from ${selected.farmerName}. How many kg?`, 'bot');
                    setQuickReplies(["10 kg", "20 kg", "50 kg"]);
                } else {
                    addMessage("Please select one of the options above.", 'bot');
                    setQuickReplies(filteredProducts.map(p => `${p.name} ($${p.price})`));
                }
            }

            else if (orderStep === 'CONFIRM_QTY') {
                // User enters quantity
                const qty = userText.replace(/[^0-9]/g, '');
                if (qty && selectedProduct) {
                    const totalCalc = parseInt(qty) * parseInt(selectedProduct.price.replace(/[^0-9]/g, '') || '0');
                    const totalStr = `₹${totalCalc}`;

                    setOrderQuantity(qty);
                    setOrderTotal(totalStr);
                    setOrderStep('CONFIRM_PAYMENT');

                    addMessage(`Quantity: ${qty}kg.\nEstimated Total: ${totalStr}.\n\nPay via UPI or Cash?`, 'bot');
                    setQuickReplies(["UPI", "Cash", "Cancel"]);
                } else {
                    addMessage("Please enter a valid number (e.g., '50').", 'bot');
                    setQuickReplies(["10", "50", "100"]);
                }
            }

            else if (orderStep === 'CONFIRM_PAYMENT') {
                if (lowerText.includes('upi')) {
                    addMessage("Generating Secure UPI Payment Gateway...", 'bot');
                    setTimeout(() => setShowPaymentModal(true), 1000);
                }
                else if (lowerText.includes('cash')) {
                    finalizeOrder('Cash on Delivery');
                } else {
                    addMessage("Please select UPI or Cash.", 'bot');
                    setQuickReplies(["UPI", "Cash"]);
                }
            }

        }, 1000);
    };

    const finalizeOrder = async (paymentMode: string) => {
        try {
            setIsProcessing(true);
            const orderData = {
                product: selectedProduct?.name,
                productId: selectedProduct?._id,
                grade: selectedProduct?.grade,
                quantity: `${orderQuantity}kg`,
                total: orderTotal,
                paymentMode: paymentMode,
                status: "Pending",
                date: new Date().toISOString(),
                location: selectedProduct?.location,
                farmerName: selectedProduct?.farmerName,
                image: selectedProduct?.image
            };
            const saved = await saveOrder(orderData);
            const uniqueId = saved._id || saved.id || Date.now().toString().slice(-6);

            const summary = `✅ Order Placed Successfully!\n\n` +
                `🆔 Order ID: #${uniqueId}\n` +
                `📦 Product: ${selectedProduct?.name}\n` +
                `⚖️ Qty: ${orderQuantity}kg\n` +
                `💰 Total: ${orderTotal}\n` +
                `📍 Location: ${selectedProduct?.location}\n` +
                `👤 Farmer: ${selectedProduct?.farmerName}\n` +
                `💳 Payment: ${orderData.paymentMode}`;

            addMessage(summary, 'bot');
            setOrderStep('IDLE');
            setQuickReplies(["Track Order", "Home"]);

            // Reset
            setSelectedProduct(null);
            setOrderQuantity('');
            setOrderTotal('');
        } catch (e) {
            console.error(e);
            addMessage("Failed to place order. Please try again.", 'bot');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePaymentSuccess = () => {
        setPaymentProcessing(true);
        // Simulate Bank Network Delay
        setTimeout(() => {
            setPaymentProcessing(false);
            setShowPaymentModal(false);
            addMessage(`Payment of ${orderTotal} Received! Processing Order...`, 'bot');
            setTimeout(() => {
                finalizeOrder('UPI');
            }, 800);
        }, 2000);
    };

    const handleChipPress = (chip: string) => {
        if (chip === "Home") {
            router.back();
            return;
        }
        if (chip === "Track Order") {
            router.push('/orders'); // Assuming orders screen
            return;
        }

        // Pass chip text as user input
        processUserMove(chip);
    };

    const resetConversation = () => {
        setMessages([{
            id: '1',
            text: "Hello! I'm your Agro Assistant. Tap the mic to place an order.",
            sender: 'bot',
            timestamp: new Date()
        }]);
        setOrderStep('IDLE');
        setQuickReplies(products.length > 0 ? Array.from(new Set(products.map(p => p.name))).slice(0, 4) : []);
    };

    const handleSendText = () => {
        if (inputText.trim()) {
            const text = inputText;
            setInputText('');
            processUserMove(text);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Modern Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <View style={styles.avatarContainerHeader}>
                        <Ionicons name="sparkles" size={18} color={THEME_COLOR} />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Agro AI</Text>
                        <Text style={styles.headerStatus}>● Online</Text>
                    </View>
                </View>

                <TouchableOpacity onPress={resetConversation} style={styles.refreshBtn}>
                    <Ionicons name="refresh-circle-outline" size={28} color="#FFF" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.chatContainer}
                    contentContainerStyle={styles.chatContent}
                >
                    {messages.map((msg) => {
                        const isUser = msg.sender === 'user';
                        return (
                            <View key={msg.id} style={[
                                styles.messageRow,
                                isUser ? styles.rowReverse : styles.rowLeft
                            ]}>
                                {/* Avatar for Bot */}
                                {!isUser && (
                                    <View style={styles.botAvatar}>
                                        <Ionicons name="sparkles" size={16} color="#FFF" />
                                    </View>
                                )}

                                <View style={[
                                    styles.bubble,
                                    isUser ? styles.userBubble : styles.botBubble
                                ]}>
                                    <Text style={[
                                        styles.messageText,
                                        isUser ? styles.userText : styles.botText
                                    ]}>
                                        {msg.text}
                                    </Text>
                                    <Text style={[
                                        styles.timestamp,
                                        isUser ? styles.userTimestamp : styles.botTimestamp
                                    ]}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}

                    {isListening && (
                        <View style={styles.statusIndicator}>
                            <Text style={styles.statusText}>Listening...</Text>
                            <View style={styles.wave} />
                        </View>
                    )}

                    {isProcessing && (
                        <View style={[styles.messageRow, styles.rowLeft]}>
                            <View style={styles.botAvatar}>
                                <Ionicons name="sparkles" size={16} color="#FFF" />
                            </View>
                            <View style={[styles.bubble, styles.botBubble, styles.loadingBubble]}>
                                <ActivityIndicator size="small" color={THEME_COLOR} />
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Bottom Input Section */}
                <View style={styles.inputArea}>
                    {quickReplies.length > 0 && (
                        <View style={styles.chipsContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 5 }}>
                                {quickReplies.map((chip, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={styles.chip}
                                        onPress={() => handleChipPress(chip)}
                                    >
                                        <Text style={styles.chipText}>{chip}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <View style={styles.inputRow}>
                        <View style={styles.textInputWrapper}>
                            <TextInput
                                placeholder="Message..."
                                style={styles.textInput}
                                placeholderTextColor="#9CA3AF"
                                value={inputText}
                                onChangeText={setInputText}
                                onSubmitEditing={handleSendText}
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                (isListening || inputText.length > 0) && styles.actionButtonActive,
                                isListening && { backgroundColor: '#FF5252' }
                            ]}
                            onPress={inputText.length > 0 ? handleSendText : handleMicPress}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={inputText.length > 0 ? "send" : (isListening ? "mic" : "mic-outline")}
                                size={24}
                                color="#FFF"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* Payment Gateway Modal */}
            <Modal
                visible={showPaymentModal}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.paymentCard}>
                        <View style={styles.paymentHeader}>
                            <Text style={styles.paymentTitle}>Secure Payment</Text>
                            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.qrContainer}>
                            <Text style={styles.merchantText}>Paying to: AgroDirect Merchant</Text>
                            <Text style={styles.amountText}>{orderTotal}</Text>
                            {/* Placeholder QR Code */}
                            <Image
                                source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=agrodirect@bank&pn=AgroDirect&am=' + orderTotal.replace('₹', '') }}
                                style={styles.qrImage}
                            />
                            <Text style={styles.scanText}>Scan with any UPI App</Text>
                        </View>

                        <View style={styles.paymentActions}>
                            {paymentProcessing ? (
                                <View style={styles.processingBtn}>
                                    <ActivityIndicator color="#FFF" />
                                    <Text style={styles.btnText}>Verifying Payment...</Text>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.payBtn}
                                    onPress={handlePaymentSuccess}
                                >
                                    <Text style={styles.btnText}>Simulate Payment Success</Text>
                                    <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginLeft: 5 }} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.secureFooter}>
                            <Ionicons name="lock-closed" size={12} color="#666" />
                            <Text style={styles.secureText}> 100% Secure Transaction</Text>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG_COLOR },

    // Header
    header: {
        backgroundColor: THEME_COLOR,
        paddingTop: Platform.OS === 'android' ? 40 : 0,
        height: Platform.OS === 'android' ? 100 : 110,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 8,
        shadowColor: THEME_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        zIndex: 10
    },
    backBtn: { padding: 8 },
    headerCenter: { flexDirection: 'row', alignItems: 'center' },
    avatarContainerHeader: {
        width: 36, height: 36, backgroundColor: '#FFF', borderRadius: 18,
        justifyContent: 'center', alignItems: 'center', marginRight: 10
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
    headerStatus: { fontSize: 12, color: '#E8F5E9', fontWeight: '600' },
    refreshBtn: { padding: 8 },

    // Chat
    chatContainer: { flex: 1 },
    chatContent: { padding: 20, paddingBottom: 20 },

    messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 },
    rowLeft: { justifyContent: 'flex-start' },
    rowReverse: { justifyContent: 'flex-end' },

    botAvatar: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: THEME_COLOR,
        justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 4,
        elevation: 2
    },

    bubble: {
        maxWidth: '75%',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
        elevation: 2,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2
    },
    botBubble: {
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 4, // Tail effect
    },
    userBubble: {
        backgroundColor: USER_COLOR,
        borderBottomRightRadius: 4, // Tail effect
    },
    loadingBubble: { paddingVertical: 12, width: 60, alignItems: 'center' },

    messageText: { fontSize: 16, lineHeight: 22 },
    botText: { color: '#1F2937' },
    userText: { color: '#FFF' },

    timestamp: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
    botTimestamp: { color: '#9CA3AF' },
    userTimestamp: { color: 'rgba(255,255,255,0.7)' },

    // Status
    statusIndicator: { alignItems: 'center', marginVertical: 10, flexDirection: 'row', justifyContent: 'center' },
    statusText: { color: '#6B7280', fontSize: 14, fontStyle: 'italic', marginRight: 8 },
    wave: { width: 10, height: 10, borderRadius: 5, backgroundColor: THEME_COLOR },

    // Input Area
    inputArea: {
        backgroundColor: '#FFF',
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 20 : 12,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 10,
        elevation: 10
    },
    chipsContainer: { marginBottom: 12, paddingHorizontal: 15, height: 36 },
    chip: {
        backgroundColor: '#E8F5E9',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 18,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#C8E6C9'
    },
    chipText: { color: THEME_COLOR, fontWeight: '700', fontSize: 13 },

    inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
    textInputWrapper: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        paddingHorizontal: 16,
        height: 48,
        justifyContent: 'center',
        marginRight: 12
    },
    textInput: { fontSize: 16, color: '#1F2937' },
    actionButton: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: THEME_COLOR,
        justifyContent: 'center', alignItems: 'center',
        elevation: 4,
        shadowColor: THEME_COLOR, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4
    },
    actionButtonActive: { transform: [{ scale: 1.05 }] },

    // Payment Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    paymentCard: { width: '85%', backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 10 },
    paymentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    paymentTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    qrContainer: { alignItems: 'center', marginBottom: 20 },
    merchantText: { fontSize: 14, color: '#666', marginBottom: 5 },
    amountText: { fontSize: 32, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    qrImage: { width: 200, height: 200, marginBottom: 10 },
    scanText: { fontSize: 12, color: '#888' },
    paymentActions: { marginTop: 10 },
    payBtn: { backgroundColor: THEME_COLOR, paddingVertical: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    processingBtn: { backgroundColor: '#757575', paddingVertical: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    secureFooter: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15 },
    secureText: { fontSize: 10, color: '#666' }
});
