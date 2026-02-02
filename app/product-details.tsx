import { TRANSLATIONS } from '@/constants/translations';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const THEME_COLOR = '#4CAF50';

export default function ProductDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const lang = (params.lang as keyof typeof TRANSLATIONS) || 'en';
    const t = TRANSLATIONS[lang];

    const product = {
        ...params,
        grade: params.grade || 'Grade A',
        harvestDate: new Date(Date.now() - 86400000).toDateString(), // Yesterday
        shelfLife: '5 Days',
        description: "Freshly harvested organic produce directly from the farm. Grown using sustainable farming practices."
    };

    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = () => {
        router.push({
            pathname: '/cart',
            params: {
                ...params,
                quantity: quantity
            }
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                {/* Hero Image */}
                <Image source={{ uri: product.image as string }} style={styles.heroImage} />

                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.content}>
                    {/* Header Info */}
                    <View style={styles.headerRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>{product.name}</Text>
                            <View style={styles.badgeRow}>
                                <View style={styles.gradeBadge}>
                                    <Text style={styles.gradeText}>{product.grade}</Text>
                                </View>
                                <View style={styles.distanceBadge}>
                                    <Ionicons name="location-sharp" size={12} color="#666" />
                                    <Text style={styles.distanceText}>{product.distance || '5 km'}</Text>
                                </View>
                            </View>
                        </View>
                        <Text style={styles.price}>{product.price}</Text>
                    </View>

                    {/* Harvest Details */}
                    <View style={styles.infoCard}>
                        <Text style={styles.sectionTitle}>Freshness Guarantee</Text>
                        <View style={styles.detailRow}>
                            <Ionicons name="time-outline" size={20} color={THEME_COLOR} />
                            <Text style={styles.detailText}>Harvested: {product.harvestDate}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="leaf-outline" size={20} color={THEME_COLOR} />
                            <Text style={styles.detailText}>Shelf Life: {product.shelfLife}</Text>
                        </View>
                        <Text style={styles.description}>{product.description}</Text>
                    </View>

                    {/* Farmer Profile */}
                    <View style={styles.farmerCard}>
                        <View style={styles.farmerHeader}>
                            <Image source={{ uri: 'https://img.icons8.com/color/96/farmer-male.png' }} style={styles.farmerAvatar} />
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.farmerName}>{product.farmerName || 'Ramesh Farm'}</Text>
                                    <Ionicons name="checkmark-circle" size={16} color="#2196F3" style={{ marginLeft: 5 }} />
                                </View>
                                <Text style={styles.farmerLoc}>{product.farmerAddress || 'Coimbatore'}</Text>
                            </View>
                            <View style={styles.ratingBox}>
                                <Text style={styles.ratingText}>{product.rating || '4.5'} ★</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.qtyContainer}>
                    <Text style={styles.qtyLabel}>Quantity (kg)</Text>
                    <View style={styles.qtyControls}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                            <Ionicons name="remove" size={20} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.qtyValue}>{quantity}</Text>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
                            <Ionicons name="add" size={20} color="#333" />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                    <Ionicons name="cart-outline" size={20} color="#FFF" style={{ marginLeft: 10 }} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    heroImage: { width: '100%', height: 300, resizeMode: 'cover' },
    backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 },
    content: { padding: 20, paddingBottom: 100 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    price: { fontSize: 24, fontWeight: 'bold', color: THEME_COLOR },
    badgeRow: { flexDirection: 'row', marginTop: 8 },
    gradeBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginRight: 10 },
    gradeText: { color: '#2E7D32', fontSize: 12, fontWeight: 'bold' },
    distanceBadge: { flexDirection: 'row', alignItems: 'center' },
    distanceText: { fontSize: 12, color: '#666', marginLeft: 4 },

    infoCard: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 12, marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    detailText: { marginLeft: 10, fontSize: 15, color: '#555' },
    description: { marginTop: 10, color: '#777', lineHeight: 20 },

    farmerCard: { borderWidth: 1, borderColor: '#EEE', borderRadius: 12, padding: 15 },
    farmerHeader: { flexDirection: 'row', alignItems: 'center' },
    farmerAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
    farmerName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    farmerLoc: { fontSize: 14, color: '#888' },
    ratingBox: { marginLeft: 'auto', backgroundColor: '#FFF9C4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    ratingText: { color: '#FBC02D', fontWeight: 'bold' },

    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1, borderTopColor: '#EEE',
        elevation: 10
    },
    qtyContainer: { flex: 1, justifyContent: 'center' },
    qtyLabel: { fontSize: 12, color: '#888', marginBottom: 5 },
    qtyControls: { flexDirection: 'row', alignItems: 'center' },
    qtyBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#EEE', justifyContent: 'center', alignItems: 'center' },
    qtyValue: { marginHorizontal: 15, fontSize: 18, fontWeight: 'bold' },

    addToCartBtn: {
        flex: 1,
        backgroundColor: THEME_COLOR,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 20
    },
    addToCartText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
