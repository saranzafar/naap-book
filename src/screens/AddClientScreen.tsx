// screens/AddClientScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import AddClientForm from '../components/AddClientForm';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getClientById, updateClient, addClient } from '../services/StorageService';
import type { Client, MeasurementEntry } from '../types/Client';

type AddRoute = RouteProp<RootStackParamList, 'AddClient'>;
type EditRoute = RouteProp<RootStackParamList, 'EditClient'>;
type AnyRoute = AddRoute | EditRoute;

export default function AddClientScreen(props: { mode?: 'add' | 'edit'; clientId?: string }) {
    const route = useRoute<AnyRoute>();
    const navigation = useNavigation();

    const clientId =
        props.clientId ??
        (route.name === 'EditClient' ? (route.params as any)?.clientId : (route.params as any)?.clientId);

    const clientParam: Client | undefined =
        route.name === 'EditClient' ? (route.params as any)?.client : undefined;

    const mode: 'add' | 'edit' = props.mode ?? (clientId ? 'edit' : 'add');

    const [initialValues, setInitialValues] = useState<any | null>(null);
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
            } catch {
                Toast.show({ type: 'error', text1: 'Failed to load client' });
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        })();
    }, [mode, clientId, clientParam, navigation]);

    const handleSubmit = useCallback(
        async (formValues: any) => {
            try {
                if (mode === 'edit') {
                    const idForUpdate = String(clientId ?? clientParam?.id);
                    console.log("id for update", idForUpdate);

                    const patch = toClientPatch(formValues);
                    await updateClient(idForUpdate, patch);
                    Toast.show({ type: 'success', text1: 'Client updated' });
                } else {
                    const payload = toNewClientPayload(formValues);
                    await addClient(payload);
                    Toast.show({ type: 'success', text1: 'Client added' });
                }
                navigation.goBack();
            } catch (e: any) {
                Toast.show({ type: 'error', text1: e?.message ?? 'Save failed' });
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

function entryToStrings(e?: MeasurementEntry) {
    return {
        value: e?.value != null ? String(e.value) : '',
        unit: e?.unit ?? '',
        notes: e?.notes ?? '',
    };
}

function toFormValues(client: Client) {
    const m = client.measurements || {};
    const cfObj = m.custom_fields || {};
    const custom_fields = Object.entries(cfObj).map(([key, cf]) => ({
        _key: key, // preserve original key if present
        name: cf.name || '',
        value: cf.value != null ? String(cf.value) : '',
        unit: cf.unit ?? '',
        notes: cf.notes ?? '',
    }));

    return {
        name: client.name ?? '',
        phone: client.phone ?? '',
        email: client.email ?? '',
        address: client.address ?? '',
        notes: client.notes ?? '',
        measurements: {
            chest: entryToStrings(m.chest),
            shoulder: entryToStrings(m.shoulder),
            arm_length: entryToStrings(m.arm_length),
            collar: entryToStrings(m.collar),
            shirt_length: entryToStrings(m.shirt_length),
            waist: entryToStrings(m.waist),
            hips: entryToStrings(m.hips),
            trouser_length: entryToStrings(m.trouser_length),
            inseam: entryToStrings(m.inseam),
            custom_fields, // array for editing UI
        },
    };
}

function toClientPatch(values: any) {
    const s = values.measurements || {};
    return {
        name: values.name?.trim(),
        phone: values.phone?.trim(),
        email: values.email?.trim(),
        address: values.address?.trim(),
        notes: values.notes?.trim(),
        measurements: {
            chest: strEntryToNum(s.chest),
            shoulder: strEntryToNum(s.shoulder),
            arm_length: strEntryToNum(s.arm_length),
            collar: strEntryToNum(s.collar),
            shirt_length: strEntryToNum(s.shirt_length),
            waist: strEntryToNum(s.waist),
            hips: strEntryToNum(s.hips),
            trouser_length: strEntryToNum(s.trouser_length),
            inseam: strEntryToNum(s.inseam),
            custom_fields: arrayToObject(s.custom_fields),
        },
    };
}

function toNewClientPayload(values: any) {
    const now = new Date().toISOString();
    const s = values.measurements || {};
    return {
        name: values.name?.trim(),
        phone: values.phone?.trim() || undefined,
        email: values.email?.trim() || undefined,
        address: values.address?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
        created_at: now,
        updated_at: now,
        measurements: {
            chest: strEntryToNum(s.chest),
            shoulder: strEntryToNum(s.shoulder),
            arm_length: strEntryToNum(s.arm_length),
            collar: strEntryToNum(s.collar),
            shirt_length: strEntryToNum(s.shirt_length),
            waist: strEntryToNum(s.waist),
            hips: strEntryToNum(s.hips),
            trouser_length: strEntryToNum(s.trouser_length),
            inseam: strEntryToNum(s.inseam),
            custom_fields: arrayToObject(s.custom_fields),
        },
    };
}

function strEntryToNum(e?: { value?: string; unit?: string; notes?: string }): MeasurementEntry | undefined {
    if (!e) return undefined;
    const hasValue = e.value != null && String(e.value).trim() !== '';
    const num = hasValue ? Number(String(e.value).replace(',', '.')) : undefined;
    const out: MeasurementEntry = {};
    if (Number.isFinite(num!)) out.value = num!;
    if (e.unit?.trim()) out.unit = e.unit.trim();
    if (e.notes?.trim()) out.notes = e.notes.trim();
    return Object.keys(out).length ? out : undefined;
}

function arrayToObject(arr?: Array<any>) {
    if (!Array.isArray(arr)) return undefined;
    const obj: Record<string, any> = {};
    arr.forEach((item, idx) => {
        const key = (item?._key as string) || safeKey(item?.name, idx);
        const m = strEntryToNum({ value: item?.value, unit: item?.unit, notes: item?.notes });
        if (!item?.name && !m) return;
        obj[key] = { name: (item?.name || '').trim(), ...(m || {}) };
    });
    return Object.keys(obj).length ? obj : {};
}

function safeKey(name?: string, idx?: number) {
    const base = (name || `custom_${idx ?? 0}`).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    return base || `custom_${idx ?? 0}`;
}
