import { saveProduct } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image as RNImage, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, Vibration, View } from 'react-native';

const THEME_COLOR = '#4CAF50';
const BG_COLOR = '#F5F5F5';

// Mock Data for "AI" and "Market"
const MOCK_CROPS = [
    { id: '1', name: 'Tomato', image: 'https://img.icons8.com/color/96/tomato.png', marketPrice: 20 },
    { id: '2', name: 'Potato', image: 'https://img.icons8.com/color/96/potato.png', marketPrice: 15 },
    { id: '3', name: 'Onion', image: 'https://img.icons8.com/color/96/onion.png', marketPrice: 30 },
    { id: '4', name: 'Rice', image: 'https://img.icons8.com/color/96/rice-bowl.png', marketPrice: 50 },
    { id: '5', name: 'Wheat', image: 'https://img.icons8.com/color/96/wheat.png', marketPrice: 40 },
    { id: '6', name: 'Carrot', image: 'https://img.icons8.com/color/96/carrot.png', marketPrice: 35 },
];

export default function AddProductScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [crop, setCrop] = useState<any>(null);
    const [image, setImage] = useState('');
    const [quality, setQuality] = useState(''); // 'Grade A', 'Grade B'
    const [quantity, setQuantity] = useState('0');
    const [unit, setUnit] = useState('kg');
    const [price, setPrice] = useState('');
    const [location, setLocation] = useState('');
    const [deliveryType, setDeliveryType] = useState('FARM_PICKUP'); // FARM_PICKUP or MARKET_DROP

    // Simulation states
    const [listening, setListening] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    // Step 1: Voice / Select Crop
    const toggleVoice = () => {
        setListening(true);
        Vibration.vibrate(100);
        setTimeout(() => {
            setListening(false);
            // Simulate voice recognition matching "Tomato"
            setCrop(MOCK_CROPS[0]);
            Alert.alert("Voice Matched", "Did you say 'Tomato'?");
        }, 2000);
    };

    // Step 2: Quality Scan
    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setAnalyzing(true);
            setTimeout(() => {
                setAnalyzing(false);
                setQuality('Grade A'); // Mock AI Result
            }, 2000);
        }
    };

    // Step 4: Location
    const getCurrentLocation = () => {
        setLoading(true);
        // Simulate GPS fetch
        setTimeout(() => {
            setLocation('Village: Melur, Dist: Madurai');
            setLoading(false);
        }, 1500);
    };

    // Final Submit
    const handleGoLive = async () => {
        setLoading(true);
        try {
            const userJson = await AsyncStorage.getItem('current_user');
            const user = userJson ? JSON.parse(userJson) : {};

            // Default profile fallback
            const profile = {
                name: user.name || 'Ramesh Farm',
                phone: user.phone || '+91 98765 43210',
                location: user.location || location || 'Coimbatore, Tamil Nadu'
            };

            const productData = {
                name: crop.name,
                price: `₹${price}/${unit}`,
                image: image || crop.image,
                farmerName: profile.name,
                farmerContact: profile.phone,
                farmerAddress: location || profile.location,
                rating: '5.0',
                quality: quality,
                quantity: `${quantity} ${unit}`,
                deliveryType
            };

            await saveProduct(productData);
            setLoading(false);
            Alert.alert("Success", "Your product is now LIVE!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (e) {
            setLoading(false);
            Alert.alert("Error", "Failed to list product");
        }
    };

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What are you selling today?</Text>

            {/* Voice Button */}
            <TouchableOpacity style={styles.micButton} onPress={toggleVoice}>
                <Ionicons name={listening ? "mic" : "mic-outline"} size={40} color="white" />
            </TouchableOpacity>
            <Text style={styles.hintText}>{listening ? "Listening..." : "Tap & Speak (e.g., 'Tomato')"}</Text>

            {/* Quick Grid */}
            <View style={styles.grid}>
                {MOCK_CROPS.map((c) => (
                    <TouchableOpacity
                        key={c.id}
                        style={[styles.gridItem, crop?.id === c.id && styles.gridItemSelected]}
                        onPress={() => setCrop(c)}
                    >
                        <RNImage source={{ uri: c.image }} style={styles.gridIcon} />
                        <Text style={styles.gridText}>{c.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {crop && (
                <TouchableOpacity style={styles.nextButton} onPress={() => setStep(2)}>
                    <Text style={styles.nextBtnText}>Next: Check Quality</Text>
                    <Ionicons name="arrow-forward" size={24} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Check Quality (AI Scan)</Text>
            <Text style={styles.subTitle}>Take a photo of your {crop?.name}</Text>

            <TouchableOpacity style={styles.cameraBox} onPress={takePhoto}>
                {image ? (
                    <RNImage source={{ uri: image }} style={styles.previewImage} />
                ) : (
                    <View style={{ alignItems: 'center' }}>
                        <Ionicons name="camera" size={50} color="#666" />
                        <Text style={{ marginTop: 10, color: '#666' }}>Tap to Scan</Text>
                    </View>
                )}
            </TouchableOpacity>

            {analyzing && (
                <View style={styles.analyzing}>
                    <ActivityIndicator size="large" color={THEME_COLOR} />
                    <Text style={{ marginLeft: 10 }}>AI is grading your crop...</Text>
                </View>
            )}

            {quality ? (
                <View style={styles.resultBox}>
                    <Ionicons name="checkmark-circle" size={30} color="green" />
                    <View style={{ marginLeft: 10 }}>
                        <Text style={styles.resultTitle}>Quality Detected</Text>
                        <Text style={styles.resultGrade}>{quality}</Text>
                    </View>
                </View>
            ) : null}

            {quality && (
                <TouchableOpacity style={styles.nextButton} onPress={() => {
                    // Pre-fill price based on market + quality
                    setPrice(`${crop.marketPrice - 2}`);
                    setStep(3);
                }}>
                    <Text style={styles.nextBtnText}>Next: Set Price</Text>
                    <Ionicons name="arrow-forward" size={24} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Quantity & Price</Text>

            <View style={styles.advisoryCard}>
                <Ionicons name="trending-up" size={24} color="#2196F3" />
                <Text style={styles.advisoryText}>
                    Market Price: <Text style={{ fontWeight: 'bold' }}>₹{crop?.marketPrice}</Text>
                </Text>
                <Text style={styles.advisorySub}>Recommended: ₹{crop?.marketPrice - 2} (Fast Sell)</Text>
            </View>

            {/* Quantity */}
            <Text style={styles.label}>Quantity ({unit})</Text>
            <View style={styles.qtyRow}>
                <TouchableOpacity onPress={() => setQuantity((Math.max(0, parseInt(quantity) - 10)).toString())} style={styles.qtyBtn}>
                    <Ionicons name="remove" size={24} color="white" />
                </TouchableOpacity>
                <TextInput
                    style={styles.qtyInput}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                />
                <TouchableOpacity onPress={() => setQuantity((parseInt(quantity) + 10).toString())} style={styles.qtyBtn}>
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Price */}
            <Text style={styles.label}>Your Price (₹ per {unit})</Text>
            <TextInput
                style={styles.priceInput}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
            />

            <TouchableOpacity style={styles.nextButton} onPress={() => setStep(4)}>
                <Text style={styles.nextBtnText}>Next: Location</Text>
                <Ionicons name="arrow-forward" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );

    const renderStep4 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Pickup Location</Text>

            <TouchableOpacity style={styles.locButton} onPress={getCurrentLocation}>
                <Ionicons name="navigate" size={24} color="white" />
                <Text style={styles.locBtnText}>Use My Current Location</Text>
            </TouchableOpacity>

            {location ? (
                <View style={styles.locResult}>
                    <Ionicons name="location-sharp" size={24} color="red" />
                    <Text style={styles.locText}>{location}</Text>
                </View>
            ) : null}

            <Text style={[styles.label, { marginTop: 20 }]}>Who delivers?</Text>
            <View style={styles.toggleRow}>
                <TouchableOpacity
                    style={[styles.toggleBtn, deliveryType === 'FARM_PICKUP' && styles.toggleBtnActive]}
                    onPress={() => setDeliveryType('FARM_PICKUP')}
                >
                    <Ionicons name="home" size={24} color={deliveryType === 'FARM_PICKUP' ? 'white' : '#666'} />
                    <Text style={[styles.toggleText, deliveryType === 'FARM_PICKUP' && styles.toggleTextActive]}>Buyer Pickup</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleBtn, deliveryType === 'MARKET_DROP' && styles.toggleBtnActive]}
                    onPress={() => setDeliveryType('MARKET_DROP')}
                >
                    <Ionicons name="car" size={24} color={deliveryType === 'MARKET_DROP' ? 'white' : '#666'} />
                    <Text style={[styles.toggleText, deliveryType === 'MARKET_DROP' && styles.toggleTextActive]}>I will Drop</Text>
                </TouchableOpacity>
            </View>

            {location && (
                <TouchableOpacity style={styles.nextButton} onPress={() => setStep(5)}>
                    <Text style={styles.nextBtnText}>Next: Confirm</Text>
                    <Ionicons name="arrow-forward" size={24} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );

    const renderStep5 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Final Confirmation</Text>

            <View style={styles.summaryCard}>
                <RNImage source={{ uri: image || crop.image }} style={styles.summaryImg} />
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Crop:</Text>
                    <Text style={styles.summaryVal}>{crop?.name}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Grade:</Text>
                    <Text style={styles.summaryVal}>{quality}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Quantity:</Text>
                    <Text style={styles.summaryVal}>{quantity} {unit}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Price:</Text>
                    <Text style={styles.summaryVal}>₹{price}/{unit}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Location:</Text>
                    <Text style={styles.summaryVal} numberOfLines={1}>{location}</Text>
                </View>

                {/* Earnings */}
                <View style={styles.earningsBox}>
                    <Text style={styles.earnLabel}>Expected Earnings</Text>
                    <Text style={styles.earnVal}>₹ {parseInt(price || '0') * parseInt(quantity || '0')}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleGoLive}>
                {loading ? <ActivityIndicator color="white" /> : (
                    <>
                        <Text style={styles.submitBtnText}>SELL NOW (Go Live)</Text>
                        <Ionicons name="rocket" size={24} color="white" style={{ marginLeft: 10 }} />
                    </>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Steps Progress */}
            <View style={styles.progressBar}>
                {[1, 2, 3, 4, 5].map(s => (
                    <View key={s} style={[styles.progressDot, step >= s && styles.progressDotActive]} />
                ))}
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
            </ScrollView>

            {/* Back Button */}
            {step > 1 && (
                <TouchableOpacity style={styles.backBtnWrapper} onPress={() => setStep(step - 1)}>
                    <Ionicons name="arrow-back" size={24} color="#666" />
                    <Text style={{ color: '#666', marginLeft: 5 }}>Back</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG_COLOR, paddingTop: 60 },
    progressBar: { flexDirection: 'row', justifyContent: 'center', marginVertical: 20 },
    progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#DDD', marginHorizontal: 5 },
    progressDotActive: { backgroundColor: THEME_COLOR, width: 20 },

    stepContainer: { padding: 20, flex: 1 },
    stepTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 20 },
    subTitle: { textAlign: 'center', color: '#666', marginBottom: 20 },

    // Step 1
    micButton: { alignSelf: 'center', backgroundColor: '#F44336', padding: 20, borderRadius: 50, elevation: 5 },
    hintText: { textAlign: 'center', marginTop: 10, color: '#888' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 20 },
    gridItem: { width: '30%', backgroundColor: 'white', margin: '1.5%', borderRadius: 10, alignItems: 'center', padding: 10, elevation: 2 },
    gridItemSelected: { borderWidth: 2, borderColor: THEME_COLOR, backgroundColor: '#E8F5E9' },
    gridIcon: { width: 40, height: 40, marginBottom: 5 },
    gridText: { fontSize: 12, fontWeight: '600', color: '#333' },

    // Step 2 & Common
    nextButton: { backgroundColor: THEME_COLOR, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 30, marginTop: 30 },
    nextBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginRight: 10 },

    cameraBox: { height: 200, backgroundColor: '#E0E0E0', borderRadius: 15, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    previewImage: { width: '100%', height: '100%' },
    analyzing: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    resultBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', padding: 15, borderRadius: 10, marginTop: 15, borderLeftWidth: 5, borderLeftColor: 'green' },
    resultTitle: { fontWeight: 'bold', fontSize: 16 },
    resultGrade: { fontSize: 18, color: 'green', fontWeight: 'bold' },

    // Step 3
    advisoryCard: { backgroundColor: '#E3F2FD', padding: 15, borderRadius: 10, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
    advisoryText: { marginLeft: 10, fontSize: 16, color: '#1565C0' },
    advisorySub: { width: '100%', marginTop: 5, marginLeft: 34, color: '#1565C0', fontSize: 12 },
    qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 15 },
    qtyBtn: { backgroundColor: THEME_COLOR, padding: 10, borderRadius: 10 },
    qtyInput: { fontSize: 22, fontWeight: 'bold', marginHorizontal: 20, width: 80, textAlign: 'center', backgroundColor: 'white', padding: 5, borderRadius: 5 },
    label: { fontSize: 16, fontWeight: '600', color: '#666', marginTop: 20 },
    priceInput: { fontSize: 30, fontWeight: 'bold', textAlign: 'center', color: THEME_COLOR, borderBottomWidth: 2, borderBottomColor: THEME_COLOR, padding: 5 },

    // Step 4
    locButton: { flexDirection: 'row', backgroundColor: '#2196F3', padding: 15, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    locBtnText: { color: 'white', fontWeight: 'bold', marginLeft: 10 },
    locResult: { marginTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    locText: { fontSize: 16, marginLeft: 5, fontWeight: '500' },
    toggleRow: { flexDirection: 'row', marginTop: 10 },
    toggleBtn: { flex: 1, alignItems: 'center', padding: 15, backgroundColor: 'white', marginHorizontal: 5, borderRadius: 10, borderWidth: 1, borderColor: '#DDD' },
    toggleBtnActive: { backgroundColor: THEME_COLOR, borderColor: THEME_COLOR },
    toggleText: { marginTop: 5, fontWeight: '600', color: '#666' },
    toggleTextActive: { color: 'white' },

    // Step 5
    summaryCard: { backgroundColor: 'white', padding: 20, borderRadius: 15, elevation: 3 },
    summaryImg: { width: 100, height: 100, alignSelf: 'center', borderRadius: 10, marginBottom: 15 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    summaryLabel: { color: '#888', fontSize: 16 },
    summaryVal: { color: '#333', fontSize: 16, fontWeight: '600', maxWidth: '60%' },
    earningsBox: { backgroundColor: '#E8F5E9', padding: 15, borderRadius: 10, marginTop: 15, alignItems: 'center' },
    earnLabel: { color: 'green', fontSize: 14 },
    earnVal: { color: 'green', fontSize: 24, fontWeight: 'bold' },
    submitButton: { backgroundColor: THEME_COLOR, padding: 20, borderRadius: 30, marginTop: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 5 },
    submitBtnText: { color: 'white', fontSize: 20, fontWeight: 'bold' },

    backBtnWrapper: { position: 'absolute', top: 50, left: 20, flexDirection: 'row', alignItems: 'center', zIndex: 10 }
});
