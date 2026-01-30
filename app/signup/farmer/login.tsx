import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function FarmerLogin() {
    const [mobile, setMobile] = useState('');
    const router = useRouter();

    const handleGetOTP = () => {
        if (mobile.length === 10) {
            router.push({ pathname: '/signup/farmer/otp', params: { mobile } });
        } else {
            // In a real app, show a toast or inline error
            alert("Please enter a valid 10-digit mobile number");
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
});
