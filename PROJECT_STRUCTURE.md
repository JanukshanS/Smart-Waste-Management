# Project Structure

## Overview

This is a React Native Expo application with a clean, organized structure for APIs and screens.

## Directory Structure

```
frontend/
├── App.js                          # Main app entry point
├── index.js                        # Expo entry point
├── package.json                    # Dependencies
├── app.json                        # Expo configuration
├── assets/                         # Images and static files
└── src/
    ├── api/                        # API layer
    │   ├── client.js              # HTTP client (fetch wrapper)
    │   ├── authApi.js             # Authentication APIs
    │   ├── index.js               # API exports
    │   └── README.md              # API documentation
    ├── constants/                  # App constants
    │   └── config.js              # API configuration & endpoints
    └── screens/                    # Screen components
        ├── SignupScreen.js        # User signup screen
        └── index.js               # Screen exports
```

## Current Features

### ✅ Signup Screen
- Beautiful green and white theme
- Form validation
- Role selection (Citizen, Coordinator, Technician)
- Address input with coordinates
- Loading states
- Success/Error alerts
- Responsive layout for web and mobile

### ✅ API Layer
- Centralized API client
- Easy to extend with new endpoints
- Error handling
- Timeout support
- Clean response format

## Design Theme

**Colors:**
- Primary Green: `#22c55e`
- White: `#ffffff`
- Light Green: `#dcfce7`
- Gray shades for text and borders

**Features:**
- Rounded corners (12-16px)
- Subtle shadows
- Modern card-based layout
- Smooth transitions

## How to Run

### Web
```bash
npm run web
```

### Android
```bash
npm run android
```

### Development Server
```bash
npm start
```

## API Configuration

The backend API URL is configured in `src/constants/config.js`:

```javascript
BASE_URL: 'http://localhost:5000/api'
```

**For Android emulator:** Change to `http://10.0.2.2:5000/api`  
**For physical device:** Change to your computer's IP address

## Current Endpoints

- **POST** `/admin/users` - User signup

## Adding New Features

### Add a New Screen
1. Create `src/screens/NewScreen.js`
2. Export it in `src/screens/index.js`
3. Import and use in `App.js`

### Add a New API
1. Add endpoint to `src/constants/config.js`
2. Create API file in `src/api/`
3. Export in `src/api/index.js`
4. See `src/api/README.md` for detailed instructions

## Dependencies

- **expo** - Development platform
- **react** & **react-native** - Framework
- **react-dom** & **react-native-web** - Web support

## Next Steps

- [ ] Add login screen
- [ ] Add navigation (React Navigation)
- [ ] Add state management (Context/Redux)
- [ ] Add more screens
- [ ] Implement authentication flow
- [ ] Add form validation library (Formik/React Hook Form)
- [ ] Add UI component library (optional)

## Notes

- All APIs return `{ success: boolean, data?: any, error?: string }`
- Form data matches the backend API structure
- Coordinates default to Colombo (6.9271, 79.8612) if not provided

