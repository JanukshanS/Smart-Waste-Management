import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "../src/contexts/AuthContext";
import { paperTheme } from "../src/constants/paperTheme";

export default function Layout() {
  return (
    <PaperProvider theme={paperTheme}>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#f8fafc" },
          }}
        >
          <Stack.Screen name="index" options={{ title: "Home" }} />
          <Stack.Screen name="signup" options={{ title: "Sign Up" }} />
          <Stack.Screen name="login" options={{ title: "Login" }} />
          <Stack.Screen name="auth-landing" options={{ title: "Welcome" }} />
        </Stack>
      </AuthProvider>
    </PaperProvider>
  );
}

