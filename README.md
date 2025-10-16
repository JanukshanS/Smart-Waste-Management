# Smart Waste Management - Frontend

React Native mobile application for the Smart Waste Management System with role-based access for Admin, Citizens, Coordinators, and Technicians.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on Android
Press 'a' in terminal

# Run on Web
Press 'w' in terminal
```

## 📚 Documentation

### For Developers
- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Complete development guide
- **[.cursorrules](./.cursorrules)** - Cursor AI rules (IMPORTANT!)
- **[COMPONENT_TEMPLATES.md](./COMPONENT_TEMPLATES.md)** - Copy-paste templates
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference card

### Setup for Team Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   npm install
   ```

2. **Add Cursor Rules**
   - Open `.cursorrules` file
   - Copy the content
   - In Cursor IDE: Settings → Rules for AI
   - Paste the rules

3. **Choose Your Module**
   - Developer 1: Admin Module
   - Developer 2: Citizen Module
   - Developer 3: Coordinator Module
   - Developer 4: Technician Module

4. **Read the Guide**
   - Open `DEVELOPER_GUIDE.md`
   - Find your assigned screens
   - Follow the development workflow

## 👥 Team Structure

| Developer | Module | Screens |
|-----------|--------|---------|
| Dev 1 | Admin | Dashboard, Users, Reports, System Health |
| Dev 2 | Citizen | Dashboard, Create Request, My Requests, Track, Find Bins, Profile |
| Dev 3 | Coordinator | Dashboard, Bins, Requests, Routes, Create Route |
| Dev 4 | Technician | Dashboard, Work Orders, Work Order Details, Devices, Register Device |

## 📁 Project Structure

```
frontend/
├── .cursorrules              # AI development rules
├── DEVELOPER_GUIDE.md        # Main development guide
├── COMPONENT_TEMPLATES.md    # Code templates
├── QUICK_REFERENCE.md        # Quick reference
├── app/                      # Routes (Expo Router)
│   ├── index.js             # Home screen
│   ├── admin/               # Admin routes
│   ├── citizen/             # Citizen routes
│   ├── coordinator/         # Coordinator routes
│   └── technician/          # Technician routes
├── src/
│   ├── components/          # Reusable components
│   │   ├── Button.js       # Shared button
│   │   ├── Admin/          # Admin components
│   │   ├── Citizen/        # Citizen components
│   │   ├── Coordinator/    # Coordinator components
│   │   └── Technician/     # Technician components
│   ├── constants/          # App constants
│   │   └── theme.js        # Colors & spacing
│   ├── screens/            # Screen components
│   │   ├── Admin/
│   │   ├── Citizen/
│   │   ├── Coordinator/
│   │   └── Technician/
│   └── api/                # API integration
└── package.json
```

## 🎨 Design System

### Colors
```javascript
COLORS.primary      // #2E7D32 - Primary green
COLORS.secondary    // #0288D1 - Secondary blue
COLORS.background   // #F5F5F5 - Light gray
COLORS.white        // #FFFFFF
COLORS.text         // #212121
COLORS.textLight    // #757575
```

### Usage
```javascript
import { COLORS, SPACING } from './src/constants/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    padding: SPACING.large,
  },
});
```

## 🛠️ Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/role/feature-name
```

### 2. Develop Your Feature
- Follow `.cursorrules`
- Use templates from `COMPONENT_TEMPLATES.md`
- Test frequently

### 3. Test Your Changes
```bash
npm start
# Test on Android/Web
```

### 4. Commit and Push
```bash
git add .
git commit -m "feat(role): description"
git push origin feature/role/feature-name
```

### 5. Create Pull Request
- Request review from team
- Address feedback
- Merge when approved

## 📋 Development Standards

### DO's ✅
- Use COLORS and SPACING constants
- Follow component templates
- Test navigation flows
- Handle loading states
- Use meaningful names
- Add comments for complex logic

### DON'Ts ❌
- Don't hardcode colors/spacing
- Don't create duplicate components
- Don't skip testing
- Don't ignore warnings
- Don't modify shared components without discussion

## 🔧 Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android device/emulator
npm run web        # Run in web browser
npm run ios        # Run on iOS device/simulator (Mac only)
```

## 🐛 Troubleshooting

### Metro bundler issues
```bash
npm start --reset-cache
```

### Module not found
```bash
rm -rf node_modules
npm install
```

### Navigation not working
- Check route path matches folder structure
- Verify file exports are correct

## 📦 Dependencies

- **expo**: Framework for React Native
- **expo-router**: File-based routing
- **react-native**: Mobile framework
- **react**: UI library

## 🤝 Contributing

1. Read `DEVELOPER_GUIDE.md`
2. Follow `.cursorrules`
3. Use templates from `COMPONENT_TEMPLATES.md`
4. Test your changes
5. Create pull request
6. Get code review

## 📞 Support

- Check documentation files
- Ask in team chat
- Create an issue for bugs

## 📄 License

Part of CSSE coursework project.

---

**Remember**: Consistency is key. Follow the rules, use the templates, and communicate with your team! 🚀
