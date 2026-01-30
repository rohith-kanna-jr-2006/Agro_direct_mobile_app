import { Stack } from 'expo-router';

export default function SignupLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="language" />
            <Stack.Screen name="role-selection" />
            <Stack.Screen name="farmer/login" />
            <Stack.Screen name="farmer/otp" />
            <Stack.Screen name="farmer/personal-details" />
            <Stack.Screen name="farmer/farm-details" />
            <Stack.Screen name="farmer/kyc" />
            <Stack.Screen name="buyer/registration" />
            <Stack.Screen name="buyer/profile" />
            <Stack.Screen name="buyer/preferences" />
        </Stack>
    );
}
