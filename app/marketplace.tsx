import { TRANSLATIONS } from '@/constants/translations';
import { fetchProducts } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Removed Mock Data
// const MARKETPLACE_ITEMS = ... 


const THEME_COLOR = '#4CAF50';

export default function MarketplaceScreen() {
    const params = useLocalSearchParams();
    const lang = (params.lang as keyof typeof TRANSLATIONS) || 'en';
    const t = TRANSLATIONS[lang];

    const [userInfo, setUserInfo] = useState<any>(null);

    useFocusEffect(
        useCallback(() => {
            loadMarketItems();
            loadUser();
        }, [])
    );

    const loadUser = async () => {
        try {
            const userStr = await AsyncStorage.getItem('current_user');
            if (userStr) {
                setUserInfo(JSON.parse(userStr));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const [marketItems, setMarketItems] = useState<any[]>([]);

    const loadMarketItems = async () => {
        try {
            const products = await fetchProducts();
            if (Array.isArray(products)) {
                setMarketItems(products);
            } else {
                setMarketItems([]);
            }
        } catch (e) {
            console.error(e);
            setMarketItems([]);
        }
    };

    const [messages, setMessages] = useState([
        { id: 1, text: "Is available?", sender: "buyer" },
        { id: 2, text: "Yes.", sender: "system" }
    ]);
    const [input, setInput] = useState("");

    const sendMessage = () => {
        if (!input.trim()) return;
        setMessages([...messages, { id: Date.now(), text: input, sender: "buyer" }]);
        setInput("");
        setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "OK.", sender: "system" }]);
        }, 1000);
    };

    const router = useRouter();

    const placeOrder = (item: any) => {
        if (userInfo?.id === 'guest') {
            // Use React Native Alert
            const { Alert } = require('react-native');
            Alert.alert(
                "Guest Mode Restricted",
                "You cannot place orders in Guest Mode. Please login.",
                [
                    { text: "OK" }
                ]
            );
            return;
        }

        router.push({
            pathname: '/checkout',
            params: {
                id: item._id || item.id,
                name: item.name,
                price: item.price,
                farmerName: item.farmerName,
                farmerContact: item.farmerContact,
                farmerAddress: item.farmerAddress,
                rating: item.rating,
                lang
            }
        });
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.sectionHeader}>{t.marketTitle}</Text>
            <View style={styles.marketGrid}>
                {marketItems.length === 0 ? (
                    <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>No products available in the market.</Text>
                ) : (
                    marketItems.map((item) => (
                        <View key={item._id || item.id} style={styles.marketCard}>
                            <Image source={{ uri: item.image }} style={styles.marketImage} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.marketName}>{item.name}</Text>
                                <Text style={styles.marketPrice}>{item.price}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.orderButton, userInfo?.id === 'guest' && { backgroundColor: '#ccc' }]}
                                onPress={() => placeOrder(item)}
                            >
                                <Text style={styles.orderButtonText}>{userInfo?.id === 'guest' ? "Login to Order" : t.placeOrder}</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </View>

            <Text style={styles.sectionHeader}>{t.chat}</Text>
            <View style={styles.chatContainer}>
                <View style={styles.chatList}>
                    {messages.map((msg) => (
                        <View key={msg.id} style={[styles.messageBubble, msg.sender === 'buyer' ? styles.myMsg : styles.sysMsg]}>
                            <Text style={msg.sender === 'buyer' ? styles.myMsgText : styles.sysMsgText}>{msg.text}</Text>
                        </View>
                    ))}
                </View>
                <View style={styles.chatInputRow}>
                    <TextInput
                        style={styles.chatInput}
                        value={input}
                        onChangeText={setInput}
                        placeholder={t.typeMsg}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                        <Ionicons name="send" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    sectionHeader: { fontSize: 22, fontWeight: 'bold', marginLeft: 20, marginTop: 20, marginBottom: 10, color: '#333' },
    marketGrid: { paddingHorizontal: 10 },
    marketCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 15, marginHorizontal: 10, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
    marketImage: { width: 60, height: 60, marginRight: 15 },
    marketName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    marketPrice: { fontSize: 16, color: THEME_COLOR, fontWeight: 'bold', marginTop: 4 },
    orderButton: { backgroundColor: THEME_COLOR, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, minWidth: 100, alignItems: 'center' },
    orderButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    chatContainer: { backgroundColor: 'white', margin: 20, borderRadius: 20, padding: 15, height: 300, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
    chatList: { flex: 1 },
    messageBubble: { padding: 10, borderRadius: 15, marginBottom: 10, maxWidth: '80%' },
    myMsg: { backgroundColor: THEME_COLOR, alignSelf: 'flex-end', borderBottomRightRadius: 2 },
    sysMsg: { backgroundColor: '#F0F0F0', alignSelf: 'flex-start', borderBottomLeftRadius: 2 },
    myMsgText: { color: 'white' },
    sysMsgText: { color: '#333' },
    chatInputRow: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
    chatInput: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10 },
    sendButton: { backgroundColor: THEME_COLOR, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
});
