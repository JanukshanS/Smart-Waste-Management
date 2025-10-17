import { Stack } from 'expo-router';
import ScheduleScreen from '../../src/screens/Coordinator/ScheduleScreen';

export default function Schedule() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Schedule',
          headerShown: true,
        }}
      />
      <ScheduleScreen />
    </>
  );
}

