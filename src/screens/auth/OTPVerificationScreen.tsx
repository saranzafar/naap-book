import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { supabase } from '../../services/supabaseClient';

export default function OTPVerificationScreen({ route, navigation }: any) {
    const [otp, setOtp] = useState('');
    const [email] = useState(route.params?.email || '');
    const [context] = useState(route.params?.context || 'signup');
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (!otp) return Toast.show({ type: 'error', text1: 'Please enter the OTP.' });

        setLoading(true);
        try {
            // Determine verification type dynamically
            const type = context === 'passwordRecovery' ? 'recovery' : 'signup';

            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type,
            });

            if (error) throw error;

            if (type === 'signup') {
                Toast.show({ type: 'success', text1: 'Account Verified', text2: 'You can now log in.' });
                navigation.replace('Login');
            } else {
                Toast.show({ type: 'success', text1: 'OTP verified', text2: 'Please set your new password.' });
                navigation.replace('ChangePassword');
            }
        } catch (err: any) {
            console.error('OTP verification failed:', err);
            Toast.show({ type: 'error', text1: 'Verification Failed', text2: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white px-6 justify-center">
            <Text className="text-3xl font-bold text-indigo-600 mb-1">
                {context === 'passwordRecovery' ? 'Reset Password' : 'Verify OTP'}
            </Text>
            <Text className="text-gray-500 mb-8">
                Enter the 6-digit code sent to your email: {email}
            </Text>

            <TextInput
                placeholder="Enter OTP"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                className="border border-gray-300 rounded-2xl p-4 text-center text-base tracking-widest"
                value={otp}
                onChangeText={setOtp}
            />

            <TouchableOpacity
                onPress={handleVerify}
                disabled={loading}
                className={`rounded-2xl py-4 mt-6 ${loading ? 'bg-indigo-400' : 'bg-indigo-600 active:opacity-80'
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
        </View>
    );
}
