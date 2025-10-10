import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import { updatePassword } from '../../services/authService';
import Toast from 'react-native-toast-message';
import { Eye, EyeOff } from 'lucide-react-native';

export default function ChangePasswordScreen({ navigation }: any) {
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = async () => {
        if (loading) return;
        setLoading(true);

        try {
            await updatePassword(newPassword);
            Toast.show({
                type: 'success',
                text1: 'Password Updated',
                text2: 'Your password has been changed successfully.',
            });
            navigation.replace('Login');
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: 'Update Failed',
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
                Change Password
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 mb-8">
                Enter a new password to secure your account.
            </Text>

            {/* Password Field */}
            <View className="relative">
                <TextInput
                    placeholder="New Password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    className="border border-gray-300 dark:border-zinc-700 rounded-2xl p-4 text-base pr-12 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 mb-4"
                    value={newPassword}
                    onChangeText={setNewPassword}
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

            {/* Update Button */}
            <TouchableOpacity
                onPress={handleChange}
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
                        Update Password
                    </Text>
                )}
            </TouchableOpacity>

            {/* Back to Login */}
            <View className="flex-row justify-center mt-10">
                <Text className="text-gray-600 dark:text-gray-400">
                    Want to go back?{' '}
                </Text>
                <TouchableOpacity onPress={() => navigation.replace('Login')}>
                    <Text className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        Log in
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
