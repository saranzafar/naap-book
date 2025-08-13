// components/ClientCard.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Client } from '../types/Client';
import { formatDate } from '../utils/format';

type Props = {
  client: Client;
  onPress?: () => void;
};

export default function ClientCard({ client, onPress }: Props) {
  const m = client.measurements || {};
  const summary = [
    m.chest?.value ? `Chest ${m.chest.value}` : null,
    m.waist?.value ? `Waist ${m.waist.value}` : null,
    m.hips?.value ? `Hip ${m.hips.value}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ borderless: false }}
      className="bg-white dark:bg-zinc-900 rounded-2xl p-4 mb-3 border border-zinc-200 dark:border-zinc-800"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-base font-semibold text-gray-900 dark:text-white">
            {client.name}
          </Text>
          <Text className="text-gray-500">{client.phone || '—'}</Text>
          <Text className="text-gray-400">{client.email || '—'}</Text>

          {!!summary && (
            <Text className="text-[12px] text-gray-600 mt-2">{summary}</Text>
          )}

          <Text className="text-xs text-gray-400 mt-2">
            Added: {formatDate(client.created_at)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
