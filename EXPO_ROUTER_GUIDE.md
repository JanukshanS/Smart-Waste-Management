# Expo Router Setup Guide

## ✅ What's Been Set Up

Expo Router is now fully configured with file-based routing (like Next.js)!

## 📁 File Structure

```
frontend/
├── app/
│   ├── _layout.js          # Root layout (navigation wrapper)
│   ├── index.js            # Dashboard (home page) - route: /
│   └── signup.js           # Signup page - route: /signup
├── src/
│   ├── api/                # API layer
│   ├── constants/          # Config & constants
│   └── screens/            # Old screens (can be deleted)
├── package.json            # Updated with expo-router entry
└── app.json                # Updated with expo-router plugin
```

## 🚀 How Routes Work

### File-Based Routing

- `app/index.js` → `/` (Dashboard - home page)
- `app/signup.js` → `/signup` (Signup page)
- `app/profile.js` → `/profile` (if you create it)

### Navigation Methods

**Method 1: Using router.push()**
```javascript
import { router } from 'expo-router';

// Navigate to signup
router.push('/signup');

// Go back
router.back();

// Replace current route
router.replace('/dashboard');
```

**Method 2: Using Link component**
```javascript
import { Link } from 'expo-router';

<Link href="/signup">
  <Text>Go to Signup</Text>
</Link>
```

## 📱 Current Routes

### 1. Dashboard (/)
- **File:** `app/index.js`
- **URL:** `/` or just open the app
- **Features:**
  - Fetches dashboard data from API
  - Shows stats, users, bins, devices, etc.
  - Pull-to-refresh
  - Animated components
  - "Create Account" button → navigates to `/signup`

### 2. Signup (/signup)
- **File:** `app/signup.js`
- **URL:** `/signup`
- **Features:**
  - User registration form
  - Form validation
  - API integration
  - Back button → returns to dashboard
  - Success → returns to dashboard

## 🎯 Navigation Examples

### In Your Dashboard
```javascript
// Button to navigate to signup
<TouchableOpacity onPress={() => router.push('/signup')}>
  <Text>Create Account</Text>
</TouchableOpacity>
```

### In Your Signup Page
```javascript
// Back button
<TouchableOpacity onPress={() => router.back()}>
  <Text>← Back</Text>
</TouchableOpacity>

// After successful signup
Alert.alert('Success', 'Account created!', [
  { text: 'OK', onPress: () => router.back() }
]);
```

## 🆕 Adding New Routes

### Example: Add a Profile Page

**Step 1:** Create `app/profile.js`
```javascript
import { Text, View } from 'react-native';
import { router } from 'expo-router';

export default function Profile() {
  return (
    <View>
      <Text>Profile Page</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text>Back</Text>
      </TouchableOpacity>
    </View>
  );
}
```

**Step 2:** Navigate to it
```javascript
router.push('/profile');
```

That's it! No need to configure routes manually.

## 🎨 Layout Configuration

The `app/_layout.js` file wraps all routes:

```javascript
<Stack
  screenOptions={{
    headerShown: false,  // Hide default headers
    contentStyle: { backgroundColor: '#f8fafc' },
  }}
>
  <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
  <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
</Stack>
```

## 🔧 Configuration Files

### package.json
```json
{
  "main": "expo-router/entry"  // Changed from "index.js"
}
```

### app.json
```json
{
  "expo": {
    "scheme": "frontend",
    "plugins": ["expo-router"],
    "web": {
      "bundler": "metro"
    }
  }
}
```

## 🚀 Running the App

```bash
# Clear cache and start
npm start -- --clear

# Run on Android
npm run android

# Run on Web
npm run web
```

## 🎯 Benefits of Expo Router

✅ **File-based routing** - Just create files, routes are automatic
✅ **No manual configuration** - No need to define routes
✅ **Type-safe** - TypeScript support
✅ **Deep linking** - URLs work automatically
✅ **Web support** - Same code works on web with proper URLs
✅ **Easy navigation** - Simple API with `router.push()`, `router.back()`

## 📖 Learn More

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [Navigation Guide](https://docs.expo.dev/router/navigating-pages/)
- [Layouts](https://docs.expo.dev/router/layouts/)

## ✨ What's Working Now

1. ✅ Dashboard at `/`
2. ✅ Signup at `/signup`
3. ✅ "Create Account" button navigates properly
4. ✅ Back button in signup works
5. ✅ API integration maintained
6. ✅ All animations and styling preserved
7. ✅ Works on Android and Web

Happy routing! 🎉


