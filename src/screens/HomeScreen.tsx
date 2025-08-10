import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert,
    Modal, Animated, Easing, ScrollView,
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
    const isActive = useRef(true);

    // details sheet state
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [sheetVisible, setSheetVisible] = useState(false);
    const slideY = useRef(new Animated.Value(0)).current; // 0->hidden, 1->visible

    const openDetails = (c: Client) => {
        setSelectedClient(c);
        setSheetVisible(true);
    };

    const closeDetails = () => {
        Animated.timing(slideY, { toValue: 0, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(
            () => {
                setSheetVisible(false);
                setSelectedClient(null);
            }
        );
    };

    useEffect(() => {
        if (sheetVisible) {
            slideY.setValue(0);
            Animated.timing(slideY, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
        }
    }, [sheetVisible, slideY]);

    const loadClients = useCallback(
        async (opts: { showSpinner?: boolean } = {}) => {
            const { showSpinner = true } = opts;
            try {
                if (showSpinner) setLoading(true);
                const data = await getAllClients();
                if (isActive.current) setClients(data);
            } catch (error) {
                console.error('Error loading clients:', error);
                if (isActive.current) Alert.alert('Error', 'Failed to load clients');
            } finally {
                if (isActive.current) {
                    if (showSpinner) setLoading(false);
                    setRefreshing(false);
                }
            }
        },
        []
    );

    useFocusEffect(
        useCallback(() => {
            isActive.current = true;
            loadClients();
            return () => {
                isActive.current = false;
            };
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
                                if (selectedClient?.id === client.id) closeDetails();
                            } catch (error) {
                                console.error('Error deleting client:', error);
                                Alert.alert('Error', 'Failed to delete client');
                            }
                        },
                    },
                ]
            );
        },
        []
    );

    const renderItem = useCallback(
        ({ item }: { item: Client }) => (
            <SwipeableClientItem client={item} onEdit={handleEditClient} onDelete={handleDeleteClient}>
                <ClientCard client={item} onPress={() => openDetails(item)} />
            </SwipeableClientItem>
        ),
        [handleEditClient, handleDeleteClient]
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
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    showsVerticalScrollIndicator={false}
                //   contentContainerStyle={{ paddingBottom: 96 }}
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

            {/* Bottom Sheet for Naap details */}
            <Modal visible={sheetVisible} transparent animationType="none" onRequestClose={closeDetails}>
                <View className="flex-1 bg-black/40">
                    <TouchableOpacity className="flex-1" activeOpacity={1} onPress={closeDetails} />
                    <Animated.View
                        style={{
                            transform: [
                                {
                                    translateY: slideY.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [400, 0], // slide up
                                    }),
                                },
                            ],
                        }}
                        className="bg-white rounded-t-2xl p-4"
                    >
                        <View className="w-12 h-1.5 bg-gray-300 self-center rounded-full mb-3" />
                        <ScrollView>
                            {selectedClient && <NaapDetails client={selectedClient} onEdit={() => {
                                closeDetails();
                                handleEditClient(selectedClient);
                            }} onDelete={() => handleDeleteClient(selectedClient)} />}
                        </ScrollView>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

/** Inline details renderer to keep your 2-component guideline */
function NaapDetails({ client, onEdit, onDelete }: { client: Client; onEdit: () => void; onDelete: () => void }) {
    const m = client.measurements;
    const rows: Array<{ label: string; value?: number; note?: string }> = [
        { label: 'Chest / Bust', value: m.chest?.value, note: m.chest?.notes },
        { label: 'Shoulder', value: m.shoulder?.value, note: m.shoulder?.notes },
        { label: 'Arm Length', value: m.arm_length?.value, note: m.arm_length?.notes },
        { label: 'Collar / Neck', value: m.collar?.value, note: m.collar?.notes },
        { label: 'Shirt Length', value: m.shirt_length?.value, note: m.shirt_length?.notes },
        { label: 'Waist', value: m.waist?.value, note: m.waist?.notes },
        { label: 'Hips', value: m.hips?.value, note: m.hips?.notes },
        { label: 'Trouser Length', value: m.trouser_length?.value, note: m.trouser_length?.notes },
        { label: 'Inseam', value: m.inseam?.value, note: m.inseam?.notes },
    ];

    const custom = Object.values(m.custom_fields || {});

    return (
        <View>
            <Text className="text-xl font-semibold">{client.name}</Text>
            <Text className="text-sm text-gray-500 mb-2">ID: {client.id}</Text>
            {!!client.phone && <Text className="text-gray-600">{client.phone}</Text>}
            {!!client.email && <Text className="text-gray-600">{client.email}</Text>}
            {!!client.address && <Text className="text-gray-600">{client.address}</Text>}
            {!!client.notes && <Text className="text-gray-700 mt-2">{client.notes}</Text>}

            <Text className="text-lg font-semibold mt-4 mb-2">Measurements</Text>

            {/* 2-column grid */}
            <View className="flex-row flex-wrap -mx-1">
                {rows.map((r, idx) => (
                    <View key={idx} className="w-1/2 px-1 mb-2">
                        <View className="border rounded-lg p-3">
                            <Text className="text-gray-500 text-[12px]">{r.label}</Text>
                            <Text className="text-base font-semibold">{r.value ?? '—'}</Text>
                            {!!r.note && (
                                <Text
                                    numberOfLines={2}
                                    className="text-[11px] text-gray-500 mt-1"
                                >
                                    {r.note}
                                </Text>
                            )}
                        </View>
                    </View>
                ))}
            </View>

            {/* Custom fields */}
            {custom.length > 0 && (
                <>
                    <Text className="text-lg font-semibold mt-3 mb-2">Custom</Text>
                    <View className="flex-row flex-wrap -mx-1">
                        {custom.map((cf, i) => (
                            <View key={i} className="w-1/2 px-1 mb-2">
                                <View className="border rounded-lg p-3">
                                    <Text className="text-gray-500 text-[12px]">{cf.name || 'Custom'}</Text>
                                    <Text className="text-base font-semibold">{cf.value ?? '—'}</Text>
                                    {!!cf.notes && (
                                        <Text numberOfLines={2} className="text-[11px] text-gray-500 mt-1">
                                            {cf.notes}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                </>
            )}

            <View className="flex-row justify-end gap-3 mt-4">
                <TouchableOpacity onPress={onEdit} className="bg-yellow-500 px-4 py-2 rounded-lg" activeOpacity={0.85}>
                    <Text className="text-white font-medium">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onDelete} className="bg-red-600 px-4 py-2 rounded-lg" activeOpacity={0.85}>
                    <Text className="text-white font-medium">Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
