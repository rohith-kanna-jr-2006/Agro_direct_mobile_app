import { TRANSLATIONS } from '@/constants/translations';
import { saveOrder } from '@/utils/api';
import { scheduleNotification } from '@/utils/notifications';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const THEME_COLOR = '#4CAF50';
const BACKGROUND_COLOR = '#F5F5F5';

export default function CheckoutScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const lang = (params.lang as keyof typeof TRANSLATIONS) || 'en';
    // Fallback for translations if not fully defined for checkout
    const t = {
        ...TRANSLATIONS[lang],
        checkoutTitle: "Checkout",
        productDetails: "Product Details",
        shippingDetails: "Shipping Details",
        quantity: "Quantity (kg)",
        totalPrice: "Total Price",
        fullName: "Full Name",
        address: "Delivery Address",
        paymentMethod: "Payment Method",
        placeOrder: "Confirm Order",
        cod: "Cash on Delivery",
        upi: "UPI / Online Payment"
    };

    const product = {
        id: params.id,
        name: params.name,
        price: params.price as string, // e.g., "₹25/kg"
        farmerName: params.farmerName as string || 'Unknown Farmer',
        farmerContact: params.farmerContact as string || 'N/A',
        farmerAddress: params.farmerAddress as string || 'Location not available',
        rating: params.rating as string || '4.0'
    };

    // console.log("Checkout Params:", params);

    // Parse price per unit
    const pricePerUnit = parseInt(product.price?.replace(/[^0-9]/g, '') || '0');

    const [quantity, setQuantity] = useState('1');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');

    useEffect(() => {
        const loadUserDetails = async () => {
            try {
                const userJson = await AsyncStorage.getItem('current_user');
                if (userJson) {
                    const user = JSON.parse(userJson);
                    if (user.name) setName(user.name);
                    if (user.location) setAddress(user.location);
                    else if (user.address) setAddress(user.address);
                }
            } catch (error) {
                console.error("Failed to load user details", error);
            }
        };
        loadUserDetails();
    }, []);

    // Use passed total if available (from Cart) or calculate locally
    const cartTotal = params.totalPrice ? parseFloat(params.totalPrice as string) : null;
    const deliveryFee = params.deliveryCost ? parseFloat(params.deliveryCost as string) : 0;

    // Fallback calculation if coming directly regular flow (though new flow goes via Cart)
    const itemTotal = pricePerUnit * (parseInt(quantity) || 0);
    const finalTotal = cartTotal || (itemTotal + deliveryFee); // If delivery fee logic wasn't in direct flow, it might be 0.

    const handleOrder = async () => {
        if (!name || !address || !quantity) {
            Alert.alert("Error", "Please fill all fields.");
            return;
        }

        const newOrder = {
            productName: product.name,
            quantity: parseInt(quantity),
            totalPrice: finalTotal,
            date: new Date().toISOString(),
            farmer: {
                name: product.farmerName,
                address: product.farmerAddress,
                rating: product.rating
            },
            userName: name,
            userAddress: address
        };

        try {
            await saveOrder(newOrder);

            // Schedule notification
            scheduleNotification("Order Placed Successfully", `Your order for ${product.name} has been confirmed!`);

            // Navigate to Success Page
            router.push({
                pathname: '/order-success',
                params: {
                    orderId: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
                    productName: product.name,
                    quantity: quantity,
                    total: finalTotal
                }
            });
        } catch (e) {
            console.error("Failed to save order", e);
            Alert.alert("Error", "Failed to place order. Please try again.");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t.checkoutTitle}</Text>
                </View>

                <View style={styles.content}>
                    {/* Farmer Details */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Farmer Information</Text>
                        <View style={styles.row}>
                            <Text style={styles.label}>Name</Text>
                            <Text style={styles.value}>{product.farmerName}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Contact</Text>
                            <Text style={styles.value}>{product.farmerContact}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Location</Text>
                            <Text style={[styles.value, { maxWidth: '60%', textAlign: 'right' }]}>{product.farmerAddress}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Rating</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="star" size={16} color="#FFD700" />
                                <Text style={[styles.value, { marginLeft: 5 }]}>{product.rating} / 5.0</Text>
                            </View>
                        </View>
                    </View>

                    {/* Product Summary */}
                    <View style={styles.card}>
                        {/* ... (existing product content) */}
                        <Text style={styles.sectionTitle}>{t.productDetails}</Text>
                        <View style={styles.row}>
                            <Text style={styles.label}>{product.name}</Text>
                            <Text style={styles.value}>{product.price}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.inputRow}>
                            <Text style={styles.label}>{t.quantity}</Text>
                            <View style={styles.qtyContainer}>
                                <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, (parseInt(quantity) || 0) - 1).toString())}>
                                    <Ionicons name="remove" size={20} color="white" />
                                </TouchableOpacity>
                                <TextInput
                                    style={styles.qtyInput}
                                    value={quantity}
                                    onChangeText={setQuantity}
                                    keyboardType="numeric"
                                />
                                <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(((parseInt(quantity) || 0) + 1).toString())}>
                                    <Ionicons name="add" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.row}>
                            <Text style={[styles.label, { fontWeight: 'bold' }]}>{t.totalPrice}</Text>
                            <Text style={[styles.value, { color: THEME_COLOR, fontSize: 20 }]}>₹{finalTotal}</Text>
                        </View>
                    </View>

                    {/* Shipping Details */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>{t.shippingDetails}</Text>

                        {/* Visual Map Placeholder */}
                        <View style={{ height: 100, backgroundColor: '#E3F2FD', borderRadius: 10, marginBottom: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#90CAF9', borderStyle: 'dashed' }}>
                            <Ionicons name="map-outline" size={32} color="#2196F3" />
                            <Text style={{ color: '#2196F3', fontSize: 12, marginTop: 5 }}>Location Pin: {address.split(',')[0] || 'Selected Address'}</Text>
                        </View>

                        <Text style={styles.inputLabel}>{t.fullName}</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your full name"
                        />

                        <Text style={styles.inputLabel}>{t.address}</Text>
                        <TextInput
                            style={[styles.input, { height: 80 }]}
                            value={address}
                            onChangeText={setAddress}
                            placeholder="Enter delivery address"
                            multiline
                        />
                    </View>

                    {/* Payment Method */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>{t.paymentMethod}</Text>

                        <TouchableOpacity
                            style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentSelected]}
                            onPress={() => setPaymentMethod('cod')}
                        >
                            <Ionicons name={paymentMethod === 'cod' ? "radio-button-on" : "radio-button-off"} size={24} color={THEME_COLOR} />
                            <Text style={styles.paymentText}>{t.cod}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.paymentOption, paymentMethod === 'upi' && styles.paymentSelected]}
                            onPress={() => setPaymentMethod('upi')}
                        >
                            <Ionicons name={paymentMethod === 'upi' ? "radio-button-on" : "radio-button-off"} size={24} color={THEME_COLOR} />
                            <Text style={styles.paymentText}>{t.upi}</Text>
                        </TouchableOpacity>

                        {/* Escrow Trust Badge */}
                        <View style={{ flexDirection: 'row', backgroundColor: '#FFF3E0', padding: 12, borderRadius: 8, marginTop: 15, alignItems: 'center' }}>
                            <Ionicons name="shield-checkmark" size={24} color="#F57C00" />
                            <View style={{ marginLeft: 10, flex: 1 }}>
                                <Text style={{ fontWeight: 'bold', color: '#E65100', fontSize: 14 }}>Escrow Protection</Text>
                                <Text style={{ color: '#EF6C00', fontSize: 12 }}>Your payment is held safely until you confirm delivery.</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.confirmButton} onPress={handleOrder}>
                        <Text style={styles.confirmButtonText}>{t.placeOrder} - ₹{finalTotal}</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView >
        </KeyboardAvoidingView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BACKGROUND_COLOR },
    header: { padding: 20, paddingTop: 50, backgroundColor: THEME_COLOR, flexDirection: 'row', alignItems: 'center' },
    backButton: { marginRight: 15 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
    content: { padding: 20 },
    card: { backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 20, elevation: 2 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    label: { fontSize: 16, color: '#555' },
    value: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
    inputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    qtyContainer: { flexDirection: 'row', alignItems: 'center' },
    qtyBtn: { backgroundColor: THEME_COLOR, width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    qtyInput: { width: 50, textAlign: 'center', fontSize: 16, borderBottomWidth: 1, borderColor: '#DDD', marginHorizontal: 10 },
    inputLabel: { fontSize: 14, color: '#666', marginBottom: 5, marginTop: 10 },
    input: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#EEE', padding: 12, borderRadius: 10, fontSize: 16 },
    paymentOption: { flexDirection: 'row', alignItems: 'center', padding: 15, borderWidth: 1, borderColor: '#EEE', borderRadius: 10, marginBottom: 10 },
    paymentSelected: { borderColor: THEME_COLOR, backgroundColor: '#E8F5E9' },
    paymentText: { marginLeft: 10, fontSize: 16, fontWeight: '500' },
    confirmButton: { backgroundColor: THEME_COLOR, padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10, marginBottom: 30 },
    confirmButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
