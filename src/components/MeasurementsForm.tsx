// src/components/MeasurementsForm.tsx
import React, { useCallback, useMemo } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Plus, Trash2 } from 'lucide-react-native';
import uuid from 'react-native-uuid';

// Use the proper types from Client.ts
import { MeasurementFieldInput, CustomFieldInput, MeasurementsFormValues } from '../types/Client';

const MEAS_KEYS: Array<{ key: keyof Omit<MeasurementsFormValues, 'custom_fields'>; label: string }> = [
  { key: 'chest', label: 'Chest / Bust' },
  { key: 'shoulder', label: 'Shoulder' },
  { key: 'arm_length', label: 'Arm Length' },
  { key: 'collar', label: 'Collar / Neck' },
  { key: 'shirt_length', label: 'Shirt Length' },
  { key: 'waist', label: 'Waist' },
  { key: 'hips', label: 'Hips' },
  { key: 'trouser_length', label: 'Trouser Length' },
  { key: 'inseam', label: 'Inseam' },
];

export default function MeasurementsForm({
  value,
  onChange,
}: {
  value: MeasurementsFormValues;
  onChange: (next: MeasurementsFormValues) => void;
}) {
  // Ensure value has proper structure - wrapped in useMemo to prevent recreation
  const safeValue: MeasurementsFormValues = useMemo(() => ({
    chest: value?.chest || { value: '', notes: '' },
    shoulder: value?.shoulder || { value: '', notes: '' },
    arm_length: value?.arm_length || { value: '', notes: '' },
    collar: value?.collar || { value: '', notes: '' },
    shirt_length: value?.shirt_length || { value: '', notes: '' },
    waist: value?.waist || { value: '', notes: '' },
    hips: value?.hips || { value: '', notes: '' },
    trouser_length: value?.trouser_length || { value: '', notes: '' },
    inseam: value?.inseam || { value: '', notes: '' },
    custom_fields: Array.isArray(value?.custom_fields) ? value.custom_fields : [],
  }), [value]);

  const updateStd = useCallback(
    (k: keyof Omit<MeasurementsFormValues, 'custom_fields'>, field: keyof MeasurementFieldInput, text: string) => {
      const cur = safeValue[k] || { value: '', notes: '' };
      onChange({
        ...safeValue,
        [k]: { ...cur, [field]: text }
      });
    },
    [safeValue, onChange]
  );

  const addCustom = useCallback(() => {
    const list = safeValue.custom_fields || [];
    const next = [
      ...list,
      { _key: String(uuid.v4()), name: '', value: '', notes: '' } as CustomFieldInput,
    ];
    onChange({ ...safeValue, custom_fields: next });
  }, [safeValue, onChange]);

  const updateCustom = useCallback(
    (idx: number, field: keyof CustomFieldInput, text: string) => {
      const list = [...(safeValue.custom_fields || [])];
      const row = { ...(list[idx] || { _key: String(uuid.v4()), name: '', value: '', notes: '' }) };
      (row as any)[field] = text;
      list[idx] = row;
      onChange({ ...safeValue, custom_fields: list });
    },
    [safeValue, onChange]
  );

  const removeCustom = useCallback(
    (idx: number) => {
      const list = [...(safeValue.custom_fields || [])];
      list.splice(idx, 1);
      onChange({ ...safeValue, custom_fields: list });
    },
    [safeValue, onChange]
  );

  return (
    <View className="mt-3">
      <Text className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Measurements</Text>

      {/* Standard fields grid */}
      <View className="flex-row flex-wrap -mx-1">
        {MEAS_KEYS.map(({ key, label }) => {
          const e = safeValue[key] || { value: '', notes: '' };
          return (
            <View key={String(key)} className="w-full md:w-1/2 px-1 mb-2">
              <View className="border rounded-xl p-3 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <Text className="text-gray-500 text-[12px] mb-2">{label}</Text>

                <TextInput
                  value={e.value || ''}
                  onChangeText={(t) => updateStd(key, 'value', t)}
                  keyboardType="decimal-pad"
                  placeholder="Value"
                  placeholderTextColor="#9ca3af"
                  blurOnSubmit={false}
                  className="border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                />

                <TextInput
                  value={e.notes || ''}
                  onChangeText={(t) => updateStd(key, 'notes', t)}
                  placeholder="Notes"
                  placeholderTextColor="#9ca3af"
                  blurOnSubmit={false}
                  multiline
                  className="mt-2 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Custom fields */}
      <View className="mt-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">Custom Fields</Text>
          <Pressable
            onPress={addCustom}
            className="px-3 h-9 rounded-full bg-blue-500/80 dark:bg-blue-400/70 items-center justify-center flex-row"
          >
            <Plus size={16} color="#fff" />
            <Text className="text-white font-semibold ml-2">Add</Text>
          </Pressable>
        </View>

        {safeValue.custom_fields.length === 0 ? (
          <Text className="text-gray-500">No custom fields.</Text>
        ) : (
          <View className="gap-2">
            {safeValue.custom_fields.map((cf, idx) => (
              <View key={cf._key || String(idx)} className="border rounded-xl p-3 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <View className="flex-row gap-2">
                  <TextInput
                    value={cf.name || ''}
                    onChangeText={(t) => updateCustom(idx, 'name', t)}
                    placeholder="Name (e.g., Sleeve Width)"
                    placeholderTextColor="#9ca3af"
                    blurOnSubmit={false}
                    className="flex-1 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                  />
                  <Pressable
                    onPress={() => removeCustom(idx)}
                    className="w-10 h-10 rounded-lg bg-red-600 items-center justify-center"
                  >
                    <Trash2 size={16} color="#fff" />
                  </Pressable>
                </View>

                <TextInput
                  value={cf.value || ''}
                  onChangeText={(t) => updateCustom(idx, 'value', t)}
                  keyboardType="decimal-pad"
                  placeholder="Value"
                  placeholderTextColor="#9ca3af"
                  blurOnSubmit={false}
                  className="mt-2 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                />

                <TextInput
                  value={cf.notes || ''}
                  onChangeText={(t) => updateCustom(idx, 'notes', t)}
                  placeholder="Notes"
                  placeholderTextColor="#9ca3af"
                  blurOnSubmit={false}
                  multiline
                  className="mt-2 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                />
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}