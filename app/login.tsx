import { fetchProfile, saveProfile } from '@/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 1. Setup WebBrowser for auth session
WebBrowser.maybeCompleteAuthSession();

// 2. Constants
const THEME_COLOR = '#4CAF50';
const GOOGLE_ICON = 'https://img.icons8.com/color/48/google-logo.png'; // Using a CDN for the icon

export default function LoginScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // 3. Google Auth Configuration
    // IMPORTANT: You must create a project in Google Cloud Console
    // and get these Client IDs: https://console.cloud.google.com/
    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: "80509016220-5kmi60qgsdo4ok2ngvjil8t9ip831uu9.apps.googleusercontent.com",
        androidClientId: "80509016220-5kmi60qgsdo4ok2ngvjil8t9ip831uu9.apps.googleusercontent.com",
        redirectUri: "https://auth.expo.io/@anonymous/KisanSmartApp" // Force match to what you added
    });

    useEffect(() => {
        if (request) {
            console.log("Current Redirect URI:", request.redirectUri);
        }
    }, [request]);

    useEffect(() => {
        handleSignInWithGoogle();
    }, [response]);

    const handleSignInWithGoogle = async () => {
        if (response?.type === 'success') {
            const { authentication } = response;
            // Use authentication.accessToken to fetch user info from Google
            if (authentication?.accessToken) {
                getUserInfo(authentication.accessToken);
            }
        } else if (response?.type === 'error') {
            Alert.alert("Sign In Error", "Failed to sign in with Google.");
        }
    };

    const getUserInfo = async (token: string) => {
        setLoading(true);
        try {
            const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const user = await res.json();

            // Save user to AsyncStorage
            await AsyncStorage.setItem('user_auth', JSON.stringify(user));
            await AsyncStorage.setItem('user_email', user.email);
            await AsyncStorage.setItem('user_name', user.name);

            // Save as current_user to match profile.tsx expectations and include login type
            const currentUser = {
                ...user,
                userId: user.email, // using email as ID for google login for now
                type: 'buyer', // Default to buyer for social login if not specified
                role: 'buyer',
                photo: user.picture // Map google 'picture' to app 'photo'
            };
            await AsyncStorage.setItem('current_user', JSON.stringify(currentUser));
            await AsyncStorage.setItem('user_role', 'buyer');

            // SYNC WITH BACKEND: Ensure profile exists in DB
            try {
                // Check if profile exists for this Google User
                console.log("Checking backend for Google User:", currentUser.userId);
                const existingProfile = await fetchProfile(currentUser.userId, 'buyer');

                if (!existingProfile) {
                    console.log("Creating new profile for Google User...");
                    await saveProfile({
                        userId: currentUser.userId,
                        role: 'buyer',
                        name: currentUser.name,
                        email: currentUser.email,
                        photo: currentUser.picture,
                        buyerDetails: {
                            subRole: 'consumer', // Default
                            interests: []
                        }
                    });
                } else {
                    console.log("Profile found, syncing local photo...");
                    // Optional: Update local photo from backend if needed, or vice versa
                }
            } catch (err) {
                console.error("Failed to sync Google User with Backend:", err);
                // We verify login anyway, but profile page might show defaults until saved again
            }

            // Navigate to Main App
            router.replace('/(tabs)');
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to fetch user info");
        } finally {
            setLoading(false);
        }
    };

    // For Demo / Testing without keys:
    const handleBypassLogin = async () => {
        setLoading(true);
        setTimeout(async () => {
            await AsyncStorage.setItem('user_auth', JSON.stringify({ name: 'Demo User', email: 'demo@kisan.com' }));
            router.replace('/(tabs)');
            setLoading(false);
        }, 1000);
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={{ uri: 'https://img.icons8.com/color/144/tractor.png' }}
                    style={{ width: 100, height: 100, marginBottom: 20 }}
                />
                <Text style={styles.title}>Kisan Smart App</Text>
                <Text style={styles.subtitle}>Empowering Farmers, Connecting Buyers</Text>
            </View>

            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={THEME_COLOR} />
                ) : (
                    <>
                        <TouchableOpacity
                            style={styles.googleButton}
                            onPress={() => {
                                if (request) {
                                    // Debug Alert
                                    // Alert.alert("Debug URI", request.redirectUri); 
                                    promptAsync();
                                } else {
                                    Alert.alert("Configuration Missing", "Please add your Google Client IDs in login.tsx");
                                    // Fallback for demo
                                    handleBypassLogin();
                                }
                            }}
                        >
                            <Image source={{ uri: GOOGLE_ICON }} style={styles.icon} />
                            <Text style={styles.buttonText}>Sign in with Google</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleBypassLogin} style={{ marginTop: 20 }}>
                            <Text style={{ color: '#666', textDecorationLine: 'underline' }}>Login as Guest / Demo</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E8F5E9', borderBottomLeftRadius: 50, borderBottomRightRadius: 50 },
    content: { flex: 1, padding: 30, alignItems: 'center', marginTop: 50 },
    title: { fontSize: 32, fontWeight: 'bold', color: THEME_COLOR, marginBottom: 5 },
    subtitle: { fontSize: 16, color: '#666' },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 30,
        width: '100%',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    icon: { width: 24, height: 24, marginRight: 15 },
    buttonText: { fontSize: 16, color: '#333', fontWeight: 'bold' }
});
