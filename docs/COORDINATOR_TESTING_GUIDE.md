# Coordinator Features Testing Guide

## Quick Start

### Prerequisites
1. Backend API running at `https://api.csse.icy-r.dev/api`
2. Expo development server running (`npm start`)
3. Test coordinator account credentials

---

## Testing Scenarios

### 1. Dashboard Testing

#### Test Case 1.1: View Dashboard Statistics
**Steps:**
1. Navigate to Coordinator Dashboard
2. Verify statistics display:
   - Total bins count
   - Full bins count (≥90%)
   - Filling bins count (70-89%)
   - Pending requests count
   - Approved requests count
   - Active routes count

**Expected Result:**
- All statistics load and display correctly
- Numbers are accurate
- Loading indicator shows during data fetch
- Error message displays if API fails

#### Test Case 1.2: Auto-Refresh
**Steps:**
1. Open dashboard
2. Wait 5 minutes
3. Observe data refresh

**Expected Result:**
- Data refreshes automatically
- No user interaction required
- Smooth transition without flickering

#### Test Case 1.3: Pull-to-Refresh
**Steps:**
1. Pull down on dashboard
2. Release

**Expected Result:**
- Refresh indicator shows
- Data reloads
- Statistics update

---

### 2. Bins Monitoring Testing

#### Test Case 2.1: View All Bins
**Steps:**
1. Navigate to Smart Bins
2. Verify bins list displays
3. Check each bin card shows:
   - Bin ID
   - Location and area
   - Fill level percentage
   - Progress bar (color-coded)
   - Status badge
   - Bin type and capacity

**Expected Result:**
- All bins display correctly
- Fill level colors are accurate:
  - Red: ≥90%
  - Orange: 70-89%
  - Green: <70%

#### Test Case 2.2: Statistics Summary
**Steps:**
1. View statistics card at top
2. Verify counts for:
   - Total bins
   - Full bins (red)
   - Filling bins (orange)
   - Normal bins (green)

**Expected Result:**
- Counts match filtered bins
- Colors match fill level

#### Test Case 2.3: Search Bins
**Steps:**
1. Tap search bar
2. Enter bin ID (e.g., "BIN-001")
3. Clear search
4. Search by location

**Expected Result:**
- Search results update in real-time
- Case-insensitive search
- Empty state if no matches

#### Test Case 2.4: Filter Bins
**Steps:**
1. Tap "All Bins" chip (default)
2. Tap "Full (≥90%)" chip
3. Verify only full bins show
4. Tap "Filling (70-89%)" chip
5. Verify only filling bins show
6. Tap "Active" chip
7. Verify only active bins show

**Expected Result:**
- Filter applies immediately
- Statistics update to match filter
- Empty state if no bins match

#### Test Case 2.5: Auto-Refresh
**Steps:**
1. Open bins screen
2. Wait 30 seconds
3. Observe data refresh

**Expected Result:**
- Data refreshes automatically every 30s
- Fill levels update if changed

---

### 3. Request Management Testing

#### Test Case 3.1: View Pending Requests
**Steps:**
1. Navigate to Manage Requests
2. Verify request list displays
3. Check each request card shows:
   - Tracking ID
   - Status badge
   - Waste type badge (color-coded)
   - Quantity
   - Address with icon
   - Preferred date
   - Description
   - Approve/Reject buttons

**Expected Result:**
- All pending requests display
- Waste type colors:
  - Green: Household
  - Red: Bulky
  - Purple: E-waste
  - Blue: Recyclable

#### Test Case 3.2: Approve Request
**Steps:**
1. Tap "Approve" on any request
2. Verify confirmation dialog appears
3. Tap "Approve" in dialog

**Expected Result:**
- Confirmation dialog shows request summary
- Success alert appears
- Request removed from list
- Request count updates

#### Test Case 3.3: Reject Request
**Steps:**
1. Tap "Reject" on any request
2. Verify rejection dialog appears
3. Tap a common reason chip (e.g., "Invalid address")
4. Verify reason fills text input
5. Modify reason if needed
6. Tap "Reject"

**Expected Result:**
- Dialog shows request tracking ID
- Common reason chips work
- Custom reason can be entered
- Cannot reject without reason
- Success alert appears
- Request removed from list

#### Test Case 3.4: Cancel Rejection
**Steps:**
1. Tap "Reject" on any request
2. Tap "Cancel" in dialog

**Expected Result:**
- Dialog closes
- Request remains in list
- No changes made

---

### 4. Routes Listing Testing

#### Test Case 4.1: View All Routes
**Steps:**
1. Navigate to Collection Routes
2. Verify routes list displays
3. Check each route card shows:
   - Route name
   - Status badge (color-coded)
   - Number of stops
   - Total distance (km)
   - Estimated duration (min)
   - Crew ID (if assigned)
   - Vehicle ID (if assigned)
   - Progress bar (if active)
   - Creation date

**Expected Result:**
- All routes display correctly
- Status colors:
  - Gray: Draft
  - Blue: Assigned
  - Orange: In-Progress
  - Green: Completed
  - Red: Cancelled

#### Test Case 4.2: Search Routes
**Steps:**
1. Tap search bar
2. Enter route name
3. Clear and search by crew ID
4. Clear and search by vehicle ID

**Expected Result:**
- Search results update in real-time
- Case-insensitive search

#### Test Case 4.3: Filter Routes
**Steps:**
1. Tap each filter chip:
   - All (shows count)
   - Draft (shows count)
   - Assigned (shows count)
   - In Progress (shows count)
   - Completed (shows count)
2. Verify counts match actual routes

**Expected Result:**
- Filter applies immediately
- Counts are accurate
- Empty state if no routes

#### Test Case 4.4: FAB Navigation
**Steps:**
1. Tap "Create Route" FAB button

**Expected Result:**
- Navigates to Create Route screen

---

### 5. Route Creation Testing

#### Test Case 5.1: Optimize Route Mode
**Steps:**
1. Navigate to Create Route
2. Verify "Optimize Route" is selected by default
3. Adjust fill level threshold slider
4. Toggle "Include Approved Requests"
5. Adjust max stops slider
6. Tap "Generate Optimized Route"

**Expected Result:**
- Sliders work smoothly
- Values update in real-time
- Toggle switches work
- Success dialog shows with stop count
- Option to view routes or dismiss

#### Test Case 5.2: Manual Route Mode
**Steps:**
1. Tap "Manual Route" button
2. Enter route name (e.g., "Test Route A")
3. Tap "Create Draft Route"

**Expected Result:**
- Input field accepts text
- Button disabled if name empty
- Success dialog appears
- Option to view routes
- Route name clears after creation

#### Test Case 5.3: Mode Switching
**Steps:**
1. Switch between Optimize and Manual modes
2. Verify content changes

**Expected Result:**
- Mode switches smoothly
- Previous inputs don't affect other mode
- Active button highlighted

#### Test Case 5.4: Validation
**Steps:**
1. In Manual mode, try to create without name
2. Verify button is disabled

**Expected Result:**
- Cannot create route without name
- Button visually disabled

---

## API Endpoint Testing

### Test with cURL or Postman

#### Get Dashboard
```bash
curl -X GET https://api.csse.icy-r.dev/api/coordinator/dashboard
```

#### Get Bins (with filters)
```bash
curl -X GET "https://api.csse.icy-r.dev/api/coordinator/bins?fillLevel[gte]=90&sort=fillLevel:desc"
```

#### Get Pending Requests
```bash
curl -X GET https://api.csse.icy-r.dev/api/coordinator/requests/pending
```

#### Approve Request
```bash
curl -X PUT https://api.csse.icy-r.dev/api/coordinator/requests/{requestId}/approve
```

#### Reject Request
```bash
curl -X PUT https://api.csse.icy-r.dev/api/coordinator/requests/{requestId}/reject \
  -H "Content-Type: application/json" \
  -d '{"reason":"Invalid address"}'
```

#### Optimize Route
```bash
curl -X POST https://api.csse.icy-r.dev/api/coordinator/routes/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "fillLevelThreshold": 90,
    "includeApprovedRequests": true,
    "maxStops": 50
  }'
```

#### Get Routes
```bash
curl -X GET "https://api.csse.icy-r.dev/api/coordinator/routes?status=in-progress"
```

---

## Error Testing

### Test Case E.1: Network Error
**Steps:**
1. Disable internet connection
2. Try to load any screen

**Expected Result:**
- Error message displays
- Retry capability available
- No app crash

### Test Case E.2: API Timeout
**Steps:**
1. Simulate slow network
2. Load data-heavy screen

**Expected Result:**
- Loading indicator shows
- Timeout error after 10 seconds
- User-friendly error message

### Test Case E.3: Invalid Data
**Steps:**
1. Submit invalid route parameters
2. Try to reject without reason

**Expected Result:**
- Validation prevents submission
- Clear error messages
- No API calls made

---

## Performance Testing

### Test Case P.1: Large Data Sets
**Steps:**
1. Test with 100+ bins
2. Test with 50+ requests
3. Test with 30+ routes

**Expected Result:**
- Smooth scrolling
- No lag or freezing
- Efficient rendering

### Test Case P.2: Memory Usage
**Steps:**
1. Navigate between screens multiple times
2. Monitor memory usage

**Expected Result:**
- No memory leaks
- Consistent performance
- Proper cleanup on unmount

---

## Accessibility Testing

### Test Case A.1: Screen Reader
**Steps:**
1. Enable screen reader
2. Navigate through screens

**Expected Result:**
- All elements have labels
- Navigation is logical
- Content is readable

---

## Checklist Summary

### Dashboard
- [ ] Statistics display correctly
- [ ] Auto-refresh works (5 min)
- [ ] Pull-to-refresh works
- [ ] Quick action buttons navigate correctly

### Bins
- [ ] All bins display with correct info
- [ ] Fill level colors accurate
- [ ] Statistics summary correct
- [ ] Search works
- [ ] Filters work (All, Full, Filling, Active)
- [ ] Auto-refresh works (30s)

### Requests
- [ ] Pending requests display
- [ ] Approve workflow works
- [ ] Reject workflow works
- [ ] Rejection reasons work
- [ ] Request count updates
- [ ] Empty state displays

### Routes
- [ ] All routes display
- [ ] Search works
- [ ] Filters work (All status types)
- [ ] Status counts accurate
- [ ] FAB navigates to create

### Create Route
- [ ] Optimize mode works
- [ ] Sliders adjust values
- [ ] Toggle switches work
- [ ] Manual mode works
- [ ] Validation works
- [ ] Success dialogs appear
- [ ] Navigation works

### Error Handling
- [ ] Network errors handled
- [ ] API errors handled
- [ ] Loading states display
- [ ] Empty states display

---

## Bug Reporting Template

**Title:** [Brief description]

**Screen:** [Dashboard/Bins/Requests/Routes/Create Route]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**


**Actual Result:**


**Screenshots:**


**Environment:**
- Device: 
- OS Version: 
- App Version: 

---

## Notes

- Test on both Android and iOS if possible
- Test on different screen sizes
- Test with real backend data
- Test edge cases and error scenarios
- Document any issues found

