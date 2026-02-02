import { useLanguage } from '@/hooks/useLanguage';
import { fetchProfile } from '@/utils/api';
import { scheduleNotification } from '@/utils/notifications';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import { maybeCompleteAuthSession } from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const THEME_COLOR = '#4CAF50';
const BACKGROUND_COLOR = '#F5F5F5';

maybeCompleteAuthSession();

export default function HomeScreen() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  const redirectUri = makeRedirectUri({
    scheme: 'kisansmartapp',
  });

  console.log("Redirect URI:", redirectUri);

  // Google Auth Config
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '80509016220-jmf6jt7oedmudt2pti13vl28fkoetnbs.apps.googleusercontent.com',
    iosClientId: '80509016220-jmf6jt7oedmudt2pti13vl28fkoetnbs.apps.googleusercontent.com',
    androidClientId: '80509016220-jmf6jt7oedmudt2pti13vl28fkoetnbs.apps.googleusercontent.com',
    webClientId: '80509016220-jmf6jt7oedmudt2pti13vl28fkoetnbs.apps.googleusercontent.com',
    redirectUri,
  });

  // Local state for the onboarding flow
  const [step, setStep] = useState<'lang' | 'role' | 'auth' | 'forgot' | 'home'>('role');
  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer');

  // Auth State
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState(''); // Stores Phone or Email
  const [password, setPassword] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [profileName, setProfileName] = useState('');

  // Check for persistent login
  useEffect(() => {
    checkSession();
  }, []);

  // Fetch fresher profile data whenever the screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (userInfo && (userInfo.email || userInfo.id)) {
        // Use email if available (for logged in users), or 'guest' 
        const userId = userInfo.email || userInfo.id;
        // Only fetch if it's a real user (not necessarily guest, unless we want guest profiles)
        if (userId !== 'guest') {
          fetchProfile(userId, role).then(data => {
            if (data && data.name) {
              setProfileName(data.name);
            }
          });
        }
      }
    }, [userInfo, role])
  );

  const checkSession = async () => {
    try {
      const session = await AsyncStorage.getItem('current_user');
      const savedEmail = await AsyncStorage.getItem('user_email'); // Get the consistent email key

      if (session) {
        const user = JSON.parse(session);
        // Ensure we have the latest email if it was saved separately
        if (savedEmail && !user.email) user.email = savedEmail;

        setRole(user.role);
        setUserInfo(user);
        setStep('home');
      } else if (savedEmail) {
        // If we have a user_email but no full session object (e.g. from Google Login flow)
        setUserInfo({ email: savedEmail, name: await AsyncStorage.getItem('user_name') });
        setStep('home');
      } else {
        router.replace('/signup/language');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('current_user');
    setUserInfo(null);
    router.replace('/signup/language');
  };

  const handleForgotPassword = async () => {
    if (!identifier || !password) {
      Alert.alert("Error", "Please enter your email/phone and new password.");
      return;
    }

    try {
      const usersStr = await AsyncStorage.getItem('users');
      const users = usersStr ? JSON.parse(usersStr) : [];

      // Find user by phone OR email
      const userIndex = users.findIndex((u: any) => u.phone === identifier || u.email === identifier);

      if (userIndex !== -1) {
        // Update password
        users[userIndex].password = password;
        await AsyncStorage.setItem('users', JSON.stringify(users));
        Alert.alert("Success", "Password reset successfully! Please login with new password.");
        setStep('auth');
        setIsLogin(true); // Switch back to login mode
        setPassword(''); // Clear password field
      } else {
        Alert.alert("Error", "User not found with this email/phone.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to reset password.");
    }
  };

  const handleAuth = async () => {
    if (!identifier || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const usersStr = await AsyncStorage.getItem('users');
      const users = usersStr ? JSON.parse(usersStr) : [];

      if (isLogin) {
        // Login Logic: Check phone OR email
        const user = users.find((u: any) =>
          (u.phone === identifier || u.email === identifier) &&
          u.password === password &&
          u.role === role
        );
        if (user) {
          await AsyncStorage.setItem('current_user', JSON.stringify(user));
          setUserInfo(user);
          scheduleNotification("Welcome back!", `You have successfully logged in as a ${role}.`);
          setStep('home');
        } else {
          Alert.alert("Error", "Invalid credentials or role.");
        }
      } else {
        // Sign Up Logic
        const existing = users.find((u: any) => u.phone === identifier || u.email === identifier);
        if (existing) {
          Alert.alert("Error", "User already exists with this email/phone.");
          return;
        }

        const isEmail = identifier.includes('@');
        const newUser = {
          id: Date.now().toString(),
          phone: isEmail ? '' : identifier,
          email: isEmail ? identifier : '',
          password,
          role,
          name: role === 'farmer' ? 'New Farmer' : 'New Buyer'
        };

        users.push(newUser);
        await AsyncStorage.setItem('users', JSON.stringify(users));

        // Auto login after signup
        await AsyncStorage.setItem('current_user', JSON.stringify(newUser));
        setUserInfo(newUser);

        scheduleNotification("Welcome!", `Account created successfully.`);
        setStep('home');
      }
    } catch (e) {
      Alert.alert("Error", "Authentication failed");
      console.error(e);
    }
  };

  const switchAccount = async () => {
    const newRole = role === 'farmer' ? 'buyer' : 'farmer';
    setRole(newRole);
    const user = { ...userInfo, role: newRole };
    setUserInfo(user);
    await AsyncStorage.setItem('current_user', JSON.stringify(user));
    Alert.alert("Switched", `You are now viewing as a ${newRole}`);
  };

  // 1. Language Step
  if (step === 'lang') {
    const LANGUAGES = [
      { code: 'en', name: 'English', native: 'English' },
      { code: 'hi', name: 'Hindi', native: 'हिंदी' },
      { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
      { code: 'mr', name: 'Marathi', native: 'मराठी' },
      { code: 'te', name: 'Telugu', native: 'తెలుగు' },
      { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    ];

    const { width } = require('react-native').Dimensions.get('window');

    return (
      <View style={[styles.container, { backgroundColor: '#FFFFFF', paddingTop: 60 }]}>
        <View style={{ alignItems: 'center', marginBottom: 30, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#2C3E50', textAlign: 'center', marginBottom: 8 }}>
            Select Language / भाषा
          </Text>
          <Text style={{ fontSize: 16, color: '#7F8C8D', textAlign: 'center' }}>
            Choose your preferred language
          </Text>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {LANGUAGES.map((item) => (
              <TouchableOpacity
                key={item.code}
                style={{
                  backgroundColor: '#FFFFFF',
                  width: (width - 60) / 2,
                  borderRadius: 24,
                  paddingVertical: 24,
                  paddingHorizontal: 16,
                  alignItems: 'center',
                  marginBottom: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 4,
                  borderWidth: 1,
                  borderColor: language === item.code ? THEME_COLOR : '#F0F0F0',
                }}
                onPress={() => {
                  setLanguage(item.code as any);
                  setStep('role'); // Or 'home' if they came from home? 
                  // Ideally if previously logged in, go to home?
                  // But step='role' is a safe default for re-selection flow.
                  // If they were already on home, role selection allows them to 'reset' experience or just go back.
                  // Let's check if we have user info to decide next step.
                  if (userInfo) {
                    setStep('home');
                  } else {
                    setStep('role');
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: item.code === 'en' ? '#E3F2FD' : '#E8F5E9',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <Text style={{
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: item.code === 'en' ? '#1976D2' : '#2E7D32',
                  }}>
                    {item.native.charAt(0)}
                  </Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#212121', marginBottom: 4 }}>
                  {item.native}
                </Text>
                <Text style={{ fontSize: 14, color: '#9E9E9E', fontWeight: '500' }}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // 2. Role Step (New Landing Page)
  if (step === 'role') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Top Header with Language Option */}
        <View style={{ position: 'absolute', top: 50, left: 20, zIndex: 10 }}>
          <TouchableOpacity
            style={styles.langButtonSmall}
            onPress={() => setStep('lang')}
          >
            <Ionicons name="language" size={20} color={THEME_COLOR} />
            <Text style={styles.langButtonSmallText}>{language.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.centerContainer}>
          <Text style={styles.landingTitle}>{t.appName}</Text>
          <Text style={styles.landingSubtitle}>{t.selectRole}</Text>

          <TouchableOpacity style={[styles.roleButton, { backgroundColor: '#4CAF50' }]} onPress={() => { setRole('farmer'); setStep('auth'); }}>
            <Ionicons name="leaf" size={40} color="white" />
            <Text style={styles.roleButtonText}>{t.farmer}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.roleButton, { backgroundColor: '#2196F3' }]} onPress={() => { setRole('buyer'); setStep('auth'); }}>
            <Ionicons name="cart" size={40} color="white" />
            <Text style={styles.roleButtonText}>{t.buyer}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Forgot Password Step
  if (step === 'forgot') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, styles.centerContainer]}
      >
        <Text style={styles.title}>Reset Password</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email or Phone"
            keyboardType="email-address"
            autoCapitalize="none"
            value={identifier}
            onChangeText={setIdentifier}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.authButton} onPress={handleForgotPassword}>
          <Text style={styles.authButtonText}>Reset Password</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setStep('auth')} style={styles.switchAuth}>
          <Text style={styles.switchAuthText}>Back to Login</Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    );
  }

  // 3. Auth Step (Login/Signup)
  if (step === 'auth') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, styles.centerContainer]}
      >
        <TouchableOpacity style={{ position: 'absolute', top: 50, left: 20, zIndex: 10 }} onPress={() => setStep('role')}>
          <Ionicons name="arrow-back" size={30} color={THEME_COLOR} />
        </TouchableOpacity>

        <Text style={styles.title}>{isLogin ? t.login : t.signup}</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email or Phone"
            keyboardType="email-address"
            autoCapitalize="none"
            value={identifier}
            onChangeText={setIdentifier}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t.password}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {isLogin && (
          <TouchableOpacity onPress={() => { setStep('forgot'); setPassword(''); }} style={{ alignSelf: 'flex-end', marginBottom: 20 }}>
            <Text style={{ color: THEME_COLOR, fontWeight: 'bold' }}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
          <Text style={styles.authButtonText}>{t.submit}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.authButton, styles.googleButton]} onPress={() => promptAsync()}>
          <Ionicons name="logo-google" size={20} color="white" style={{ marginRight: 10 }} />
          <Text style={styles.authButtonText}>{t.googleSignIn}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchAuth}>
          <Text style={styles.switchAuthText}>
            {isLogin ? t.noAccount : t.hasAccount} <Text style={{ fontWeight: 'bold', color: THEME_COLOR }}>{isLogin ? t.signup : t.login}</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={async () => {
          const guestUser = { name: 'Guest User', role: role, id: 'guest' };
          setUserInfo(guestUser);
          await AsyncStorage.setItem('current_user', JSON.stringify(guestUser));
          setStep('home');
          scheduleNotification("Welcome Guest", "You are exploring in Guest Mode.");
        }}>
          <Text style={styles.guestText}>Continue as Guest</Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    );
  }

  // 4. Home Dashboard Helper Logic
  const allFeatures = [
    { id: 'Scan', title: t.plantHealth, icon: 'scan-outline', route: '/scanner', color: '#66BB6A', roles: ['farmer'] },
    { id: 'Sun', title: t.sunlight, icon: 'sunny-outline', route: '/sunlight', color: '#FFA726', roles: ['farmer'] },
    { id: 'Light', title: t.cropGuidance, icon: 'flashlight-outline', route: '/guidance', color: '#29B6F6', roles: ['farmer'] },
    { id: 'AddProd', title: t.submitProd, icon: 'add-circle-outline', route: '/add-product', color: '#EF5350', roles: ['farmer'] },
    { id: 'MyProds', title: t.myProducts, icon: 'list-outline', route: '/my-products', color: '#5C6BC0', roles: ['farmer'] },
    { id: 'Analytics', title: t.analytics, icon: 'bar-chart-outline', route: '/analytics', color: '#8D6E63', roles: ['farmer'] },
    { id: 'Profile', title: t.profile, icon: 'person-outline', route: '/profile', color: '#78909C', roles: ['farmer', 'buyer'] },
    { id: 'Market', title: t.marketplace, icon: 'cart-outline', route: '/marketplace', color: '#AB47BC', roles: ['buyer'] },
    // { id: 'Orders', title: t.myOrders || "My Orders", icon: 'receipt-outline', route: '/orders', color: '#7E57C2', roles: ['buyer'] },
    // Ensure "Orders" is visible for Farmer too if they get orders? Or "My Sales"? 
    // For now keeping strict to existing logic but adding Orders for Farmer could be good later.
    { id: 'Orders', title: t.myOrders || "My Orders", icon: 'receipt-outline', route: '/orders', color: '#7E57C2', roles: ['buyer'] },
  ];

  const features = allFeatures.filter(f => f.roles.includes(role));

  const handleNavigation = (route: string) => {
    if (userInfo?.id === 'guest') {
      const restrictedRoutes = ['/profile', '/add-product', '/my-products', '/analytics', '/orders'];
      if (restrictedRoutes.includes(route)) {
        Alert.alert(
          "Guest Mode Restricted",
          "Please Login or Signup to access this feature.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Login / Signup",
              onPress: () => {
                setStep('auth');
              }
            }
          ]
        );
        return;
      }
    }
    router.push({ pathname: route as any, params: { lang: language, role: role } });
  };

  // 4. Home Dashboard
  if (step === 'home') {
    const isFarmer = role === 'farmer';

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Dashboard Header */}
        <View style={[styles.header, { height: 'auto', paddingBottom: 30, borderRadius: 0, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Welcome Back,</Text>
              <Text style={styles.headerTitle}>{profileName || userInfo?.name || "Farmer"}</Text>
            </View>
            <TouchableOpacity onPress={logout} style={{ padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 }}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Quick Stats (Empty State for fresh login) */}
          {isFarmer && (
            <View style={{ flexDirection: 'row', marginTop: 25, justifyContent: 'space-between', width: '100%' }}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Sales</Text>
                <Text style={styles.statValue}>₹0</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Active Crops</Text>
                <Text style={styles.statValue}>0</Text>
              </View>
            </View>
          )}
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {/* Conditional Content based on Role */}
          {isFarmer ? (
            <>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 }}>Your Farm Tools</Text>
              <View style={styles.gridContainer}>
                {features.map((item: any) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.gridItem, { backgroundColor: item.color, width: '48%', height: 140 }]}
                    onPress={() => handleNavigation(item.route)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={item.icon as any} size={32} color="white" />
                    <Text style={[styles.gridLabel, { fontSize: 14 }]}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.gridContainer}>
              {features.map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.gridItem, { backgroundColor: item.color, width: '48%' }]}
                  onPress={() => handleNavigation(item.route)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={item.icon as any} size={40} color="white" />
                  <Text style={styles.gridLabel}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* FAB - Main Action: Add First Crop */}
        {isFarmer && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => handleNavigation('/add-product')}
          >
            <Ionicons name="add" size={32} color="white" />
            <Text style={styles.fabText}>Add Your First Crop</Text>
          </TouchableOpacity>
        )}

      </SafeAreaView>
    );
  }

  // Fallback (Should typically not reach here if step logic is sound)
  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND_COLOR },
  centerContainer: { alignItems: 'center', justifyContent: 'center', flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },

  langButton: { width: '100%', padding: 20, backgroundColor: 'white', marginBottom: 15, borderRadius: 15, alignItems: 'center', elevation: 3 },
  langButtonText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  roleButton: { width: '100%', padding: 30, marginBottom: 20, borderRadius: 20, alignItems: 'center', elevation: 5 },
  roleButtonText: { fontSize: 22, fontWeight: 'bold', color: 'white', marginTop: 10 },

  // Auth Styles
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', width: '100%', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16 },
  authButton: { width: '100%', padding: 15, backgroundColor: THEME_COLOR, borderRadius: 10, alignItems: 'center', marginTop: 10, elevation: 3 },
  googleButton: { backgroundColor: '#DB4437', flexDirection: 'row', justifyContent: 'center' },
  authButtonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  switchAuth: { marginTop: 20 },
  switchAuthText: { color: '#666', fontSize: 16 },

  header: { padding: 24, paddingTop: 60, backgroundColor: THEME_COLOR, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center', position: 'relative' },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: 'white' },
  headerSubtitle: { fontSize: 16, color: '#E8F5E9', marginTop: 5 },
  langSwitch: { position: 'absolute', top: 50, right: 20 },

  scrollContent: { paddingBottom: 20 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, justifyContent: 'space-between', marginTop: 20 },
  gridItem: { width: '48%', height: 160, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2 },
  gridLabel: { color: 'white', marginTop: 12, fontWeight: 'bold', fontSize: 16, textAlign: 'center', paddingHorizontal: 5 },

  // New Landing Styles
  landingTitle: { fontSize: 36, fontWeight: '900', color: THEME_COLOR, marginBottom: 10, textAlign: 'center', letterSpacing: 1 },
  landingSubtitle: { fontSize: 18, color: '#666', marginBottom: 40, textAlign: 'center' },
  langButtonSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 8, paddingHorizontal: 12, borderRadius: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2 },
  langButtonSmallText: { marginLeft: 5, fontWeight: 'bold', color: THEME_COLOR },
  guestText: { marginTop: 20, fontSize: 16, color: '#666', textDecorationLine: 'underline' },

  // New Dashboard Stats
  statCard: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 15, borderRadius: 15, width: '48%', alignItems: 'center' },
  statLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 5 },
  statValue: { color: 'white', fontSize: 24, fontWeight: 'bold' },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: THEME_COLOR,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  fabText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});
