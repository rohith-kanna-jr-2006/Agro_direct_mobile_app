import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function BuyerProfile() {
    const [subRole, setSubRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [image, setImage] = useState<string | null>(null);
    const router = useRouter();
    const { mobile } = useLocalSearchParams();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [locationLoading, setLocationLoading] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem('user_sub_role').then(r => {
            setSubRole(r || 'consumer');
            setLoading(false);
            // console.log("Sub Role:", r);
        });
    }, []);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const getCurrentLocation = async () => {
        setLocationLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                setLocationLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});

            // Reverse Geocode to get address
            let reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (reverseGeocode.length > 0) {
                const addr = reverseGeocode[0];
                // Construct a readable address string
                const formattedAddress = [
                    addr.name,
                    addr.street,
                    addr.city,
                    addr.district,
                    addr.region,
                    addr.postalCode
                ].filter(Boolean).join(', ');

                setAddress(formattedAddress);
            } else {
                // Fallback if reverse geocode fails logic but we have coords
                setAddress(`${location.coords.latitude}, ${location.coords.longitude}`);
            }

        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not fetch location");
        } finally {
            setLocationLoading(false);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator /></View>;

    const isBusiness = subRole !== 'consumer';

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.header}>Complete Your Profile</Text>
            <Text style={styles.subHeader}>
                {isBusiness ? 'Tell us about your business' : 'Tell us where to deliver'}
            </Text>

            <View style={styles.form}>
                <Text style={styles.label}>Your Name</Text>
                <TextInput style={styles.input} placeholder="John Doe" value={name} onChangeText={setName} />

                <Text style={styles.label}>Address</Text>
                <TextInput style={styles.input} placeholder="Start typing address..." value={address} onChangeText={setAddress} multiline />

                <TouchableOpacity
                    style={styles.locationBtn}
                    onPress={getCurrentLocation}
                    disabled={locationLoading}
                >
                    {locationLoading ? (
                        <ActivityIndicator size="small" color="#2575FC" />
                    ) : (
                        <>
                            <Ionicons name="location-sharp" size={18} color="#2575FC" />
                            <Text style={styles.locationText}>Use Current Location</Text>
                        </>
                    )}
                </TouchableOpacity>

                {isBusiness && (
                    <View style={styles.businessSection}>
                        <Text style={styles.sectionTitle}>Business Details</Text>

                        <Text style={styles.label}>Business Name</Text>
                        <TextInput style={styles.input} placeholder="e.g. Saravana Bhavan" value={businessName} onChangeText={setBusinessName} />

                        <Text style={styles.label}>GST Number (Optional)</Text>
                        <TextInput style={styles.input} placeholder="GSTIN..." autoCapitalize="characters" />

                        <Text style={styles.label}>Shop Photo</Text>
                        <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                            {image ? (
                                <Image source={{ uri: image }} style={styles.preview} />
                            ) : (
                                <View style={styles.uploadContent}>
                                    <Ionicons name="images-outline" size={30} color="#666" />
                                    <Text style={styles.uploadText}>Upload Store Front</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <TouchableOpacity style={styles.button} onPress={async () => {
                if (!name.trim()) {
                    alert("Please enter your name");
                    return;
                }
                const data = {
                    mobile,
                    name,
                    location: address,
                    subRole: subRole || 'consumer',
                    businessName,
                    storeImage: image
                };
                await AsyncStorage.setItem('temp_reg_buyer', JSON.stringify(data));
                router.push('/signup/buyer/preferences');
            }}>
                <Text style={styles.buttonText}>Next Step</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        padding: 24,
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    subHeader: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
    },
    form: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
    },
    locationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    locationText: {
        color: '#2575FC',
        marginLeft: 5,
        fontWeight: '600',
    },
    businessSection: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    uploadBox: {
        height: 150,
        borderWidth: 1,
        borderColor: '#DDD',
        borderStyle: 'dashed',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        overflow: 'hidden',
    },
    uploadContent: {
        alignItems: 'center',
    },
    uploadText: {
        color: '#666',
        marginTop: 5,
    },
    preview: {
        width: '100%',
        height: '100%',
    },
    button: {
        backgroundColor: '#2575FC',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
