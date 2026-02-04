import { Colors } from '@/constants/theme';
import { TRANSLATIONS } from '@/constants/translations';
import { useTheme } from '@/context/ThemeContext';
import { fetchProducts } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function MarketplaceScreen() {
    const { theme } = useTheme();
    const colors = Colors[theme];

    const params = useLocalSearchParams();
    const lang = (params.lang as keyof typeof TRANSLATIONS) || 'en';
    const t = TRANSLATIONS[lang];

    const [userInfo, setUserInfo] = useState<any>(null);

    useFocusEffect(
        useCallback(() => {
            loadMarketItems();
            loadUser();
        }, [])
    );

    const loadUser = async () => {
        try {
            const userStr = await AsyncStorage.getItem('current_user');
            if (userStr) {
                setUserInfo(JSON.parse(userStr));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const [marketItems, setMarketItems] = useState<any[]>([]);

    const loadMarketItems = async () => {
        try {
            const products = await fetchProducts();
            if (Array.isArray(products)) {
                setMarketItems(products);
            } else {
                setMarketItems([]);
            }
        } catch (e) {
            console.error(e);
            setMarketItems([]);
        }
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Nearest');

    const FILTERS = ["Nearest", "Lowest Price", "Organic", "Bulk Available"];

    // Map backend fields to display fields
    const getDisplayItem = (item: any) => ({
        ...item,
        grade: item.quality || 'Grade A',
        displayQuantity: item.quantity || '50 kg',
        distance: item.distance || `${Math.floor(Math.random() * 10) + 1} km`
    });

    const router = useRouter();

    const placeOrder = (item: any) => {
        if (userInfo?.id === 'guest') {
            const { Alert } = require('react-native');
            Alert.alert("Guest Mode Restricted", "You cannot place orders in Guest Mode. Please login.", [{ text: "OK" }]);
            return;
        }

        router.push({
            pathname: '/product-details',
            params: {
                id: item._id || item.id,
                name: item.name,
                price: item.price,
                farmerName: item.farmerName,
                farmerContact: item.farmerContact,
                farmerAddress: item.farmerAddress,
                rating: item.rating,
                grade: item.grade,
                distance: item.distance,
                image: item.image,
                lang
            }
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.primary }]}>
                <View>
                    <Text style={styles.locationLabel}>Current Location</Text>
                    <View style={styles.locationRow}>
                        <Ionicons name="location" size={18} color="#FFF" />
                        <Text style={styles.locationText}> Coimbatore, TN</Text>
                        <Ionicons name="chevron-down" size={16} color="#FFF" />
                    </View>
                </View>
                <TouchableOpacity style={styles.iconBtn}>
                    <Ionicons name="notifications-outline" size={24} color="#FFF" />
                    <View style={styles.badge} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Search Bar */}
                <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
                    <Ionicons name="search" size={20} color={colors.icon} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search 'Fresh Tomatoes'..."
                        placeholderTextColor={colors.icon}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={() => console.log('Search Triggered')}
                        returnKeyType="search"
                    />
                    <TouchableOpacity onPress={() => router.push('/chat-order')} style={{ marginRight: 10 }}>
                        <Ionicons name="mic" size={22} color={colors.tint} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/smart-order')}>
                        <Ionicons name="arrow-forward-circle" size={28} color={colors.tint} />
                    </TouchableOpacity>
                </View>

                {/* Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    {FILTERS.map((f, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[
                                styles.filterChip,
                                { backgroundColor: activeFilter === f ? colors.tint : colors.inputBackground }
                            ]}
                            onPress={() => setActiveFilter(f)}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: activeFilter === f ? '#FFF' : colors.text }
                            ]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Grid Title */}
                <Text style={[styles.sectionHeader, { color: colors.text }]}>Fresh Recommendations</Text>

                {/* Product Grid */}
                <View style={styles.productGrid}>
                    {marketItems.length === 0 ? (
                        <Text style={styles.emptyText}>No products found.</Text>
                    ) : (
                        marketItems.map((rawItem) => {
                            const item = getDisplayItem(rawItem);
                            return (
                                <TouchableOpacity
                                    key={item._id || item.id}
                                    style={[styles.productCard, { backgroundColor: colors.cardBackground }]}
                                    onPress={() => placeOrder(item)}
                                >
                                    <Image source={{ uri: item.image }} style={styles.productImage} />

                                    {/* AI Grade Badge */}
                                    <View style={styles.gradeBadge}>
                                        <Text style={styles.gradeText}>{item.grade}</Text>
                                    </View>

                                    <View style={styles.cardContent}>
                                        <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                                        <Text style={[styles.productPrice, { color: colors.tint }]}>{item.price}</Text>

                                        <View style={styles.metaRow}>
                                            <Ionicons name="location-sharp" size={12} color={colors.icon} />
                                            <Text style={styles.distanceText}> {item.distance}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            {/* Ask AI FAB (Left) */}
            <TouchableOpacity
                style={styles.aiFab}
                onPress={() => router.push('/chat-order')}
            >
                <Ionicons name="chatbubble-ellipses" size={26} color="white" />
                <Text style={styles.fabText}>Ask AI</Text>
            </TouchableOpacity>

            {/* Post Request FAB (Right) */}
            <TouchableOpacity style={styles.fab}>
                <Ionicons name="add" size={30} color="white" />
                <Text style={styles.fabText}>Post Req</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    locationLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    locationText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginRight: 5 },
    iconBtn: { padding: 5, position: 'relative' },
    badge: { position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: 4, backgroundColor: 'red' },

    scrollContent: { paddingBottom: 100 },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: -25, // Overlap header
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        elevation: 4,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },

    filterScroll: { marginTop: 20, paddingHorizontal: 20, maxHeight: 40 },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    filterText: { fontSize: 14 },
    activeFilterText: { color: '#FFF', fontWeight: 'bold' },

    sectionHeader: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 20, marginTop: 25, marginBottom: 15 },

    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 15, // Gap handling
    },
    productCard: {
        width: '48%',
        borderRadius: 15,
        marginBottom: 15,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3
    },
    productImage: { width: '100%', height: 120, resizeMode: 'cover' },
    gradeBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#E8F5E9', // Keep green for badge as it implies 'fresh/organic' usually
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#4CAF50'
    },
    gradeText: { fontSize: 10, fontWeight: 'bold', color: '#2E7D32' },

    cardContent: { padding: 12 },
    productName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    productPrice: { fontSize: 16, fontWeight: 'bold' },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    distanceText: { fontSize: 12, color: '#999' },

    emptyText: { textAlign: 'center', marginTop: 40, width: '100%', color: '#999' },

    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF9800',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        elevation: 6
    },
    fabText: { color: '#FFF', fontWeight: 'bold', marginLeft: 5 },
    aiFab: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2196F3', // Blue for AI
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        elevation: 6
    }
});
