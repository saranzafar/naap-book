import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import MeasurementsForm from './MeasurementsForm';
import { Measurements } from '../types/Client';

type Props = {
    initialValues?: any;
    onSubmit: (values: any) => Promise<void> | void;
    submitLabel?: string;
    mode?: 'add' | 'edit';
};

const DEFAULTS = {
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    measurements: {
        chest: { value: '', notes: '' },
        shoulder: { value: '', notes: '' },
        arm_length: { value: '', notes: '' },
        collar: { value: '', notes: '' },
        shirt_length: { value: '', notes: '' },
        waist: { value: '', notes: '' },
        hips: { value: '', notes: '' },
        trouser_length: { value: '', notes: '' },
        inseam: { value: '', notes: '' },
        custom_fields: [] as Array<{ _key?: string; name: string; value: string; notes?: string }>,
    },
};

// --- UI types mirrored from MeasurementsForm ---
type EntryStr = { value: string; notes?: string };
type CustomFieldStr = { _key?: string; name: string; value: string; notes?: string };
type MeasurementsUI = {
    chest?: EntryStr;
    shoulder?: EntryStr;
    arm_length?: EntryStr;
    collar?: EntryStr;
    shirt_length?: EntryStr;
    waist?: EntryStr;
    hips?: EntryStr;
    trouser_length?: EntryStr;
    inseam?: EntryStr;
    custom_fields?: CustomFieldStr[];
};

// --- API/Storage types (already in ../types/Client) ---
// type Measurement = { value: number; notes?: string };
// type Measurements = { ...; custom_fields?: Record<string, { name: string; value: number; notes?: string }> };

const toNum = (s?: string) => {
    if (s == null) return 0;
    const n = parseFloat(String(s).trim());
    return Number.isFinite(n) ? n : 0;
};

function toMeasurements(src?: MeasurementsUI): Measurements {
    const m: Measurements = {
        chest: { value: toNum(src?.chest?.value), notes: src?.chest?.notes },
        shoulder: { value: toNum(src?.shoulder?.value), notes: src?.shoulder?.notes },
        arm_length: { value: toNum(src?.arm_length?.value), notes: src?.arm_length?.notes },
        collar: { value: toNum(src?.collar?.value), notes: src?.collar?.notes },
        shirt_length: { value: toNum(src?.shirt_length?.value), notes: src?.shirt_length?.notes },
        waist: { value: toNum(src?.waist?.value), notes: src?.waist?.notes },
        hips: { value: toNum(src?.hips?.value), notes: src?.hips?.notes },
        trouser_length: { value: toNum(src?.trouser_length?.value), notes: src?.trouser_length?.notes },
        inseam: { value: toNum(src?.inseam?.value), notes: src?.inseam?.notes },
        custom_fields: {},
    };

    // Convert array -> record map with numeric values
    for (const cf of src?.custom_fields ?? []) {
        const name = (cf.name ?? '').trim();
        if (!name) continue;
        m.custom_fields![name] = {
            name,
            value: toNum(cf.value),
            notes: cf.notes,
        };
    }
    return m;
}


export default function AddClientForm({ initialValues, onSubmit, submitLabel = 'Add Client' }: Props) {
    const [values, setValues] = useState<any>({ ...DEFAULTS });

    useEffect(() => {
        if (initialValues) {
            setValues((v: any) => ({
                ...v,
                ...initialValues,
                measurements: {
                    ...DEFAULTS.measurements,
                    ...(initialValues.measurements ?? {}),
                    // ensure strings
                    chest: { value: String(initialValues.measurements?.chest?.value ?? ''), notes: initialValues.measurements?.chest?.notes ?? '' },
                    // repeat similarly for other fixed fields OR rely on MeasurementsForm to normalize
                },
            }));
        }
    }, [initialValues]);

    const update = (key: string) => (text: string) =>
        setValues((v: any) => ({ ...v, [key]: text }));

    const handleSubmit = async () => {
        const formPayload = {
            name: values.name?.trim(),
            phone: values.phone?.trim(),
            email: values.email?.trim(),
            address: values.address?.trim(),
            notes: values.notes?.trim(),
        };

        // pass UI shape (strings + custom_fields ARRAY) unchanged
        await onSubmit?.({ ...formPayload, measurements: values.measurements });
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
            <View className="gap-3">
                <Field label="Name" value={String(values.name ?? '')} onChangeText={update('name')} required />
                <Field label="Phone" value={String(values.phone ?? '')} onChangeText={update('phone')} keyboardType="phone-pad" />
                <Field label="Email" value={String(values.email ?? '')} onChangeText={update('email')} keyboardType="email-address" autoCapitalize="none" />
                <Field label="Address" value={String(values.address ?? '')} onChangeText={update('address')} />
                <Field label="Notes" value={String(values.notes ?? '')} onChangeText={update('notes')} multiline />

                <MeasurementsForm
                    value={values.measurements}
                    onChange={(m) => setValues((v: any) => ({ ...v, measurements: m }))}
                />
            </View>

            <Pressable onPress={handleSubmit} className="mt-4 rounded-xl border px-4 py-3">
                <Text className="text-center font-semibold">{submitLabel}</Text>
            </Pressable>
        </KeyboardAvoidingView>
    );
}

function Field({
    label, value, onChangeText, multiline, keyboardType, autoCapitalize, required,
}: {
    label: string;
    value: string;
    onChangeText: (t: string) => void;
    multiline?: boolean;
    keyboardType?: any;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    required?: boolean;
}) {
    return (
        <View>
            <Text className="text-[13px] text-gray-600 dark:text-gray-300 mb-1">
                {label}{required ? ' *' : ''}
            </Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                placeholderTextColor="#9ca3af"
                placeholder={`Enter ${label.toLowerCase()}`}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-3 text-gray-900 dark:text-white"
            />
        </View>
    );
}

