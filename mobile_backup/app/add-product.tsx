import { Colors } from '@/constants/theme';
import { TRANSLATIONS } from '@/constants/translations';
import { useTheme } from '@/context/ThemeContext';
import { saveProduct } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Image as RNImage,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';
import Animated, { FadeIn, FadeInRight, FadeOut } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Mock Data for "Market Insights"
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
    const { theme } = useTheme();
    const colors = Colors[theme];

    const params = useLocalSearchParams();
    const lang = (params.lang as keyof typeof TRANSLATIONS) || 'en';
    const t = TRANSLATIONS[lang];

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [crop, setCrop] = useState<any>(null);
    const [image, setImage] = useState('');
    const [quality, setQuality] = useState(''); // 'Grade A', 'Grade B'
    const [quantity, setQuantity] = useState('50');
    const [unit, setUnit] = useState('kg');
    const [price, setPrice] = useState('');
    const [locationText, setLocationText] = useState('');
    const [deliveryType, setDeliveryType] = useState('FARM_PICKUP'); // FARM_PICKUP or MARKET_DROP

    // Simulation states
    const [listening, setListening] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    // Step 1: Voice / Select Crop
    const toggleVoice = () => {
        setListening(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Vibration.vibrate(100);

        setTimeout(() => {
            setListening(false);
            const selectedCrop = MOCK_CROPS[0]; // Simulation match "Tomato"
            setCrop(selectedCrop);

            // Speech Feedback
            const speechText = lang === 'ta'
                ? `தக்காளி கண்டறியப்பட்டது. நீங்கள் தக்காளி என்று சொன்னீர்களா?`
                : `Tomato recognized. Did you say Tomato?`;

            Speech.speak(speechText, { language: lang === 'ta' ? 'ta-IN' : 'en-US' });

            Alert.alert(t.voiceMatched, `${t.didYouSay} 'Tomato'?`, [
                { text: "No", onPress: () => setCrop(null), style: 'cancel' },
                { text: "Yes", onPress: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) }
            ]);
        }, 2000);
    };

    const handleCropSelect = (item: any) => {
        setCrop(item);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    // Step 2: Quality Scan
    // Refactor the scan logic into a reusable function
    const runAiScan = (uri: string) => {
        setAnalyzing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // ---------------------------------------------------------
        // REAL AI INTEGRATION WOULD GO HERE
        // System Prompt:
        // "You are an agricultural quality control expert. Analyze the uploaded image of a crop.
        // Identify the crop (e.g., Tomato, Potato, Onion).
        // Grade the quality based on visual appearance (color, size, skin texture, defects) into one of these categories: 'Grade A' (Premium), 'Grade B' (Standard), or 'Grade C' (Fair).
        // Estimate the visible quantity if possible.
        // Return your response strictly as a JSON object with no markdown formatting: { \"cropName\": \"string\", \"quality\": \"string\", \"confidenceScore\": number, \"reasoning\": \"string\" }"
        // ---------------------------------------------------------
        // Example API Payload (Pseudo-code):
        // const response = await fetch('https://api.openai.com/v1/chat/completions', {
        //   method: 'POST',
        //   body: JSON.stringify({
        //     model: "gpt-4o",
        //     messages: [
        //       {
        //         role: "user",
        //         content: [
        //           { type: "text", text: "Analyze this crop image for market listing." },
        //           { type: "image_url", image_url: { url: uri } }
        //         ]
        //       }
        //     ]
        //   })
        // });
        // ---------------------------------------------------------
        setTimeout(() => {
            setAnalyzing(false);
            const grades = ['Grade A', 'Grade A', 'Grade B']; // Weighting towards A for demo
            const randomGrade = grades[Math.floor(Math.random() * grades.length)];
            setQuality(randomGrade);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            Speech.speak(
                lang === 'ta'
                    ? `தர ஆய்வு முடிந்தது. உங்கள் பயிர் ${randomGrade === 'Grade A' ? 'தரம் ஏ' : 'தரம் பி'} என கண்டறியப்பட்டுள்ளது.`
                    : `Scan complete. Your crop is graded as ${randomGrade}.`,
                { language: lang === 'ta' ? 'ta-IN' : 'en-US' }
            );
        }, 2000);
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission", t.cameraPermission);
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            runAiScan(result.assets[0].uri);
        }
    };

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            runAiScan(result.assets[0].uri);
        }
    };

    // Step 4: Location
    const getCurrentLocation = async () => {
        setLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                // Fallback to simulation
                setTimeout(() => {
                    setLocationText('Village: Melur, Dist: Madurai');
                    setLoading(false);
                }, 1500);
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            // In a real app we'd reverse geocode. For demo we stick to the hardcoded village after getting real coords.
            console.log("Real Coords:", loc.coords);

            setTimeout(() => {
                setLocationText('Village: Melur, Dist: Madurai');
                setLoading(false);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }, 1500); // User requested 1.5s
        } catch (e) {
            setLocationText('Coimbatore, Tamil Nadu');
            setLoading(false);
        }
    };

    // Final Submit
    const handleGoLive = async () => {
        setLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        try {
            const userJson = await AsyncStorage.getItem('current_user');
            const user = userJson ? JSON.parse(userJson) : {};

            const productData = {
                name: crop.name,
                price: `₹${price}/${unit}`,
                image: image || crop.image,
                farmerName: user.name || 'Ramesh Farm',
                farmerContact: user.phone || '+91 98765 43210',
                farmerAddress: locationText || user.location || 'Coimbatore, TN',
                rating: '5.0',
                quality: quality,
                quantity: `${quantity} ${unit}`,
                deliveryType
            };

            await saveProduct(productData);
            setLoading(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            Alert.alert("Success", t.listingSuccess, [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (e) {
            setLoading(false);
            Alert.alert("Error", t.listingError);
        }
    };

    const renderStep1 = () => (
        <Animated.View entering={FadeInRight} exiting={FadeOut} style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>{t.sellingToday}</Text>

            {/* Voice Button */}
            <TouchableOpacity
                style={[styles.micButton, { backgroundColor: colors.error, transform: [{ scale: listening ? 1.2 : 1 }] } as any]}
                onPress={toggleVoice}
            >
                <Ionicons name={listening ? "mic" : "mic-outline"} size={40} color="white" />
            </TouchableOpacity>
            <Text style={styles.hintText}>{listening ? t.listening : t.tapAndSpeak}</Text>

            {/* Quick Grid */}
            <View style={styles.grid}>
                {MOCK_CROPS.map((c) => (
                    <TouchableOpacity
                        key={c.id}
                        style={[
                            styles.gridItem,
                            { backgroundColor: colors.cardBackground },
                            crop?.id === c.id && { borderWidth: 2, borderColor: colors.tint, backgroundColor: theme === 'light' ? '#E8F5E9' : '#1B5E20' }
                        ]}
                        onPress={() => handleCropSelect(c)}
                    >
                        <RNImage source={{ uri: c.image }} style={styles.gridIcon} />
                        <Text style={[styles.gridText, { color: colors.text }]}>{c.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {crop && (
                <Animated.View entering={FadeIn}>
                    <TouchableOpacity
                        style={[styles.nextButton, { backgroundColor: colors.tint }]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setStep(2);
                        }}
                    >
                        <Text style={styles.nextBtnText}>{t.nextQuality}</Text>
                        <Ionicons name="arrow-forward" size={24} color="white" />
                    </TouchableOpacity>
                </Animated.View>
            )}
        </Animated.View>
    );

    const renderStep2 = () => (
        <Animated.View entering={FadeInRight} exiting={FadeOut} style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>{t.checkQuality}</Text>
            <Text style={[styles.subTitle, { color: colors.icon }]}>{t.takePhotoOf} {crop?.name}</Text>

            {image ? (
                <TouchableOpacity
                    style={[styles.cameraBox, { backgroundColor: colors.inputBackground }]}
                    onPress={takePhoto}
                >
                    <RNImage source={{ uri: image }} style={styles.previewImage} />
                </TouchableOpacity>
            ) : (
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
                    {/* Option 1: Camera */}
                    <TouchableOpacity
                        style={[styles.cameraBox, { width: 140, height: 140, backgroundColor: colors.inputBackground }]}
                        onPress={takePhoto}
                    >
                        <Ionicons name="camera" size={40} color={colors.icon} />
                        <Text style={{ color: colors.icon }}>{t.camera}</Text>
                    </TouchableOpacity>

                    {/* Option 2: Directory/Gallery */}
                    <TouchableOpacity
                        style={[styles.cameraBox, { width: 140, height: 140, backgroundColor: colors.inputBackground }]}
                        onPress={pickImage}
                    >
                        <Ionicons name="images" size={40} color={colors.icon} />
                        <Text style={{ color: colors.icon }}>{t.gallery}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {analyzing && (
                <View style={styles.analyzing}>
                    <ActivityIndicator size="large" color={colors.tint} />
                    <Text style={{ marginLeft: 10, color: colors.text }}>{t.gradingCrop}</Text>
                </View>
            )}

            {quality ? (
                <Animated.View entering={FadeIn} style={[styles.resultBox, { backgroundColor: theme === 'light' ? '#E8F5E9' : '#1B5E20', borderLeftColor: colors.tint }]}>
                    <Ionicons name="checkmark-circle" size={30} color={colors.tint} />
                    <View style={{ marginLeft: 10 }}>
                        <Text style={[styles.resultTitle, { color: colors.text }]}>{t.qualityDetected}</Text>
                        <Text style={[styles.resultGrade, { color: colors.tint }]}>{quality}</Text>
                    </View>
                </Animated.View>
            ) : null}

            {quality && (
                <TouchableOpacity
                    style={[styles.nextButton, { backgroundColor: colors.tint }]}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setPrice(`${crop.marketPrice - 2}`);
                        setStep(3);
                    }}
                >
                    <Text style={styles.nextBtnText}>{t.nextPrice}</Text>
                    <Ionicons name="arrow-forward" size={24} color="white" />
                </TouchableOpacity>
            )}
        </Animated.View>
    );

    const renderStep3 = () => (
        <Animated.View entering={FadeInRight} exiting={FadeOut} style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>{t.qtyAndPrice}</Text>

            <View style={[styles.advisoryCard, { backgroundColor: theme === 'light' ? '#E3F2FD' : '#0D47A1' }]}>
                <Ionicons name="trending-up" size={24} color="#2196F3" />
                <Text style={[styles.advisoryText, { color: theme === 'light' ? '#1565C0' : '#BBDEFB' }]}>
                    {t.marketPrice}: <Text style={{ fontWeight: 'bold' }}>₹{crop?.marketPrice}</Text>
                </Text>
                <Text style={[styles.advisorySub, { color: theme === 'light' ? '#1565C0' : '#BBDEFB' }]}>
                    {t.recommended}: ₹{crop?.marketPrice - 2} ({t.fastSell})
                </Text>
            </View>

            {/* Quantity */}
            <Text style={[styles.label, { color: colors.icon }]}>{t.quantityLabel} ({unit})</Text>
            <View style={styles.qtyRow}>
                <TouchableOpacity
                    onPress={() => {
                        setQuantity((Math.max(0, parseInt(quantity) - 10)).toString());
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[styles.qtyBtn, { backgroundColor: colors.tint }]}
                >
                    <Ionicons name="remove" size={24} color="white" />
                </TouchableOpacity>
                <TextInput
                    style={[styles.qtyInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                />
                <TouchableOpacity
                    onPress={() => {
                        setQuantity((parseInt(quantity) + 10).toString());
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[styles.qtyBtn, { backgroundColor: colors.tint }]}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Price */}
            <Text style={[styles.label, { color: colors.icon }]}>{t.yourPrice} (₹ per {unit})</Text>
            <TextInput
                style={[styles.priceInput, { color: colors.tint, borderBottomColor: colors.tint }]}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
            />

            <TouchableOpacity
                style={[styles.nextButton, { backgroundColor: colors.tint }]}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setStep(4);
                }}
            >
                <Text style={styles.nextBtnText}>{t.nextLocation}</Text>
                <Ionicons name="arrow-forward" size={24} color="white" />
            </TouchableOpacity>
        </Animated.View>
    );

    const renderStep4 = () => (
        <Animated.View entering={FadeInRight} exiting={FadeOut} style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>{t.pickupLocation}</Text>

            <TouchableOpacity
                style={[styles.locButton, { backgroundColor: '#2196F3' }]}
                onPress={getCurrentLocation}
            >
                {loading ? <ActivityIndicator color="white" /> : (
                    <>
                        <Ionicons name="navigate" size={24} color="white" />
                        <Text style={styles.locBtnText}>{t.useCurrentLoc}</Text>
                    </>
                )}
            </TouchableOpacity>

            {locationText ? (
                <Animated.View entering={FadeIn} style={styles.locResult}>
                    <Ionicons name="location-sharp" size={24} color={colors.error} />
                    <Text style={[styles.locText, { color: colors.text }]}>{locationText}</Text>
                </Animated.View>
            ) : null}

            <Text style={[styles.label, { color: colors.icon, marginTop: 40 }]}>{t.whoDelivers}</Text>
            <View style={styles.toggleRow}>
                <TouchableOpacity
                    style={[
                        styles.toggleBtn,
                        { backgroundColor: colors.cardBackground, borderColor: colors.inputBorder },
                        deliveryType === 'FARM_PICKUP' && { backgroundColor: colors.tint, borderColor: colors.tint }
                    ]}
                    onPress={() => {
                        setDeliveryType('FARM_PICKUP');
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                >
                    <Ionicons name="home" size={24} color={deliveryType === 'FARM_PICKUP' ? 'white' : colors.icon} />
                    <Text style={[
                        styles.toggleText,
                        { color: colors.icon },
                        deliveryType === 'FARM_PICKUP' && { color: 'white' }
                    ]}>{t.buyerPickup}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.toggleBtn,
                        { backgroundColor: colors.cardBackground, borderColor: colors.inputBorder },
                        deliveryType === 'MARKET_DROP' && { backgroundColor: colors.tint, borderColor: colors.tint }
                    ]}
                    onPress={() => {
                        setDeliveryType('MARKET_DROP');
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                >
                    <Ionicons name="car" size={24} color={deliveryType === 'MARKET_DROP' ? 'white' : colors.icon} />
                    <Text style={[
                        styles.toggleText,
                        { color: colors.icon },
                        deliveryType === 'MARKET_DROP' && { color: 'white' }
                    ]}>{t.iWillDrop}</Text>
                </TouchableOpacity>
            </View>

            {locationText && (
                <TouchableOpacity
                    style={[styles.nextButton, { backgroundColor: colors.tint, marginTop: 40 }]}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setStep(5);
                    }}
                >
                    <Text style={styles.nextBtnText}>{t.nextConfirm}</Text>
                    <Ionicons name="arrow-forward" size={24} color="white" />
                </TouchableOpacity>
            )}
        </Animated.View>
    );

    const renderStep5 = () => (
        <Animated.View entering={FadeInRight} style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>{t.finalConfirm}</Text>

            <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
                <RNImage source={{ uri: image || crop.image }} style={styles.summaryImg} />
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.icon }]}>{t.summaryCrop}:</Text>
                    <Text style={[styles.summaryVal, { color: colors.text }]}>{crop?.name}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.icon }]}>{t.summaryGrade}:</Text>
                    <Text style={[styles.summaryVal, { color: colors.text }]}>{quality}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.icon }]}>{t.summaryQty}:</Text>
                    <Text style={[styles.summaryVal, { color: colors.text }]}>{quantity} {unit}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.icon }]}>{t.summaryPrice}:</Text>
                    <Text style={[styles.summaryVal, { color: colors.text }]}>₹{price}/{unit}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.icon }]}>{t.summaryLoc}:</Text>
                    <Text style={[styles.summaryVal, { color: colors.text }]} numberOfLines={1}>{locationText}</Text>
                </View>

                {/* Earnings */}
                <View style={[styles.earningsBox, { backgroundColor: theme === 'light' ? '#E8F5E9' : '#1B5E20' }]}>
                    <Text style={[styles.earnLabel, { color: colors.tint }]}>{t.expectedEarnings}</Text>
                    <Text style={[styles.earnVal, { color: colors.tint }]}>₹ {parseInt(price || '0') * parseInt(quantity || '0')}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.tint }]}
                onPress={handleGoLive}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="white" /> : (
                    <>
                        <Text style={styles.submitBtnText}>{t.sellNow}</Text>
                        <Ionicons name="rocket" size={24} color="white" style={{ marginLeft: 10 }} />
                    </>
                )}
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            {/* Steps Progress */}
            <View style={styles.progressBar}>
                {[1, 2, 3, 4, 5].map(s => (
                    <View
                        key={s}
                        style={[
                            styles.progressDot,
                            { backgroundColor: colors.inputBorder },
                            step >= s && { backgroundColor: colors.tint, width: 20 }
                        ]}
                    />
                ))}
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
            </ScrollView>

            {/* Back Button */}
            {step > 1 && (
                <TouchableOpacity
                    style={styles.backBtnWrapper}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setStep(step - 1);
                    }}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.icon} />
                    <Text style={{ color: colors.icon, marginLeft: 5 }}>{t.back}</Text>
                </TouchableOpacity>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60 },
    progressBar: { flexDirection: 'row', justifyContent: 'center', marginVertical: 20 },
    progressDot: { width: 10, height: 10, borderRadius: 5, marginHorizontal: 5 },

    stepContainer: { padding: 20, flex: 1 },
    stepTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    subTitle: { textAlign: 'center', marginBottom: 20 },

    // Step 1
    micButton: { alignSelf: 'center', padding: 20, borderRadius: 50, elevation: 5 },
    hintText: { textAlign: 'center', marginTop: 10, color: '#888' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 20 },
    gridItem: { width: '30%', margin: '1.5%', borderRadius: 10, alignItems: 'center', padding: 10, elevation: 2 },
    gridIcon: { width: 40, height: 40, marginBottom: 5 },
    gridText: { fontSize: 12, fontWeight: '600' },

    // Step 2 & Common
    nextButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 30, marginTop: 30 },
    nextBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginRight: 10 },

    cameraBox: { height: 200, borderRadius: 15, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    previewImage: { width: '100%', height: '100%' },
    analyzing: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    resultBox: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, marginTop: 15, borderLeftWidth: 5 },
    resultTitle: { fontWeight: 'bold', fontSize: 16 },
    resultGrade: { fontSize: 18, fontWeight: 'bold' },

    // Step 3
    advisoryCard: { padding: 15, borderRadius: 10, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
    advisoryText: { marginLeft: 10, fontSize: 16 },
    advisorySub: { width: '100%', marginTop: 5, marginLeft: 34, fontSize: 12 },
    qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 15 },
    qtyBtn: { padding: 10, borderRadius: 10 },
    qtyInput: { fontSize: 22, fontWeight: 'bold', marginHorizontal: 20, width: 80, textAlign: 'center', padding: 5, borderRadius: 5 },
    label: { fontSize: 16, fontWeight: '600', marginTop: 20 },
    priceInput: { fontSize: 30, fontWeight: 'bold', textAlign: 'center', borderBottomWidth: 2, padding: 5 },

    // Step 4
    locButton: { flexDirection: 'row', padding: 15, borderRadius: 10, justifyContent: 'center', alignItems: 'center', minHeight: 55 },
    locBtnText: { color: 'white', fontWeight: 'bold', marginLeft: 10 },
    locResult: { marginTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    locText: { fontSize: 16, marginLeft: 5, fontWeight: '500' },
    toggleRow: { flexDirection: 'row', marginTop: 10 },
    toggleBtn: { flex: 1, alignItems: 'center', padding: 15, marginHorizontal: 5, borderRadius: 10, borderWidth: 1 },
    toggleText: { marginTop: 5, fontWeight: '600' },

    // Step 5
    summaryCard: { padding: 20, borderRadius: 15, elevation: 3 },
    summaryImg: { width: 100, height: 100, alignSelf: 'center', borderRadius: 10, marginBottom: 15 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    summaryLabel: { fontSize: 16 },
    summaryVal: { fontSize: 16, fontWeight: '600', maxWidth: '60%' },
    earningsBox: { padding: 15, borderRadius: 10, marginTop: 15, alignItems: 'center' },
    earnLabel: { fontSize: 14 },
    earnVal: { fontSize: 24, fontWeight: 'bold' },
    submitButton: { padding: 20, borderRadius: 30, marginTop: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 5 },
    submitBtnText: { color: 'white', fontSize: 20, fontWeight: 'bold' },

    backBtnWrapper: { position: 'absolute', top: 50, left: 20, flexDirection: 'row', alignItems: 'center', zIndex: 10 }
});
