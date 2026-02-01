import { Colors } from '@/constants/theme';
import { TRANSLATIONS } from '@/constants/translations';
import { useTheme } from '@/context/ThemeContext';
import { fetchProfile, saveProfile, sendOtp, verifyOtp } from '@/utils/api';
import { scheduleNotification } from '@/utils/notifications';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


const THEME_COLOR = '#4CAF50';
const BACKGROUND_COLOR = '#F5F5F5';

WebBrowser.maybeCompleteAuthSession();

export default function ProfileScreen() {
    const { theme, preference, setPreference } = useTheme();
    const colors = Colors[theme];

    const params = useLocalSearchParams();
    const router = useRouter();
    const lang = (params.lang as keyof typeof TRANSLATIONS) || 'en';
    const t = TRANSLATIONS[lang];

    // Default role from params, or determine some other way if needed. 
    // Ideally, role should be global state or passed, here we default to 'farmer' but allow override
    // In a real app, this would come from a Context or Redux store.
    // For now, we'll try to get it from storage if not in params.
    const [role, setRole] = useState<'farmer' | 'buyer'>((params.role as 'farmer' | 'buyer') || 'farmer');

    const [name, setName] = useState('');
    const [storeName, setStoreName] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [email, setEmail] = useState('');
    const [isGoogleLinked, setIsGoogleLinked] = useState(false);
    const [loading, setLoading] = useState(true);

    // Account Details State
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [upsId, setUpsId] = useState('');
    const [bankName, setBankName] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);

    // Buyer Specific State
    const [subRole, setSubRole] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [interests, setInterests] = useState<string[]>([]);
    const [weeklyRequirement, setWeeklyRequirement] = useState('');

    // Verification State
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpTimer, setOtpTimer] = useState(0);

    // Google Auth Request
    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: "80509016220-5kmi60qgsdo4ok2ngvjil8t9ip831uu9.apps.googleusercontent.com",
        androidClientId: "80509016220-5kmi60qgsdo4ok2ngvjil8t9ip831uu9.apps.googleusercontent.com",
        redirectUri: "https://auth.expo.io/@anonymous/KisanSmartApp"
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.accessToken) {
                // Determine if we want to fetch user info or just mark as linked
                // For now, let's just fetch to get the email and verify
                fetchGoogleUserInfo(authentication.accessToken);
            }
        }
    }, [response]);

    useEffect(() => {
        let interval: any;
        if (otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);

    const fetchGoogleUserInfo = async (token: string) => {
        try {
            const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const user = await res.json();

            // Logic to link:
            // 1. If email field is empty, fill it.
            // 2. Set isGoogleLinked to true.
            // 3. Save auth token/user to storage so it persists as "linked"
            setIsGoogleLinked(true);
            if (!email) setEmail(user.email);

            // Construct auth object to save
            const authObj = {
                ...user,
                accessToken: token
            };
            await AsyncStorage.setItem('user_auth', JSON.stringify(authObj));

            Alert.alert("Success", "Google Account Linked Successfully!");
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to link Google account.");
        }
    };

    const handleSendOtp = async () => {
        if (!phone || phone.length < 10) {
            Alert.alert("Invalid Phone", "Please enter a valid phone number.");
            return;
        }
        try {
            setLoading(true);
            const response = await sendOtp(phone);
            setLoading(false);
            setShowOtpInput(true);
            setOtpTimer(60); // 60 seconds cooldown
            Alert.alert("OTP Sent", response.message || `An OTP has been sent to ${phone}`);
        } catch (error: any) {
            setLoading(false);
            Alert.alert("Error", error.message || "Failed to send OTP");
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpCode || otpCode.length < 4) {
            Alert.alert("Invalid OTP", "Please enter a valid OTP.");
            return;
        }
        try {
            setLoading(true);
            await verifyOtp(phone, otpCode, role); // Passing role if needed by backend, though verification usually role-agnostic
            setLoading(false);
            setIsPhoneVerified(true);
            setShowOtpInput(false);
            setOtpCode('');
            Alert.alert("Success", "Phone Number Verified!");
        } catch (error: any) {
            setLoading(false);
            Alert.alert("Verification Failed", error.message || "Invalid OTP");
        }
    };

    // Initial Role Check: If no param, try to load from storage
    useEffect(() => {
        const initRole = async () => {
            if (!params.role) {
                const storedRole = await AsyncStorage.getItem('user_role');
                // Only update if different to avoid unnecessary cycles, though React handles this
                if (storedRole === 'buyer' || storedRole === 'farmer') {
                    if (storedRole !== role) {
                        setRole(storedRole);
                    }
                }
            }
        };
        initRole();
    }, []);

    // Load Data whenever role changes (includes initial render)
    useEffect(() => {
        loadProfile();
    }, [role]);

    const loadProfile = async () => {
        try {
            // Get the currently logged-in user stored during login/signup
            const userStr = await AsyncStorage.getItem('current_user');
            // Check if linked with Google
            const auth = await AsyncStorage.getItem('user_auth');
            setIsGoogleLinked(!!auth);

            if (!userStr) {
                // If no user is logged in, show defaults or redirect to login (optional)
                console.log("No user found in storage");
                // Use defaults below
            } else {
                const currentUser = JSON.parse(userStr);
                const userId = currentUser.userId || currentUser._id; // Handle both formats

                if (userId) {
                    // Fetch real profile from backend
                    const profileData = await fetchProfile(userId, role);

                    if (profileData) {
                        const { name, storeName, phone, location, bio, photo, bankDetails, walletBalance, buyerDetails } = profileData;
                        setName(name || currentUser.name || '');
                        setStoreName(storeName || '');
                        setPhone(phone || currentUser.phone || '');
                        setLocation(location || (typeof currentUser.location === 'string' ? currentUser.location : '') || '');
                        setBio(bio || '');
                        setPhotoUrl(photo || currentUser.photo || currentUser.picture || '');
                        setEmail(currentUser.email || '');

                        setWalletBalance(walletBalance || 0);

                        if (bankDetails) {
                            setAccountNumber(bankDetails.accountNumber || '');
                            setIfscCode(bankDetails.ifscCode || '');
                            setUpsId(bankDetails.upsId || '');
                            setBankName(bankDetails.bankName || '');
                        }

                        if (buyerDetails) {
                            setSubRole(buyerDetails.subRole || 'consumer');
                            setBusinessName(buyerDetails.businessName || '');
                            setInterests(buyerDetails.interests || []);
                            setWeeklyRequirement(buyerDetails.weeklyRequirement || '');
                        }

                        // Check if phone matches the one in profile to consider it verified initially?
                        // Or better, if backend sends isVerified flag. Assuming backend might not have it yet.
                        // If phone exists in profile, we can assume it was verified or just mark as unverified if changed.
                        // For now, if loading from profile, we can optimistically set verified if phone is present.
                        if (phone) setIsPhoneVerified(true);

                        return; // Successfully loaded real data
                    }
                }
            }

            // Fallback Defaults (If no user logged in or profile fetch failed)
            setName(role === 'farmer' ? 'Ramesh Farm' : 'Anjali Buyer');
            setStoreName(role === 'farmer' ? 'Ramesh Organics' : '');
            setPhone('+91 98765 43210');
            setLocation(role === 'farmer' ? 'Coimbatore, Tamil Nadu' : 'Bangalore, Karnataka');
            setBio(role === 'farmer' ? 'Organic farming since 2010.' : 'Love fresh vegetables.');
            setPhotoUrl('');
            setEmail('');
            setIsGoogleLinked(false);
            setAccountNumber(''); setIfscCode(''); setUpsId(''); setBankName('');
            setWalletBalance(0);
            // Default buyer state reset
            setSubRole(''); setBusinessName(''); setInterests([]); setWeeklyRequirement('');
        } catch (e) {
            console.error("Failed to load profile", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            // Get current real user
            let userId = "demo@kisan.com";
            const userStr = await AsyncStorage.getItem('current_user');
            if (userStr) {
                const u = JSON.parse(userStr);
                userId = u.userId || u._id || userId;
            }

            const profileData = {
                userId, // Include the userId in the save payload
                role, name, storeName, phone, location, bio, photo: photoUrl,
                // bankDetails handled separately via secure flow
                // bankDetails: { ... } removed from here
                buyerDetails: {
                    subRole,
                    businessName,
                    interests,
                    weeklyRequirement
                }
            };
            await saveProfile(profileData);

            // Also update the global role locally just in case
            await AsyncStorage.setItem('user_role', role);

            Alert.alert("Success", "Profile Saved Successfully!");
            scheduleNotification("Profile Updated", "Your profile details have been successfully updated.");
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to save profile.");
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setPhotoUrl(result.assets[0].uri);
        }
    };

    const switchAccount = async () => {
        const newRole = role === 'farmer' ? 'buyer' : 'farmer';

        // 1. Get current logged-in user ID to check existence
        let userId = null;
        const userStr = await AsyncStorage.getItem('current_user');
        if (userStr) {
            const u = JSON.parse(userStr);
            userId = u.userId || u._id;
        }

        // If generic login not found, allow switch (fallback behavior) but warn
        if (!userId) {
            setRole(newRole);
            await AsyncStorage.setItem('user_role', newRole);
            Alert.alert("Account Switched", `You are now viewing as a ${newRole} (Guest).`);
            return;
        }

        // 2. Check if profile exists for the NEW role
        setLoading(true);
        const existingProfile = await fetchProfile(userId, newRole);
        setLoading(false);

        if (existingProfile) {
            // Profile exists, switch context
            setRole(newRole);
            await AsyncStorage.setItem('user_role', newRole);
            Alert.alert("Account Switched", `You are now interacting as a ${newRole}.`);
        } else {
            // Profile does NOT exist for this role
            Alert.alert(
                "Account Not Found",
                `You don't have a ${newRole} profile yet. Do you want to create one?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Create Account",
                        onPress: () => {
                            // Redirect to the signup flow for that role
                            if (newRole === 'farmer') {
                                router.push('/signup/farmer/login');
                            } else {
                                router.push('/signup/buyer/registration');
                            }
                        }
                    }
                ]
            );
        }
    };

    if (loading) {
        return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><Text>Loading...</Text></View>;
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.primary }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View style={[styles.avatarContainer, { marginBottom: 20 }]}>
                    <TouchableOpacity onPress={pickImage} style={{ alignItems: 'center' }}>
                        <Image
                            source={{ uri: photoUrl || (role === 'farmer' ? 'https://img.icons8.com/color/96/farmer-male.png' : 'https://img.icons8.com/color/96/user.png') }}
                            style={styles.avatar}
                        />
                        <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: THEME_COLOR, borderRadius: 15, padding: 4 }}>
                            <Ionicons name="camera" size={16} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Spacer (removed previous absolute positioning logic to simplify) */}
            </View>

            <View style={styles.form}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                    <TouchableOpacity style={styles.switchBtn} onPress={switchAccount}>
                        <Ionicons name="swap-horizontal" size={20} color={THEME_COLOR} style={{ marginRight: 8 }} />
                        <Text style={styles.switchText}>Switch to {role === 'farmer' ? 'Buyer' : 'Farmer'} View</Text>
                    </TouchableOpacity>
                </View>

                {/* Theme Selector */}
                <View style={[styles.sectionContainer, { borderTopWidth: 0, marginBottom: 20 }]}>
                    <Text style={[styles.subSectionTitle, { color: colors.text, marginBottom: 10 }]}>App Appearance</Text>
                    <View style={{ flexDirection: 'row', backgroundColor: colors.inputBackground, padding: 4, borderRadius: 12 }}>
                        {(['system', 'light', 'dark'] as const).map((mode) => (
                            <TouchableOpacity
                                key={mode}
                                onPress={() => setPreference(mode)}
                                style={{
                                    flex: 1,
                                    paddingVertical: 8,
                                    alignItems: 'center',
                                    borderRadius: 10,
                                    backgroundColor: preference === mode ? colors.primary : 'transparent',
                                }}
                            >
                                <Text style={{
                                    color: preference === mode ? '#fff' : colors.text,
                                    fontWeight: preference === mode ? 'bold' : 'normal',
                                    fontSize: 14
                                }}>
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Text style={styles.sectionTitle}>{role === 'farmer' ? t.farmer : t.buyer} {t.profile}</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t.name}</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                            style={[styles.input, { flex: 1, color: isGoogleLinked ? '#666' : '#333' }]}
                            value={email}
                            onChangeText={setEmail}
                            editable={!isGoogleLinked}
                            placeholder="your@email.com"
                        />
                        {isGoogleLinked ? (
                            <View style={{ marginLeft: 10, alignItems: 'center', justifyContent: 'center' }}>
                                <Image source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }} style={{ width: 24, height: 24 }} />
                                <Text style={{ fontSize: 10, color: '#4CAF50', fontWeight: 'bold' }}>Linked</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={{ marginLeft: 10, backgroundColor: '#fff', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center' }}
                                onPress={() => {
                                    if (request) promptAsync();
                                    else Alert.alert("Error", "Google Auth not configured");
                                }}
                            >
                                <Image source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }} style={{ width: 20, height: 20 }} />
                                <Text style={{ fontSize: 10, color: '#333' }}>Link</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {role === 'farmer' && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Store Name</Text>
                        <TextInput style={styles.input} value={storeName} onChangeText={setStoreName} placeholder="e.g. Ramesh Organics" />
                    </View>
                )}

                {/* Removed Profile Photo URL Input as we now have the picker above */}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>About / Bio</Text>
                    <TextInput
                        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        numberOfLines={3}
                        placeholder="Tell us about yourself..."
                    />
                </View>

                {role === 'farmer' && (
                    <View style={styles.walletCard}>
                        <Text style={styles.walletTitle}>💰 Wallet Balance</Text>
                        <Text style={styles.walletAmount}>₹{walletBalance.toLocaleString()}</Text>
                        <Text style={styles.walletSubtitle}>Total Earnings from Sales</Text>
                    </View>
                )}

                {role === 'buyer' && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.subSectionTitle}>Buying Preferences</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Buyer Type</Text>
                            <TextInput style={[styles.input, { backgroundColor: '#f0f0f0' }]} value={subRole === 'consumer' ? 'Home / Consumer' : 'Business / Retailer'} editable={false} />
                        </View>

                        {subRole === 'business' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Business Name</Text>
                                <TextInput style={styles.input} value={businessName} onChangeText={setBusinessName} />
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Approx. Weekly Need</Text>
                            <TextInput style={styles.input} value={weeklyRequirement} onChangeText={setWeeklyRequirement} />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Interests</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5 }}>
                                {interests.map((int, i) => (
                                    <View key={i} style={{ backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, borderWidth: 1, borderColor: '#4CAF50' }}>
                                        <Text style={{ color: '#4CAF50', fontSize: 12 }}>{int}</Text>
                                    </View>
                                ))}
                                {interests.length === 0 && <Text style={{ color: '#999', fontStyle: 'italic' }}>No interests selected</Text>}
                            </View>
                        </View>
                    </View>
                )}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t.phone}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            value={phone}
                            onChangeText={(text) => {
                                setPhone(text);
                                setIsPhoneVerified(false); // Reset verification on change
                            }}
                            keyboardType="phone-pad"
                        />
                        {isPhoneVerified ? (
                            <View style={{ marginLeft: 10, alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                                <Text style={{ fontSize: 10, color: '#4CAF50', fontWeight: 'bold' }}>Verified</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={{ marginLeft: 10, backgroundColor: THEME_COLOR, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10 }}
                                onPress={handleSendOtp}
                                disabled={otpTimer > 0}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                    {otpTimer > 0 ? `${otpTimer}s` : 'Verify'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {showOtpInput && !isPhoneVerified && (
                    <View style={[styles.inputGroup, { marginTop: -10, backgroundColor: '#E8F5E9', padding: 15, borderRadius: 10 }]}>
                        <Text style={{ fontSize: 14, color: '#333', marginBottom: 10 }}>Enter OTP sent to {phone}</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <TextInput
                                style={[styles.input, { flex: 1, backgroundColor: 'white' }]}
                                value={otpCode}
                                onChangeText={setOtpCode}
                                placeholder="123456"
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                            <TouchableOpacity
                                style={{ marginLeft: 10, backgroundColor: '#333', paddingHorizontal: 20, justifyContent: 'center', borderRadius: 10 }}
                                onPress={handleVerifyOtp}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t.location}</Text>
                    <TextInput style={styles.input} value={location} onChangeText={setLocation} />
                </View>

                {/* Bank / Account Details Section */}
                <Text style={[styles.sectionTitle, { fontSize: 20, marginTop: 10, marginBottom: 15 }]}>Account Details</Text>

                <TouchableOpacity
                    style={[styles.inputGroup, {
                        backgroundColor: '#F5F5F5',
                        padding: 20,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#DDD',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }]}
                    onPress={() => router.push({ pathname: '/manage-bank', params: { role } })}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="card-outline" size={24} color="#666" />
                        <View style={{ marginLeft: 15 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Manage Bank Account</Text>
                            <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Update account & IFSC details safely</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveText}>{t.save}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: '#FF5252', marginTop: 20 }]}
                    onPress={() => {
                        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
                            { text: "Cancel", style: "cancel" },
                            {
                                text: "Sign Out", style: 'destructive', onPress: async () => {
                                    await AsyncStorage.multiRemove([
                                        'user_auth',
                                        'current_user',
                                        'user_role',
                                        'user_sub_role',
                                        'user_email',
                                        'user_name',
                                        'temp_reg_buyer'
                                    ]);
                                    router.replace('/login');
                                }
                            }
                        ]);
                    }}
                >
                    <Text style={styles.saveText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 }, // Dynamic background handled in component
    header: { height: 180, backgroundColor: THEME_COLOR, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    backButton: { marginBottom: 20 },
    avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginBottom: -90, elevation: 5 },
    avatar: { width: 90, height: 90, borderRadius: 45 },
    form: { padding: 25, marginTop: 60 },
    sectionTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#333' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 16, color: '#666', marginBottom: 5, fontWeight: '600' },
    input: { backgroundColor: 'white', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#EEE', fontSize: 16 },
    saveBtn: { backgroundColor: THEME_COLOR, padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
    saveText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    switchBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: THEME_COLOR },
    switchText: { color: THEME_COLOR, fontWeight: 'bold' },
    walletCard: { backgroundColor: '#E8F5E9', padding: 20, borderRadius: 15, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: THEME_COLOR },
    walletTitle: { fontSize: 16, color: '#333', fontWeight: 'bold', marginBottom: 5 },
    walletAmount: { fontSize: 28, color: THEME_COLOR, fontWeight: 'bold' },
    walletSubtitle: { fontSize: 12, color: '#666' },
    sectionContainer: { marginBottom: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' },
    subSectionTitle: { fontSize: 18, fontWeight: '600', color: '#444', marginBottom: 15 }
});
