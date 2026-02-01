import { TRANSLATIONS } from '@/constants/translations';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const THEME_COLOR = '#4CAF50';

export default function CartScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const lang = (params.lang as keyof typeof TRANSLATIONS) || 'en';
    const t = TRANSLATIONS[lang];

    // Extract Product Data
    const product = {
        ...params,
        priceVal: parseInt((params.price as string)?.replace(/[^0-9]/g, '') || '0'),
        distanceVal: parseInt((params.distance as string)?.replace(/[^0-9]/g, '') || '5'), // Default 5km
        qty: parseInt(params.quantity as string || '1')
    };

    const itemTotal = product.priceVal * product.qty;

    // Logistics Calculation
    // Base ₹20 + ₹5 per km
    const deliveryCost = 20 + (product.distanceVal * 5);
    const grandTotal = itemTotal + deliveryCost;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Review Order</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Item List */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Items</Text>
                    <View style={styles.productRow}>
                        <Image source={{ uri: product.image as string }} style={styles.thumb} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.prodName}>{product.name}</Text>
                            <Text style={styles.prodMeta}>{product.qty} kg x {product.price}</Text>
                        </View>
                        <Text style={styles.rowPrice}>₹{itemTotal}</Text>
                    </View>
                </View>

                {/* Logistics */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Logistics & Delivery</Text>
                    <View style={styles.logisticsRow}>
                        <View style={styles.iconBox}>
                            <Ionicons name="train-outline" size={24} color="#FF9800" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 15 }}>
                            <Text style={styles.partnerName}>AgroLogistics</Text>
                            <Text style={styles.deliveryTime}>Est. Delivery: Today, 6 PM</Text>
                        </View>
                    </View>

                    <View style={styles.costRow}>
                        <Text style={styles.costLabel}>Distance</Text>
                        <Text style={styles.costValue}>{product.distanceVal} km</Text>
                    </View>
                    <View style={styles.costRow}>
                        <Text style={styles.costLabel}>Delivery Fee</Text>
                        <Text style={styles.costValue}>₹{deliveryCost}</Text>
                    </View>
                </View>

                {/* Bill Summary */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Bill Summary</Text>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Item Total</Text>
                        <Text style={styles.billValue}>₹{itemTotal}</Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Delivery Fee</Text>
                        <Text style={styles.billValue}>₹{deliveryCost}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.billRow}>
                        <Text style={styles.grandLabel}>Grand Total</Text>
                        <Text style={styles.grandValue}>₹{grandTotal}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View>
                    <Text style={styles.totalLabel}>Grand Total</Text>
                    <Text style={styles.totalAmount}>₹{grandTotal}</Text>
                </View>
                <TouchableOpacity
                    style={styles.checkoutBtn}
                    onPress={() => router.push({
                        pathname: '/checkout',
                        params: {
                            ...params,
                            quantity: product.qty,
                            totalPrice: grandTotal,
                            deliveryCost: deliveryCost
                        }
                    })}
                >
                    <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 5 }} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, backgroundColor: '#FFF', elevation: 2 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    scrollContent: { padding: 20 },

    card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },

    productRow: { flexDirection: 'row', alignItems: 'center' },
    thumb: { width: 50, height: 50, borderRadius: 8, marginRight: 15 },
    prodName: { fontSize: 16, fontWeight: '600', color: '#333' },
    prodMeta: { fontSize: 14, color: '#666', marginTop: 2 },
    rowPrice: { fontSize: 18, fontWeight: 'bold', color: '#333' },

    logisticsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 15 },
    iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center' },
    partnerName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    deliveryTime: { fontSize: 14, color: '#2E7D32', marginTop: 2, fontWeight: '500' },

    costRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    costLabel: { color: '#666' },
    costValue: { fontWeight: '600' },

    billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    billLabel: { fontSize: 14, color: '#555' },
    billValue: { fontSize: 14, color: '#333', fontWeight: '500' },
    divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
    grandLabel: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    grandValue: { fontSize: 18, fontWeight: 'bold', color: THEME_COLOR },

    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderTopWidth: 1, borderTopColor: '#EEE',
        elevation: 10
    },
    totalLabel: { fontSize: 12, color: '#888' },
    totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    checkoutBtn: {
        backgroundColor: THEME_COLOR,
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center'
    },
    checkoutText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
