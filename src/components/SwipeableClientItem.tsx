import React, { PropsWithChildren, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Client } from '../types/Client';

type Props = {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
} & PropsWithChildren;

export const SwipeableClientItem: React.FC<Props> = ({ client, onEdit, onDelete, children }) => {
  const ref = useRef<Swipeable | null>(null);

  const renderRightActions = () => (
    <View className="flex-row">
      <TouchableOpacity
        onPress={() => {
          ref.current?.close();
          onEdit(client);
        }}
        className="bg-yellow-500 px-4 justify-center"
      >
        <Text className="text-white font-medium">Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          ref.current?.close();
          onDelete(client);
        }}
        className="bg-red-600 px-4 justify-center"
      >
        <Text className="text-white font-medium">Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable ref={ref} renderRightActions={renderRightActions}>
      {children}
    </Swipeable>
  );
};

export default SwipeableClientItem;
