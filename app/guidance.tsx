import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { TRANSLATIONS } from '@/constants/translations';

export default function LedGuidanceScreen() {
    const params = useLocalSearchParams();
    const lang = (params.lang as keyof typeof TRANSLATIONS) || 'en';
    const t = TRANSLATIONS[lang];

    const [mode, setMode] = useState(0);
    const [torchOn, setTorchOn] = useState(false);
    const intervalRef = useRef<any>(null);
    const [permission, requestPermission] = useCameraPermissions();

    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTorchOn(false);

        if (mode === 3) {
            setTorchOn(true);
        } else if (mode === 1) {
            intervalRef.current = setInterval(() => {
                setTorchOn(prev => !prev);
            }, 1000);
        } else if (mode === 2) {
            intervalRef.current = setInterval(() => {
                setTorchOn(prev => !prev);
            }, 100);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [mode]);

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={styles.centerContainer}>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>{t.grantPermission}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleMode = (newMode: number) => {
        if (mode === newMode) setMode(0);
        else setMode(newMode);
        Haptics.selectionAsync();
    };

    return (
        <View style={styles.container}>
            <CameraView style={{ width: 1, height: 1, opacity: 0 }} enableTorch={torchOn} facing="back" />

            <View style={styles.guidanceContainer}>
                <Text style={styles.sectionTitle}>{t.cropGuidance}</Text>
                <Text style={styles.subText}>{t.selectMode}</Text>


                <TouchableOpacity style={[styles.actionButton, mode === 1 && styles.activeButton, { borderColor: '#2196F3' }]} onPress={() => handleMode(1)}>
                    <Ionicons name="water-outline" size={24} color={mode === 1 ? 'white' : '#2196F3'} />
                    <Text style={[styles.actionText, mode === 1 && styles.activeText, { color: '#2196F3' }]}>{t.irrigation}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, mode === 2 && styles.activeButton, { borderColor: '#F44336' }]} onPress={() => handleMode(2)}>
                    <Ionicons name="alert-circle-outline" size={24} color={mode === 2 ? 'white' : '#F44336'} />
                    <Text style={[styles.actionText, mode === 2 && styles.activeText, { color: '#F44336' }]}>{t.diseaseWarn}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, mode === 3 && styles.activeButton, { borderColor: '#FFEB3B' }]} onPress={() => handleMode(3)}>
                    <Ionicons name="moon-outline" size={24} color={mode === 3 ? 'white' : '#FFC107'} />
                    <Text style={[styles.actionText, mode === 3 && styles.activeText, { color: '#FFC107' }]}>{t.nightMode}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    centerContainer: { alignItems: 'center', justifyContent: 'center', flex: 1, padding: 20 },
    button: { backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25 },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    guidanceContainer: { flex: 1, padding: 20, justifyContent: 'center' },
    sectionTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
    subText: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
    actionButton: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 15, borderWidth: 2, marginBottom: 15, backgroundColor: 'white' },
    activeButton: { backgroundColor: '#F5F5F5' },
    actionText: { fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
    activeText: {},
});
