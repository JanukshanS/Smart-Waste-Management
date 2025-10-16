# React Native Expo App

A React Native application built with Expo that runs on **Android** and **Web**.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- For Android: Android Studio with Android SDK, or use Expo Go app on your phone

### Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## 📱 Running the App

### Start Development Server

```bash
npm start
```

This will open the Expo Dev Tools in your browser where you can choose which platform to run.

### Run on Android

```bash
npm run android
```

**Options:**
1. **Android Emulator**: Have Android Studio with an emulator running
2. **Physical Device**: Install [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) from Play Store, scan the QR code from the terminal

### Run on Web

```bash
npm run web
```

This will open the app in your default browser at `http://localhost:8081` (or a different port if 8081 is busy).

## 📦 Project Structure

```
frontend/
├── App.js              # Main application component
├── index.js            # Entry point
├── app.json            # Expo configuration
├── package.json        # Dependencies and scripts
└── assets/             # Images and static files
```

## 🛠️ Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS (requires macOS)
- `npm run web` - Run in web browser

## 📚 Technologies

- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Native Web** - Web compatibility
- **React Dom** - Web rendering

## 🔧 Configuration

The app is configured in `app.json`:
- Android adaptive icons
- Web favicon
- Splash screen
- Platform-specific settings

## 🐛 Troubleshooting

### Android Issues
- Ensure Android SDK is installed
- Check that `ANDROID_HOME` environment variable is set
- Try running `adb devices` to see connected devices

### Web Issues
- Clear browser cache
- Try a different port: `expo start --web --port 8082`

### General Issues
- Clear cache: `npm start --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## 📖 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Native Web](https://necolas.github.io/react-native-web/)

## ✨ Next Steps

1. Start editing `App.js` to build your app
2. Add new screens and components
3. Install additional packages as needed
4. Configure navigation (React Navigation recommended)
5. Add state management (Context API, Redux, etc.)

Happy coding! 🎉

