import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams } from 'expo-router';
import { TRANSLATIONS } from '@/constants/translations';

export default function PlantScannerScreen() {
    const params = useLocalSearchParams();
    const lang = (params.lang as keyof typeof TRANSLATIONS) || 'en';
    const t = TRANSLATIONS[lang];

    const [permission, requestPermission] = useCameraPermissions();
    const [scannedImage, setScannedImage] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const cameraRef = useRef<any>(null);

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.text}>{t.cameraPermission}</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>{t.grantPermission}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            try {
                const photo = await cameraRef.current.takePictureAsync();
                setScannedImage(photo.uri);
                analyzeHealth();
            } catch (error) {
                Alert.alert("Error", "Failed to take picture");
            }
        }
    };

    const analyzeHealth = () => {
        setAnalyzing(true);
        setTimeout(() => {
            const outcomes = [
                { status: t.healthy, color: '#4CAF50', message: 'Your plant looks great!' },
                { status: t.needsWater, color: '#FFEB3B', message: 'Improve soil moisture.' },
                { status: t.disease, color: '#F44336', message: 'Quarantine this plant.' },
            ];
            const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
            setResult(randomOutcome);
            setAnalyzing(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 2000);
    };

    const resetScan = () => {
        setScannedImage(null);
        setResult(null);
    };

    return (
        <View style={styles.container}>
            {scannedImage ? (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: scannedImage }} style={styles.previewImage} />
                    {analyzing && (
                        <View style={styles.overlay}>
                            <ActivityIndicator size="large" color="white" />
                            <Text style={styles.overlayText}>{t.scan}</Text>
                        </View>
                    )}
                    {result && !analyzing && (
                        <View style={[styles.resultCard, { borderLeftColor: result.color, borderLeftWidth: 10 }]}>
                            <Text style={[styles.resultTitle, { color: result.color }]}>{result.status}</Text>
                            <Text style={styles.resultMessage}>{result.message}</Text>
                            <TouchableOpacity style={styles.button} onPress={resetScan}>
                                <Text style={styles.buttonText}>{t.scanAnother}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            ) : (
                <CameraView style={styles.camera} ref={cameraRef} facing="back">
                    <View style={styles.cameraControls}>
                        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                            <View style={styles.captureInner} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.scanOverlay}>
                        <Text style={styles.scanText}>{t.centerLeaf}</Text>
                    </View>
                </CameraView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    centerContainer: { alignItems: 'center', justifyContent: 'center', flex: 1, padding: 20 },
    text: { fontSize: 18, marginBottom: 20 },
    button: { backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25 },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    camera: { flex: 1, width: '100%' },
    cameraControls: { flex: 1, backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'center', margin: 20, alignItems: 'flex-end' },
    captureButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'white' },
    captureInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'white' },
    scanOverlay: { position: 'absolute', top: 50, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 10 },
    scanText: { color: 'white', fontSize: 16 },
    previewContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    previewImage: { width: '100%', height: '100%', position: 'absolute' },
    overlay: { backgroundColor: 'rgba(0,0,0,0.7)', padding: 30, borderRadius: 20, alignItems: 'center' },
    overlayText: { color: 'white', marginTop: 10, fontSize: 18, fontWeight: 'bold' },
    resultCard: { width: '80%', padding: 20, backgroundColor: 'white', borderRadius: 10, elevation: 10, alignItems: 'center' },
    resultTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    resultMessage: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20 },
});
