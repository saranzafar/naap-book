import React, { useState } from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { saveUser } from "../services/StorageService";
import { validateUser } from "../utils/validation";
import AddClientForm from "../components/AddClientForm";
import MeasurementsForm from "../components/MeasurementsForm";
import { AddClientFormValues, Measurements } from "../types/Client";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import uuid from 'react-native-uuid';
import Toast from 'react-native-toast-message';


type AddClientScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddClient'>;

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
    custom_fields: {}, // only if you're using this
};

export default function AddClientScreen({ navigation }: { navigation: AddClientScreenNavigationProp }) {
    const [client, setClient] = useState<AddClientFormValues>({
        name: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
    });
    const [measurements, setMeasurements] = useState<Measurements>(initialMeasurements);
    const [errors, setErrors] = useState<string[]>([]);

    const handleSubmit = async () => {
        const { isValid, errors: userErrors } = validateUser(client);
        if (!isValid) {
            setErrors(userErrors);
            return;
        }
        const newClient = {
            id: uuid.v4() as string,
            ...client,
            measurements,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        await saveUser(newClient);

        Toast.show({
            type: 'success',
            text1: 'Client added!',
            text2: client.name ? `Welcome, ${client.name}!` : undefined,
            position: 'top', // or 'bottom'
            visibilityTime: 2000,
        });

        navigation.goBack();
    };

    return (
        <ScrollView className="flex-1 p-4">
            <Text className="text-xl font-bold mb-2">Add New Client</Text>
            <AddClientForm values={client} onChange={setClient} errors={errors} />
            <MeasurementsForm values={measurements} onChange={setMeasurements} />
            {errors.length > 0 && (
                <View className="mb-2">
                    {errors.map((err, i) => (
                        <Text key={i} className="text-red-500">{err}</Text>
                    ))}
                </View>
            )}
            <TouchableOpacity
                onPress={handleSubmit}
                className="bg-blue-600 py-3 rounded-lg items-center mt-4"
                activeOpacity={0.8}
            >
                <Text className="text-white font-bold text-lg">Save Client</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
