import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { updatePassword } from '../../services/authService';

export default function ChangePasswordScreen({ navigation }: any) {
    const [newPassword, setNewPassword] = useState('');

    const handleChange = async () => {
        try {
            await updatePassword(newPassword);
            Alert.alert('Success', 'Password updated successfully.');
            navigation.replace('Login');
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
    };

    return (
        <View className="flex-1 bg-white px-6 justify-center">
            <Text className="text-3xl font-bold text-indigo-600 mb-1">Change Password</Text>
            <Text className="text-gray-500 mb-8">
                Enter a new password to secure your account.
            </Text>

            <TextInput
                placeholder="New Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                className="border border-gray-300 rounded-2xl p-4 text-base mb-6"
                value={newPassword}
                onChangeText={setNewPassword}
            />

            <TouchableOpacity
                onPress={handleChange}
                className="bg-indigo-600 rounded-2xl py-4 active:opacity-80"
            >
                <Text className="text-center text-white font-semibold text-base">
                    Update Password
                </Text>
            </TouchableOpacity>
        </View>
    );
}
