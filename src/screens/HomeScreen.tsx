import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Pressable, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Search, Phone, Hash, User } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { getAllClients, deleteClient } from '../services/StorageService';
import ClientCard from '../components/ClientCard';
import EmptyState from '../components/EmptyState';
import { SwipeableClientItem } from '../components/SwipeableClientItem';
import { Client } from '../types/Client';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type FilterMode = 'all' | 'name' | 'phone' | 'id';

export default function HomeScreen() {
    const navigation = useNavigation<Nav>();

    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // --- NEW: search state ---
    const [query, setQuery] = useState('');
    const [mode, setMode] = useState<FilterMode>('all');

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
            navigation.navigate('EditClient', { clientId: String(client.id), client });
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
                                Toast.show({ type: 'success', text1: 'Record Deleted Successfully!' });
                            } catch (error) {
                                console.error('Error deleting client:', error);
                                Toast.show({ type: 'error', text1: 'Failed to delete Record!' });
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

    // --- NEW: helpers for matching ---
    const norm = (s: any) => String(s ?? '').toLowerCase().trim();
    const digits = (s: any) => String(s ?? '').replace(/\D+/g, '');

    const idMatches = (idVal: any, q: string) => {
        const idStr = norm(idVal);
        const qStr = norm(q);
        if (!qStr) return true;
        if (idStr.includes(qStr)) return true;

        // Support "c-7" / "n-7" / plain "7" matching "n-7"
        const qNum = digits(qStr);
        const idNum = digits(idStr);
        if (qNum && idNum && idNum.includes(qNum)) return true;

        return false;
    };

    // --- NEW: filtered list ---
    const filteredClients = useMemo(() => {
        const q = norm(query);
        if (!q) return clients;

        return clients.filter((c) => {
            const nameStr = norm(c.name);
            const phoneStr = digits(c.phone || '');
            const idStr = c.id; // could be "n-7", numeric, uuid, etc.

            if (mode === 'name') {
                return nameStr.includes(q);
            }
            if (mode === 'phone') {
                // allow typing with or without separators
                const qDigits = digits(q);
                return qDigits ? phoneStr.includes(qDigits) : false;
            }
            if (mode === 'id') {
                return idMatches(idStr, q);
            }

            // mode === 'all'
            const qDigits = digits(q);
            return (
                nameStr.includes(q) ||
                (qDigits ? phoneStr.includes(qDigits) : false) ||
                idMatches(idStr, q)
            );
        });
    }, [query, clients, mode]);

    if (loading) {
        return (
            <View className="flex-1 p-4 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View className="flex-1 p-4">
            {/* ---- Minimal Header ---- */}
            <View className="mb-3">
                <View className="flex-row items-center justify-between">
                    <Text className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">Naap Book</Text>
                    {/* (Optional) put a lightweight settings/icon area here later */}
                </View>

                {/* Search input */}
                <View className="mt-3 flex-row items-center rounded-2xl border border-zinc-200 bg-white px-3 py-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <Search size={18} color="#9ca3af" />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search by name, phone, or ID (e.g., c-7)"
                        placeholderTextColor="#9ca3af"
                        className="ml-2 flex-1 text-[15px] text-zinc-900 dark:text-zinc-100"
                        returnKeyType="search"
                    />
                    {query ? (
                        <Pressable onPress={() => setQuery('')} hitSlop={10} className="pl-2">
                            <Text className="text-zinc-400">Clear</Text>
                        </Pressable>
                    ) : null}
                </View>

                {/* Filter chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2 -mx-1">
                    {[
                        { key: 'all', label: 'All', icon: User },
                        { key: 'name', label: 'Name', icon: User },
                        { key: 'phone', label: 'Phone', icon: Phone },
                        { key: 'id', label: 'ID', icon: Hash },
                    ].map(({ key, label, icon: Icon }) => {
                        const active = mode === (key as FilterMode);
                        return (
                            <Pressable
                                key={key}
                                onPress={() => setMode(key as FilterMode)}
                                className={`mx-1 h-9 flex-row items-center rounded-full px-3 ${active
                                    ? 'bg-blue-600'
                                    : 'bg-zinc-100 dark:bg-zinc-800'
                                    }`}
                            >
                                <Icon size={14} color={active ? '#fff' : '#a1a1aa'} />
                                <Text
                                    className={`ml-2 text-[13px] font-semibold ${active ? 'text-white' : 'text-zinc-500'
                                        }`}
                                >
                                    {label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Count */}
            <Text className="text-sm text-zinc-500 mb-2">
                {filteredClients.length} of {clients.length} client{clients.length !== 1 ? 's' : ''}
            </Text>

            {/* List */}
            {filteredClients.length > 0 ? (
                <FlatList
                    data={filteredClients}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <EmptyState message={query ? 'No matching clients.' : 'No clients yet. Add your first client!'} />
            )}

            {/* FAB */}
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
