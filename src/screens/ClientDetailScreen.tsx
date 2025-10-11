import React, { useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Alert,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    Phone,
    Mail,
    MessageSquare,
    MapPin,
    Calendar,
    Pencil,
    Trash2,
    User,
} from 'lucide-react-native';

import { RootStackParamList } from '../navigation/AppNavigator';
import { deleteClient } from '../services/StorageService';
import { openDial, openEmail, openSms } from '../utils/contactActions';
import type { Client } from '../types/Client';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ClientDetail'>;
type Route = RouteProp<RootStackParamList, 'ClientDetail'>;

export default function ClientDetailScreen() {
    const navigation = useNavigation<Nav>();
    const { params } = useRoute<Route>();
    const client = params.client as Client;
    console.log('ClientDetailScreen render', client);


    const initials = useMemo(() => {
        const parts = (client?.name || '').trim().split(/\s+/);
        const [a, b] = [parts[0]?.[0], parts[1]?.[0]];
        return (a || '').toUpperCase() + (b || '').toUpperCase();
    }, [client?.name]);

    const measurements = client?.measurements || {};

    const rows: Array<{ key: keyof typeof measurements; label: string }> = [
        { key: 'Qameez', label: 'Qameez / قمیض (Shirt Length)' },
        { key: 'Bazu', label: 'Bazu / بازو (Sleeve)' },
        { key: 'Teera', label: 'Teera / تیرا (Armhole)' },
        { key: 'Gala', label: 'Gala / گلا (Neck)' },
        { key: 'Chati', label: 'Chati / چھاتی (Chest)' },
        { key: 'Qamar', label: 'Qamar / کمر (Waist)' },
        { key: 'Ghera', label: 'Ghera / گھیرہ (Hem)' },
        { key: 'Shalwar', label: 'Shalwar / شلوار (Trousers)' },
        { key: 'Pancha', label: 'Pancha / پانچہ (Cuff)' },
    ];

    const customFields = Object.values(measurements.custom_fields || {});

    const onEdit = useCallback(() => {
        navigation.navigate('EditClient', { clientId: String(client.id), client });
    }, [navigation, client]);

    const onDelete = useCallback(() => {
        Alert.alert(
            'Delete Client',
            `Are you sure you want to delete "${client.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteClient(client.id);
                        navigation.goBack();
                    },
                },
            ]
        );
    }, [client.id, client.name, navigation]);

    return (
        <View className="flex-1">
            <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
                {/* Top card */}
                <View className="px-4 pt-4">
                    <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 pb-6 relative overflow-hidden">
                        {/* soft gradient circle backdrop */}
                        <View className="absolute -top-20 -right-10 w-56 h-56 rounded-full bg-blue-100/60 dark:bg-blue-900/20" />
                        <View className="flex-row items-center">
                            <View className="w-14 h-14 rounded-full bg-blue-600/90 items-center justify-center mr-3">
                                {initials ? (
                                    <Text className="text-white font-semibold">{initials}</Text>
                                ) : (
                                    <User size={20} color="white" />
                                )}
                            </View>
                            <View className="flex-1">
                                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                                    {client.name || 'Unnamed Client'}
                                </Text>
                                {!!client.notes && (
                                    <Text
                                        className="text-[12px] text-gray-500 mt-0.5"
                                        numberOfLines={2}
                                    >
                                        {client.notes}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Quick actions */}
                        <View className="flex-row mt-4">
                            <ActionChip
                                label="Call"
                                icon={<Phone size={16} color="#fff" />}
                                onPress={() => client.phone && openDial(client.phone)}
                                disabled={!client.phone}
                            />
                            <ActionChip
                                label="SMS"
                                icon={<MessageSquare size={16} color="#fff" />}
                                onPress={() => client.phone && openSms(client.phone)}
                                disabled={!client.phone}
                            />
                            <ActionChip
                                label="Email"
                                icon={<Mail size={16} color="#fff" />}
                                onPress={() => client.email && openEmail(client.email)}
                                disabled={!client.email}
                            />
                        </View>

                        {/* Meta info */}
                        <View className="mt-4 gap-1">
                            {client.phone ? (
                                <MetaRow icon={<Phone size={16} color="#6b7280" />} text={client.phone} />
                            ) : null}
                            {client.email ? (
                                <MetaRow icon={<Mail size={16} color="#6b7280" />} text={client.email} />
                            ) : null}
                            {client.address ? (
                                <MetaRow icon={<MapPin size={16} color="#6b7280" />} text={client.address} />
                            ) : null}
                            {client.created_at ? (
                                <MetaRow
                                    icon={<Calendar size={16} color="#6b7280" />}
                                    text={`Added: ${new Date(client.created_at).toDateString()}`}
                                />
                            ) : null}
                        </View>
                    </View>
                </View>

                {/* Measurements */}
                <Section title="Measurements / ناپ">
                    <View className="flex-row flex-wrap -mx-1">
                        {rows.map(({ key, label }) => {
                            const v = (measurements as any)?.[key];
                            const value = v?.value ?? '';
                            const note = v?.notes ?? '';
                            return (
                                <View key={String(key)} className="w-1/2 px-1 mb-2">
                                    <Card>
                                        <Text className="text-[12px] text-gray-500">{label}</Text>
                                        <Text className="text-base font-semibold mt-0.5 dark:text-gray-300">
                                            {value || '—'}
                                        </Text>
                                        {!!note && (
                                            <Text
                                                numberOfLines={2}
                                                className="text-[11px] text-gray-500 mt-1"
                                            >
                                                {note}
                                            </Text>
                                        )}
                                    </Card>
                                </View>
                            );
                        })}
                    </View>
                </Section>

                {/* Custom Fields */}
                {customFields.length > 0 && (
                    <Section title="Custom Fields / اضافی ناپ">
                        <View className="flex-row flex-wrap -mx-1">
                            {customFields.map((cf: any, i: number) => (
                                <View key={i} className="w-1/2 px-1 mb-2">
                                    <Card>
                                        <Text className="text-[12px] text-gray-500">
                                            {cf?.name || 'Custom'}
                                        </Text>
                                        <Text className="text-base font-semibold mt-0.5">
                                            {cf?.value ?? '—'}
                                        </Text>
                                        {!!cf?.notes && (
                                            <Text
                                                numberOfLines={2}
                                                className="text-[11px] text-gray-500 mt-1"
                                            >
                                                {cf?.notes}
                                            </Text>
                                        )}
                                    </Card>
                                </View>
                            ))}
                        </View>
                    </Section>
                )}

                {/* Notes */}
                {!!client?.notes && (
                    <Section title="Notes / نوٹس">
                        <Card>
                            <Text className="text-[14px] text-gray-700 dark:text-gray-300 leading-5">
                                {client.notes}
                            </Text>
                        </Card>
                    </Section>
                )}
            </ScrollView>

            {/* Bottom actions */}
            <View className="absolute left-0 right-0 bottom-0 px-4 pb-5 pt-3 bg-white/90 dark:bg-zinc-950/90 border-t border-zinc-200 dark:border-zinc-800">
                <View className="flex-row gap-3">
                    <Pressable
                        onPress={onDelete}
                        android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: false }}
                        className="flex-1 bg-red-600 rounded-xl items-center justify-center h-12"
                        accessibilityRole="button"
                        accessibilityLabel="Delete client"
                    >
                        <View className="flex-row items-center gap-2">
                            <Trash2 size={18} color="#fff" />
                            <Text className="text-white font-semibold">Delete</Text>
                        </View>
                    </Pressable>
                    <Pressable
                        onPress={onEdit}
                        android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: false }}
                        className="flex-1 bg-yellow-500 rounded-xl items-center justify-center h-12"
                        accessibilityRole="button"
                        accessibilityLabel="Edit client"
                    >
                        <View className="flex-row items-center gap-2">
                            <Pencil size={18} color="#fff" />
                            <Text className="text-white font-semibold">Edit</Text>
                        </View>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

/* ——— UI Helpers ——— */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View className="px-4 mt-5">
            <Text className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{title}</Text>
            {children}
        </View>
    );
}

function Card({ children }: { children: React.ReactNode }) {
    return (
        <View className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-white dark:bg-zinc-900">
            {children}
        </View>
    );
}

function MetaRow({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <View className="flex-row items-center gap-2">
            <View className="w-6">{icon}</View>
            <Text className="text-[13px] text-gray-600 dark:text-gray-300">{text}</Text>
        </View>
    );
}

function ActionChip({
    label,
    icon,
    onPress,
    disabled,
}: {
    label: string;
    icon: React.ReactNode;
    onPress: () => void;
    disabled?: boolean;
}) {
    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
            className={`mr-2 px-3 h-9 rounded-full flex-row items-center gap-2 ${disabled
                ? 'bg-zinc-300/60 dark:bg-zinc-700/40'
                : 'bg-blue-500 dark:bg-blue-400/70'
                }`}
            accessibilityRole="button"
            accessibilityLabel={label}
        >
            <View>{icon}</View>
            <Text
                className={`text-[12px] font-semibold ${disabled
                    ? 'text-zinc-600 dark:text-zinc-300'
                    : 'text-white'
                    }`}
            >
                {label}
            </Text>
        </Pressable>
    );
}
