import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PersonalDetails() {
    const [image, setImage] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [address, setAddress] = useState({ state: '', district: '', village: '' });
    const [loadingLoc, setLoadingLoc] = useState(false);
    const router = useRouter();

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Camera permission is required to take photo.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const getCurrentLocation = async () => {
        setLoadingLoc(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            let reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (reverseGeocode.length > 0) {
                const place = reverseGeocode[0];
                setAddress({
                    state: place.region || place.subregion || '',
                    district: place.subregion || place.city || '',
                    village: place.district || place.street || '' // Approximation
                });
            }
        } catch (error) {
            Alert.alert("Error", "Could not fetch location.");
        } finally {
            setLoadingLoc(false);
        }
    };

    const handleNext = () => {
        if (!name.trim()) {
            Alert.alert("Missing Information", "Please enter your full name.");
            return;
        }
        router.push('/signup/farmer/farm-details');
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.header}>Personal Details</Text>
            <Text style={styles.subHeader}>Let's get to know you better</Text>

            <View style={styles.avatarContainer}>
                <TouchableOpacity onPress={takePhoto} style={styles.avatarPlaceholder}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.avatar} />
                    ) : (
                        <View style={styles.cameraIconContainer}>
                            <Ionicons name="camera" size={40} color="#666" />
                            <Text style={styles.cameraText}>Take Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Full Name *</Text>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your full name"
                        value={name}
                        onChangeText={setName}
                    />
                    <TouchableOpacity style={styles.micButton}>
                        <Ionicons name="mic" size={20} color="#4CAF50" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Location</Text>
                <TouchableOpacity
                    style={styles.gpsButton}
                    onPress={getCurrentLocation}
                    disabled={loadingLoc}
                >
                    {loadingLoc ? <ActivityIndicator color="#fff" /> : <Ionicons name="location" size={20} color="#fff" />}
                    <Text style={styles.gpsButtonText}>
                        {loadingLoc ? "Detecting..." : "Use Current GPS Location"}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.separator}>--- OR ---</Text>

                <TextInput
                    style={styles.input}
                    placeholder="State"
                    value={address.state}
                    onChangeText={(t) => setAddress({ ...address, state: t })}
                />
                <TextInput
                    style={styles.input}
                    placeholder="District"
                    value={address.district}
                    onChangeText={(t) => setAddress({ ...address, district: t })}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Village"
                    value={address.village}
                    onChangeText={(t) => setAddress({ ...address, village: t })}
                />

                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
            </View>
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
        alignItems: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    subHeader: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
    },
    avatarContainer: {
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#4CAF50',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    cameraIconContainer: {
        alignItems: 'center',
    },
    cameraText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 10,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#FAFAFA',
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#333',
        marginBottom: 10, // For non-row inputs
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 12,
        paddingHorizontal: 15,
        backgroundColor: '#FAFAFA',
    },
    micButton: {
        padding: 10,
    },
    gpsButton: {
        flexDirection: 'row',
        backgroundColor: '#2196F3',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    gpsButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 10,
    },
    separator: {
        textAlign: 'center',
        color: '#999',
        marginBottom: 20,
    },
    nextButton: {
        backgroundColor: '#4CAF50',
        marginTop: 20,
        padding: 18,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
