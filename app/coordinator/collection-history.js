import { Stack } from 'expo-router';
import CollectionHistoryScreen from '../../src/screens/Coordinator/CollectionHistoryScreen';

export default function CollectionHistory() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Collection History',
          headerShown: true,
        }}
      />
      <CollectionHistoryScreen />
    </>
  );
}

