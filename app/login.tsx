import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { sendOtp, verifyOtp } from '@/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// 1. Setup WebBrowser for auth session
WebBrowser.maybeCompleteAuthSession();

// 2. Constants
const GOOGLE_ICON = 'https://img.icons8.com/color/48/google-logo.png'; // Using a CDN for the icon

export default function LoginScreen() {
    const { theme } = useTheme();
    const colors = Colors[theme];
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Phone Login State
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);

    // Check if already logged in
    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            const userJson = await AsyncStorage.getItem('current_user');
            if (userJson) {
                router.replace('/(tabs)');
            }
        } catch (e) {
            console.log("Error checking login status:", e);
        }
    };

    // --- Phone Login Handlers ---

    const handleSendOtp = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            Alert.alert("Invalid Phone", "Please enter a valid mobile number.");
            return;
        }
        setLoading(true);
        try {
            await sendOtp(phoneNumber);
            setShowOtpInput(true);
            Alert.alert("OTP Sent", "Code is 1234 (Mock) or check SMS."); // Hint for user
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to send OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 4) {
            Alert.alert("Invalid OTP", "Please enter the 4-digit code.");
            return;
        }
        setLoading(true);
        try {
            // Force role='farmer' for this screen
            const data = await verifyOtp(phoneNumber, otp, 'farmer');

            if (data.user) {
                await AsyncStorage.setItem('user_auth', JSON.stringify(data.user));

                // If profile exists, use it. If not, maybe create a temp one 
                // or just redirect to dashboard (and dashboard handles "fresh" state)
                if (data.profile) {
                    await AsyncStorage.setItem('current_user', JSON.stringify(data.profile));
                    await AsyncStorage.setItem('user_role', 'farmer');
                } else {
                    // "Fresh" session - Create a basic profile in memory or let Dashboard handle empty state?
                    // User asked for "Navigates to Farmer Dashboard" on success.
                    // We'll Create a minimal farmer profile locally so they can enter.
                    const freshProfile = {
                        userId: data.user.email || data.user.phone, // fallback ID
                        role: 'farmer',
                        name: 'Farmer', // Generic until updated
                        phone: phoneNumber
                    };
                    await AsyncStorage.setItem('current_user', JSON.stringify(freshProfile));
                    await AsyncStorage.setItem('user_role', 'farmer');
                }

                // Immediate Action: Navigate to Dashboard
                router.replace('/(tabs)');
            } else if (data.isNewUser) {
                // Even for new user, requirements say "Navigates to Farmer Dashboard" (implying immediate access)
                // We will auto-create a session
                const freshUser = { phone: phoneNumber, role: 'farmer', name: 'New Farmer' };
                await AsyncStorage.setItem('current_user', JSON.stringify(freshUser));
                await AsyncStorage.setItem('user_role', 'farmer');
                router.replace('/(tabs)');
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to verify OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: '#E8F5E9' }]}>
            {/* Greenish background for Farmer theme */}

            <View style={styles.header}>
                <Image
                    source={{ uri: 'https://img.icons8.com/color/144/tractor.png' }}
                    style={{ width: 120, height: 120, marginBottom: 20 }}
                />
                <Text style={styles.headerTitle}>Welcome Farmer</Text>
                <Text style={styles.headerSubtitle}>Login to manage your crops</Text>
            </View>

            <View style={styles.card}>
                {loading ? (
                    <ActivityIndicator size="large" color="#2E7D32" />
                ) : (
                    <>
                        {!showOtpInput ? (
                            <>
                                <Text style={styles.label}>Mobile Number</Text>
                                <TextInput
                                    placeholder="Enter 10-digit number"
                                    placeholderTextColor="#999"
                                    style={styles.input}
                                    keyboardType="phone-pad"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    maxLength={10}
                                />
                                <TouchableOpacity
                                    style={styles.greenButton}
                                    onPress={handleSendOtp}
                                >
                                    <Text style={styles.buttonText}>Send OTP</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={styles.label}>Enter OTP</Text>
                                <TextInput
                                    placeholder="Enter 4-digit code"
                                    placeholderTextColor="#999"
                                    style={styles.input}
                                    keyboardType="number-pad"
                                    value={otp}
                                    onChangeText={setOtp}
                                    maxLength={4}
                                />
                                <TouchableOpacity
                                    style={styles.greenButton}
                                    onPress={handleVerifyOtp}
                                >
                                    <Text style={styles.buttonText}>Verify & Login</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setShowOtpInput(false)} style={{ marginTop: 15 }}>
                                    <Text style={{ color: '#2E7D32', textAlign: 'center' }}>Change Number</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 30 },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#2E7D32' },
    headerSubtitle: { fontSize: 16, color: '#555', marginTop: 5 },

    card: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        padding: 30,
        borderRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5
    },
    label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8, marginLeft: 5 },
    input: {
        backgroundColor: '#F5F5F5',
        padding: 15,
        borderRadius: 15,
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0'
    },
    greenButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: 'center',
        elevation: 3
    },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
