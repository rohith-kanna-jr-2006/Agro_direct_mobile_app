import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function KYC() {
    const router = useRouter();
    const [frontImage, setFrontImage] = useState<string | null>(null);
    const [backImage, setBackImage] = useState<string | null>(null);

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

    const handleFinish = async () => {
        // In a real app, you'd submit data to backend here
        await AsyncStorage.setItem('current_user', JSON.stringify({ role: 'farmer', name: 'Farmer User' }));
        router.replace('/(tabs)');
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.header}>KYC & Bank Details</Text>
            <Text style={styles.subHeader}>Secure your payments and identity. You can skip this step and do it later.</Text>

            <Text style={styles.sectionTitle}>Identity Proof (Aadhaar / KCC)</Text>

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
            <TextInput style={styles.input} placeholder="Account Number" keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="IFSC Code" autoCapitalize="characters" />
            <TextInput style={styles.input} placeholder="Bank Name" />

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
});
