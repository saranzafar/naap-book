import React from 'react';
import { FlatList } from 'react-native';
import { Client } from '../types/Client';
import ClientCard from './ClientCard';

type Props = {
    clients: Client[];
    onItemPress: (client: Client) => void;
};

export default function ClientList({ clients, onItemPress }: Props) {
    return (
        <FlatList
            data={clients}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
                <ClientCard client={item} onPress={() => onItemPress(item)} />
            )}
            className="pb-20"
        />
    );
}
