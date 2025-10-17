import { Stack } from 'expo-router';
import BinManagementScreen from '../../src/screens/Coordinator/BinManagementScreen';

export default function BinManagement() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Bin Management',
          headerShown: true,
        }}
      />
      <BinManagementScreen />
    </>
  );
}
