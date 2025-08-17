// screens/AddClientScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { CommonActions } from '@react-navigation/native';

import AddClientForm from '../components/AddClientForm';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getClientById, updateClient, addClient } from '../services/StorageService';
import type { Client, AddClientFormValues, MeasurementFieldInput, CustomFieldInput } from '../types/Client';
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

    const [initialValues, setInitialValues] = useState<AddClientFormValues | null>(null);
    const [loading, setLoading] = useState(mode === 'edit' && !clientParam);

    useEffect(() => {
        if (mode !== 'edit') return;

        if (clientParam) {
            setInitialValues(toFormValues(clientParam));
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
                setInitialValues(toFormValues(client));
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
        async (formValues: AddClientFormValues) => {
            try {
                console.log('Submitting form values:', JSON.stringify(formValues, null, 2));

                if (mode === 'edit') {
                    const idForUpdate = String(clientId ?? clientParam?.id);
                    if (!idForUpdate) {
                        throw new Error('No client ID found for update');
                    }

                    console.log("Updating client with id:", idForUpdate);

                    await updateClient(idForUpdate, formValues);
                    Toast.show({ type: 'success', text1: 'Client updated successfully' });
                } else {
                    console.log("Adding new client");
                    await addClient(formValues);
                    Toast.show({ type: 'success', text1: 'Client added successfully' });
                }

                // Navigate back to home
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'Home' }],
                    })
                );
            } catch (e: any) {
                console.error('Submit error:', e);
                Toast.show({
                    type: 'error',
                    text1: 'Save failed',
                    text2: e?.message ?? 'Unknown error occurred'
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

/* ---------------- mapping helpers ---------------- */

function measurementToInput(m?: { value?: number; notes?: string }): MeasurementFieldInput {
    return {
        value: m?.value != null ? String(m.value) : '',
        notes: m?.notes ?? '',
    };
}

function toFormValues(client: Client): AddClientFormValues {
    const m = client.measurements || {};
    const cfObj = m.custom_fields || {};

    // Convert custom fields object to array for editing
    const custom_fields: CustomFieldInput[] = Object.entries(cfObj).map(([key, cf]) => ({
        _key: key,
        name: cf.name || '',
        value: cf.value != null ? String(cf.value) : '',
        notes: cf.notes ?? '',
    }));

    return {
        name: client.name ?? '',
        phone: client.phone ?? '',
        email: client.email ?? '',
        address: client.address ?? '',
        notes: client.notes ?? '',
        measurements: {
            chest: measurementToInput(m.chest),
            shoulder: measurementToInput(m.shoulder),
            arm_length: measurementToInput(m.arm_length),
            collar: measurementToInput(m.collar),
            shirt_length: measurementToInput(m.shirt_length),
            waist: measurementToInput(m.waist),
            hips: measurementToInput(m.hips),
            trouser_length: measurementToInput(m.trouser_length),
            inseam: measurementToInput(m.inseam),
            custom_fields,
        },
    };
}