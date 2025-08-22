import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Pressable, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Search, Phone, Hash, User } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import Clipboard from '@react-native-clipboard/clipboard';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { FileDown } from 'lucide-react-native';

import { deleteClient } from '../services/StorageService';
import { getClientsPage } from '../services/StorageService';
import ClientCard from '../components/ClientCard';
import EmptyState from '../components/EmptyState';
import { SwipeableClientItem } from '../components/SwipeableClientItem';
import { Client } from '../types/Client';
import { RootStackParamList } from '../navigation/AppNavigator';
import { formatClientForShare } from '../utils/format';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type FilterMode = 'all' | 'name' | 'phone' | 'id';

const PAGE_SIZE = 20; // Adjust as needed

export default function HomeScreen() {
    const navigation = useNavigation<Nav>();

    const [items, setItems] = useState<Client[]>([]);
    const [total, setTotal] = useState(0);

    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);

    // Search/filter (from your minimal header)
    const [query, setQuery] = useState('');
    const [mode, setMode] = useState<FilterMode>('all');

    // Debounce search a bit for UX
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const debouncedQuery = useMemo(() => query, [query]); // simple; if you want stricter debounce, wrap setQuery.

    const openDetails = useCallback((c: Client) => {
        navigation.navigate('ClientDetail', { client: c });
    }, [navigation]);

    const loadPage = useCallback(async (nextOffset: number, opts?: { replace?: boolean }) => {
        const replace = !!opts?.replace;

        if (nextOffset === 0) setInitialLoading(true);
        else setLoadingMore(true);

        try {
            const { items: pageItems, total: totalCount } = await getClientsPage({
                offset: nextOffset,
                limit: PAGE_SIZE,
                query: debouncedQuery,
                mode,
            });

            setTotal(totalCount);
            setHasMore(nextOffset + pageItems.length < totalCount);

            if (replace) {
                setItems(pageItems);
            } else {
                setItems((prev) => (nextOffset === 0 ? pageItems : prev.concat(pageItems)));
            }
            setOffset(nextOffset + pageItems.length);
        } catch (err) {
            console.error('Pagination load failed:', err);
            Alert.alert('Error', 'Failed to load clients');
        } finally {
            setInitialLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    }, [debouncedQuery, mode]);

    // Initial + onFocus refresh (keeps pagination)
    useFocusEffect(
        useCallback(() => {
            // Fresh start each time screen focuses (optional)
            setOffset(0);
            setHasMore(true);
            loadPage(0, { replace: true });
        }, [loadPage])
    );

    // When query/mode changes -> reset & reload first page
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setOffset(0);
            setHasMore(true);
            loadPage(0, { replace: true });
        }, 150); // small debounce for typing
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [debouncedQuery, mode, loadPage]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setOffset(0);
        setHasMore(true);
        loadPage(0, { replace: true });
    }, [loadPage]);

    const onEndReached = useCallback(() => {
        if (!hasMore || loadingMore || initialLoading) return;
        loadPage(offset);
    }, [hasMore, loadingMore, initialLoading, loadPage, offset]);

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
                                // delete locally
                                await deleteClient(client.id);
                                // reload from start to keep pagination stable
                                setOffset(0);
                                setHasMore(true);
                                await loadPage(0, { replace: true });
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
        [loadPage]
    );

    const handleShareClient = useCallback((client: Client) => {
        const formatted = formatClientForShare(client);
        Clipboard.setString(formatted);
        Toast.show({ type: 'success', text1: 'Copied!', text2: 'Client record copied to clipboard.' });
    }, []);

    const handleExportAllToPDF = useCallback(async () => {
        try {
            if (!items.length) {
                Toast.show({ type: 'info', text1: 'No records', text2: 'No clients to export.' });
                return;
            }

            // Build HTML dynamically
            const allRecordsHtml = items
                .map((client) => `<pre>${formatClientForShare(client)}</pre>`)
                .join('<hr/>');

            const htmlContent = `
                <html>
                    <head>
                    <meta charset="utf-8"/>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        pre { white-space: pre-wrap; font-size: 14px; margin-bottom: 20px; }
                        hr { border: none; border-top: 1px solid #ccc; margin: 30px 0; }
                    </style>
                    </head>
                    <body>
                    <h1>NaapBook – Client Records</h1>
                    ${allRecordsHtml}
                    </body>
                </html>
                `;

            const file = await RNHTMLtoPDF.convert({
                html: htmlContent,
                fileName: `naapbook_records_${Date.now()}`,
                base64: false,
            });

            Toast.show({ type: 'success', text1: 'PDF Exported', text2: 'File saved successfully!' });

            // Open share dialog
            await Share.open({
                url: `file://${file.filePath}`,
                type: 'application/pdf',
                failOnCancel: false,
            });
        } catch (error) {
            console.error('PDF export failed', error);
            Toast.show({ type: 'error', text1: 'Export failed', text2: 'Unable to create PDF.' });
        }
    }, [items]);


    const renderItem = useCallback(
        ({ item }: { item: Client }) => (
            <SwipeableClientItem
                client={item}
                onEdit={handleEditClient}
                onDelete={handleDeleteClient}
                onShare={handleShareClient}
            >
                <ClientCard client={item} onPress={() => openDetails(item)} />
            </SwipeableClientItem>
        ),
        [handleEditClient, handleDeleteClient, handleShareClient, openDetails]
    );

    // ---- Header (same minimal header from last step) ----
    const Header = (
        <View className="mb-3">
            <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">Naap Book</Text>

                {/* Export PDF button */}
                <TouchableOpacity
                    onPress={handleExportAllToPDF}
                    className="ml-3 p-2 rounded-full bg-blue-600"
                    activeOpacity={0.8}
                >
                    <FileDown size={20} color="white" />
                </TouchableOpacity>
            </View>


            {/* Search */}
            <View className="mt-3 flex-row items-center rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
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

            {/* Chips */}
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
                            className={`mx-1 h-9 flex-row items-center rounded-full px-3 ${active ? 'bg-blue-600' : 'bg-zinc-100 dark:bg-zinc-800'
                                }`}
                        >
                            <Icon size={14} color={active ? '#fff' : '#a1a1aa'} />
                            <Text className={`ml-2 text-[13px] font-semibold ${active ? 'text-white' : 'text-zinc-500'}`}>
                                {label}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>

            {/* Count */}
            <Text className="mt-2 text-sm text-zinc-500">
                {items.length} of {total} client{total !== 1 ? 's' : ''}
            </Text>
        </View>
    );

    if (initialLoading) {
        return (
            <View className="flex-1 p-4 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View className="flex-1 p-4">
            {Header}

            {items.length > 0 ? (
                <FlatList
                    data={items}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    showsVerticalScrollIndicator={false}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.4}  // load when 40% from bottom
                    ListFooterComponent={
                        loadingMore ? (
                            <View className="py-4">
                                <ActivityIndicator />
                            </View>
                        ) : !hasMore ? (
                            <View className="py-3">
                                <Text className="text-center text-xs text-zinc-400">No more clients</Text>
                            </View>
                        ) : null
                    }
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
