import { TRANSLATIONS } from '@/constants/translations';
import { deleteProduct, fetchProducts } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Default Data if nothing in storage
const INITIAL_PRODUCTS = [
    { id: '1', name: 'Tomato Hybrid', price: '₹25/kg', image: 'https://img.icons8.com/color/96/tomato.png', views: 120, sales: 50 },
    { id: '2', name: 'Potato Spunta', price: '₹15/kg', image: 'https://img.icons8.com/color/96/potato.png', views: 200, sales: 80 },
];

const THEME_COLOR = '#4CAF50';
const BACKGROUND_COLOR = '#F5F5F5';

export default function MyProductsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const lang = (params.lang as keyof typeof TRANSLATIONS) || 'en';
    const t = TRANSLATIONS[lang];

    const [products, setProducts] = useState<any[]>([]);

    useFocusEffect(
        useCallback(() => {
            loadProducts();
        }, [])
    );

    const loadProducts = async () => {
        try {
            const storedProducts = await fetchProducts();
            if (Array.isArray(storedProducts)) {
                // Filter? No, fetchProducts gets all. 
                // If "my products" implies only user's products, we need filtering or separate endpoint.
                // Current app logic `AsyncStorage.getItem('farmer_products')` seemed to store ALL products in one key?
                // Or separate keys? `farmer_products` implies global list in previous simple implementation?
                // Wait, `marketplace.tsx` ALSO reads `farmer_products`.
                // So "My Products" and "Marketplace" shared the same list in AsyncStorage?
                // If so, then fetching all products is correct behavior for this migration.
                // I'll keep it simple: fetch all.
                setProducts(storedProducts);
            } else {
                setProducts([]);
            }
        } catch (e) {
            console.error("Failed to load products", e);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteProduct(id);
            setProducts(products.filter(p => (p._id || p.id) !== id));
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to delete product");
        }
    };

    const handleEdit = (item: any) => {
        router.push({
            pathname: '/add-product',
            params: {
                id: item._id || item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                lang: lang
            }
        });
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>{item.price}</Text>
                <View style={styles.stats}>
                    <Text style={styles.statText}><Ionicons name="eye-outline" size={14} /> {item.views || 0}</Text>
                    <Text style={[styles.statText, { marginLeft: 10 }]}><Ionicons name="cart-outline" size={14} /> {item.sales || 0}</Text>
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFA726' }]} onPress={() => handleEdit(item)}>
                    <Ionicons name="create-outline" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EF5350', marginTop: 10 }]} onPress={() => handleDelete(item._id || item.id)}>
                    <Ionicons name="trash-outline" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.header}>{t.myProducts}</Text>
            </View>

            <FlatList
                data={products}
                keyExtractor={item => item._id || item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push({ pathname: '/add-product', params: { lang } })}
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BACKGROUND_COLOR },
    headerRow: { flexDirection: 'row', alignItems: 'center', padding: 20, marginTop: 30 },
    header: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    list: { paddingHorizontal: 15 },
    card: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 3 },
    image: { width: 70, height: 70, borderRadius: 10, marginRight: 15 },
    info: { flex: 1, justifyContent: 'center' },
    name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    price: { fontSize: 16, color: THEME_COLOR, fontWeight: '600', marginVertical: 4 },
    stats: { flexDirection: 'row' },
    statText: { fontSize: 12, color: '#666' },
    actions: { justifyContent: 'center' },
    actionBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: THEME_COLOR, justifyContent: 'center', alignItems: 'center', elevation: 5 },
});
