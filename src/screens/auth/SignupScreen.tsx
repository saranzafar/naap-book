import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { signUp } from '../../services/authService';
import Toast from 'react-native-toast-message';

export default function SignupScreen({ navigation }: any) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async () => {
        try {
            await signUp(name, email, password);
            Toast.show({ type: 'success', text1: 'Account Created', text2: 'An OTP has been sent to your email.' });
            navigation.replace('OTPVerification', { email });
        } catch (err: any) {
            Toast.show({ type: 'error', text1: 'Signup Failed. ', text2: err.message });
        }
    };

    return (
        <View className="flex-1 bg-white px-6 justify-center">
            <Text className="text-3xl font-bold text-indigo-600 mb-1">Create Account</Text>
            <Text className="text-gray-500 mb-8">Start your adventure with us</Text>

            <View className="flex gap-2">
                <TextInput
                    placeholder="Full Name"
                    placeholderTextColor="#9CA3AF"
                    className="border border-gray-300 rounded-2xl p-4 text-base"
                    value={name}
                    onChangeText={setName}
                />

                <TextInput
                    placeholder="Email"
                    placeholderTextColor="#9CA3AF"
                    className="border border-gray-300 rounded-2xl p-4 text-base"
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    className="border border-gray-300 rounded-2xl p-4 text-base"
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    onPress={handleSignup}
                    className="bg-indigo-600 rounded-2xl py-4 mt-2 active:opacity-80"
                >
                    <Text className="text-center text-white font-semibold text-base">
                        Sign Up
                    </Text>
                </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-10">
                <Text className="text-gray-600">Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text className="text-indigo-600 font-semibold">Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
