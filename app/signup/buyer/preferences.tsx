import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const INTERESTS = [
    { name: 'Vegetables', icon: 'nutrition-outline' },
    { name: 'Fruits', icon: 'leaf-outline' },
    { name: 'Grains', icon: 'apps-outline' }, // closest generic
    { name: 'Spices', icon: 'flame-outline' },
    { name: 'Flowers', icon: 'rose-outline' },
    { name: 'Dairy', icon: 'water-outline' }
];

const QUANTITIES = ['< 10 kg', '10 - 50 kg', '50 - 500 kg', '500 kg +', '1 Ton +'];

export default function Preferences() {
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [quantity, setQuantity] = useState('');
    const router = useRouter();

    const toggleInterest = (interest: string) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(selectedInterests.filter(i => i !== interest));
        } else {
            setSelectedInterests([...selectedInterests, interest]);
        }
    };

    const handleStart = async () => {
        // Save preferences
        await AsyncStorage.setItem('current_user', JSON.stringify({ role: 'buyer', name: 'Buyer User' }));
        router.replace('/(tabs)');
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.header}>Personalize Feed</Text>
            <Text style={styles.subHeader}>What are you interested in buying?</Text>

            <Text style={styles.label}>Categories</Text>
            <View style={styles.chipsContainer}>
                {INTERESTS.map((item) => (
                    <TouchableOpacity
                        key={item.name}
                        style={[styles.chip, selectedInterests.includes(item.name) && styles.selectedChip]}
                        onPress={() => toggleInterest(item.name)}
                    >
                        <Ionicons
                            name={item.icon as any}
                            size={18}
                            color={selectedInterests.includes(item.name) ? '#fff' : '#555'}
                        />
                        <Text style={[styles.chipText, selectedInterests.includes(item.name) && styles.selectedChipText]}>
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Average Weekly Requirement</Text>
            <View style={styles.listContainer}>
                {QUANTITIES.map((q) => (
                    <TouchableOpacity
                        key={q}
                        style={[styles.listItem, quantity === q && styles.selectedListItem]}
                        onPress={() => setQuantity(q)}
                    >
                        <View style={[styles.radio, quantity === q && styles.radioSelected]}>
                            {quantity === q && <View style={styles.radioInner} />}
                        </View>
                        <Text style={[styles.listText, quantity === q && styles.selectedListText]}>{q}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.button} onPress={handleStart}>
                <Text style={styles.buttonText}>Start Buying</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 10 }} />
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
        paddingTop: 50,
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
        marginBottom: 15,
        marginTop: 10,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 30,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#EEE',
    },
    selectedChip: {
        backgroundColor: '#2575FC',
        borderColor: '#2575FC',
    },
    chipText: {
        fontSize: 14,
        color: '#555',
        marginLeft: 8,
        fontWeight: '600',
    },
    selectedChipText: {
        color: '#fff',
    },
    listContainer: {
        marginBottom: 30,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    selectedListItem: {
        backgroundColor: '#F0F8FF',
        borderRadius: 8,
        paddingHorizontal: 10,
        borderBottomWidth: 0,
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#BBB',
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        borderColor: '#2575FC',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#2575FC',
    },
    listText: {
        fontSize: 16,
        color: '#333',
    },
    selectedListText: {
        color: '#2575FC',
        fontWeight: '600',
    },
    button: {
        backgroundColor: '#2575FC',
        padding: 18,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#2575FC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
