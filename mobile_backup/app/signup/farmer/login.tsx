import { sendOtp } from '@/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

export default function FarmerLogin() {
    const [mobile, setMobile] = useState('');
    const router = useRouter();

    const redirectUri = makeRedirectUri({
        scheme: 'kisansmartapp',
        path: 'auth'
    });

    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: "80509016220-jmf6jt7oedmudt2pti13vl28fkoetnbs.apps.googleusercontent.com",
        androidClientId: "80509016220-jmf6jt7oedmudt2pti13vl28fkoetnbs.apps.googleusercontent.com",
        redirectUri: redirectUri
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.accessToken) {
                getUserInfo(authentication.accessToken);
            }
        }
    }, [response]);

    const getUserInfo = async (token: string) => {
        try {
            const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const user = await res.json();

            // Save user info
            await AsyncStorage.setItem('user_auth', JSON.stringify(user));
            await AsyncStorage.setItem('user_email', user.email);
            if (user.name) await AsyncStorage.setItem('user_name', user.name);

            // Mark as logged in
            await AsyncStorage.setItem('current_user', JSON.stringify({ ...user, type: 'farmer' }));

            Alert.alert("Success", `Welcome ${user.name}!`);
            router.replace('/(tabs)');
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to fetch user info");
        }
    };

    const handleGetOTP = async () => {
        if (mobile.length === 10) {
            try {
                const response = await sendOtp(mobile);
                // Use the server message if provided (e.g. for Mock OTP), otherwise default
                const message = response.message || `Verification code sent to +91 ${mobile}`;
                Alert.alert("OTP Sent", message, [
                    { text: "OK", onPress: () => router.push({ pathname: '/signup/farmer/otp', params: { mobile } }) }
                ]);
            } catch (error: any) {
                Alert.alert("Error", error.message || "Failed to send OTP");
            }
        } else {
            Alert.alert("Invalid Number", "Please enter a valid 10-digit mobile number");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <Image
                    source={{ uri: 'https://img.icons8.com/color/144/tractor.png' }}
                    style={styles.illustration}
                />

                <Text style={styles.title}>Login / Register</Text>
                <Text style={styles.subtitle}>Enter your mobile number</Text>

                <View style={styles.inputWrapper}>
                    <Text style={styles.prefix}>+91</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Mobile Number"
                        keyboardType="numeric"
                        maxLength={10}
                        value={mobile}
                        onChangeText={setMobile}
                        placeholderTextColor="#CCC"
                        autoFocus
                    />
                    <TouchableOpacity style={styles.micButton}>
                        <Image source={{ uri: 'https://img.icons8.com/ios-glyphs/60/microphone.png' }} style={styles.micIcon} />
                    </TouchableOpacity>
                </View>

                <View style={styles.instruction}>
                    <Text style={styles.instructionText}>Use microphone for voice input</Text>
                </View>

                <TouchableOpacity
                    style={[styles.button, { opacity: mobile.length === 10 ? 1 : 0.6 }]}
                    onPress={handleGetOTP}
                    disabled={mobile.length !== 10}
                >
                    <Text style={styles.buttonText}>Get OTP</Text>
                    <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/arrow.png' }} style={styles.arrowIcon} />
                </TouchableOpacity>

                <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>OR</Text>
                    <View style={styles.line} />
                </View>

                <TouchableOpacity
                    style={styles.googleButton}
                    onPress={() => promptAsync()}
                >
                    <Image source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }} style={styles.googleIcon} />
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
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
        flex: 1,
        padding: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    illustration: {
        width: 120,
        height: 120,
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#4CAF50',
        borderRadius: 16,
        paddingHorizontal: 15,
        height: 60,
        width: '100%',
        marginBottom: 15,
    },
    prefix: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    micButton: {
        padding: 10,
    },
    micIcon: {
        width: 24,
        height: 24,
        tintColor: '#4CAF50',
    },
    instruction: {
        marginBottom: 40,
    },
    instructionText: {
        color: '#888',
        fontSize: 14,
    },
    button: {
        backgroundColor: '#2E7D32',
        width: '100%',
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
    arrowIcon: {
        width: 20,
        height: 20,
        tintColor: '#fff',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: 30,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    orText: {
        marginHorizontal: 10,
        color: '#9E9E9E',
        fontWeight: '600',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        width: '100%',
        height: 56,
        borderRadius: 28,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    googleIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    }
});
