import { registerUserPhone, verifyPmKisan } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function KYC() {
    const router = useRouter();
    const [frontImage, setFrontImage] = useState<string | null>(null);
    const [backImage, setBackImage] = useState<string | null>(null);
    const [bank, setBank] = useState({ account: '', ifsc: '', bankName: '' });

    // PM-KISAN Verification State
    const [aadhaar, setAadhaar] = useState('');
    const [verificationStatus, setVerificationStatus] = useState<'none' | 'loading' | 'verified' | 'failed'>('none');
    const [verificationMsg, setVerificationMsg] = useState('');

    const pickImage = async (setFunction: Function) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
        });
        if (!result.canceled) {
            setFunction(result.assets[0].uri);
        }
    };

    const handlePmKisanVerify = async () => {
        if (aadhaar.length !== 12) {
            Alert.alert("Invalid Aadhaar", "Please enter a valid 12-digit Aadhaar number.");
            return;
        }

        setVerificationStatus('loading');
        try {
            const result = await verifyPmKisan(aadhaar);
            if (result.valid) {
                setVerificationStatus('verified');
                setVerificationMsg(result.message);
                // Auto-fill bank details if available (simulated)
                setBank(prev => ({ ...prev, bankName: "State Bank of India (Linked)" }));
            } else {
                setVerificationStatus('failed');
                setVerificationMsg(result.message || "Verification failed.");
            }
        } catch (error) {
            setVerificationStatus('failed');
            setVerificationMsg("Network or Server Error");
        }
    };

    const handleFinish = async () => {
        try {
            // Retrieve previous steps data
            const personalStr = await AsyncStorage.getItem('temp_reg_personal');
            const farmStr = await AsyncStorage.getItem('temp_reg_farm');

            if (!personalStr) {
                Alert.alert("Error", "Session expired. Please start over.");
                router.replace('/signup/farmer/login');
                return;
            }

            const personalData = JSON.parse(personalStr);
            const farmData = farmStr ? JSON.parse(farmStr) : null;

            // Construct payload
            const payload = {
                phone: personalData.mobile, // From login/personal-details
                name: personalData.name,
                location: personalData.address, // Structured object
                role: 'farmer',
                farmDetails: farmData,
                bankDetails: {
                    accountNumber: bank.account,
                    ifscCode: bank.ifsc,
                    bankName: bank.bankName
                }
            };

            // Call API
            const response = await registerUserPhone(payload);

            // Save confirmed user profile
            await AsyncStorage.setItem('current_user', JSON.stringify(response.profile || response.user));
            await AsyncStorage.setItem('user_role', 'farmer');

            // Clean up temp
            await AsyncStorage.removeItem('temp_reg_personal');
            await AsyncStorage.removeItem('temp_reg_farm');

            Alert.alert("Welcome!", "Your account has been created successfully.");
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert("Registration Failed", error.message || "Could not create account.");
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.header}>KYC & Bank Details</Text>
            <Text style={styles.subHeader}>Secure your payments and identity. You can skip this step and do it later.</Text>

            <Text style={styles.sectionTitle}>Identity Proof (Aadhaar / KCC)</Text>

            {/* PM-KISAN Verification Section */}
            <View style={styles.verificationContainer}>
                <Text style={styles.label}>Verify with PM-KISAN (Recommended)</Text>
                <View style={styles.verifyRow}>
                    <TextInput
                        style={[styles.input, styles.verifyInput]}
                        placeholder="Enter 12-digit Aadhaar"
                        keyboardType="numeric"
                        maxLength={12}
                        value={aadhaar}
                        onChangeText={setAadhaar}
                        editable={verificationStatus !== 'verified'}
                    />
                    {verificationStatus !== 'verified' && (
                        <TouchableOpacity
                            style={[styles.verifyButton, verificationStatus === 'loading' && styles.disabledButton]}
                            onPress={handlePmKisanVerify}
                            disabled={verificationStatus === 'loading'}
                        >
                            <Text style={styles.verifyButtonText}>
                                {verificationStatus === 'loading' ? 'Verifying...' : 'Verify'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {verificationStatus === 'verified' && (
                    <View style={styles.successBox}>
                        <Ionicons name="checkmark-circle" size={24} color="white" />
                        <Text style={styles.successText}>Verified Farmer (PM-KISAN Database)</Text>
                    </View>
                )}

                {verificationStatus === 'failed' && (
                    <Text style={styles.errorText}>{verificationMsg}</Text>
                )}
            </View>

            <Text style={styles.orText}>OR Upload Manually</Text>

            <View style={styles.uploadRow}>
                <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage(setFrontImage)}>
                    {frontImage ? (
                        <Image source={{ uri: frontImage }} style={styles.previewImage} />
                    ) : (
                        <>
                            <Ionicons name="camera-outline" size={32} color="#4CAF50" />
                            <Text style={styles.uploadText}>Front Side</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage(setBackImage)}>
                    {backImage ? (
                        <Image source={{ uri: backImage }} style={styles.previewImage} />
                    ) : (
                        <>
                            <Ionicons name="camera-outline" size={32} color="#4CAF50" />
                            <Text style={styles.uploadText}>Back Side</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Bank Details</Text>
            <TextInput
                style={styles.input}
                placeholder="Account Number"
                keyboardType="numeric"
                value={bank.account}
                onChangeText={(t) => setBank({ ...bank, account: t })}
            />
            <TextInput
                style={styles.input}
                placeholder="IFSC Code"
                autoCapitalize="characters"
                value={bank.ifsc}
                onChangeText={(t) => setBank({ ...bank, ifsc: t })}
            />
            <TextInput
                style={styles.input}
                placeholder="Bank Name"
                value={bank.bankName}
                onChangeText={(t) => setBank({ ...bank, bankName: t })}
            />

            <TouchableOpacity style={styles.button} onPress={handleFinish}>
                <Text style={styles.buttonText}>Finish Setup</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={handleFinish}>
                <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 24,
        paddingTop: 40,
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    subHeader: {
        fontSize: 14,
        color: '#666',
        marginBottom: 30,
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
        marginTop: 10,
    },
    uploadRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    uploadBox: {
        width: '48%',
        height: 120,
        borderWidth: 1.5,
        borderColor: '#4CAF50',
        borderStyle: 'dashed',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F8E9',
        overflow: 'hidden',
    },
    uploadText: {
        color: '#4CAF50',
        marginTop: 8,
        fontWeight: '600',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        marginBottom: 15,
        backgroundColor: '#FAFAFA',
    },
    button: {
        backgroundColor: '#2E7D32',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    skipButton: {
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    skipText: {
        color: '#888',
        fontSize: 16,
    },
    // New Styles for Verification
    verificationContainer: {
        marginBottom: 20,
        backgroundColor: '#F9FAFB',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    verifyRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    verifyInput: {
        flex: 1,
        marginBottom: 0, // Override default input margin
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
    },
    verifyButton: {
        backgroundColor: '#2E7D32',
        paddingVertical: 14, // Match input height roughly
        paddingHorizontal: 20,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        justifyContent: 'center',
        height: 50, // Approximate height of input
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#A5D6A7',
    },
    verifyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    successBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
    },
    successText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    errorText: {
        color: '#D32F2F',
        marginTop: 8,
        fontSize: 13,
    },
    orText: {
        textAlign: 'center',
        color: '#888',
        marginVertical: 15,
        fontWeight: '600',
    },
});
