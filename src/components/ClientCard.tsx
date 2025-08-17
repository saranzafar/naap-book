import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Client } from '../types/Client';
import { formatDate } from '../utils/format';
import { ChevronRight, Phone, Hash } from 'lucide-react-native';

type Props = { client: Client; onPress?: () => void };

const STD_KEYS = [
  'chest', 'shoulder', 'arm_length', 'collar', 'shirt_length', 'waist', 'hips', 'trouser_length', 'inseam',
] as const;

const COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // green-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#14B8A6', // teal-500
];

export default function ClientCard({ client, onPress }: Props) {
  const m = useMemo(() => client.measurements ?? ({} as any), [client.measurements]);
  const color = useMemo(() => getColorForId(client.id), [client.id]);

  const summary = useMemo(() => {
    const parts: string[] = [];
    if (m?.chest?.value) parts.push(`Chest ${m.chest.value}`);
    if (m?.waist?.value) parts.push(`Waist ${m.waist.value}`);
    if (m?.hips?.value) parts.push(`Hip ${m.hips.value}`);
    return parts.join(' · ');
  }, [m]);

  const naapCount = useMemo(() => {
    let count = 0;
    for (const k of STD_KEYS) {
      const v = m?.[k]?.value;
      if (v !== undefined && v !== null && String(v).trim() !== '' && Number(v) !== 0) count++;
    }
    const cf = m?.custom_fields;
    if (cf && typeof cf === 'object') {
      Object.values(cf).forEach((row: any) => {
        const v = row?.value;
        if (v !== undefined && v !== null && String(v).trim() !== '' && Number(v) !== 0) count++;
      });
    }
    return count;
  }, [m]); // ✅ depends on stabilized m

  const initial = useMemo(
    () => (client.name?.trim?.()[0] || '#').toUpperCase(),
    [client.name]
  );

  const phoneText = client.phone || '—';

  function getColorForId(id: string): string {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0; // to 32bit int
    }
    return COLORS[Math.abs(hash) % COLORS.length];
  }


  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ borderless: false }}
      className="mb-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <View className="flex-row items-start">
        <View
          className="mr-3 h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: color }}
        >
          <Text className="text-lg font-bold text-white">{initial}</Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="flex-1 pr-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {client.name || 'Unnamed'}
            </Text>
            <ChevronRight size={18} color="#a1a1aa" />
          </View>

          <View className="mt-1 flex-row flex-wrap gap-2">
            <View className="flex-row items-center rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
              <Hash size={12} color="#71717a" />
              <Text className="ml-1 text-[12px] font-medium text-zinc-600 dark:text-zinc-300">
                {String(client.id)}
              </Text>
            </View>
            <View className="flex-row items-center rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
              <Phone size={12} color="#71717a" />
              <Text className="ml-1 text-[12px] font-medium text-zinc-600 dark:text-zinc-300">
                {phoneText}
              </Text>
            </View>
          </View>

          {summary ? (
            <Text className="mt-2 text-[12px] text-zinc-600 dark:text-zinc-300">{summary}</Text>
          ) : null}

          <View className="mt-2 flex-row items-center justify-between">
            <View className="rounded-lg bg-blue-50 px-2 py-1 dark:bg-blue-500/10">
              <Text className="text-[12px] font-semibold text-blue-700 dark:text-blue-300">
                Naap: {naapCount}
              </Text>
            </View>
            <Text className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Added: {formatDate(client.created_at)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
