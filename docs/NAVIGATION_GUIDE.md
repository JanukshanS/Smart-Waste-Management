# Navigation Guide

## Overview

The app now has clean navigation between Dashboard and Signup screens.

## App Structure

```
App.js (Clean & Simple)
├── NavigationContainer
└── Stack Navigator
    ├── Dashboard Screen (Home)
    └── Signup Screen
```

## Navigation Flow

### Dashboard → Signup
- Click the **"➕ Create New Account"** button (green button below stats)
- Navigates to Signup screen

### Signup → Dashboard  
- Click the **"← Back"** button in the header
- Returns to Dashboard

## Code Structure

### App.js (23 lines - Clean!)
```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { DashboardScreen, SignupScreen } from './src/screens';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## Screens

### 1. Dashboard Screen
- **Location:** `src/screens/DashboardScreen.js`
- **Features:**
  - Stats cards
  - "Create New Account" button
  - Quick actions
  - Recent activity

### 2. Signup Screen
- **Location:** `src/screens/SignupScreen.js`
- **Features:**
  - Personal info form (name, email, phone, role)
  - Address form (street, city, postal code, coordinates)
  - Back button in header
  - Form validation
  - API integration ready

## API Integration

The signup form is connected to your backend:
- **Endpoint:** `POST http://localhost:5000/api/admin/users`
- **API Files:** `src/api/`
- **Config:** `src/constants/config.js`

## Running the App

```bash
npm start        # Start dev server
npm run web      # Run on web
npm run android  # Run on Android
```

## Design Theme

- **Primary Color:** Green (#22c55e)
- **Background:** White (#ffffff)
- **Accent:** Light green (#dcfce7)
- Clean, modern UI with rounded corners and subtle shadows

## Notes

- Navigation uses React Navigation Stack
- No gesture handler issues (simplified setup)
- Works on both web and Android
- Old simple dashboard code kept in App.js as reference (commented out)

