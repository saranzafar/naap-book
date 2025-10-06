import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { login } from '../../services/authService';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            await login(email, password);
            navigation.replace('Home');
        } catch (err: any) {
            Alert.alert('Login Failed', err.message);
        }
    };

    return (
        <View className="flex-1 bg-white px-6 justify-center">
            <Text className="text-3xl font-bold text-indigo-600 mb-1">Welcome Back</Text>
            <Text className="text-gray-500 mb-8">Login to continue your journey</Text>

            <View className="flex gap-2">
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
                    onPress={handleLogin}
                    className="bg-indigo-600 rounded-2xl py-4 mt-2 active:opacity-80"
                >
                    <Text className="text-center text-white font-semibold text-base">
                        Login
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('ForgetPassword')}>
                    <Text className="text-center text-indigo-500 mt-3">Forgot Password?</Text>
                </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-10">
                <Text className="text-gray-600">Don’t have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <Text className="text-indigo-600 font-semibold">Sign up</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
