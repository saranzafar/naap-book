// src/components/MeasurementsForm.tsx
import React, { useCallback, useMemo } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Plus, Trash2 } from 'lucide-react-native';
import uuid from 'react-native-uuid';

import type { Measurements, MeasurementEntry, CustomField } from '../types/Client';

const MEAS_KEYS: Array<{ key: keyof Omit<Measurements, 'custom_fields'>; label: string }> = [
  { key: 'Qameez', label: 'Qameez / قمیض' },
  { key: 'Bazu', label: 'Bazu / بازو' },
  { key: 'Teera', label: 'Teera / تیرا' },
  { key: 'Gala', label: 'Gala / گلا' },
  { key: 'Chati', label: 'Chati / چھاتی' },
  { key: 'Qamar', label: 'Qamar / کمر' },
  { key: 'Ghera', label: 'Ghera / گھیرہ' },
  { key: 'Shalwar', label: 'Shalwar / شلوار' },
  { key: 'Pancha', label: 'Pancha / پانچہ' },
];

export default function MeasurementsForm({
  value,
  onChange,
}: {
  value: Measurements;
  onChange: (next: Measurements) => void;
}) {
  const safeValue: Measurements = useMemo(
    () => ({
      Qameez: value?.Qameez || { value: '', notes: '' },
      Bazu: value?.Bazu || { value: '', notes: '' },
      Teera: value?.Teera || { value: '', notes: '' },
      Gala: value?.Gala || { value: '', notes: '' },
      Chati: value?.Chati || { value: '', notes: '' },
      Qamar: value?.Qamar || { value: '', notes: '' },
      Ghera: value?.Ghera || { value: '', notes: '' },
      Shalwar: value?.Shalwar || { value: '', notes: '' },
      Pancha: value?.Pancha || { value: '', notes: '' },
      custom_fields: value?.custom_fields || {},
    }),
    [value]
  );

  const updateStd = useCallback(
    (k: keyof Omit<Measurements, 'custom_fields'>, field: keyof MeasurementEntry, text: string) => {
      const cur = safeValue[k] || { value: '', notes: '' };
      onChange({
        ...safeValue,
        [k]: { ...cur, [field]: text },
      });
    },
    [safeValue, onChange]
  );

  const customList = useMemo(() => Object.entries(safeValue.custom_fields || {}), [safeValue.custom_fields]);

  const addCustom = useCallback(() => {
    const id = String(uuid.v4());
    const next: Record<string, CustomField> = {
      ...safeValue.custom_fields,
      [id]: { name: '', value: '', notes: '' },
    };
    onChange({ ...safeValue, custom_fields: next });
  }, [safeValue, onChange]);

  const updateCustom = useCallback(
    (key: string, field: keyof CustomField, text: string) => {
      const next = { ...safeValue.custom_fields };
      const row = next[key] || { name: '', value: '', notes: '' };
      next[key] = { ...row, [field]: text };
      onChange({ ...safeValue, custom_fields: next });
    },
    [safeValue, onChange]
  );

  const removeCustom = useCallback(
    (key: string) => {
      const next = { ...safeValue.custom_fields };
      delete next[key];
      onChange({ ...safeValue, custom_fields: next });
    },
    [safeValue, onChange]
  );

  return (
    <View>
      <Text className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
        Measurements / ناپ
      </Text>

      {/* Standard measurement fields */}
      <View className="flex-row flex-wrap -mx-1">
        {MEAS_KEYS.map(({ key, label }) => {
          const e = safeValue[key] || { value: '', notes: '' };
          return (
            <View key={String(key)} className="w-1/2 px-1 mb-2">
              <View className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <Text className="mb-2 text-[12px] text-gray-500">{label}</Text>

                <TextInput
                  value={e.value || ''}
                  onChangeText={(t) => updateStd(key, 'value', t)}
                  keyboardType="decimal-pad"
                  placeholder="Value"
                  placeholderTextColor="#9ca3af"
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-gray-900 dark:border-zinc-800 dark:text-white"
                />

                <TextInput
                  value={e.notes || ''}
                  onChangeText={(t) => updateStd(key, 'notes', t)}
                  placeholder="Notes"
                  placeholderTextColor="#9ca3af"
                  className="mt-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-gray-900 dark:border-zinc-800 dark:text-white"
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Custom fields */}
      <View className="mt-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            Custom Fields / اضافی ناپ
          </Text>
          <Pressable
            onPress={addCustom}
            className="px-3 h-9 rounded-full bg-blue-500/80 dark:bg-blue-400/70 items-center justify-center flex-row"
          >
            <Plus size={16} color="#fff" />
            <Text className="text-white font-semibold ml-2">Add</Text>
          </Pressable>
        </View>

        {customList.length === 0 ? (
          <Text className="text-gray-500">No custom fields.</Text>
        ) : (
          <View className="gap-2">
            {customList.map(([key, cf]) => (
              <View
                key={key}
                className="border rounded-xl p-3 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              >
                <View className="flex-row gap-2">
                  <TextInput
                    value={cf.name || ''}
                    onChangeText={(t) => updateCustom(key, 'name', t)}
                    placeholder="Name (e.g., Sleeve Width)"
                    placeholderTextColor="#9ca3af"
                    className="flex-1 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                  />
                  <Pressable
                    onPress={() => removeCustom(key)}
                    className="w-10 h-10 rounded-lg bg-red-600 items-center justify-center"
                  >
                    <Trash2 size={16} color="#fff" />
                  </Pressable>
                </View>

                <TextInput
                  value={cf.value || ''}
                  onChangeText={(t) => updateCustom(key, 'value', t)}
                  keyboardType="decimal-pad"
                  placeholder="Value"
                  placeholderTextColor="#9ca3af"
                  className="mt-2 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                />

                <TextInput
                  value={cf.notes || ''}
                  onChangeText={(t) => updateCustom(key, 'notes', t)}
                  placeholder="Notes"
                  placeholderTextColor="#9ca3af"
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
