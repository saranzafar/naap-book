import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { verifyRecoveryOtp } from '../../services/authService';
import Toast from 'react-native-toast-message';

export default function OTPVerificationScreen({ route, navigation }: any) {
    const [otp, setOtp] = useState('');
    const [email] = useState(route.params?.email || '');

    const handleVerify = async () => {
        if (!otp) return Alert.alert('Error', 'Please enter the OTP.');
        try {
            await verifyRecoveryOtp(email, otp, 'signup');
            Toast.show({ type: 'success', text1: 'OTP verified successfully. Please set a new password.' });
            navigation.replace('ChangePassword');
        } catch (err: any) {
            Toast.show({ type: 'error', text1: 'Verification Failed. ', text2: err.message } );
        }
    };

    return (
        <View className="flex-1 bg-white px-6 justify-center">
            <Text className="text-3xl font-bold text-indigo-600 mb-1">Verify OTP</Text>
            <Text className="text-gray-500 mb-8">
                Enter the 6-digit code sent to your email.
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
                className="bg-indigo-600 rounded-2xl py-4 mt-6 active:opacity-80"
            >
                <Text className="text-center text-white font-semibold text-base">Verify</Text>
            </TouchableOpacity>
        </View>
    );
}
