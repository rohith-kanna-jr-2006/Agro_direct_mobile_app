import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [hasLanguage, setHasLanguage] = useState(false);
    const [hasUser, setHasUser] = useState(false);
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            // Check if language is selected
            const lang = await AsyncStorage.getItem('app_language');
            // Check if user is logged in
            const user = await AsyncStorage.getItem('current_user');

            setHasLanguage(!!lang);
            setHasUser(!!user);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (hasUser) {
        return <Redirect href="/(tabs)" />;
    }

    // If no user, but has language, go to role selection (resume flow)
    // Or just start from language if they haven't finished signup
    if (hasLanguage) {
        // for now, let's always allow them to re-select language if not logged in, 
        // OR we could jump to role. Let's redirect to Language to be safe/consistent with "Start" flow.
        // Actually, if they picked language but didn't finish, maybe role selection is better?
        // Let's stick to Language as the entry for non-logged-in users to match the "App Opening" feel.
        return <Redirect href="/signup/language" />;
    }

    return <Redirect href="/signup/language" />;
}
