import React from "react";
import { View, Text, TextInput } from "react-native";
import { AddClientFormValues } from "../types/Client";

type Props = {
    values: AddClientFormValues;
    onChange: (values: AddClientFormValues) => void;
    errors?: string[];
};

export default function AddClientForm({ values, onChange, errors }: Props) {
    const inputStyle = "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-gray-600";

    return (
        <View className="gap-2">
            {/* Full Name */}
            <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                </Text>
                <TextInput
                    placeholder="Enter client's full name"
                    value={values.name ?? ""}
                    onChangeText={(val) => onChange({ ...values, name: val })}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                    className={inputStyle}
                />
            </View>

            {/* Phone & Email Row */}
            <View className="flex-row space-x-3">
                <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone
                    </Text>
                    <TextInput
                        placeholder="Phone number"
                        value={values.phone ?? ""}
                        onChangeText={(val) => onChange({ ...values, phone: val })}
                        keyboardType="phone-pad"
                        autoCorrect={false}
                        returnKeyType="next"
                        className={inputStyle}
                    />
                </View>
                <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                    </Text>
                    <TextInput
                        placeholder="Email address"
                        value={values.email ?? ""}
                        onChangeText={(val) => onChange({ ...values, email: val })}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="next"
                        className={inputStyle}
                    />
                </View>
            </View>

            {/* Address */}
            <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                </Text>
                <TextInput
                    placeholder="Enter full address"
                    value={values.address ?? ""}
                    onChangeText={(val) => onChange({ ...values, address: val })}
                    autoCapitalize="sentences"
                    returnKeyType="next"
                    className={inputStyle}
                />
            </View>

            {/* Notes */}
            <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Additional Notes
                </Text>
                <TextInput
                    placeholder="Any special notes or preferences..."
                    value={values.notes ?? ""}
                    onChangeText={(val) => onChange({ ...values, notes: val })}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    className={`${inputStyle} h-20`}
                />
            </View>
        </View>
    );
}