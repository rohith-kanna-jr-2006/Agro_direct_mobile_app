import { TRANSLATIONS } from '@/constants/translations';
import { fetchProfile, saveProfile } from '@/utils/api';
import { scheduleNotification } from '@/utils/notifications';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const THEME_COLOR = '#4CAF50';
const BACKGROUND_COLOR = '#F5F5F5';

export default function ProfileScreen() {
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
    const [photo, setPhoto] = useState('');
    const [loading, setLoading] = useState(true);

    // Account Details State
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [upsId, setUpsId] = useState('');
    const [bankName, setBankName] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
        loadProfile();
    }, []);

    // Effect to reload profile when role changes locally (from switcher)
    useEffect(() => {
        loadProfile();
    }, [role]);

    const loadProfile = async () => {
        try {
            // Check locally stored role preference
            const storedRole = await AsyncStorage.getItem('user_role');
            // We rely on state 'role' but in a full app might sync this.

            // Fetch specific profile for current role from API
            const profileData = await fetchProfile(role);

            if (profileData && profileData.name) {
                const { name, storeName, phone, location, bio, photo, bankDetails, walletBalance } = profileData;
                setName(name || '');
                setStoreName(storeName || '');
                setPhone(phone || '');
                setLocation(location || '');
                setBio(bio || '');
                setPhoto(photo || '');
                setWalletBalance(walletBalance || 0);

                if (bankDetails) {
                    setAccountNumber(bankDetails.accountNumber || '');
                    setIfscCode(bankDetails.ifscCode || '');
                    setUpsId(bankDetails.upsId || '');
                    setBankName(bankDetails.bankName || '');
                } else {
                    setAccountNumber(''); setIfscCode(''); setUpsId(''); setBankName('');
                }
            } else {
                // Defaults if no profile saved yet
                setName(role === 'farmer' ? 'Ramesh Farm' : 'Anjali Buyer');
                setStoreName(role === 'farmer' ? 'Ramesh Organics' : '');
                setPhone('+91 98765 43210');
                setLocation(role === 'farmer' ? 'Coimbatore, Tamil Nadu' : 'Bangalore, Karnataka');
                setBio(role === 'farmer' ? 'Organic farming since 2010.' : 'Love fresh vegetables.');
                setPhoto('');
                setAccountNumber(''); setIfscCode(''); setUpsId(''); setBankName('');
                setWalletBalance(0);
            }
        } catch (e) {
            console.error("Failed to load profile", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const profileData = {
                role, name, storeName, phone, location, bio, photo,
                bankDetails: {
                    accountNumber,
                    ifscCode,
                    upsId,
                    bankName
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

    const switchAccount = async () => {
        const newRole = role === 'farmer' ? 'buyer' : 'farmer';
        setRole(newRole);
        await AsyncStorage.setItem('user_role', newRole);
        Alert.alert("Account Switched", `You are now interacting as a ${newRole}.`);
    };

    if (loading) {
        return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><Text>Loading...</Text></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: photo || (role === 'farmer' ? 'https://img.icons8.com/color/96/farmer-male.png' : 'https://img.icons8.com/color/96/user.png') }}
                        style={styles.avatar}
                    />
                </View>
                {/* Spacer to balance header */}
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.form}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                    <TouchableOpacity style={styles.switchBtn} onPress={switchAccount}>
                        <Ionicons name="swap-horizontal" size={20} color={THEME_COLOR} style={{ marginRight: 8 }} />
                        <Text style={styles.switchText}>Switch to {role === 'farmer' ? 'Buyer' : 'Farmer'} View</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>{role === 'farmer' ? t.farmer : t.buyer} {t.profile}</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t.name}</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} />
                </View>

                {role === 'farmer' && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Store Name</Text>
                        <TextInput style={styles.input} value={storeName} onChangeText={setStoreName} placeholder="e.g. Ramesh Organics" />
                    </View>
                )}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Profile Photo URL</Text>
                    <TextInput
                        style={styles.input}
                        value={photo}
                        onChangeText={setPhoto}
                        placeholder="https://example.com/photo.jpg"
                    />
                </View>

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

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t.phone}</Text>
                    <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t.location}</Text>
                    <TextInput style={styles.input} value={location} onChangeText={setLocation} />
                </View>

                {/* Bank / Account Details Section */}
                <Text style={[styles.sectionTitle, { fontSize: 20, marginTop: 10, marginBottom: 15 }]}>Account Details</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Bank Name</Text>
                    <TextInput style={styles.input} value={bankName} onChangeText={setBankName} placeholder="e.g. SBI" />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Account Number</Text>
                    <TextInput style={styles.input} value={accountNumber} onChangeText={setAccountNumber} keyboardType="numeric" placeholder="XXXXXXXXXXXX" />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>IFSC Code</Text>
                    <TextInput style={styles.input} value={ifscCode} onChangeText={setIfscCode} autoCapitalize="characters" placeholder="SBIN000XXXX" />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>UPI ID</Text>
                    <TextInput style={styles.input} value={upsId} onChangeText={setUpsId} placeholder="name@upi" />
                </View>

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
                                    await AsyncStorage.removeItem('user_auth');
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
    container: { flex: 1, backgroundColor: BACKGROUND_COLOR },
    header: { height: 180, backgroundColor: THEME_COLOR, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    backButton: { marginBottom: 20 },
    avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginBottom: -90, elevation: 5 },
    avatar: { width: 80, height: 80 },
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
    walletSubtitle: { fontSize: 12, color: '#666' }
});
