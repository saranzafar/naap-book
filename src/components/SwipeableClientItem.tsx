import React, { PropsWithChildren, useRef } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Client } from '../types/Client';
import { Pencil, Trash2 } from 'lucide-react-native';

type Props = {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
} & PropsWithChildren;

export const SwipeableClientItem: React.FC<Props> = ({ client, onEdit, onDelete, children }) => {
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
        accessibilityRole="button"
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Pencil color="white" size={18} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          ref.current?.close();
          onDelete(client);
        }}
        activeOpacity={0.9}
        className="w-10 h-10 rounded-full bg-red-600 items-center justify-center mx-1 shadow-sm"
        accessibilityRole="button"
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
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

export default SwipeableClientItem;
