// screens/EditClientScreen.tsx
import React from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import AddClientScreen from './AddClientScreen';
import { RootStackParamList } from '../navigation/AppNavigator';

type R = RouteProp<RootStackParamList, 'EditClient'>;

export default function EditClientScreen() {
  const { params } = useRoute<R>();
  return <AddClientScreen mode="edit" clientId={params.clientId} />;
}
