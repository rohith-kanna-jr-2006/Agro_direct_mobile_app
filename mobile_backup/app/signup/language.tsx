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
        return () => {
            Speech.stop();
        };
    }, []);

    const playGreetings = async () => {
        // Creating a sequence
        for (const lang of LANGUAGES.slice(0, 3)) {
            const voiceOptions = {
                language: lang.code === 'en' ? 'en-US' : `${lang.code}-IN`,
            };
            Speech.speak(lang.greeting, voiceOptions);
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
            <View style={[styles.iconCircle, { backgroundColor: item.code === 'en' ? '#E3F2FD' : '#E8F5E9' }]}>
                <Text style={[styles.langChar, { color: item.code === 'en' ? '#1976D2' : '#2E7D32' }]}>{item.native.charAt(0)}</Text>
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
        backgroundColor: '#FFFFFF', // Clean white background
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    image: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#212121',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
        fontWeight: '500',
    },
    grid: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        width: (SCREEN_WIDTH - 60) / 2, // 2 columns with 20px padding * 2 sides + 20px gap
        borderRadius: 24,
        paddingVertical: 24,
        paddingHorizontal: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    langChar: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    nativeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 4,
    },
    englishName: {
        fontSize: 14,
        color: '#9E9E9E',
        fontWeight: '500',
    },
});
