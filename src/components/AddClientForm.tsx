import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import MeasurementsForm from './MeasurementsForm';

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

export default function AddClientForm({ initialValues, onSubmit, submitLabel = 'Add Client' }: Props) {
    const [values, setValues] = useState<any>({ ...DEFAULTS });

    useEffect(() => {
        if (initialValues) {
            // shallow merge to keep missing keys safe
            setValues((v: any) => ({
                ...v,
                ...initialValues,
                measurements: {
                    ...DEFAULTS.measurements,
                    ...(initialValues.measurements || {}),
                    custom_fields: Array.isArray(initialValues.measurements?.custom_fields)
                        ? initialValues.measurements.custom_fields
                        : [],
                },
            }));
        }
    }, [initialValues]);

    const update = (key: string) => (text: string) =>
        setValues((v: any) => ({ ...v, [key]: text }));

    const validate = (): string | null => {
        if (!values.name?.trim()) return 'Name is required.';
        if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) return 'Invalid email.';
        if (values.phone && !/^[\d+\-\s()]{6,}$/.test(values.phone)) return 'Invalid phone.';
        return null;
    };

    const handleSubmit = async () => {
        const err = validate();
        if (err) return Toast.show({ type: 'error', text1: err });
        await onSubmit(values);
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

            <Pressable
                onPress={handleSubmit}
                className="mt-6 h-12 rounded-xl items-center justify-center bg-blue-600 active:bg-blue-700"
            >
                <Text className="text-white font-semibold">{submitLabel}</Text>
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

