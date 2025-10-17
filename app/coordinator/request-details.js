import { Stack } from 'expo-router';
import RequestDetailsScreen from '../../src/screens/Coordinator/RequestDetailsScreen';

export default function RequestDetails() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Request Details',
          headerShown: true,
        }}
      />
      <RequestDetailsScreen />
    </>
  );
}

