import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import AddClientForm from '../components/AddClientForm';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getClientById, updateClient, addClient } from '../services/StorageService';
import type { Client, ClientPatch, Measurements } from '../types/Client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AddRoute = RouteProp<RootStackParamList, 'AddClient'>;
type EditRoute = RouteProp<RootStackParamList, 'EditClient'>;
type AnyRoute = AddRoute | EditRoute;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AddClientScreen(props: { mode?: 'add' | 'edit'; clientId?: string }) {
    const route = useRoute<AnyRoute>();
    const navigation = useNavigation<Nav>();

    const clientId =
        props.clientId ??
        (route.name === 'EditClient' ? (route.params as any)?.clientId : (route.params as any)?.clientId);

    const clientParam: Client | undefined =
        route.name === 'EditClient' ? (route.params as any)?.client : undefined;

    const mode: 'add' | 'edit' = props.mode ?? (clientId ? 'edit' : 'add');

    const [initialValues, setInitialValues] = useState<Partial<Client> | null>(null);
    const [loading, setLoading] = useState(mode === 'edit' && !clientParam);

    useEffect(() => {
        if (mode !== 'edit') return;

        if (clientParam) {
            setInitialValues(clientParam);
            setLoading(false);
            return;
        }

        if (!clientId) return;
        (async () => {
            try {
                const client = await getClientById(String(clientId));
                if (!client) {
                    Toast.show({ type: 'error', text1: 'Client not found' });
                    navigation.goBack();
                    return;
                }
                setInitialValues(client);
            } catch (error) {
                console.error('Failed to load client:', error);
                Toast.show({ type: 'error', text1: 'Failed to load client' });
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        })();
    }, [mode, clientId, clientParam, navigation]);

    const handleSubmit = useCallback(
        async (formValues: Client) => {
            try {
                if (mode === 'edit') {
                    const idForUpdate = String(clientId ?? clientParam?.id);
                    if (!idForUpdate) throw new Error('No client ID found for update');

                    const patch: ClientPatch = {
                        name: formValues.name,
                        phone: formValues.phone,
                        email: formValues.email,
                        address: formValues.address,
                        notes: formValues.notes,
                        measurements: formValues.measurements,
                    };

                    await updateClient(idForUpdate, patch);
                    Toast.show({ type: 'success', text1: 'Client updated successfully' });
                } else {
                    await addClient(formValues);
                    Toast.show({ type: 'success', text1: 'Client added successfully' });
                }

                navigation.navigate('Home');
            } catch (e: any) {
                console.error('Submit error:', e);
                Toast.show({
                    type: 'error',
                    text1: 'Save failed',
                    text2: e?.message ?? 'Unknown error occurred',
                });
            }
        },
        [mode, clientId, clientParam, navigation]
    );

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="always">
            <AddClientForm
                initialValues={initialValues ?? undefined}
                onSubmit={handleSubmit}
                submitLabel={mode === 'edit' ? 'Save Changes' : 'Add Client'}
                mode={mode}
            />
        </ScrollView>
    );
}

/* ---------------- mapping helpers (optional, simplified) ---------------- */

export function normalizeMeasurements(m?: Measurements): Measurements {
    return {
        Qameez: m?.Qameez || { value: '', notes: '' },
        Bazu: m?.Bazu || { value: '', notes: '' },
        Teera: m?.Teera || { value: '', notes: '' },
        Gala: m?.Gala || { value: '', notes: '' },
        Chati: m?.Chati || { value: '', notes: '' },
        Qamar: m?.Qamar || { value: '', notes: '' },
        Ghera: m?.Ghera || { value: '', notes: '' },
        Shalwar: m?.Shalwar || { value: '', notes: '' },
        Pancha: m?.Pancha || { value: '', notes: '' },
        custom_fields: m?.custom_fields || {},
    };
}
