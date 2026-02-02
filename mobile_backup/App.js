import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, FlatList, TextInput, ScrollView, Platform, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LightSensor } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// --- Theme Constants ---
const THEME_COLOR = '#4CAF50'; // Agricultural Green
const BACKGROUND_COLOR = '#F5F5F5';
const CARD_BG = '#FFFFFF';

// --- Mock Data for Marketplace ---
const MARKETPLACE_ITEMS = [
    { id: '1', name: 'Tomato Hybrid', price: '$25/kg', image: 'https://img.icons8.com/color/96/tomato.png' },
    { id: '2', name: 'Potato Spunta', price: '$15/kg', image: 'https://img.icons8.com/color/96/potato.png' },
    { id: '3', name: 'Corn Sweet', price: '$10/kg', image: 'https://img.icons8.com/color/96/corn.png' },
    { id: '4', name: 'Wheat Grain', price: '$30/kg', image: 'https://img.icons8.com/color/96/wheat.png' },
];

const Stack = createStackNavigator();

// --- Components ---

// 1. Home Dashboard
function HomeScreen({ navigation }) {
    const features = [
        { id: 'Scan', title: 'Plant Health', icon: 'scan-outline', screen: 'PlantScanner', color: '#66BB6A' },
        { id: 'Sun', title: 'Sunlight Tracker', icon: 'sunny-outline', screen: 'SunlightTracker', color: '#FFA726' },
        { id: 'Light', title: 'Crop Guidance', icon: 'flashlight-outline', screen: 'LedGuidance', color: '#29B6F6' },
        { id: 'Market', title: 'Marketplace', icon: 'cart-outline', screen: 'Marketplace', color: '#AB47BC' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>FarmDirect</Text>
                <Text style={styles.headerSubtitle}>Smart Farming Assistant</Text>
            </View>

            <View style={styles.gridContainer}>
                {features.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.gridItem, { backgroundColor: item.color }]}
                        onPress={() => navigation.navigate(item.screen)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name={item.icon} size={40} color="white" />
                        <Text style={styles.gridLabel}>{item.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
}

// 2. Feature A: Plant Health Scanner (Camera + Mock AI)
function PlantScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scannedImage, setScannedImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const cameraRef = useRef(null);
    const isFocused = useIsFocused();

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.text}>Camera permission is required</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            try {
                const photo = await cameraRef.current.takePictureAsync();
                setScannedImage(photo.uri);
                analyzeHealth();
            } catch (error) {
                Alert.alert("Error", "Failed to take picture");
            }
        }
    };

    const analyzeHealth = () => {
        setAnalyzing(true);
        // Mock AI delay
        setTimeout(() => {
            const outcomes = [
                { status: 'Healthy Plant', color: '#4CAF50', message: 'Your plant looks great!' },
                { status: 'Needs Water/Fertilizer', color: '#FFEB3B', message: 'Improve soil moisture.' },
                { status: 'Disease Detected', color: '#F44336', message: 'Quarantine this plant immediately.' },
            ];
            // Randomly pick one
            const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
            setResult(randomOutcome);
            setAnalyzing(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 2000);
    };

    const resetScan = () => {
        setScannedImage(null);
        setResult(null);
    };

    return (
        <View style={styles.container}>
            {scannedImage ? (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: scannedImage }} style={styles.previewImage} />
                    {analyzing && (
                        <View style={styles.overlay}>
                            <ActivityIndicator size="large" color="white" />
                            <Text style={styles.overlayText}>Scanning Leaf...</Text>
                        </View>
                    )}
                    {result && !analyzing && (
                        <View style={[styles.resultCard, { borderLeftColor: result.color, borderLeftWidth: 10 }]}>
                            <Text style={[styles.resultTitle, { color: result.color }]}>{result.status}</Text>
                            <Text style={styles.resultMessage}>{result.message}</Text>
                            <TouchableOpacity style={styles.button} onPress={resetScan}>
                                <Text style={styles.buttonText}>Scan Another</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            ) : (
                isFocused && ( // Only render camera when focused
                    <CameraView style={styles.camera} ref={cameraRef} facing="back">
                        <View style={styles.cameraControls}>
                            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                                <View style={styles.captureInner} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.scanOverlay}>
                            <Text style={styles.scanText}>Center leaf in frame</Text>
                        </View>
                    </CameraView>
                )
            )}
        </View>
    );
}

// 3. Feature B: Sunlight Exposure Tracker
function SunlightTrackerScreen() {
    const [lux, setLux] = useState(0);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            LightSensor.setUpdateInterval(500);
            const subscription = LightSensor.addListener(data => {
                setLux(data.illuminance);
            });
            return () => subscription.remove();
        }
    }, [isFocused]);

    const getStatus = (value) => {
        if (value < 100) return { text: 'Low Sunlight', color: '#90A4AE', icon: 'cloud-outline' };
        if (value < 1000) return { text: 'Medium/Good Sunlight', color: '#FBC02D', icon: 'partly-sunny-outline' };
        return { text: 'High Sunlight', color: '#FF6F00', icon: 'sunny' };
    };

    const status = getStatus(lux);

    return (
        <View style={[styles.container, styles.centerContainer, { backgroundColor: '#E0F7FA' }]}>
            <Ionicons name={status.icon} size={100} color={status.color} />
            <Text style={styles.luxValue}>{Math.round(lux)} lx</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                <Text style={styles.statusText}>{status.text}</Text>
            </View>
            <Text style={styles.instructionText}>
                Point your sensor towards the light source to measure intensity for your crops.
            </Text>
        </View>
    );
}

// 4. Feature C: LED Crop Guidance (Flashlight)
function LedGuidanceScreen() {
    // Mode: 0 = Off, 1 = Irrigation (Slow Blink), 2 = Disease (Fast Blink), 3 = Night (On)
    const [mode, setMode] = useState(0);
    const [torchOn, setTorchOn] = useState(false);
    const intervalRef = useRef(null);
    const [permission, requestPermission] = useCameraPermissions();
    const isFocused = useIsFocused(); // Ensure we handle unmounts

    // Clear interval on unmount or mode change
    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        // Default state when switching modes
        setTorchOn(false);

        if (mode === 3) {
            // Night Mode: Always On
            setTorchOn(true);
        } else if (mode === 1) {
            // Irrigation: Slow Blink (1s)
            intervalRef.current = setInterval(() => {
                setTorchOn(prev => !prev);
            }, 1000);
        } else if (mode === 2) {
            // Disease: Fast Blink (Strobe 100ms)
            intervalRef.current = setInterval(() => {
                setTorchOn(prev => !prev);
            }, 100);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [mode]);

    // Turn off when leaving screen
    useEffect(() => {
        if (!isFocused) {
            setMode(0);
            setTorchOn(false);
        }
    }, [isFocused]);

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.text}>Camera (Flash) permission is required</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleMode = (newMode) => {
        if (mode === newMode) setMode(0); // Toggle off if clicked again
        else setMode(newMode);
        Haptics.selectionAsync();
    };

    return (
        <View style={styles.container}>
            {/* Hidden Camera View to Control Torch */}
            {isFocused && (
                <CameraView
                    style={{ width: 1, height: 1, opacity: 0 }}
                    enableTorch={torchOn}
                    facing="back"
                />
            )}

            <View style={styles.guidanceContainer}>
                <Text style={styles.sectionTitle}>Field Guidance System</Text>
                <Text style={styles.subText}>Select a mode to signal field workers.</Text>

                <TouchableOpacity
                    style={[styles.actionButton, mode === 1 && styles.activeButton, { borderColor: '#2196F3' }]}
                    onPress={() => handleMode(1)}>
                    <Ionicons name="water-outline" size={24} color={mode === 1 ? 'white' : '#2196F3'} />
                    <Text style={[styles.actionText, mode === 1 && styles.activeText, { color: '#2196F3' }]}>
                        {mode === 1 ? 'Active: Irrigation (Slow)' : 'Irrigation Alert'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, mode === 2 && styles.activeButton, { borderColor: '#F44336' }]}
                    onPress={() => handleMode(2)}>
                    <Ionicons name="alert-circle-outline" size={24} color={mode === 2 ? 'white' : '#F44336'} />
                    <Text style={[styles.actionText, mode === 2 && styles.activeText, { color: '#F44336' }]}>
                        {mode === 2 ? 'Active: Disease (Strobe)' : 'Disease Warning'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, mode === 3 && styles.activeButton, { borderColor: '#FFEB3B' }]}
                    onPress={() => handleMode(3)}>
                    <Ionicons name="moon-outline" size={24} color={mode === 3 ? 'white' : '#FFC107'} />
                    <Text style={[styles.actionText, mode === 3 && styles.activeText, { color: '#FFC107' }]}>
                        {mode === 3 ? 'Active: Night Mode' : 'Night Mode'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// 5. Feature D: Buyer Marketplace & Chat
function MarketplaceScreen() {
    const [messages, setMessages] = useState([
        { id: 1, text: "Is the tomato stock available?", sender: "buyer" },
        { id: 2, text: "Yes, freshly harvested today.", sender: "system" }
    ]);
    const [input, setInput] = useState("");

    const sendMessage = () => {
        if (!input.trim()) return;
        setMessages([...messages, { id: Date.now(), text: input, sender: "buyer" }]);
        setInput("");
        setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Order received. Confirming details...", sender: "system" }]);
        }, 1000);
    };

    const placeOrder = (item) => {
        Alert.alert("Success", `Order placed for ${item.name}!`);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.sectionHeader}>Fresh Produce</Text>
            <View style={styles.marketGrid}>
                {MARKETPLACE_ITEMS.map((item) => (
                    <View key={item.id} style={styles.marketCard}>
                        <Image source={{ uri: item.image }} style={styles.marketImage} />
                        <Text style={styles.marketName}>{item.name}</Text>
                        <Text style={styles.marketPrice}>{item.price}</Text>
                        <TouchableOpacity style={styles.orderButton} onPress={() => placeOrder(item)}>
                            <Text style={styles.orderButtonText}>Place Order</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            <Text style={styles.sectionHeader}>Buyer Chat</Text>
            <View style={styles.chatContainer}>
                <View style={styles.chatList}>
                    {messages.map((msg) => (
                        <View key={msg.id} style={[styles.messageBubble, msg.sender === 'buyer' ? styles.myMsg : styles.sysMsg]}>
                            <Text style={msg.sender === 'buyer' ? styles.myMsgText : styles.sysMsgText}>{msg.text}</Text>
                        </View>
                    ))}
                </View>
                <View style={styles.chatInputRow}>
                    <TextInput
                        style={styles.chatInput}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Type a message..."
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                        <Ionicons name="send" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

// Main App Navigation
export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Stack.Navigator
                    screenOptions={{
                        headerStyle: { backgroundColor: THEME_COLOR },
                        headerTintColor: '#fff',
                        headerTitleStyle: { fontWeight: 'bold' },
                    }}
                >
                    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="PlantScanner" component={PlantScannerScreen} options={{ title: 'Health Scanner' }} />
                    <Stack.Screen name="SunlightTracker" component={SunlightTrackerScreen} options={{ title: 'Sunlight Tracker' }} />
                    <Stack.Screen name="LedGuidance" component={LedGuidanceScreen} options={{ title: 'Field Guidance' }} />
                    <Stack.Screen name="Marketplace" component={MarketplaceScreen} options={{ title: 'Marketplace' }} />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BACKGROUND_COLOR },
    centerContainer: { alignItems: 'center', justifyContent: 'center' },

    // Header
    header: { padding: 24, paddingTop: 60, backgroundColor: THEME_COLOR, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center' },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: 'white' },
    headerSubtitle: { fontSize: 16, color: '#E8F5E9', marginTop: 5 },

    // Grid
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, justifyContent: 'space-between', marginTop: 20 },
    gridItem: { width: '48%', height: 160, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2 },
    gridLabel: { color: 'white', marginTop: 12, fontWeight: 'bold', fontSize: 16 },

    // Camera
    camera: { flex: 1, width: '100%' },
    cameraControls: { flex: 1, backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'center', margin: 20, alignItems: 'flex-end' },
    captureButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'white' },
    captureInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'white' },
    scanOverlay: { position: 'absolute', top: 50, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 10 },
    scanText: { color: 'white', fontSize: 16 },

    // Preview
    previewContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    previewImage: { width: '100%', height: '100%', position: 'absolute' },
    overlay: { backgroundColor: 'rgba(0,0,0,0.7)', padding: 30, borderRadius: 20, alignItems: 'center' },
    overlayText: { color: 'white', marginTop: 10, fontSize: 18, fontWeight: 'bold' },
    resultCard: { width: '80%', padding: 20, backgroundColor: 'white', borderRadius: 10, elevation: 10, alignItems: 'center' },
    resultTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    resultMessage: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20 },

    // Common UI
    button: { backgroundColor: THEME_COLOR, paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25 },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    // Sunlight
    luxValue: { fontSize: 48, fontWeight: 'bold', color: '#333', marginVertical: 20 },
    statusBadge: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 30, marginBottom: 20 },
    statusText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
    instructionText: { textAlign: 'center', color: '#666', paddingHorizontal: 40, marginTop: 10 },

    // Guidance
    guidanceContainer: { flex: 1, padding: 20, justifyContent: 'center' },
    sectionTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
    subText: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
    actionButton: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 15, borderWidth: 2, marginBottom: 15, backgroundColor: 'white' },
    activeButton: { backgroundColor: '#F5F5F5' },
    actionText: { fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
    activeText: {},

    // Marketplace
    sectionHeader: { fontSize: 22, fontWeight: 'bold', marginLeft: 20, marginTop: 20, marginBottom: 10, color: '#333' },
    marketGrid: { paddingHorizontal: 10 },
    marketCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 15, marginHorizontal: 10, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
    marketImage: { width: 60, height: 60, marginRight: 15 },
    marketName: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#333' },
    marketPrice: { fontSize: 16, color: THEME_COLOR, fontWeight: 'bold', marginRight: 15 },
    orderButton: { backgroundColor: THEME_COLOR, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
    orderButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

    // Chat
    chatContainer: { backgroundColor: 'white', margin: 20, borderRadius: 20, padding: 15, height: 300, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
    chatList: { flex: 1 },
    messageBubble: { padding: 10, borderRadius: 15, marginBottom: 10, maxWidth: '80%' },
    myMsg: { backgroundColor: THEME_COLOR, alignSelf: 'flex-end', borderBottomRightRadius: 2 },
    sysMsg: { backgroundColor: '#F0F0F0', alignSelf: 'flex-start', borderBottomLeftRadius: 2 },
    myMsgText: { color: 'white' },
    sysMsgText: { color: '#333' },
    chatInputRow: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
    chatInput: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10 },
    sendButton: { backgroundColor: THEME_COLOR, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
});
