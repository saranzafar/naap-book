import React, { useState } from "react";
import { View, ScrollView, Text, TouchableOpacity, SafeAreaView } from "react-native";
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
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700">
                    <View className="px-6 py-6">
                        <Text className="text-3xl font-bold text-gray-900 dark:text-white">
                            Add New Client
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 mt-1">
                            Enter client details and measurements
                        </Text>
                    </View>
                </View>

                {/* Content */}
                <View className="p-4">
                    {/* Client Information Card */}
                    <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <View className="p-3 bg-blue-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                                Client Information
                            </Text>
                        </View>
                        <View className="p-4">
                            <AddClientForm
                                values={client}
                                onChange={setClient}
                                errors={errors}
                            />
                        </View>
                    </View>

                    {/* Measurements Card */}
                    <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <View className="px-4 py-3 bg-green-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                                Measurements
                            </Text>
                        </View>
                        <View className="">
                            <MeasurementsForm
                                values={measurements}
                                onChange={setMeasurements}
                            />
                        </View>
                    </View>

                    {/* Error Messages */}
                    {errors.length > 0 && (
                        <View className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4">
                            <View className="flex-row items-center mb-2">
                                <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                                <Text className="text-red-800 dark:text-red-400 font-medium">
                                    Please fix the following errors:
                                </Text>
                            </View>
                            {errors.map((err, i) => (
                                <Text
                                    key={i}
                                    className="text-red-700 dark:text-red-300 text-sm ml-4 mb-1"
                                >
                                    • {err}
                                </Text>
                            ))}
                        </View>
                    )}

                    {/* Save Button */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={saving}
                        className={`${saving
                                ? "bg-gray-400 dark:bg-gray-600"
                                : "bg-blue-600 dark:bg-blue-500"
                            } py-4 px-6 rounded-xl items-center justify-center shadow-lg`}
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-semibold text-lg">
                            {saving ? "Saving..." : "Save Client"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}