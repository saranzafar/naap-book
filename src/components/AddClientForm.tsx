import React from "react";
import { View, TextInput } from "react-native";
import { AddClientFormValues } from "../types/Client";

type Props = {
    values: AddClientFormValues;
    onChange: (values: AddClientFormValues) => void;
    errors?: string[];
};

export default function AddClientForm({ values, onChange, errors }: Props) {
    return (
        <View>
            <TextInput
                placeholder="Full Name"
                value={values.name}
                onChangeText={val => onChange({ ...values, name: val })}
                className="mb-2 border rounded p-2"
            />
            <TextInput
                placeholder="Phone"
                value={values.phone}
                onChangeText={val => onChange({ ...values, phone: val })}
                className="mb-2 border rounded p-2"
            />
            <TextInput
                placeholder="Email"
                value={values.email}
                onChangeText={val => onChange({ ...values, email: val })}
                className="mb-2 border rounded p-2"
            />
            <TextInput
                placeholder="Address"
                value={values.address}
                onChangeText={val => onChange({ ...values, address: val })}
                className="mb-2 border rounded p-2"
            />
            <TextInput
                placeholder="Notes"
                value={values.notes}
                onChangeText={val => onChange({ ...values, notes: val })}
                className="mb-2 border rounded p-2"
            />
        </View>
    );
}
