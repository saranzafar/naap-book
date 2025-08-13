// screens/HomeScreen.tsx
import React, { useCallback, useState } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus } from 'lucide-react-native';

import { getAllClients, deleteClient } from '../services/StorageService';
import ClientCard from '../components/ClientCard';
import EmptyState from '../components/EmptyState';
import { SwipeableClientItem } from '../components/SwipeableClientItem';
import { Client } from '../types/Client';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
    const navigation = useNavigation<Nav>();

    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // 👉 Navigate to detail screen on card press
    const openDetails = useCallback((c: Client) => {
        navigation.navigate('ClientDetail', { client: c });
    }, [navigation]);

    const loadClients = useCallback(
        async (opts: { showSpinner?: boolean } = {}) => {
            const { showSpinner = true } = opts;
            try {
                if (showSpinner) setLoading(true);
                const data = await getAllClients();
                setClients(data);
            } catch (error) {
                console.error('Error loading clients:', error);
                Alert.alert('Error', 'Failed to load clients');
            } finally {
                if (showSpinner) setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );

    useFocusEffect(
        useCallback(() => {
            loadClients();
        }, [loadClients])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadClients({ showSpinner: false });
    }, [loadClients]);

    const handleEditClient = useCallback(
        (client: Client) => {
            navigation.navigate('EditClient', { clientId: client.id });
        },
        [navigation]
    );

    const handleDeleteClient = useCallback(
        (client: Client) => {
            Alert.alert(
                'Delete Client',
                `Are you sure you want to delete "${client.name}"?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                await deleteClient(client.id);
                                await loadClients({ showSpinner: false });
                                Alert.alert('Deleted', 'Client deleted successfully.');
                            } catch (error) {
                                console.error('Error deleting client:', error);
                                Alert.alert('Error', 'Failed to delete client');
                            }
                        },
                    },
                ]
            );
        },
        [loadClients]
    );

    const renderItem = useCallback(
        ({ item }: { item: Client }) => (
            <SwipeableClientItem client={item} onEdit={handleEditClient} onDelete={handleDeleteClient}>
                <ClientCard client={item} onPress={() => openDetails(item)} />
            </SwipeableClientItem>
        ),
        [handleEditClient, handleDeleteClient, openDetails]
    );

    if (loading) {
        return (
            <View className="flex-1 p-4 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View className="flex-1 p-4">
            <Text className="text-xl font-bold mb-4">
                {clients.length} Client{clients.length !== 1 ? 's' : ''}
            </Text>

            {clients.length > 0 ? (
                <FlatList
                    data={clients}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 96 }} // avoid FAB overlap
                />
            ) : (
                <EmptyState message="No clients yet. Add your first client!" />
            )}

            <TouchableOpacity
                onPress={() => navigation.navigate('AddClient', {})}
                className="absolute bottom-6 right-6 bg-blue-600 rounded-full p-4 shadow-lg"
                activeOpacity={0.85}
            >
                <Plus color="white" size={28} />
            </TouchableOpacity>
        </View>
    );
}
