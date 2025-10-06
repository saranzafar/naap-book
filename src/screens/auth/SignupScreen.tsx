import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
import { signUp } from '../../services/authService';
import Toast from 'react-native-toast-message';
import { Eye, EyeOff } from 'lucide-react-native';

export default function SignupScreen({ navigation }: any) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (loading) return; // prevent duplicate presses
        setLoading(true);

        try {
            await signUp(name, email, password);
            Toast.show({
                type: 'success',
                text1: 'Account Created',
                text2: 'An OTP has been sent to your email.',
            });
            navigation.replace('OTPVerification', { email, context: 'signup' });
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: 'Signup Failed',
                text2: err.message,
            });
        } finally {
            setLoading(false); // 👈 reset loading
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

                {/* Password with eye toggle */}
                <View className="relative">
                    <TextInput
                        placeholder="Password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                        className="border border-gray-300 rounded-2xl p-4 text-base pr-12"
                        value={password}
                        onChangeText={setPassword}
                    />
                    <Pressable
                        onPress={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-4"
                        hitSlop={10}
                    >
                        {showPassword ? (
                            <EyeOff size={22} color="#9CA3AF" />
                        ) : (
                            <Eye size={22} color="#9CA3AF" />
                        )}
                    </Pressable>
                </View>

                {/* Signup button */}
                <TouchableOpacity
                    onPress={handleSignup}
                    disabled={loading}
                    className={`rounded-2xl py-4 mt-2 ${loading ? 'bg-indigo-400' : 'bg-indigo-600 active:opacity-80'
                        }`}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-center text-white font-semibold text-base">
                            Sign Up
                        </Text>
                    )}
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
