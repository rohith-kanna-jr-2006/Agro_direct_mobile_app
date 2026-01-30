import { TRANSLATIONS } from '@/constants/translations';
import { fetchOrders, rateOrder } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

const THEME_COLOR = '#4CAF50';
const BACKGROUND_COLOR = '#F5F5F5';

export default function OrdersScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const lang = (params.lang as keyof typeof TRANSLATIONS) || 'en';
    // Fallback translations
    const t = {
        ...TRANSLATIONS[lang],
        rateOrder: TRANSLATIONS[lang]?.rateOrder || "Rate Order",
        yourRating: TRANSLATIONS[lang]?.yourRating || "Your Rating",
        ratingSubmitted: TRANSLATIONS[lang]?.ratingSubmitted || "Rating Submitted!"
    };

    const [orders, setOrders] = useState<any[]>([]);
    const [ratingModalVisible, setRatingModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [tempRating, setTempRating] = useState(0);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const parsedOrders = await fetchOrders();
            if (parsedOrders) {
                // Backend sorts by date desc, but we can ensure here if needed
                setOrders(parsedOrders);
            }
        } catch (e) {
            console.error("Failed to load orders", e);
        }
    };

    const handleRateOrder = (order: any) => {
        setSelectedOrder(order);
        setTempRating(0);
        setRatingModalVisible(true);
    };

    const submitRating = async () => {
        if (!selectedOrder || tempRating === 0) return;

        try {
            // Support both id (legacy) and _id (mongo)
            const orderId = selectedOrder._id || selectedOrder.id;
            await rateOrder(orderId, tempRating);

            const updatedOrders = orders.map(o => {
                const oId = o._id || o.id;
                if (oId === orderId) {
                    return { ...o, userRating: tempRating };
                }
                return o;
            });

            setOrders(updatedOrders);
            setRatingModalVisible(false);
            Alert.alert("Success", t.ratingSubmitted);
        } catch (e) {
            Alert.alert("Error", "Failed to submit rating");
        }
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.date}>{formatDate(item.date)}</Text>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Completed</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.productRow}>
                <Text style={styles.productName}>{item.productName}</Text>
                <Text style={styles.price}>₹{item.totalPrice}</Text>
            </View>

            <Text style={styles.detail}>Quantity: {item.quantity} kg</Text>

            {item.farmer && (
                <View style={styles.farmerContainer}>
                    <Text style={styles.farmerLabel}>Farmer Details:</Text>
                    <Text style={styles.farmerText}>{item.farmer.name}</Text>
                    <Text style={styles.farmerSubText}>{item.farmer.address}</Text>

                    <View style={styles.actionRow}>
                        {/* Farmer's existing rating */}
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color="#FFD700" />
                            <Text style={styles.ratingText}>{item.farmer.rating}</Text>
                        </View>

                        {/* User's rating action */}
                        {item.userRating ? (
                            <View style={styles.userRatingBadge}>
                                <Text style={styles.userRatingLabel}>{t.yourRating}:</Text>
                                <Ionicons name="star" size={14} color="white" />
                                <Text style={styles.userRatingValue}>{item.userRating}</Text>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.rateButton} onPress={() => handleRateOrder(item)}>
                                <Ionicons name="star-outline" size={14} color="white" style={{ marginRight: 4 }} />
                                <Text style={styles.rateButtonText}>{t.rateOrder}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Orders</Text>
            </View>

            {orders.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="bag-handle-outline" size={80} color="#CCC" />
                    <Text style={styles.emptyText}>No orders yet</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            )}

            {/* Rating Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={ratingModalVisible}
                onRequestClose={() => setRatingModalVisible(false)}
            >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setRatingModalVisible(false)}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Rate {selectedOrder?.farmer?.name}</Text>
                            <Text style={styles.modalSubtitle}>How was your experience?</Text>

                            <View style={styles.starContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity key={star} onPress={() => setTempRating(star)}>
                                        <Ionicons
                                            name={star <= tempRating ? "star" : "star-outline"}
                                            size={40}
                                            color={star <= tempRating ? "#FFD700" : "#CCC"}
                                            style={{ marginHorizontal: 5 }}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, { opacity: tempRating === 0 ? 0.5 : 1 }]}
                                onPress={submitRating}
                                disabled={tempRating === 0}
                            >
                                <Text style={styles.submitButtonText}>{t.submit}</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BACKGROUND_COLOR },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: 'white', elevation: 2 },
    backButton: { marginRight: 15 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    list: { padding: 15 },
    card: { backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 3 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    date: { fontSize: 14, color: '#888' },
    statusBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    statusText: { color: THEME_COLOR, fontWeight: 'bold', fontSize: 12 },
    divider: { height: 1, backgroundColor: '#EEE', marginBottom: 10 },
    productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    productName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    price: { fontSize: 18, fontWeight: 'bold', color: THEME_COLOR },
    detail: { fontSize: 14, color: '#555', marginBottom: 10 },
    farmerContainer: { backgroundColor: '#F9F9F9', padding: 10, borderRadius: 10, marginTop: 5 },
    farmerLabel: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 3 },
    farmerText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    farmerSubText: { fontSize: 12, color: '#666' },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    ratingRow: { flexDirection: 'row', alignItems: 'center' },
    ratingText: { fontSize: 12, color: '#333', marginLeft: 4, fontWeight: '600' },
    rateButton: { backgroundColor: THEME_COLOR, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
    rateButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    userRatingBadge: { backgroundColor: '#FFA726', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
    userRatingLabel: { color: 'white', fontSize: 12, marginRight: 5 },
    userRatingValue: { color: 'white', fontWeight: 'bold', marginLeft: 3 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 18, color: '#999', marginTop: 20 },
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', padding: 25, borderTopLeftRadius: 25, borderTopRightRadius: 25, alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    modalSubtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
    starContainer: { flexDirection: 'row', marginBottom: 30 },
    submitButton: { backgroundColor: THEME_COLOR, width: '100%', padding: 15, borderRadius: 15, alignItems: 'center' },
    submitButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
