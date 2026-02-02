import { Colors } from '@/constants/theme';
import { TRANSLATIONS } from '@/constants/translations';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CartScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { theme } = useTheme();
    const colors = Colors[theme];

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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Review Order</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Item List */}
                <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Items</Text>
                    <View style={styles.productRow}>
                        <Image source={{ uri: product.image as string }} style={styles.thumb} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.prodName, { color: colors.text }]}>{product.name}</Text>
                            <Text style={[styles.prodMeta, { color: colors.icon }]}>{product.qty} kg x {product.price}</Text>
                        </View>
                        <Text style={[styles.rowPrice, { color: colors.text }]}>₹{itemTotal}</Text>
                    </View>
                </View>

                {/* Logistics */}
                <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Logistics & Delivery</Text>
                    <View style={[styles.logisticsRow, { borderBottomColor: colors.inputBorder }]}>
                        <View style={[styles.iconBox, { backgroundColor: colors.inputBackground }]}>
                            <Ionicons name="train-outline" size={24} color="#FF9800" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 15 }}>
                            <Text style={[styles.partnerName, { color: colors.text }]}>AgroLogistics</Text>
                            <Text style={[styles.deliveryTime, { color: colors.primary }]}>Est. Delivery: Today, 6 PM</Text>
                        </View>
                    </View>

                    <View style={styles.costRow}>
                        <Text style={[styles.costLabel, { color: colors.icon }]}>Distance</Text>
                        <Text style={[styles.costValue, { color: colors.text }]}>{product.distanceVal} km</Text>
                    </View>
                    <View style={styles.costRow}>
                        <Text style={[styles.costLabel, { color: colors.icon }]}>Delivery Fee</Text>
                        <Text style={[styles.costValue, { color: colors.text }]}>₹{deliveryCost}</Text>
                    </View>
                </View>

                {/* Bill Summary */}
                <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Bill Summary</Text>
                    <View style={styles.billRow}>
                        <Text style={[styles.billLabel, { color: colors.icon }]}>Item Total</Text>
                        <Text style={[styles.billValue, { color: colors.text }]}>₹{itemTotal}</Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={[styles.billLabel, { color: colors.icon }]}>Delivery Fee</Text>
                        <Text style={[styles.billValue, { color: colors.text }]}>₹{deliveryCost}</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.inputBorder }]} />
                    <View style={styles.billRow}>
                        <Text style={[styles.grandLabel, { color: colors.text }]}>Grand Total</Text>
                        <Text style={[styles.grandValue, { color: colors.primary }]}>₹{grandTotal}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={[styles.bottomBar, { backgroundColor: colors.cardBackground, borderTopColor: colors.inputBorder }]}>
                <View>
                    <Text style={[styles.totalLabel, { color: colors.icon }]}>Grand Total</Text>
                    <Text style={[styles.totalAmount, { color: colors.text }]}>₹{grandTotal}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
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
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, elevation: 2 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    scrollContent: { padding: 20 },

    card: { borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },

    productRow: { flexDirection: 'row', alignItems: 'center' },
    thumb: { width: 50, height: 50, borderRadius: 8, marginRight: 15 },
    prodName: { fontSize: 16, fontWeight: '600' },
    prodMeta: { fontSize: 14, marginTop: 2 },
    rowPrice: { fontSize: 18, fontWeight: 'bold' },

    logisticsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, paddingBottom: 15 },
    iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    partnerName: { fontSize: 16, fontWeight: 'bold' },
    deliveryTime: { fontSize: 14, marginTop: 2, fontWeight: '500' },

    costRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    costLabel: {},
    costValue: { fontWeight: '600' },

    billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    billLabel: { fontSize: 14 },
    billValue: { fontSize: 14, fontWeight: '500' },
    divider: { height: 1, marginVertical: 10 },
    grandLabel: { fontSize: 18, fontWeight: 'bold' },
    grandValue: { fontSize: 18, fontWeight: 'bold' },

    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderTopWidth: 1,
        elevation: 10
    },
    totalLabel: { fontSize: 12 },
    totalAmount: { fontSize: 20, fontWeight: 'bold' },
    checkoutBtn: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center'
    },
    checkoutText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
