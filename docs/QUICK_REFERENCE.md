# Quick Reference Card

## 🎨 Colors
```javascript
import { COLORS, SPACING } from '../constants/theme';

COLORS.primary      // #2E7D32
COLORS.secondary    // #0288D1
COLORS.background   // #F5F5F5
COLORS.white        // #FFFFFF
COLORS.text         // #212121
COLORS.textLight    // #757575
COLORS.border       // #E0E0E0
COLORS.error        // #F44336
```

## 📏 Spacing
```javascript
SPACING.small       // 8
SPACING.medium      // 16
SPACING.large       // 24
```

## 🧭 Navigation
```javascript
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/role/screen-name');  // Navigate forward
router.back();                     // Go back
```

## 📁 File Locations

### Your Screen
```
src/screens/{Role}/YourScreen.js
```

### Your Route
```
app/{role}/your-screen.js
```

### Your Components
```
src/components/{Role}/YourComponent.js
```

## 🔄 Common Imports
```javascript
// Basic
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Navigation
import { useRouter } from 'expo-router';

// Theme
import { COLORS, SPACING } from '../../constants/theme';

// Components
import Button from '../../components/Button';
```

## ✅ Quick Checklist
- [ ] Import COLORS and SPACING
- [ ] Use StyleSheet.create()
- [ ] Add loading states
- [ ] Test navigation
- [ ] Remove console.logs
- [ ] Check for warnings

## 🐛 Common Fixes

### Colors not working?
```javascript
// ❌ Wrong
backgroundColor: '#fff'

// ✅ Correct
backgroundColor: COLORS.white
```

### Navigation not working?
```javascript
// ❌ Wrong
router.push('/myScreen')

// ✅ Correct  
router.push('/citizen/my-screen')
```

### Component not found?
```javascript
// Add to index.js
export { default as YourComponent } from './YourComponent';
```

## 📝 Naming Conventions
- **Screens**: `CreateRequestScreen.js`
- **Components**: `RequestCard.js`
- **Routes**: `create-request.js`
- **Branches**: `feature/citizen/create-request`

## 💬 Git Commands
```bash
git checkout -b feature/role/feature-name
git add .
git commit -m "feat(role): description"
git push origin feature/role/feature-name
```

## 📞 Need Help?
1. Check `.cursorrules`
2. Check `DEVELOPER_GUIDE.md`
3. Check `COMPONENT_TEMPLATES.md`
4. Ask the team!

