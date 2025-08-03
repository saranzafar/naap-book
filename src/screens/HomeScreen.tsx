import React from 'react';
import { useColorScheme } from 'react-native';
import { View, Text } from 'react-native';

const HomeScreen = () => {
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? 'dark' : '';

    return (
        <View className={`flex-1 items-center justify-center bg-white dark:bg-black ${theme}`}>
            <Text className="text-black dark:text">
                {scheme} mode active!
            </Text>
            <Text className="text-2xl font-bold text-blue-600">Hello from NaapBook</Text>
        </View>
    );
};

export default HomeScreen;