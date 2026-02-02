import { sendOtp, verifyOtp } from '@/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function BuyerOTPVerification() {
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

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length === 4) {
            try {
                const response = await verifyOtp(mobile as string, otpString, 'buyer');

                if (response.isNewUser) {
                    // New user, proceed to signup flow with mobile number
                    router.push({ pathname: '/signup/buyer/profile', params: { mobile } });
                } else if (response.user && response.profile) {
                    // Existing user AND existing buyer profile -> Login
                    const userData = response.profile;
                    await AsyncStorage.setItem('current_user', JSON.stringify(userData));
                    await AsyncStorage.setItem('user_role', 'buyer');
                    router.replace('/(tabs)');
                } else if (response.user && !response.profile) {
                    // User exists (likely Farmer) but NO Buyer Profile -> Redirect to Buyer Registration
                    router.push({
                        pathname: '/signup/buyer/profile',
                        params: { mobile, prefillName: response.user.name || '' }
                    });
                } else {
                    // Fallback
                    router.push({ pathname: '/signup/buyer/profile', params: { mobile } });
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
            Alert.alert("Sent", "OTP has been resent to your mobile.");
        } catch (error) {
            Alert.alert("Error", "Failed to resend OTP");
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.header}>Verify Account</Text>
                <Text style={styles.subHeader}>Enter the 4-digit code sent to {mobile}</Text>

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => { if (ref) inputs.current[index] = ref; }}
                            style={styles.otpInput}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={(text) => handleChange(text, index)}
                        />
                    ))}
                </View>

                <TouchableOpacity style={styles.button} onPress={handleVerify}>
                    <Text style={styles.buttonText}>Verify & Proceed</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleResend}>
                    <Text style={styles.resendText}>Didn't receive code? <Text style={styles.resendLink}>Resend</Text></Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 24, justifyContent: 'center', flex: 1 },
    header: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    subHeader: { fontSize: 16, color: '#666', marginBottom: 40 },
    otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, gap: 10 },
    otpInput: { width: 60, height: 60, borderWidth: 1, borderColor: '#DDD', borderRadius: 12, fontSize: 24, textAlign: 'center', backgroundColor: '#FAFAFA' },
    button: { backgroundColor: '#2575FC', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    resendText: { textAlign: 'center', color: '#666', fontSize: 14 },
    resendLink: { color: '#2575FC', fontWeight: 'bold' }
});
