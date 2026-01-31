import { TRANSLATIONS } from '@/constants/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export type LanguageCode = keyof typeof TRANSLATIONS;

export function useLanguage() {
    const [language, setLanguageState] = useState<LanguageCode>('en');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const savedLang = await AsyncStorage.getItem('app_language');
            if (savedLang && (savedLang in TRANSLATIONS)) {
                setLanguageState(savedLang as LanguageCode);
            }
        } catch (e) {
            console.error("Failed to load language", e);
        } finally {
            setIsLoaded(true);
        }
    };

    const setLanguage = useCallback(async (lang: LanguageCode) => {
        try {
            await AsyncStorage.setItem('app_language', lang);
            setLanguageState(lang);
        } catch (e) {
            console.error("Failed to save language", e);
        }
    }, []);

    return {
        language,
        setLanguage,
        t: TRANSLATIONS[language],
        isLoaded
    };
}
