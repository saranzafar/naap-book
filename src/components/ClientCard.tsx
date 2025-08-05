import React from 'react';
import { View, Text } from 'react-native';
import { Client } from '../types/Client';
import { formatDate } from '../utils/format';

type Props = { client: Client };

export default function ClientCard({ client }: Props) {
  return (
    <View className="p-4 rounded-xl bg-white mb-3 shadow">
      <Text className="text-lg font-semibold">{client.name}</Text>
      <Text className="text-gray-500">{client.phone || '—'}</Text>
      <Text className="text-gray-400">{client.email || '—'}</Text>
      <Text className="text-xs text-gray-300 mt-1">
        Added: {formatDate(client.created_at)}
      </Text>
      {/* ...display main measurements or summary here if you wish */}
    </View>
  );
}
