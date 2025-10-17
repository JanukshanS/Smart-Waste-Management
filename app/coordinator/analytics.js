import { Stack } from 'expo-router';
import AnalyticsScreen from '../../src/screens/Coordinator/AnalyticsScreen';

export default function Analytics() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Analytics',
          headerShown: true,
        }}
      />
      <AnalyticsScreen />
    </>
  );
}

