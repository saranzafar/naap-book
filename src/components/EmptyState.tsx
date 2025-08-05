import React from "react";
import { View, Text } from "react-native";
import HomeEmptyStateIcon from "./HomeEmptyStateIcon";

export default function EmptyState({ message }: { message: string }) {
    return (
        <View className="flex-1 items-center justify-center mt-24">
            <HomeEmptyStateIcon />
            <Text className="text-gray-400 text-base mt-4">{message}</Text>
        </View>
    );
}
