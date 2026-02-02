import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LightSensor } from 'expo-sensors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { TRANSLATIONS } from '@/constants/translations';

export default function SunlightTrackerScreen() {
    const params = useLocalSearchParams();
    const lang = (params.lang as keyof typeof TRANSLATIONS) || 'en';
    const t = TRANSLATIONS[lang];

    const [lux, setLux] = useState(0);

    useEffect(() => {
        LightSensor.setUpdateInterval(500);
        const subscription = LightSensor.addListener(data => {
            setLux(data.illuminance);
        });
        return () => subscription.remove();
    }, []);

    const getStatus = (value: number) => {
        if (value < 100) return { text: t.lowSun, color: '#90A4AE', icon: 'cloud-outline' };
        if (value < 1000) return { text: t.medSun, color: '#FBC02D', icon: 'partly-sunny-outline' };
        return { text: t.highSun, color: '#FF6F00', icon: 'sunny' };
    };

    const status = getStatus(lux);

    return (
        <View style={[styles.container, styles.centerContainer, { backgroundColor: '#E0F7FA' }]}>
            <Ionicons name={status.icon as any} size={100} color={status.color} />
            <Text style={styles.luxValue}>{Math.round(lux)} lx</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                <Text style={styles.statusText}>{status.text}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContainer: { alignItems: 'center', justifyContent: 'center', flex: 1, padding: 20 },
    luxValue: { fontSize: 48, fontWeight: 'bold', color: '#333', marginVertical: 20 },
    statusBadge: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 30, marginBottom: 20 },
    statusText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});
