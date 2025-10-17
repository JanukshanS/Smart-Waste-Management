import { Stack } from 'expo-router';
import BinDetailsScreen from '../../src/screens/Coordinator/BinDetailsScreen';

export default function BinDetails() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Bin Details',
          headerShown: true,
        }}
      />
      <BinDetailsScreen />
    </>
  );
}

