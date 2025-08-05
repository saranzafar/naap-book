import React from 'react';
import { FlatList } from 'react-native';
import { Client } from '../types/Client';
import ClientCard from './ClientCard';

export default function ClientList({ clients }: { clients: Client[] }) {
    return (
        <FlatList
            data={clients}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <ClientCard client={item} />}
            // contentContainerStyle={{ paddingBottom: 100 }}
            className='pb-20'
        />
    );
}
