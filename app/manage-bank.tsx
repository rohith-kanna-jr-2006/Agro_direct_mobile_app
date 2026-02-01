import { fetchBankDetails, saveBankDetails, verifyIfsc } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const THEME_COLOR = '#4CAF50';

export default function AddBankScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const role = (params.role as string) || 'farmer'; // Default to farmer if not passed

    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [verifyingIfsc, setVerifyingIfsc] = useState(false);

    // Form Fields
    const [accountHolderName, setAccountHolderName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [bankName, setBankName] = useState('');
    const [branchName, setBranchName] = useState('');
    const [accountType, setAccountType] = useState<'Savings' | 'Current'>('Savings');
    const [upiId, setUpiId] = useState('');

    // Field Status
    const [ifscVerified, setIfscVerified] = useState(false);
    const [showAccountNumber, setShowAccountNumber] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Get User ID
            const userStr = await AsyncStorage.getItem('current_user');
            if (userStr) {
                const u = JSON.parse(userStr);
                const uid = u.userId || u._id;
                setUserId(uid);

                // Pre-fill Name if available
                if (u.name) setAccountHolderName(u.name);

                // Fetch Existing Bank Details
                const existing = await fetchBankDetails(uid, role);
                if (existing) {
                    setAccountHolderName(existing.accountHolderName || u.name || '');
                    setAccountNumber(existing.accountNumber || '');
                    setConfirmAccountNumber(existing.accountNumber || ''); // Auto-fill confirm for editing
                    setIfscCode(existing.ifscCode || '');
                    setBankName(existing.bankName || '');
                    setBranchName(existing.branchName || '');
                    setAccountType((existing.accountType as 'Savings' | 'Current') || 'Savings');
                    setUpiId(existing.upiId || '');
                    if (existing.ifscCode) setIfscVerified(true);
                }
            }
        } catch (e) {
            console.error("Failed to load user data", e);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyIfsc = async () => {
        if (ifscCode.length < 11) {
            Alert.alert("Invalid Code", "IFSC code must be 11 characters.");
            return;
        }
        setVerifyingIfsc(true);
        try {
            const data = await verifyIfsc(ifscCode);
            if (data.success && data.details) {
                setBankName(data.details.bank);
                setBranchName(data.details.branch);
                setIfscVerified(true);
            } else {
                Alert.alert("Not Found", "Invalid IFSC Code or Bank not found.");
                setIfscVerified(false);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to verify IFSC code.");
            setIfscVerified(false);
        } finally {
            setVerifyingIfsc(false);
        }
    };

    const handleSave = async () => {
        if (!userId) {
            Alert.alert("Error", "User not logged in.");
            return;
        }
        if (!accountNumber || accountNumber !== confirmAccountNumber) {
            Alert.alert("Error", "Account numbers do not match.");
            return;
        }
        if (!ifscVerified) {
            Alert.alert("Error", "Please verify IFSC code first.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                userId,
                role,
                accountHolderName,
                accountNumber,
                ifscCode,
                bankName,
                branchName,
                accountType,
                upiId
            };
            await saveBankDetails(payload);
            Alert.alert("Success", "Bank details saved securely.", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to save bank details.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={THEME_COLOR} /></View>;
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Bank Account</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Banner */}
                <View style={[styles.banner, { backgroundColor: role === 'farmer' ? '#E8F5E9' : '#E3F2FD', borderColor: role === 'farmer' ? '#4CAF50' : '#2196F3' }]}>
                    <Ionicons name={role === 'farmer' ? "wallet-outline" : "card-outline"} size={24} color={role === 'farmer' ? '#4CAF50' : '#2196F3'} />
                    <Text style={[styles.bannerText, { color: role === 'farmer' ? '#2E7D32' : '#1565C0' }]}>
                        {role === 'farmer'
                            ? "This account will be used to receive your sales earnings."
                            : "This account will be used for instant refunds."
                        }
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Account Holder Name</Text>
                        <TextInput
                            style={styles.input}
                            value={accountHolderName}
                            onChangeText={setAccountHolderName}
                            placeholder="Full Name as per Bank Records"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Account Number</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[styles.input, { flex: 1, borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                                value={accountNumber}
                                onChangeText={setAccountNumber}
                                secureTextEntry={!showAccountNumber}
                                keyboardType="numeric"
                                placeholder="Enter Account Number"
                            />
                            <TouchableOpacity
                                onPress={() => setShowAccountNumber(!showAccountNumber)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons name={showAccountNumber ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Account Number</Text>
                        <TextInput
                            style={[styles.input, accountNumber && confirmAccountNumber && accountNumber !== confirmAccountNumber ? { borderColor: 'red' } : {}]}
                            value={confirmAccountNumber}
                            onChangeText={setConfirmAccountNumber}
                            secureTextEntry={!showAccountNumber}
                            keyboardType="numeric"
                            placeholder="Re-enter Account Number"
                        />
                        {accountNumber && confirmAccountNumber && accountNumber !== confirmAccountNumber && (
                            <Text style={styles.errorText}>Account numbers do not match</Text>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>IFSC Code</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <TextInput
                                style={[styles.input, { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 }]}
                                value={ifscCode}
                                onChangeText={(text) => {
                                    setIfscCode(text.toUpperCase());
                                    setIfscVerified(false);
                                }}
                                autoCapitalize="characters"
                                placeholder="e.g. SBIN0001234"
                                maxLength={11}
                            />
                            <TouchableOpacity
                                style={[styles.verifyBtn, ifscVerified ? { backgroundColor: '#4CAF50' } : {}]}
                                onPress={handleVerifyIfsc}
                                disabled={verifyingIfsc || ifscVerified}
                            >
                                {verifyingIfsc ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : ifscVerified ? (
                                    <Ionicons name="checkmark" size={20} color="white" />
                                ) : (
                                    <Text style={styles.verifyText}>Verify</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                        {ifscVerified && bankName && (
                            <View style={styles.bankInfo}>
                                <Text style={styles.bankInfoText}><Text style={{ fontWeight: 'bold' }}>{bankName}</Text></Text>
                                <Text style={styles.bankInfoText}>{branchName}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Account Type</Text>
                        <View style={styles.radioGroup}>
                            <TouchableOpacity
                                style={[styles.radioButton, accountType === 'Savings' && styles.radioButtonSelected]}
                                onPress={() => setAccountType('Savings')}
                            >
                                <View style={[styles.radioOuter, accountType === 'Savings' && { borderColor: THEME_COLOR }]}>
                                    {accountType === 'Savings' && <View style={styles.radioInner} />}
                                </View>
                                <Text style={[styles.radioText, accountType === 'Savings' && { color: THEME_COLOR }]}>Savings</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.radioButton, accountType === 'Current' && styles.radioButtonSelected]}
                                onPress={() => setAccountType('Current')}
                            >
                                <View style={[styles.radioOuter, accountType === 'Current' && { borderColor: THEME_COLOR }]}>
                                    {accountType === 'Current' && <View style={styles.radioInner} />}
                                </View>
                                <Text style={[styles.radioText, accountType === 'Current' && { color: THEME_COLOR }]}>Current</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>UPI ID (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            value={upiId}
                            onChangeText={setUpiId}
                            placeholder="e.g. user@oksbi"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.saveBtnText}>Save Bank Account</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.trustBadge}>
                        <Ionicons name="lock-closed" size={14} color="#666" />
                        <Text style={styles.trustText}>Your bank details are encrypted and stored securely.</Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, backgroundColor: 'white', elevation: 2 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    backButton: { padding: 5 },

    banner: { flexDirection: 'row', padding: 15, margin: 20, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
    bannerText: { marginLeft: 10, flex: 1, fontSize: 14, fontWeight: '500' },

    formCard: { backgroundColor: 'white', margin: 20, marginTop: 0, padding: 20, borderRadius: 15, elevation: 2 },

    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '600' },
    input: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 16, color: '#333' },

    errorText: { color: 'red', fontSize: 12, marginTop: 4 },

    passwordContainer: { flexDirection: 'row', alignItems: 'center' },
    eyeIcon: { padding: 12, backgroundColor: '#FAFAFA', borderWidth: 1, borderLeftWidth: 0, borderColor: '#DDD', borderTopRightRadius: 8, borderBottomRightRadius: 8 },

    verifyBtn: { backgroundColor: '#333', paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 8, borderBottomRightRadius: 8 },
    verifyText: { color: 'white', fontWeight: 'bold' },

    bankInfo: { marginTop: 10, padding: 10, backgroundColor: '#F0F9FF', borderRadius: 8, borderWidth: 1, borderColor: '#B3E5FC' },
    bankInfoText: { color: '#0277BD', fontSize: 13 },

    radioGroup: { flexDirection: 'row', gap: 20 },
    radioButton: { flexDirection: 'row', alignItems: 'center', padding: 10, borderWidth: 1, borderColor: '#EEE', borderRadius: 8, flex: 1, justifyContent: 'center' },
    radioButtonSelected: { backgroundColor: '#F1F8E9', borderColor: THEME_COLOR },
    radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#999', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: THEME_COLOR },
    radioText: { color: '#666', fontWeight: '500' },

    saveBtn: { backgroundColor: THEME_COLOR, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    saveBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

    trustBadge: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
    trustText: { fontSize: 12, color: '#666', marginLeft: 6 }
});
