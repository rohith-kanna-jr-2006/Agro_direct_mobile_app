import { TRANSLATIONS } from '@/constants/translations';
import { fetchProfile, saveProduct, updateProduct } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const THEME_COLOR = '#4CAF50';
const BACKGROUND_COLOR = '#F5F5F5';

export default function AddProductScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const lang = (params.lang as keyof typeof TRANSLATIONS) || 'en';
    const t = TRANSLATIONS[lang];

    const [name, setName] = useState((params.name as string) || '');
    const [price, setPrice] = useState((params.price as string) ? (params.price as string).replace(/[^0-9.]/g, '') : ''); // Extract number if editing
    const [unit, setUnit] = useState((params.price as string) && (params.price as string).includes('/') ? (params.price as string).split('/')[1] : 'kg');
    const [image, setImage] = useState(params.image as string || '');
    const isEditMode = !!params.id;

    const UNITS = [
        { label: 'Per kg', value: 'kg' },
        { label: 'Per 1/2 kg', value: '500g' },
        { label: 'Per Item', value: 'pc' }
    ];

    const handleSubmit = async () => {
        if (!name || !price) {
            Alert.alert("Error", "Please fill name and price");
            return;
        }

        // Automatic Rupee Formatting with Unit
        // If price is "50", formatted becomes "₹50/kg" (or selected unit)
        let formattedPrice = price;
        if (!formattedPrice.includes('₹')) {
            formattedPrice = `₹${formattedPrice}`;
        }

        // Append unit if not already present (though we are constructing it fresh mostly)
        // Since we split it on load, we reconstruct it here safely.
        formattedPrice = `${formattedPrice}/${unit}`;

        try {
            // Get current farmer profile details to attach to the product
            const farmerProfile = await fetchProfile('farmer');
            const profile = farmerProfile || {
                name: 'Ramesh Farm', // Default
                phone: '+91 98765 43210',
                location: 'Coimbatore, Tamil Nadu'
            };

            const productData = {
                name,
                price: formattedPrice,
                image: image || 'https://img.icons8.com/color/96/vegetable.png',
                farmerName: profile.name,
                farmerContact: profile.phone,
                farmerAddress: profile.location,
                rating: '5.0' // Default rating for new products
            };

            if (isEditMode) {
                // Update existing
                await updateProduct(params.id as string, productData);
                Alert.alert("Success", "Product Updated!");
            } else {
                // Add new
                await saveProduct(productData);
                Alert.alert("Success", t.prodAdded);
            }

            router.back();
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to save product");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.formCard}>
                    <Text style={styles.title}>{isEditMode ? "Edit Product" : t.addProduct}</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t.prodName}</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g. Potato"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t.prodPrice} (₹)</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginRight: 10 }]}
                                value={price}
                                onChangeText={setPrice}
                                placeholder="e.g. 50"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.unitContainer}>
                            {UNITS.map((u) => (
                                <TouchableOpacity
                                    key={u.value}
                                    style={[styles.unitChip, unit === u.value && styles.unitChipSelected]}
                                    onPress={() => setUnit(u.value)}
                                >
                                    <Text style={[styles.unitText, unit === u.value && styles.unitTextSelected]}>{u.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t.prodImage}</Text>
                        <TextInput
                            style={styles.input}
                            value={image}
                            onChangeText={setImage}
                            placeholder="https://example.com/image.png"
                        />
                    </View>

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Ionicons name="add-circle-outline" size={24} color="white" style={{ marginRight: 10 }} />
                        <Text style={styles.submitButtonText}>{isEditMode ? "Update Product" : t.submitProd}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BACKGROUND_COLOR },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    formCard: { backgroundColor: 'white', padding: 25, borderRadius: 20, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 25, textAlign: 'center' },

    inputContainer: { marginBottom: 20 },
    label: { fontSize: 16, color: '#666', marginBottom: 8, fontWeight: '600' },
    input: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#EEE', borderRadius: 10, padding: 15, fontSize: 16 },

    unitContainer: { flexDirection: 'row', marginTop: 10, flexWrap: 'wrap' },
    unitChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#DDD', marginRight: 10, marginBottom: 5, backgroundColor: 'white' },
    unitChipSelected: { backgroundColor: THEME_COLOR, borderColor: THEME_COLOR },
    unitText: { color: '#666', fontSize: 14 },
    unitTextSelected: { color: 'white', fontWeight: 'bold' },

    submitButton: { backgroundColor: THEME_COLOR, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 18, borderRadius: 15, marginTop: 10 },
    submitButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
