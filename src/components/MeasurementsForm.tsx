import React from "react";
import { View, TextInput, Text } from "react-native";
import { Measurements } from "../types/Client";

type Props = {
  values: Measurements;
  onChange: (vals: Measurements) => void;
};

const measurementFields: (keyof Measurements)[] = [
  "chest", "shoulder", "arm_length", "collar", "shirt_length",
  "waist", "hips", "trouser_length", "inseam"
];

export default function MeasurementsForm({ values, onChange }: Props) {
  return (
    <View className="mt-4">
      <Text className="font-bold mb-2">Measurements</Text>
      {measurementFields.map(field => (
        <View key={field} className="flex-row items-center mb-2">
          <Text className="w-32 capitalize">{field.replace("_", " ")}:</Text>
          <TextInput
            keyboardType="numeric"
            placeholder="Value"
            value={values[field]?.value?.toString() || ""}
            onChangeText={val =>
              onChange({
                ...values,
                [field]: {
                  ...values[field],
                  value: Number(val),
                }
              })
            }
            className="border rounded p-2 flex-1"
          />
          {/* Optional: Notes for each field */}
        </View>
      ))}
      {/* Optionally: Render custom fields */}
    </View>
  );
}
