import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { supabase } from '../../services/supabaseClient';

export default function OTPVerificationScreen({ route, navigation }: any) {
    const [otp, setOtp] = useState('');
    const [email] = useState(route.params?.email || '');
    const [context] = useState(route.params?.context || 'signup');
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (!otp.trim()) {
            return Toast.show({
                type: 'error',
                text1: 'Missing Code',
                text2: 'Please enter the 6-digit OTP sent to your email.',
            });
        }

        setLoading(true);
        try {
            const type = context === 'passwordRecovery' ? 'recovery' : 'signup';

            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type,
            });

            if (error) throw error;

            if (type === 'signup') {
                Toast.show({
                    type: 'success',
                    text1: 'Account Verified',
                    text2: 'You can now log in to your account.',
                });
                navigation.replace('Login');
            } else {
                Toast.show({
                    type: 'success',
                    text1: 'OTP Verified',
                    text2: 'Please set your new password.',
                });
                navigation.replace('Home', { email, context: 'passwordRecovery' });
            }
        } catch (err: any) {
            console.error('OTP verification failed:', err);
            Toast.show({
                type: 'error',
                text1: 'Verification Failed',
                text2: err.message || 'The OTP you entered is invalid or expired.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white dark:bg-zinc-950 px-6 justify-center">
            {/* Header */}
            <Text className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                {context === 'passwordRecovery' ? 'Reset Password' : 'Verify OTP'}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 mb-8">
                Enter the 6-digit code sent to{' '}
                <Text className="font-semibold text-gray-700 dark:text-gray-300">{email}</Text>.
            </Text>

            {/* OTP Input */}
            <TextInput
                placeholder="Enter OTP"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={6}
                className="border border-gray-300 dark:border-zinc-700 rounded-2xl p-4 text-center text-lg tracking-widest text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900"
                value={otp}
                onChangeText={setOtp}
            />

            {/* Verify Button */}
            <TouchableOpacity
                onPress={handleVerify}
                disabled={loading}
                className={`rounded-2xl py-4 mt-6 ${loading
                    ? 'bg-indigo-400'
                    : 'bg-indigo-600 active:opacity-80'
                    }`}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text className="text-center text-white font-semibold text-base">
                        Verify
                    </Text>
                )}
            </TouchableOpacity>

            {/* Navigation Option */}
            {context === 'signup' ? (
                <View className="flex-row justify-center mt-10">
                    <Text className="text-gray-600 dark:text-gray-400">
                        Already verified?{' '}
                    </Text>
                    <TouchableOpacity onPress={() => navigation.replace('Login')}>
                        <Text className="text-indigo-600 dark:text-indigo-400 font-semibold">
                            Log in
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : null}
        </View>
    );
}
