import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const THEME_COLOR = '#4CAF50';

export default function OrderSuccessScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { orderId, productName, quantity, total } = params;

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <Ionicons name="checkmark" size={60} color="#FFF" />
                </View>

                <Text style={styles.title}>Order Placed Successfully!</Text>
                <Text style={styles.subtitle}>Your order ID is <Text style={{ fontWeight: 'bold' }}>{orderId}</Text></Text>

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Order Summary</Text>
                    <Text style={styles.summaryText}>{productName} x {quantity}kg</Text>
                    <Text style={styles.totalText}>Total Paid: ₹{total}</Text>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.trackBtn}>
                        <Ionicons name="map-outline" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Track Shipment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.chatBtn}>
                        <Ionicons name="chatbubble-ellipses-outline" size={24} color={THEME_COLOR} />
                        <Text style={[styles.btnText, { color: THEME_COLOR }]}>Chat with Farmer</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/marketplace')}>
                <Text style={styles.homeBtnText}>Continue Shopping</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', padding: 20 },
    content: { alignItems: 'center', width: '100%' },
    iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: THEME_COLOR, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 10 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },

    summaryCard: { backgroundColor: '#F9F9F9', padding: 20, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 40 },
    summaryTitle: { fontSize: 14, color: '#888', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 },
    summaryText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    totalText: { fontSize: 20, fontWeight: 'bold', color: THEME_COLOR },

    actionButtons: { width: '100%' },
    trackBtn: { backgroundColor: THEME_COLOR, padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    chatBtn: { backgroundColor: '#FFF', borderWidth: 2, borderColor: THEME_COLOR, padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    btnText: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginLeft: 10 },

    homeBtn: { marginTop: 30, padding: 15 },
    homeBtnText: { color: '#666', fontSize: 16 }
});
