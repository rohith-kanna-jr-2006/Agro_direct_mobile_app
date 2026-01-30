import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Actually linear-gradient is not in package.json. I'll stick to Value colors.

const SCREEN_WIDTH = Dimensions.get('window').width;

const LANGUAGES = [
    { code: 'en', name: 'English', native: 'English', greeting: 'Please select your language' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी', greeting: 'कृपया अपनी भाषा चुनें' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', greeting: 'தயவுசெய்து உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்' },
    { code: 'mr', name: 'Marathi', native: 'मराठी', greeting: 'कृपया तुमची भाषा निवडा' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', greeting: 'దయచేసి మీ భాషను ఎంచుకోండి' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', greeting: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ' },
];

export default function LanguageSelection() {
    const router = useRouter();

    useEffect(() => {
        playGreetings();
        return () => Speech.stop();
    }, []);

    const playGreetings = async () => {
        // Creating a sequence
        for (const lang of LANGUAGES.slice(0, 3)) { // Play first 3 to avoid long wait
            Speech.speak(lang.greeting, { language: lang.code === 'en' ? 'en-US' : undefined });
            // Note: Speech.speak is fire-and-forget in some versions, but queueing works in others.
            // We'll just let Expo manage the queue.
        }
    };

    const selectLanguage = async (lang: typeof LANGUAGES[0]) => {
        await AsyncStorage.setItem('app_language', lang.code);
        Speech.stop();
        router.push('/signup/role-selection');
    };

    const renderItem = ({ item }: { item: typeof LANGUAGES[0] }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => selectLanguage(item)}
            activeOpacity={0.7}
        >
            <View style={styles.iconCircle}>
                <Text style={styles.langChar}>{item.native.charAt(0)}</Text>
            </View>
            <Text style={styles.nativeName}>{item.native}</Text>
            <Text style={styles.englishName}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={{ uri: 'https://img.icons8.com/clouds/200/translation.png' }}
                    style={styles.image}
                />
                <Text style={styles.title}>Welcome / सुस्वागतम</Text>
                <Text style={styles.subtitle}>Select your language to continue</Text>
            </View>

            <FlatList
                data={LANGUAGES}
                renderItem={renderItem}
                keyExtractor={item => item.code}
                numColumns={2}
                contentContainerStyle={styles.grid}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F9FF',
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    image: {
        width: 120,
        height: 120,
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#2C3E50',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#7F8C8D',
        marginTop: 5,
        textAlign: 'center',
    },
    grid: {
        paddingHorizontal: 15,
        paddingBottom: 40,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    card: {
        backgroundColor: '#FFFFFF',
        width: (SCREEN_WIDTH - 45) / 2, // 2 columns with padding
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    langChar: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    nativeName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    englishName: {
        fontSize: 14,
        color: '#95A5A6',
    },
});
