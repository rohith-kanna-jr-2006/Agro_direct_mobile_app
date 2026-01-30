import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const CROPS = [
    { id: '1', name: 'Wheat', icon: 'https://img.icons8.com/color/96/wheat.png' },
    { id: '2', name: 'Rice', icon: 'https://img.icons8.com/color/96/rice-bowl.png' },
    { id: '3', name: 'Tomato', icon: 'https://img.icons8.com/color/96/tomato.png' },
    { id: '4', name: 'Potato', icon: 'https://img.icons8.com/color/96/potato.png' },
    { id: '5', name: 'Onion', icon: 'https://img.icons8.com/color/96/onion.png' },
    { id: '6', name: 'Cotton', icon: 'https://img.icons8.com/color/96/cotton.png' },
    { id: '7', name: 'Corn', icon: 'https://img.icons8.com/color/96/corn.png' },
    { id: '8', name: 'Sugarcane', icon: 'https://img.icons8.com/color/96/sugar-cane.png' },
];

export default function FarmDetails() {
    const [acres, setAcres] = useState('');
    const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
    const [irrigation, setIrrigation] = useState('');
    const router = useRouter();

    const toggleCrop = (id: string) => {
        if (selectedCrops.includes(id)) {
            setSelectedCrops(selectedCrops.filter(c => c !== id));
        } else {
            setSelectedCrops([...selectedCrops, id]);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.header}>Farm Details</Text>
            <Text style={styles.subHeader}>What do you grow?</Text>

            <Text style={styles.label}>Total Land Size (Acres)</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="e.g. 2.5"
                    value={acres}
                    onChangeText={setAcres}
                />
                <Text style={styles.unit}>Acres</Text>
            </View>

            <Text style={styles.label}>Primary Crops</Text>
            <Text style={styles.helperText}>Select all that apply</Text>
            <View style={styles.grid}>
                {CROPS.map(crop => (
                    <TouchableOpacity
                        key={crop.id}
                        style={[styles.cropCard, selectedCrops.includes(crop.id) && styles.selectedCrop]}
                        onPress={() => toggleCrop(crop.id)}
                        activeOpacity={0.7}
                    >
                        <Image source={{ uri: crop.icon }} style={styles.cropIcon} />
                        <Text style={[styles.cropName, selectedCrops.includes(crop.id) && styles.selectedCropName]}>{crop.name}</Text>
                        {selectedCrops.includes(crop.id) && (
                            <View style={styles.checkMark}>
                                <Text style={styles.checkText}>✓</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Irrigation Type (Optional)</Text>
            <View style={styles.pillContainer}>
                {['Rainfed', 'Borewell', 'Canal'].map(type => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.pill, irrigation === type && styles.selectedPill]}
                        onPress={() => setIrrigation(type)}
                    >
                        <Text style={[styles.pillText, irrigation === type && styles.selectedPillText]}>{type}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.button} onPress={() => router.push('/signup/farmer/kyc')}>
                <Text style={styles.buttonText}>Next</Text>
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
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    subHeader: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
        marginTop: 20,
    },
    helperText: {
        fontSize: 14,
        color: '#999',
        marginTop: -5,
        marginBottom: 15,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 15,
        backgroundColor: '#FAFAFA',
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 18,
        color: '#333',
    },
    unit: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    cropCard: {
        width: (width - 48 - 12) / 2, // 2 columns
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#EEE',
        borderRadius: 16,
        padding: 15,
        alignItems: 'center',
        marginBottom: 12,
    },
    selectedCrop: {
        borderColor: '#4CAF50',
        backgroundColor: '#E8F5E9',
    },
    cropIcon: {
        width: 48,
        height: 48,
        marginBottom: 8,
    },
    cropName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
    },
    selectedCropName: {
        color: '#2E7D32',
    },
    checkMark: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#4CAF50',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    pillContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    pill: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        backgroundColor: '#F0F0F0',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    selectedPill: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    pillText: {
        color: '#666',
        fontWeight: '600',
    },
    selectedPillText: {
        color: '#fff',
    },
    button: {
        backgroundColor: '#2E7D32',
        marginTop: 40,
        padding: 18,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 40,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
