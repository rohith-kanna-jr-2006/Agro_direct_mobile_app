import { fetchProfile, saveProfile, sendOtp } from '@/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function BuyerRegistration() {
    const router = useRouter();
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);

    const redirectUri = makeRedirectUri({
        scheme: 'kisansmartapp',
        path: 'auth'
    });

    // Google Auth Config
    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: "80509016220-jmf6jt7oedmudt2pti13vl28fkoetnbs.apps.googleusercontent.com",
        androidClientId: "80509016220-jmf6jt7oedmudt2pti13vl28fkoetnbs.apps.googleusercontent.com",
        redirectUri: redirectUri
    });

    useEffect(() => {
        // DEBUG: Remove this after configuring Google Cloud Console
        if (request) {
            console.log("Redirect URI:", request.redirectUri);
            // Alert.alert("Setup Required", `Please add this Redirect URI to your Google Cloud Console:\n\n${request.redirectUri}`);
        }
    }, [request]);

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.accessToken) {
                getUserInfo(authentication.accessToken);
            }
        } else if (response?.type === 'error') {
            Alert.alert("Authentication Error", "Please ensure your Redirect URI is configured in Google Cloud Console.");
        }
    }, [response]);

    const getUserInfo = async (token: string) => {
        setLoading(true);
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
            const currentUser = {
                ...user,
                type: 'buyer',
                userId: user.email,
                role: 'buyer',
                photo: user.picture
            };
            await AsyncStorage.setItem('current_user', JSON.stringify(currentUser));
            await AsyncStorage.setItem('user_role', 'buyer');

            // SYNC WITH BACKEND
            try {
                const existingProfile = await fetchProfile(currentUser.userId, 'buyer');
                if (!existingProfile) {
                    await saveProfile({
                        userId: currentUser.userId,
                        role: 'buyer',
                        name: currentUser.name,
                        email: currentUser.email,
                        photo: currentUser.picture,
                        buyerDetails: { subRole: 'consumer', interests: [] }
                    });
                }
            } catch (e) {
                console.error("Backend sync failed in reg:", e);
            }

            Alert.alert("Success", `Welcome ${user.name}!`);
            router.replace('/(tabs)');
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to fetch user info");
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = async () => {
        if (mobile.length < 10) {
            Alert.alert("Invalid Number", "Please enter a valid 10-digit mobile number");
            return;
        }
        setLoading(true);
        try {
            await sendOtp(mobile);
            router.push({ pathname: '/signup/buyer/otp', params: { mobile } });
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.header}>Create Account</Text>
                <Text style={styles.subHeader}>Sign up to start buying fresh produce</Text>

                <View style={styles.form}>
                    <Text style={styles.label}>Mobile Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="9876543210"
                        value={mobile}
                        onChangeText={setMobile}
                        keyboardType="phone-pad"
                        maxLength={10}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={loading}>
                        <Text style={styles.buttonText}>{loading ? "Sending OTP..." : "Continue"}</Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.line} />
                        <Text style={styles.or}>OR</Text>
                        <View style={styles.line} />
                    </View>

                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => promptAsync()}
                        disabled={!request}
                    >
                        <Image source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }} style={styles.socialIcon} />
                        <Text style={styles.socialText}>Continue with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.socialButton, { marginTop: 10 }]}>
                        <Image source={{ uri: 'https://img.icons8.com/color/48/facebook-new.png' }} style={styles.socialIcon} />
                        <Text style={styles.socialText}>Continue with Facebook</Text>
                    </TouchableOpacity>
                </View>
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
        padding: 24,
        justifyContent: 'center',
        flex: 1,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subHeader: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: '#FAFAFA',
    },
    button: {
        backgroundColor: '#2575FC',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#EEE',
    },
    or: {
        paddingHorizontal: 15,
        color: '#999',
        fontWeight: '600',
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEE',
        backgroundColor: '#fff',
    },
    socialIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    socialText: {
        color: '#333',
        fontWeight: '600',
        fontSize: 15,
    },
});
