import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { supabase } from '../../services/supabaseClient';
import Toast from 'react-native-toast-message';
import { LogOut, User, Eye, EyeOff } from 'lucide-react-native';
import { updatePassword } from '../../services/authService';

export default function ProfileScreen({ navigation }: any) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data, error } = await supabase.auth.getUser();
                if (error) throw error;
                setUser(data?.user);
            } catch (err: any) {
                console.error('Failed to fetch user:', err);
                Toast.show({ type: 'error', text1: 'Error fetching user info' });
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // Handle password change
    const handleChangePassword = async () => {
        if (!password || !confirm) {
            Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please enter both fields.' });
            return;
        }
        if (password !== confirm) {
            Toast.show({ type: 'error', text1: 'Password Mismatch', text2: 'Passwords do not match.' });
            return;
        }

        setUpdating(true);
        try {
            await updatePassword(password);
            Toast.show({ type: 'success', text1: 'Password Updated', text2: 'You’ll need to log in again.' });
            await supabase.auth.signOut();
            navigation.replace('Login');
        } catch (err: any) {
            console.error('Password update failed:', err);
            Toast.show({ type: 'error', text1: 'Update Failed', text2: err.message });
        } finally {
            setUpdating(false);
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            Toast.show({ type: 'info', text1: 'Logged Out' });
            navigation.replace('Login');
        } catch (err: any) {
            Toast.show({ type: 'error', text1: 'Logout Failed', text2: err.message });
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-900">
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-white dark:bg-zinc-900 px-6 py-10"
        >
            {/* Header */}
            <View className="items-center mb-8">
                <View className="bg-indigo-100 dark:bg-indigo-900 p-5 rounded-full mb-4">
                    <User size={40} color="#4f46e5" />
                </View>
                <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {user?.user_metadata?.name || 'User'}
                </Text>
                <Text className="text-zinc-500 dark:text-zinc-400 mt-1">
                    {user?.email || 'No email available'}
                </Text>
            </View>

            {/* Account Info */}
            <View className="mb-8">
                <Text className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                    Account Details
                </Text>
                <View className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                    <Text className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">User ID</Text>
                    <Text numberOfLines={1} selectable className="text-zinc-800 dark:text-zinc-100 text-[13px]">
                        {user?.id}
                    </Text>
                </View>
            </View>

            {/* Password Section */}
            <View>
                <Text className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
                    Change Password
                </Text>

                {/* New Password Field */}
                <View className="relative mb-3">
                    <TextInput
                        placeholder="New Password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                        className="border border-gray-300 dark:border-zinc-700 rounded-2xl p-4 text-base text-zinc-900 dark:text-zinc-100 pr-12"
                        value={password}
                        onChangeText={setPassword}
                    />
                    <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4"
                        hitSlop={10}
                    >
                        {showPassword ? <EyeOff size={22} color="#9CA3AF" /> : <Eye size={22} color="#9CA3AF" />}
                    </Pressable>
                </View>

                {/* Confirm Password Field */}
                <View className="relative">
                    <TextInput
                        placeholder="Confirm Password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showConfirm}
                        className="border border-gray-300 dark:border-zinc-700 rounded-2xl p-4 text-base text-zinc-900 dark:text-zinc-100 pr-12"
                        value={confirm}
                        onChangeText={setConfirm}
                    />
                    <Pressable
                        onPress={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-4"
                        hitSlop={10}
                    >
                        {showConfirm ? <EyeOff size={22} color="#9CA3AF" /> : <Eye size={22} color="#9CA3AF" />}
                    </Pressable>
                </View>

                <TouchableOpacity
                    onPress={handleChangePassword}
                    disabled={updating}
                    className={`rounded-2xl py-4 mt-4 ${updating ? 'bg-indigo-400' : 'bg-indigo-600 active:opacity-80'
                        }`}
                >
                    {updating ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-center text-white font-semibold text-base">
                            Change Password
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Logout */}
            <TouchableOpacity
                onPress={handleLogout}
                className="flex-row items-center justify-center mt-10 py-3 border border-red-300 dark:border-red-800 rounded-2xl active:opacity-80"
            >
                <LogOut size={18} color="#ef4444" />
                <Text className="text-red-600 dark:text-red-400 ml-2 font-semibold">Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
