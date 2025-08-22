import React, { PropsWithChildren, useRef } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Client } from '../types/Client';
import { Pencil, Trash2, Copy } from 'lucide-react-native';

type Props = {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onShare: (client: Client) => void;
} & PropsWithChildren;

export const SwipeableClientItem: React.FC<Props> = ({ client, onEdit, onDelete, onShare, children }) => {
  const ref = useRef<Swipeable | null>(null);

  const renderRightActions = () => (
    <View className="flex-row items-center pr-2">
      <TouchableOpacity
        onPress={() => {
          ref.current?.close();
          onEdit(client);
        }}
        activeOpacity={0.9}
        className="w-10 h-10 rounded-full bg-yellow-500 items-center justify-center mx-1 shadow-sm"
      >
        <Pencil color="white" size={18} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          ref.current?.close();
          onShare(client);
        }}
        activeOpacity={0.9}
        className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center mx-1 shadow-sm"
      >
        <Copy color="white" size={18} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          ref.current?.close();
          onDelete(client);
        }}
        activeOpacity={0.9}
        className="w-10 h-10 rounded-full bg-red-600 items-center justify-center mx-1 shadow-sm"
      >
        <Trash2 color="white" size={18} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable
      ref={ref}
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
      overshootRight={false}
    >
      {children}
    </Swipeable>
  );
};
