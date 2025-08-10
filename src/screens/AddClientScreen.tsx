import React, { useState } from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { addClient } from "../services/StorageService";
import {
    validateMeasurementValues,
    validateMeasurementNotes,
    validateCustomFieldsLimit,
    validateCustomFieldNames,
} from "../utils/validation";

import AddClientForm from "../components/AddClientForm";
import MeasurementsForm from "../components/MeasurementsForm";
import { AddClientFormValues, Measurements } from "../types/Client";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import Toast from "react-native-toast-message";
import { validateUser } from "../storage/StorageService";

type AddClientScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "AddClient"
>;

const initialMeasurements: Measurements = {
    chest: { value: 0, notes: "" },
    shoulder: { value: 0, notes: "" },
    arm_length: { value: 0, notes: "" },
    collar: { value: 0, notes: "" },
    shirt_length: { value: 0, notes: "" },
    waist: { value: 0, notes: "" },
    hips: { value: 0, notes: "" },
    trouser_length: { value: 0, notes: "" },
    inseam: { value: 0, notes: "" },
    custom_fields: {},
};

export default function AddClientScreen({
    navigation,
}: {
    navigation: AddClientScreenNavigationProp;
}) {
    const [client, setClient] = useState<AddClientFormValues>({
        name: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
    });
    const [measurements, setMeasurements] =
        useState<Measurements>(initialMeasurements);
    const [errors, setErrors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
        const userCheck = validateUser(client);
        const valueErrors = validateMeasurementValues(measurements);
        const noteErrors = validateMeasurementNotes(measurements);
        const cfLimitErrors = validateCustomFieldsLimit(measurements, 5);
        const cfNameErrors = validateCustomFieldNames(measurements);

        const allErrors = [
            ...userCheck.errors,
            ...valueErrors,
            ...noteErrors,
            ...cfLimitErrors,
            ...cfNameErrors,
        ];

        if (!userCheck.isValid || allErrors.length > 0) {
            setErrors(allErrors);
            return;
        }

        try {
            setSaving(true);
            setErrors([]);
            await addClient(client, measurements);

            Toast.show({
                type: "success",
                text1: "Client added!",
                text2: client.name ? `Welcome, ${client.name}!` : undefined,
                position: "top",
                visibilityTime: 2000,
            });

            navigation.goBack();
        } catch (e) {
            setErrors(["Failed to add client. Please try again."]);
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView className="flex-1 p-4">
            <Text className="text-xl font-bold mb-2">Add New Client</Text>

            <AddClientForm values={client} onChange={setClient} errors={errors} />
            <MeasurementsForm values={measurements} onChange={setMeasurements} />

            {!!errors.length && (
                <View className="mb-2">
                    {errors.map((err, i) => (
                        <Text key={i} className="text-red-500">
                            {err}
                        </Text>
                    ))}
                </View>
            )}

            <TouchableOpacity
                onPress={handleSubmit}
                disabled={saving}
                className={`${saving ? "bg-blue-400" : "bg-blue-600"} py-3 rounded-lg items-center mt-4`}
                activeOpacity={0.8}
            >
                <Text className="text-white font-bold text-lg">
                    {saving ? "Saving..." : "Save Client"}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
