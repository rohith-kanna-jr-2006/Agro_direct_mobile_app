import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function RoleSelection() {
    const router = useRouter();

    const handleRoleSelect = async (role: string, subRole?: string) => {
        await AsyncStorage.setItem('user_role', role);
        if (subRole) await AsyncStorage.setItem('user_sub_role', subRole);

        if (role === 'farmer') {
            router.push('/signup/farmer/login');
        } else {
            router.push('/signup/buyer/registration');
        }
    };

    const RoleCard = ({ title, desc, iconUri, onPress, color }: any) => (
        <TouchableOpacity
            style={[styles.smallCard, { borderColor: color }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Image source={{ uri: iconUri }} style={styles.smallIcon} />
            <Text style={styles.smallTitle}>{title}</Text>
            <Text style={styles.smallDesc}>{desc}</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Who are you?</Text>
                <Text style={styles.headerSubtitle}>Choose the profile that fits you best</Text>
            </View>

            {/* Farmer Section - Featured */}
            <TouchableOpacity
                style={styles.farmerCard}
                onPress={() => handleRoleSelect('farmer')}
                activeOpacity={0.8}
            >
                <View style={styles.farmerInfo}>
                    <Text style={styles.farmerTitle}>I am a Farmer</Text>
                    <Text style={styles.farmerSubtitle}>Sell your produce directly to buyers.</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Start Selling</Text>
                    </View>
                </View>
                <Image
                    source={{ uri: 'https://img.icons8.com/color/96/farmer-male.png' }}
                    style={styles.farmerImage}
                />
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>I want to Buy...</Text>

            <View style={styles.grid}>
                <RoleCard
                    title="Household"
                    desc="For Home"
                    iconUri="https://img.icons8.com/color/96/home.png"
                    onPress={() => handleRoleSelect('buyer', 'consumer')}
                    color="#E3F2FD"
                />
                <RoleCard
                    title="Retailer"
                    desc="Shop Owner"
                    iconUri="https://img.icons8.com/color/96/shop.png"
                    onPress={() => handleRoleSelect('buyer', 'retailer')}
                    color="#E8F5E9"
                />
                <RoleCard
                    title="Restaurant"
                    desc="Hotel/Food"
                    iconUri="https://img.icons8.com/color/96/restaurant.png"
                    onPress={() => handleRoleSelect('buyer', 'hotel')}
                    color="#FFF3E0"
                />
                <RoleCard
                    title="Wholesaler"
                    desc="Bulk Agent"
                    iconUri="https://img.icons8.com/color/96/warehouse.png"
                    onPress={() => handleRoleSelect('buyer', 'wholesaler')}
                    color="#F3E5F5"
                />
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
        paddingTop: 60,
    },
    header: {
        marginBottom: 30,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
    },
    farmerCard: {
        backgroundColor: '#4CAF50',
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    farmerInfo: {
        flex: 1,
        marginRight: 16,
    },
    farmerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    farmerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 16,
    },
    farmerImage: {
        width: 80,
        height: 80,
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16, // Works in newer React Native
    },
    smallCard: {
        width: (width - 48 - 16) / 2, // 2 columns, 48 padding, 16 gap
        backgroundColor: '#fff',
        borderWidth: 2,
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    smallIcon: {
        width: 48,
        height: 48,
        marginBottom: 12,
    },
    smallTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },
    smallDesc: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
    },
});
