import { TRANSLATIONS } from '@/constants/translations';
import { fetchAnalytics } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const THEME_COLOR = '#4CAF50';
const BACKGROUND_COLOR = '#F5F5F5';

export default function AnalyticsScreen() {
    const params = useLocalSearchParams();
    const lang = (params.lang as keyof typeof TRANSLATIONS) || 'en';
    const t = TRANSLATIONS[lang];

    const [analytics, setAnalytics] = useState<any>(null);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const data = await fetchAnalytics();
            if (data) {
                setAnalytics(data);
            }
        } catch (e) {
            console.error("Failed to load analytics", e);
        }
    };

    if (!analytics) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Loading Analytics...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>{t.analytics}</Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>{t.revenue}</Text>
                <Text style={styles.bigNumber}>₹{(analytics.revenue || 0).toLocaleString()}</Text>
                <Text style={styles.trend}>Total Revenue</Text>
            </View>

            <View style={styles.row}>
                <View style={[styles.card, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.cardTitle}>{t.sales}</Text>
                    <View style={styles.iconRow}>
                        <Ionicons name="cart" size={30} color={THEME_COLOR} />
                        <Text style={styles.midNumber}>{analytics.sales}</Text>
                    </View>
                </View>
                <View style={[styles.card, { flex: 1, marginLeft: 10 }]}>
                    <Text style={styles.cardTitle}>Avg Rating</Text>
                    <View style={styles.iconRow}>
                        <Ionicons name="star" size={30} color="#FFA726" />
                        <Text style={styles.midNumber}>{analytics.averageRating}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Top Product</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>
                    {analytics.topProduct !== 'None' ? analytics.topProduct : "No sales yet"}
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>💡 AI/Data Science Suggestions</Text>
                {analytics.suggestions && analytics.suggestions.length > 0 ? (
                    analytics.suggestions.map((s: string, index: number) => (
                        <View key={index} style={{ flexDirection: 'row', marginTop: 10 }}>
                            <Text style={{ marginRight: 10 }}>•</Text>
                            <Text style={{ fontSize: 16, color: '#333', lineHeight: 22 }}>{s}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={{ fontStyle: 'italic', marginTop: 10 }}>No suggestions available yet.</Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BACKGROUND_COLOR, padding: 20 },
    header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    card: { backgroundColor: 'white', padding: 20, borderRadius: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, elevation: 3 },
    row: { flexDirection: 'row', marginBottom: 0 },
    cardTitle: { fontSize: 16, color: '#666', fontWeight: '600', marginBottom: 10 },
    bigNumber: { fontSize: 36, fontWeight: 'bold', color: '#333' },
    midNumber: { fontSize: 28, fontWeight: 'bold', color: '#333', marginLeft: 10 },
    trend: { color: '#4CAF50', marginTop: 5, fontWeight: 'bold' },
    iconRow: { flexDirection: 'row', alignItems: 'center' },
    chartPlaceholder: { height: 150, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 10 },
    bar: { width: 30, backgroundColor: '#E0E0E0', borderRadius: 5 }
});
