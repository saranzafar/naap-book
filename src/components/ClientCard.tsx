// components/ClientCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Client } from '../types/Client';
import { formatDate } from '../utils/format';

type Props = {
  client: Client;
  onPress?: () => void;
};

export default function ClientCard({ client, onPress }: Props) {
  const m = client.measurements;
  const summary = [
    m.chest?.value ? `Chest ${m.chest.value}` : null,
    m.waist?.value ? `Waist ${m.waist.value}` : null,
    m.inseam?.value ? `Inseam ${m.inseam.value}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} className="mb-3">
      <View className="p-4 rounded-xl bg-white shadow">
        <Text className="text-lg font-semibold">{client.name}</Text>
        <Text className="text-[12px] text-gray-500 mb-1">ID: {client.id}</Text>

        <Text className="text-gray-500">{client.phone || '—'}</Text>
        <Text className="text-gray-400">{client.email || '—'}</Text>

        {!!summary && (
          <Text className="text-[12px] text-gray-600 mt-2">{summary}</Text>
        )}

        <Text className="text-xs text-gray-400 mt-2">
          Added: {formatDate(client.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
