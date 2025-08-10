import React, { JSX } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Measurements, MeasurementField, CustomField } from "../types/Client";
import { Plus, Trash2 } from "lucide-react-native";

type Props = {
  values: Measurements;
  onChange: (values: Measurements) => void;
};

type StdKey =
  | "chest"
  | "shoulder"
  | "arm_length"
  | "collar"
  | "shirt_length"
  | "waist"
  | "hips"
  | "trouser_length"
  | "inseam";

const LABELS: Record<StdKey, string> = {
  chest: "Chest / Bust",
  shoulder: "Shoulder",
  arm_length: "Arm Length",
  collar: "Collar / Neck",
  shirt_length: "Shirt Length",
  waist: "Waist",
  hips: "Hips",
  trouser_length: "Trouser Length",
  inseam: "Inseam",
};

export default function MeasurementsForm({ values, onChange }: Props) {
  const upsertStd = (key: StdKey, patch: Partial<MeasurementField>) => {
    const current: MeasurementField = {
      value: values[key]?.value ?? 0,
      notes: values[key]?.notes ?? "",
    };
    onChange({ ...values, [key]: { ...current, ...patch } });
  };

  const stdKeys = Object.keys(LABELS) as StdKey[];

  const addCustomField = () => {
    const id = `field_${Date.now()}`;
    const cf: CustomField = { name: "", value: 0, notes: "" };
    onChange({
      ...values,
      custom_fields: { ...(values.custom_fields || {}), [id]: cf },
    });
  };

  const updateCustomField = (id: string, patch: Partial<CustomField>) => {
    const cur = values.custom_fields?.[id] || { name: "", value: 0, notes: "" };
    onChange({
      ...values,
      custom_fields: {
        ...(values.custom_fields || {}),
        [id]: { ...cur, ...patch },
      },
    });
  };

  const removeCustomField = (id: string) => {
    const next = { ...(values.custom_fields || {}) };
    delete next[id];
    onChange({ ...values, custom_fields: next });
  };

  return (
    <View className="">
      {/* Standard Measurements */}
      <View className="space-y-2">
        {stdKeys.reduce((acc, key, index) => {
          if (index % 2 === 0) {
            const nextKey = stdKeys[index + 1];
            acc.push(
              <View key={`pair-${index}`} className="flex-row gap-2 mb-2">
                {/* First measurement */}
                <View className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 p-3">
                  <Text className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {LABELS[key]}
                  </Text>
                  <TextInput
                    placeholder="0"
                    keyboardType="numeric"
                    value={String(values[key]?.value ?? "")}
                    onChangeText={(txt) =>
                      upsertStd(key, { value: Number(txt.replace(/[^0-9.]/g, "")) || 0 })
                    }
                    className="bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded px-3 py-2 text-gray-900 dark:text-white text-sm mb-2"
                  />
                  <TextInput
                    placeholder="Notes..."
                    value={values[key]?.notes ?? ""}
                    onChangeText={(txt) => upsertStd(key, { notes: txt })}
                    className="bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded px-3 py-1.5 text-gray-900 dark:text-white text-xs"
                  />
                </View>

                {/* Second measurement */}
                {nextKey ? (
                  <View className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 p-3">
                    <Text className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {LABELS[nextKey]}
                    </Text>
                    <TextInput
                      placeholder="0"
                      keyboardType="numeric"
                      value={String(values[nextKey]?.value ?? "")}
                      onChangeText={(txt) =>
                        upsertStd(nextKey, { value: Number(txt.replace(/[^0-9.]/g, "")) || 0 })
                      }
                      className="bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded px-3 py-2 text-gray-900 dark:text-white text-sm mb-2"
                    />
                    <TextInput
                      placeholder="Notes..."
                      value={values[nextKey]?.notes ?? ""}
                      onChangeText={(txt) => upsertStd(nextKey, { notes: txt })}
                      className="bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded px-3 py-1.5 text-gray-900 dark:text-white text-xs"
                    />
                  </View>
                ) : (
                  <View className="flex-1" />
                )}
              </View>
            );
          }
          return acc;
        }, [] as JSX.Element[])}
      </View>

      {/* Custom Fields Section */}
      <View>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            Custom Fields
          </Text>
          <TouchableOpacity
            onPress={addCustomField}
            className="bg-blue-500 px-3 py-2 rounded-lg flex-row items-center space-x-1"
            activeOpacity={0.8}
          >
            <Plus color="white" size={16} />
            <Text className="text-white font-medium text-sm">Add</Text>
          </TouchableOpacity>
        </View>

        {Object.entries(values.custom_fields || {}).length === 0 ? (
          <View className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600 border-dashed">
            <Text className="text-gray-500 dark:text-gray-400 text-center text-sm">
              No custom fields added yet
            </Text>
          </View>
        ) : (
          <View className="space-y-3">
            {Object.entries(values.custom_fields || {}).reduce((acc, [id, field], index) => {
              if (index % 2 === 0) {
                const entries = Object.entries(values.custom_fields || {});
                const nextEntry = entries[index + 1];

                acc.push(
                  <View key={`custom-pair-${index}`} className="flex-row gap-3">
                    {/* First custom field */}
                    <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-3">
                      <View className="flex-row items-center gap-2 mb-2">
                        <TextInput
                          placeholder="Field name"
                          value={field.name}
                          onChangeText={(txt) => updateCustomField(id, { name: txt })}
                          className="flex-1 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded px-3 py-1.5 text-gray-900 dark:text-white text-xs"
                        />
                        <TouchableOpacity
                          onPress={() => removeCustomField(id)}
                          className="bg-red-500 px-2 py-1.5 rounded"
                          activeOpacity={0.8}
                        >
                          <Trash2 color="white" size={12} />
                        </TouchableOpacity>
                      </View>
                      <TextInput
                        placeholder="0"
                        keyboardType="numeric"
                        value={String(field.value ?? "")}
                        onChangeText={(txt) =>
                          updateCustomField(id, {
                            value: Number(txt.replace(/[^0-9.]/g, "")) || 0,
                          })
                        }
                        className="bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded px-3 py-2 text-gray-900 dark:text-white text-sm mb-2"
                      />
                      <TextInput
                        placeholder="Notes..."
                        value={field.notes ?? ""}
                        onChangeText={(txt) => updateCustomField(id, { notes: txt })}
                        className="bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded px-3 py-1.5 text-gray-900 dark:text-white text-xs"
                      />
                    </View>

                    {/* Second custom field */}
                    {nextEntry ? (
                      <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-3">
                        <View className="flex-row items-center gap-2 mb-2">
                          <TextInput
                            placeholder="Field name"
                            value={nextEntry[1].name}
                            onChangeText={(txt) => updateCustomField(nextEntry[0], { name: txt })}
                            className="flex-1 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded px-3 py-1.5 text-gray-900 dark:text-white text-xs"
                          />
                          <TouchableOpacity
                            onPress={() => removeCustomField(nextEntry[0])}
                            className="bg-red-500 px-2 py-1.5 rounded"
                            activeOpacity={0.8}
                          >
                            <Trash2 color="white" size={12} />
                          </TouchableOpacity>
                        </View>
                        <TextInput
                          placeholder="0"
                          keyboardType="numeric"
                          value={String(nextEntry[1].value ?? "")}
                          onChangeText={(txt) =>
                            updateCustomField(nextEntry[0], {
                              value: Number(txt.replace(/[^0-9.]/g, "")) || 0,
                            })
                          }
                          className="bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded px-3 py-2 text-gray-900 dark:text-white text-sm mb-2"
                        />
                        <TextInput
                          placeholder="Notes..."
                          value={nextEntry[1].notes ?? ""}
                          onChangeText={(txt) => updateCustomField(nextEntry[0], { notes: txt })}
                          className="bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded px-3 py-1.5 text-gray-900 dark:text-white text-xs"
                        />
                      </View>
                    ) : (
                      <View className="flex-1" />
                    )}
                  </View>
                );
              }
              return acc;
            }, [] as JSX.Element[])}
          </View>
        )}
      </View>
    </View>
  );
}