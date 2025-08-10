import React from "react";
import { View, Text, TextInput } from "react-native";
import { AddClientFormValues } from "../types/Client";

type Props = {
    values: AddClientFormValues;
    onChange: (values: AddClientFormValues) => void;
    errors?: string[];
};

export default function AddClientForm({ values, onChange, errors }: Props) {
    return (
        <View>
            {!!errors?.length && (
                <View className="mb-2">
                    {errors.map((e, i) => (
                        <Text key={i} className="text-red-600 text-sm">{e}</Text>
                    ))}
                </View>
            )}

            <TextInput
                placeholder="Full Name"
                value={values.name ?? ""}
                onChangeText={(val) => onChange({ ...values, name: val })}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                className="mb-2 border rounded p-2"
            />

            <TextInput
                placeholder="Phone"
                value={values.phone ?? ""}
                onChangeText={(val) => onChange({ ...values, phone: val })}
                keyboardType="phone-pad"
                autoCorrect={false}
                returnKeyType="next"
                className="mb-2 border rounded p-2"
            />

            <TextInput
                placeholder="Email"
                value={values.email ?? ""}
                onChangeText={(val) => onChange({ ...values, email: val })}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                className="mb-2 border rounded p-2"
            />

            <TextInput
                placeholder="Address"
                value={values.address ?? ""}
                onChangeText={(val) => onChange({ ...values, address: val })}
                autoCapitalize="sentences"
                returnKeyType="next"
                className="mb-2 border rounded p-2"
            />

            <TextInput
                placeholder="Notes"
                value={values.notes ?? ""}
                onChangeText={(val) => onChange({ ...values, notes: val })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="mb-2 border rounded p-2"
            />
        </View>
    );
}
