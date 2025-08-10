import React from "react";
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
    <View className="mt-4">
      <Text className="text-lg font-semibold mb-2">Measurements</Text>

      {/* Standard measurements */}
      {stdKeys.map((k) => (
        <View key={k} className="mb-3">
          <Text className="text-sm font-medium mb-1">{LABELS[k]}</Text>
          <View className="flex-row gap-2">
            <TextInput
              placeholder="Value"
              keyboardType="numeric"
              value={String(values[k]?.value ?? "")}
              onChangeText={(txt) =>
                upsertStd(k, { value: Number(txt.replace(/[^0-9.]/g, "")) || 0 })
              }
              className="flex-1 border rounded p-2"
            />
            <TextInput
              placeholder="Note"
              value={values[k]?.notes ?? ""}
              onChangeText={(txt) => upsertStd(k, { notes: txt })}
              className="flex-1 border rounded p-2"
            />
          </View>
        </View>
      ))}

      {/* Custom fields */}
      <View className="mt-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-semibold">Custom Fields</Text>
          <TouchableOpacity
            onPress={addCustomField}
            className="bg-blue-600 px-3 py-2 rounded-md"
            activeOpacity={0.85}
          >
            <View className="flex-row items-center gap-2">
              <Plus color="white" size={18} />
              <Text className="text-white">Add</Text>
            </View>
          </TouchableOpacity>
        </View>

        {Object.entries(values.custom_fields || {}).length === 0 ? (
          <Text className="text-gray-500">No custom fields added yet.</Text>
        ) : (
          Object.entries(values.custom_fields || {}).map(([id, field]) => (
            <View key={id} className="mb-3 border rounded p-3">
              <View className="flex-row gap-2 mb-2">
                <TextInput
                  placeholder="Field name (e.g., Thigh)"
                  value={field.name}
                  onChangeText={(txt) => updateCustomField(id, { name: txt })}
                  className="flex-1 border rounded p-2"
                />
                <TextInput
                  placeholder="Value"
                  keyboardType="numeric"
                  value={String(field.value ?? "")}
                  onChangeText={(txt) =>
                    updateCustomField(id, {
                      value: Number(txt.replace(/[^0-9.]/g, "")) || 0,
                    })
                  }
                  className="w-28 border rounded p-2"
                />
              </View>
              <View className="flex-row items-center gap-2">
                <TextInput
                  placeholder="Note"
                  value={field.notes ?? ""}
                  onChangeText={(txt) => updateCustomField(id, { notes: txt })}
                  className="flex-1 border rounded p-2"
                />
                <TouchableOpacity
                  onPress={() => removeCustomField(id)}
                  className="bg-red-600 px-3 py-2 rounded-md"
                  activeOpacity={0.85}
                >
                  <View className="flex-row items-center gap-1">
                    <Trash2 color="white" size={18} />
                    <Text className="text-white">Remove</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
