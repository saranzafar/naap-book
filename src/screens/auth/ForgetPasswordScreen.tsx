import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { resetPassword } from '../../services/authService';
import Toast from 'react-native-toast-message';

export default function ForgetPasswordScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        if (loading) return;
        setLoading(true);

        try {
            await resetPassword(email);
            Toast.show({
                type: 'success',
                text1: 'OTP Sent',
                text2: 'Check your email for the verification code.',
            });
            navigation.navigate('OTPVerification', { email, context: 'passwordRecovery' });
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: 'Failed to Send OTP',
                text2: err.message || 'Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white dark:bg-zinc-950 px-6 justify-center">
            {/* Header */}
            <Text className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                Forgot Password?
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 mb-8">
                Enter your email address to receive a verification code.
            </Text>

            {/* Input */}
            <TextInput
                placeholder="Email Address"
                placeholderTextColor="#9CA3AF"
                className="border border-gray-300 dark:border-zinc-700 rounded-2xl p-4 text-base text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 mb-4"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            {/* Button */}
            <TouchableOpacity
                onPress={handleSendOtp}
                disabled={loading}
                className={`rounded-2xl py-4 mt-2 ${loading
                        ? 'bg-indigo-400'
                        : 'bg-indigo-600 active:opacity-80'
                    }`}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text className="text-center text-white font-semibold text-base">
                        Send OTP
                    </Text>
                )}
            </TouchableOpacity>

            {/* Redirect */}
            <View className="flex-row justify-center mt-10">
                <Text className="text-gray-600 dark:text-gray-400">
                    Remember your password?{' '}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        Log in
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
