import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { resetPassword } from '../../services/authService';

export default function ForgetPasswordScreen({ navigation }: any) {
    const [email, setEmail] = useState('');

    const handleSendOtp = async () => {
        try {
            await resetPassword(email);
            Alert.alert('Check your email', 'A reset OTP has been sent to your inbox.');
            navigation.navigate('OTPVerification', { email });
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
    };

    return (
        <View className="flex-1 bg-white px-6 justify-center">
            <Text className="text-3xl font-bold text-indigo-600 mb-1">Forgot Password?</Text>
            <Text className="text-gray-500 mb-8">
                Enter your email to receive a verification code.
            </Text>

            <TextInput
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                className="border border-gray-300 rounded-2xl p-4 text-base mb-6"
                value={email}
                onChangeText={setEmail}
            />

            <TouchableOpacity
                onPress={handleSendOtp}
                className="bg-indigo-600 rounded-2xl py-4 active:opacity-80"
            >
                <Text className="text-center text-white font-semibold text-base">
                    Send OTP
                </Text>
            </TouchableOpacity>
            <View className="flex-row justify-center mt-10">
                <Text className="text-gray-600">Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text className="text-indigo-600 font-semibold">Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
