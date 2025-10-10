import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Pressable,
    ActivityIndicator,
} from 'react-native';
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
        if (loading) return;
        setLoading(true);

        try {
            await signUp(name, email, password);
            Toast.show({
                type: 'success',
                text1: 'Account Created',
                text2: 'An OTP has been sent to your email for verification.',
            });
            navigation.replace('OTPVerification', { email, context: 'signup' });
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: 'Signup Failed',
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
                Create Account
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 mb-8">
                Start your adventure with us
            </Text>

            {/* Form */}
            <View className="flex gap-3">
                {/* Full Name */}
                <TextInput
                    placeholder="Full Name"
                    placeholderTextColor="#9CA3AF"
                    className="border border-gray-300 dark:border-zinc-700 rounded-2xl p-4 text-base text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900"
                    value={name}
                    onChangeText={setName}
                />

                {/* Email */}
                <TextInput
                    placeholder="Email"
                    placeholderTextColor="#9CA3AF"
                    className="border border-gray-300 dark:border-zinc-700 rounded-2xl p-4 text-base text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                {/* Password */}
                <View className="relative">
                    <TextInput
                        placeholder="Password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                        className="border border-gray-300 dark:border-zinc-700 rounded-2xl p-4 text-base pr-12 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900"
                        value={password}
                        onChangeText={setPassword}
                    />
                    <Pressable
                        onPress={() => setShowPassword(!showPassword)}
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

                {/* Signup Button */}
                <TouchableOpacity
                    onPress={handleSignup}
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
                            Sign Up
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Redirect to Login */}
            <View className="flex-row justify-center mt-10">
                <Text className="text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        Login
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
