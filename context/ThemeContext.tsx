import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type ThemePreference = 'system' | 'light' | 'dark';
type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeMode;
    preference: ThemePreference;
    setPreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    preference: 'system',
    setPreference: () => { },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemScheme = useSystemColorScheme();
    const [preference, setPreferenceState] = useState<ThemePreference>('system');
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        loadPreference();
    }, []);

    const loadPreference = async () => {
        try {
            const stored = await AsyncStorage.getItem('theme_preference');
            if (stored === 'light' || stored === 'dark' || stored === 'system') {
                setPreferenceState(stored);
            }
        } catch (e) {
            console.error("Failed to load theme preference", e);
        } finally {
            setLoaded(true);
        }
    };

    const setPreference = async (newPref: ThemePreference) => {
        setPreferenceState(newPref);
        try {
            await AsyncStorage.setItem('theme_preference', newPref);
        } catch (e) {
            console.error("Failed to save theme preference", e);
        }
    };

    const theme: ThemeMode =
        preference === 'system'
            ? (systemScheme === 'dark' ? 'dark' : 'light')
            : preference;

    return (
        <ThemeContext.Provider value={{ theme, preference, setPreference }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
