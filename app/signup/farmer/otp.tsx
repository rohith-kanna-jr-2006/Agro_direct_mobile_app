
import { sendOtp, verifyOtp } from '@/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function OTPVerification() {
    const { mobile } = useLocalSearchParams();
    const [otp, setOtp] = useState(['', '', '', '']);
    const inputs = useRef<Array<TextInput | null>>([]);
    const router = useRouter();

    const handleChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 3) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length === 4) {
            try {
                const response = await verifyOtp(mobile as string, otpString, 'farmer');

                if (response.isNewUser) {
                    // New user, proceed to signup flow with mobile number
                    router.push({ pathname: '/signup/farmer/personal-details', params: { mobile } });
                } else if (response.user && response.profile) {
                    // Existing user AND existing farmer profile -> Login
                    const userData = response.profile;
                    await AsyncStorage.setItem('current_user', JSON.stringify(userData));
                    await AsyncStorage.setItem('user_role', 'farmer');
                    router.replace('/(tabs)');
                } else if (response.user && !response.profile) {
                    // User exists (likely Buyer) but NO Farmer Profile -> Redirect to Farmer Registration
                    // We pass the name if available to pre-fill
                    router.push({
                        pathname: '/signup/farmer/personal-details',
                        params: { mobile, prefillName: response.user.name || '' }
                    });
                } else {
                    // Fallback
                    router.push({ pathname: '/signup/farmer/personal-details', params: { mobile } });
                }

            } catch (error: any) {
                Alert.alert("Invalid OTP", error.message || "Verification failed");
            }
        } else {
            Alert.alert("Incomplete", "Please enter the complete 4-digit OTP");
        }
    };

    const handleResend = async () => {
        try {
            await sendOtp(mobile as string);
            Alert.alert("Sent", "OTP has been resent successfully.");
        } catch (error: any) {
            Alert.alert("Error", "Failed to resend OTP");
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Enter Verification Code</Text>
                <Text style={styles.subtitle}>We have sent a 4-digit code to +91 {mobile}</Text>

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={el => { inputs.current[index] = el; }}
                            style={styles.otpBox}
                            keyboardType="numeric"
                            maxLength={1}
                            value={digit}
                            onChangeText={(text) => handleChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                        />
                    ))}
                </View>

                <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
                    <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleVerify}>
                    <Text style={styles.buttonText}>Verify & Proceed</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 30,
        alignItems: 'center',
        paddingTop: 80,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: 40,
    },
    otpBox: {
        width: 60,
        height: 60,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        fontSize: 24,
        textAlign: 'center',
        backgroundColor: '#F9F9F9',
        color: '#333',
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#2E7D32',
        width: '100%',
        padding: 16,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resendButton: {
        marginBottom: 30,
    },
    resendText: {
        color: '#4CAF50',
        fontWeight: '600',
    },
});
