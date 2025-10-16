# Developer Guide - Smart Waste Management Frontend

## 🎯 Overview
This guide ensures all 4 developers maintain consistency while building different components for the Smart Waste Management System.

## 👥 Team Structure & Responsibilities

### Developer 1 - Admin Module
**Screens to Build:**
- `AdminDashboardScreen` - System overview with stats
- `UsersScreen` - User management (CRUD operations)
- `ReportsScreen` - System reports and analytics
- `SystemHealthScreen` - API and database monitoring

**Components:**
- `src/components/Admin/UserCard.js`
- `src/components/Admin/SystemHealthCard.js`
- `src/components/Admin/ReportChart.js`

---

### Developer 2 - Citizen Module
**Screens to Build:**
- `CitizenDashboardScreen` - Citizen overview
- `CreateRequestScreen` - Form to create waste pickup requests
- `MyRequestsScreen` - List of user's requests with filters
- `TrackRequestScreen` - Request tracking with status timeline
- `FindBinsScreen` - Map/list of nearby bins
- `ProfileScreen` - User profile and settings

**Components:**
- `src/components/Citizen/RequestCard.js`
- `src/components/Citizen/BinCard.js`
- `src/components/Citizen/RequestStatusTimeline.js`

---

### Developer 3 - Coordinator Module
**Screens to Build:**
- `CoordinatorDashboardScreen` - Overview of bins and requests
- `BinsScreen` - Smart bin monitoring with fill levels
- `RequestsScreen` - Manage citizen requests (approve/reject)
- `RoutesScreen` - View collection routes
- `CreateRouteScreen` - Generate optimized routes

**Components:**
- `src/components/Coordinator/RouteCard.js`
- `src/components/Coordinator/BinStatusCard.js`
- `src/components/Coordinator/RequestApprovalCard.js`

---

### Developer 4 - Technician Module
**Screens to Build:**
- `TechnicianDashboardScreen` - Technician overview
- `WorkOrdersScreen` - List of repair work orders
- `WorkOrderDetailsScreen` - Detailed work order view
- `DevicesScreen` - Device management and status
- `RegisterDeviceScreen` - Register new IoT devices

**Components:**
- `src/components/Technician/WorkOrderCard.js`
- `src/components/Technician/DeviceCard.js`
- `src/components/Technician/DeviceStatusBadge.js`

---

## 📁 Project Structure

```
frontend/
├── .cursorrules              # Cursor AI rules (ADD THIS TO YOUR CURSOR)
├── DEVELOPER_GUIDE.md        # This file
├── app/                      # Expo Router routes
│   ├── index.js             # Home screen
│   ├── admin/               # Admin routes
│   ├── citizen/             # Citizen routes
│   ├── coordinator/         # Coordinator routes
│   └── technician/          # Technician routes
├── src/
│   ├── components/          # Reusable components
│   │   ├── Button.js       # Shared button (ALREADY CREATED)
│   │   ├── Admin/          # Admin-specific components
│   │   ├── Citizen/        # Citizen-specific components
│   │   ├── Coordinator/    # Coordinator-specific components
│   │   └── Technician/     # Technician-specific components
│   ├── constants/          # App constants
│   │   └── theme.js        # Colors & spacing (ALREADY CREATED)
│   ├── screens/            # Screen components
│   │   ├── Admin/          # Admin screens (PLACEHOLDERS READY)
│   │   ├── Citizen/        # Citizen screens (PLACEHOLDERS READY)
│   │   ├── Coordinator/    # Coordinator screens (PLACEHOLDERS READY)
│   │   └── Technician/     # Technician screens (PLACEHOLDERS READY)
│   └── api/                # API integration (TO BE ADDED)
└── package.json
```

---

## 🚀 Getting Started

### 1. Setup Your Environment
```bash
cd frontend
npm install
npm start
```

### 2. Add Cursor Rules
1. Copy the `.cursorrules` file content
2. In Cursor, go to Settings → Rules for AI
3. Paste the rules to ensure AI follows our standards

### 3. Choose Your Module
Each developer should work on their assigned module (Admin, Citizen, Coordinator, or Technician)

---

## 🎨 Design Standards

### Available Colors (from `theme.js`)
```javascript
COLORS.primary      // #2E7D32 - Primary green
COLORS.secondary    // #0288D1 - Secondary blue
COLORS.background   // #F5F5F5 - Light gray background
COLORS.white        // #FFFFFF - White
COLORS.text         // #212121 - Primary text
COLORS.textLight    // #757575 - Secondary text
COLORS.border       // #E0E0E0 - Borders
COLORS.error        // #F44336 - Error red
```

### Available Spacing
```javascript
SPACING.small       // 8
SPACING.medium      // 16
SPACING.large       // 24
```

### Usage Example
```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.large,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
});
```

---

## 🛠️ Component Development Workflow

### Step 1: Plan Your Component
- Review the placeholder screen
- List what data it needs
- Sketch the UI layout
- Identify reusable parts

### Step 2: Create Component Structure
```javascript
// Example: src/components/Citizen/RequestCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

const RequestCard = ({ request, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{request.title}</Text>
      <Text style={styles.status}>{request.status}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    padding: SPACING.medium,
    marginBottom: SPACING.small,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  status: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: SPACING.small,
  },
});

export default RequestCard;
```

### Step 3: Update Index File
```javascript
// src/components/Citizen/index.js
export { default as RequestCard } from './RequestCard';
export { default as BinCard } from './BinCard';
```

### Step 4: Use in Screen
```javascript
import { RequestCard } from '../../components/Citizen';

const MyRequestsScreen = () => {
  const requests = []; // Will come from API later
  
  return (
    <View style={styles.container}>
      {requests.map(request => (
        <RequestCard 
          key={request.id}
          request={request}
          onPress={() => {/* Navigate to details */}}
        />
      ))}
    </View>
  );
};
```

---

## 🔄 Git Workflow

### Branch Naming Convention
```bash
feature/admin/user-management      # Admin developer
feature/citizen/create-request     # Citizen developer
feature/coordinator/bin-monitoring # Coordinator developer
feature/technician/work-orders     # Technician developer
```

### Daily Workflow
```bash
# 1. Start your day - pull latest changes
git checkout main
git pull origin main

# 2. Create your feature branch
git checkout -b feature/role/feature-name

# 3. Make your changes
# ... code ...

# 4. Commit frequently
git add .
git commit -m "feat(citizen): add create request form"

# 5. Push your branch
git push origin feature/role/feature-name

# 6. Create Pull Request when ready
```

### Commit Message Format
```bash
feat(role): add feature description
fix(role): fix bug description
style(role): styling changes
refactor(role): code refactoring
docs: update documentation
```

---

## 📋 Development Checklist

### Before Starting a Feature
- [ ] Read the component requirements
- [ ] Check existing code for similar patterns
- [ ] Plan the component structure
- [ ] Identify reusable components

### While Developing
- [ ] Use COLORS and SPACING constants
- [ ] Follow the component structure pattern
- [ ] Add meaningful variable names
- [ ] Handle loading/error states
- [ ] Test navigation flows

### Before Committing
- [ ] Test on Android/Web
- [ ] Check for console errors/warnings
- [ ] Verify colors match design
- [ ] Ensure navigation works
- [ ] Remove console.log statements
- [ ] Format code properly

### Before Pull Request
- [ ] Pull latest main branch
- [ ] Resolve any conflicts
- [ ] Test entire flow end-to-end
- [ ] Add comments for complex logic
- [ ] Update documentation if needed

---

## 🎯 Feature Requirements by Role

### Admin Features
1. **Dashboard**: Stats cards, charts, system overview
2. **User Management**: List, add, edit, delete users
3. **Reports**: Charts, export data, filter by date
4. **System Health**: API status, database status, alerts

### Citizen Features
1. **Dashboard**: Quick stats, recent requests
2. **Create Request**: Form with waste type, quantity, location
3. **My Requests**: List with filters, search, status badges
4. **Track Request**: Status timeline, updates
5. **Find Bins**: Map/list view, filter by type
6. **Profile**: Edit profile, change password, settings

### Coordinator Features
1. **Dashboard**: Bin overview, full bins alert, pending requests
2. **Bins Screen**: List/map of bins, fill levels, status
3. **Requests**: Approve/reject requests, assign to routes
4. **Routes**: View routes, monitor progress
5. **Create Route**: Generate optimized route

### Technician Features
1. **Dashboard**: Pending work orders, device status
2. **Work Orders**: List, filter, update status
3. **Work Order Details**: Full details, add notes, complete
4. **Devices**: List devices, status, filter
5. **Register Device**: Form to add new device

---

## 🐛 Common Issues & Solutions

### Issue: Colors not showing
**Solution**: Make sure you're importing from theme.js
```javascript
import { COLORS, SPACING } from '../../constants/theme';
```

### Issue: Navigation not working
**Solution**: Check route path matches folder structure
```javascript
// Correct
router.push('/citizen/my-requests');  // matches app/citizen/my-requests.js

// Wrong
router.push('/myRequests');  // no such route
```

### Issue: Component not found
**Solution**: Check export in index.js
```javascript
// src/components/Citizen/index.js
export { default as RequestCard } from './RequestCard';
```

### Issue: Styles not applying
**Solution**: Use StyleSheet.create
```javascript
const styles = StyleSheet.create({
  container: { /* styles */ }
});
```

---

## 📞 Communication

### Before Starting
- Review your assigned module
- Check if any shared components are needed
- Discuss with team if unsure

### During Development
- Share reusable components in team chat
- Ask for help if stuck
- Report blocking issues

### Code Review
- Review each other's PRs
- Check for consistency
- Test on your device
- Provide constructive feedback

---

## 🎓 Learning Resources

### React Native
- [Official Docs](https://reactnative.dev/)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)

### Code Examples
- Check existing Button component
- Check placeholder screens for structure
- Follow patterns in `.cursorrules`

---

## ✅ Success Criteria

Your module is complete when:
- [ ] All screens have functionality (not just placeholders)
- [ ] Navigation works between all screens
- [ ] UI matches design standards
- [ ] Colors and spacing use constants
- [ ] Components are reusable
- [ ] Code follows .cursorrules
- [ ] No console errors or warnings
- [ ] Tested on Android and Web
- [ ] Code reviewed by team
- [ ] Merged to main branch

---

## 🚦 Priority Order

### Phase 1: Core Screens (Week 1)
Each developer builds their main dashboard and 1-2 key screens

### Phase 2: Full Features (Week 2)
Complete all screens with full functionality

### Phase 3: Polish (Week 3)
Refinement, testing, bug fixes, integration

---

**Remember**: We're building this together. Keep it clean, keep it consistent, and communicate! 🚀

