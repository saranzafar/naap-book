import React, { useCallback, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, FlatList } from "react-native";
import { getAllClients } from "../services/StorageService";
import ClientCard from "../components/ClientCard";
import EmptyState from "../components/EmptyState";
import { Client } from "../types/Client";
import { Plus } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

export default function HomeScreen() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const fetchClients = useCallback(() => {
        setLoading(true);
        getAllClients().then(data => {
            setClients(data);
            setLoading(false);
        });
    }, []);

    useFocusEffect(fetchClients);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getAllClients().then(data => {
            setClients(data);
            setRefreshing(false);
        });
    }, []);

    if (loading) return <ActivityIndicator size="large" />;

    return (
        <View className="flex-1 p-4">
            <Text className="text-xl font-bold mb-4">
                {clients.length} Client{clients.length !== 1 && "s"}
            </Text>
            {clients.length > 0 ? (
                <FlatList
                    data={clients}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <ClientCard client={item} />}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            ) : (
                <EmptyState message="No clients yet. Add your first client!" />
            )}
            <TouchableOpacity
                onPress={() => navigation.navigate({ name: 'AddClient', params: {} })}
                className="absolute bottom-6 right-6 bg-blue-600 rounded-full p-4 shadow-lg"
                activeOpacity={0.85}
            >
                <Plus color="white" size={28} />
            </TouchableOpacity>
        </View>
    );
}
