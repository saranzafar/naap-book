import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import MeasurementsForm from './MeasurementsForm';
import { MeasurementsFormValues, AddClientFormValues } from '../types/Client';
import { ScrollView } from 'react-native-gesture-handler';

type Props = {
    initialValues?: Partial<AddClientFormValues>;
    onSubmit: (values: AddClientFormValues) => Promise<void> | void;
    submitLabel?: string;
    mode?: 'add' | 'edit';
};

const DEFAULT_MEASUREMENTS: MeasurementsFormValues = {
    chest: { value: '', notes: '' },
    shoulder: { value: '', notes: '' },
    arm_length: { value: '', notes: '' },
    collar: { value: '', notes: '' },
    shirt_length: { value: '', notes: '' },
    waist: { value: '', notes: '' },
    hips: { value: '', notes: '' },
    trouser_length: { value: '', notes: '' },
    inseam: { value: '', notes: '' },
    custom_fields: [],
};

const DEFAULTS: AddClientFormValues = {
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    measurements: DEFAULT_MEASUREMENTS,
};

export default function AddClientForm({ initialValues, onSubmit, submitLabel = 'Add Client' }: Props) {
    const [values, setValues] = useState<AddClientFormValues>({ ...DEFAULTS });

    useEffect(() => {
        if (initialValues) {
            // Safely merge initial values with defaults
            const safeInitial: AddClientFormValues = {
                name: initialValues.name || '',
                phone: initialValues.phone || '',
                email: initialValues.email || '',
                address: initialValues.address || '',
                notes: initialValues.notes || '',
                measurements: {
                    chest: initialValues.measurements?.chest || { value: '', notes: '' },
                    shoulder: initialValues.measurements?.shoulder || { value: '', notes: '' },
                    arm_length: initialValues.measurements?.arm_length || { value: '', notes: '' },
                    collar: initialValues.measurements?.collar || { value: '', notes: '' },
                    shirt_length: initialValues.measurements?.shirt_length || { value: '', notes: '' },
                    waist: initialValues.measurements?.waist || { value: '', notes: '' },
                    hips: initialValues.measurements?.hips || { value: '', notes: '' },
                    trouser_length: initialValues.measurements?.trouser_length || { value: '', notes: '' },
                    inseam: initialValues.measurements?.inseam || { value: '', notes: '' },
                    custom_fields: Array.isArray(initialValues.measurements?.custom_fields)
                        ? initialValues.measurements.custom_fields
                        : [],
                },
            };
            setValues(safeInitial);
        }
    }, [initialValues]);

    const update = (key: keyof Omit<AddClientFormValues, 'measurements'>) => (text: string) =>
        setValues((v) => ({ ...v, [key]: text }));

    const handleSubmit = async () => {
        try {
            // Validate required fields
            if (!values.name?.trim()) {
                Toast.show({
                    type: 'error',
                    text1: 'Validation Error',
                    text2: 'Name is required'
                });
                return;
            }

            // Clean up the form payload
            const formPayload: AddClientFormValues = {
                name: values.name.trim(),
                phone: values.phone?.trim() || undefined,
                email: values.email?.trim() || undefined,
                address: values.address?.trim() || undefined,
                notes: values.notes?.trim() || undefined,
                measurements: values.measurements,
            };

            await onSubmit(formPayload);
        } catch (error) {
            console.error('Form submission error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error instanceof Error ? error.message : 'Failed to save client'
            });
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1"
        >
            <ScrollView
                keyboardShouldPersistTaps="handled"
                className="flex-1"
            >
                {/* Card wrapper */}
                <View className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                    <Text className="mb-3 font-bold text-zinc-800 dark:text-zinc-100">
                        Client Details
                    </Text>

                    {/* Two-column grid */}
                    <View className="-mx-2 flex-row flex-wrap">
                        <View className="w-1/2 px-2">
                            <Field
                                label="Name"
                                value={values.name}
                                onChangeText={update("name")}
                                required
                            />
                        </View>
                        <View className="w-1/2 px-2">
                            <Field
                                label="Phone"
                                value={values.phone || ""}
                                onChangeText={update("phone")}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View className="w-1/2 px-2 mt-3">
                            <Field
                                label="Email"
                                value={values.email || ""}
                                onChangeText={update("email")}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        <View className="w-1/2 px-2 mt-3">
                            <Field
                                label="Address"
                                value={values.address || ""}
                                onChangeText={update("address")}
                            />
                        </View>
                    </View>
                </View>

                {/* Measurements in its own card */}
                <View className="mt-2 rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                    <MeasurementsForm
                        value={values.measurements}
                        onChange={(m: any) => setValues((v: any) => ({ ...v, measurements: m }))}
                    />
                </View>

                {/* Notes LAST as a textarea */}
                <View className="mt-2 rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                    <Field
                        label="Notes"
                        value={values.notes || ""}
                        onChangeText={update("notes")}
                        multiline
                    />
                </View>

                {/* Submit */}
                <View className="mb-12">
                    <Pressable
                        onPress={handleSubmit}
                        android_ripple={{ color: "#ffffff22", borderless: false }}
                        className="mt-4 rounded-2xl border border-blue-600 bg-blue-600 py-3 shadow-lg active:opacity-90 dark:border-blue-500 dark:bg-blue-500"
                    >
                        <Text className="text-center text-base font-semibold text-white">
                            {submitLabel}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
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