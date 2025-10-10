import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import { login } from '../../services/authService';
import Toast from 'react-native-toast-message';
import { Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (loading) return;
        setLoading(true);

        try {
            await login(email, password);
            Toast.show({
                type: 'success',
                text1: 'Login Successful',
                text2: 'Welcome back!',
            });
            navigation.replace('Home');
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: 'Login Failed',
                text2: err.message || 'Please check your credentials and try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white dark:bg-zinc-950 px-6 justify-center">
            {/* Header */}
            <Text className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                Welcome Back
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 mb-8">
                Login to continue your journey
            </Text>

            {/* Form */}
            <View className="flex gap-3">
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

                {/* Login Button */}
                <TouchableOpacity
                    onPress={handleLogin}
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
                            Login
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Forgot password */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('ForgetPassword')}
                    className="mt-3"
                >
                    <Text className="text-center text-indigo-500 dark:text-indigo-400">
                        Forgot Password?
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Signup redirect */}
            <View className="flex-row justify-center mt-10">
                <Text className="text-gray-600 dark:text-gray-400">
                    Don’t have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <Text className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        Sign up
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
