import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

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
                    router.push({ pathname: '/signup/farmer/personal-details', params: { mobile } });
                } else if (response.user && response.profile) {
                    const userData = response.profile;
                    await AsyncStorage.setItem('current_user', JSON.stringify(userData));
                    await AsyncStorage.setItem('user_role', 'farmer');
                    router.replace('/(tabs)');
                } else if (response.user && !response.profile) {
                    router.push({
                        pathname: '/signup/farmer/personal-details',
                        params: { mobile, prefillName: response.user.name || '' }
                    });
                } else {
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
            const response = await sendOtp(mobile as string);
            const message = response.message || "OTP has been resent successfully.";
            Alert.alert("Sent", message);
        } catch (error: any) {
            Alert.alert("Error", "Failed to resend OTP");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.text }]}>Enter Verification Code</Text>
                <Text style={[styles.subtitle, { color: theme.icon }]}>We have sent a 4-digit code to +91 {mobile}</Text>

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={el => { inputs.current[index] = el; }}
                            style={[
                                styles.otpBox,
                                {
                                    backgroundColor: theme.inputBackground,
                                    borderColor: theme.inputBorder,
                                    color: theme.text
                                }
                            ]}
                            keyboardType="numeric"
                            maxLength={1}
                            value={digit}
                            onChangeText={(text) => handleChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            placeholderTextColor={theme.icon}
                        />
                    ))}
                </View>

                <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
                    <Text style={[styles.resendText, { color: theme.secondary }]}>Resend OTP</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                    onPress={handleVerify}
                >
                    <Text style={[styles.buttonText, { color: '#fff' }]}>Verify & Proceed</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 30,
        alignItems: 'center',
        paddingTop: 80,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
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
        borderRadius: 12,
        fontSize: 24,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    button: {
        width: '100%',
        padding: 16,
        borderRadius: 30,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    resendButton: {
        marginBottom: 30,
    },
    resendText: {
        fontWeight: '600',
    },
});
