import { Stack } from 'expo-router';
import AllRequestsScreen from '../../src/screens/Coordinator/AllRequestsScreen';

export default function AllRequests() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'All Requests',
          headerShown: true,
        }}
      />
      <AllRequestsScreen />
    </>
  );
}

