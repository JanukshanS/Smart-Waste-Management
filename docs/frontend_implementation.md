# Frontend Implementation Guide - FlutterFlow
## Smart Waste Management System

---

## Overview

This guide provides step-by-step instructions for building the Smart Waste Management mobile application using FlutterFlow, connecting to the backend API.

---

## Prerequisites

### FlutterFlow Account
- Sign up at https://flutterflow.io
- Start with free tier (sufficient for MVP)

### Backend Setup
- Backend API running and accessible
- Swagger documentation available at `/api-docs`
- Know your API base URL (e.g., `http://192.168.1.100:5000`)

### Design Assets
- App icon and splash screen
- Color scheme defined
- Font selection

---

## Project Setup

### 1. Create New FlutterFlow Project

**Steps:**
1. Log into FlutterFlow
2. Click "Create New" → "Blank App"
3. Project Name: `Smart Waste Management`
4. Platform: iOS & Android
5. Theme: Start with default, customize later

### 2. Configure App Settings

**Navigation:**
Settings → General Settings

**Configure:**
- **App Name:** Smart Waste Management
- **Bundle ID:** com.yourcompany.wastemanagement
- **Version:** 1.0.0
- **Orientation:** Portrait only
- **Status Bar:** Dark content

### 3. Set Up Theme

**Navigation:**
Settings → Theme Settings

**Color Palette:**
```
Primary Color: #2E7D32 (Green - sustainability)
Secondary Color: #FFA726 (Orange - alerts)
Tertiary Color: #1976D2 (Blue - info)
Error Color: #D32F2F (Red - errors)

Background Colors:
- Primary Background: #FFFFFF
- Secondary Background: #F5F5F5

Text Colors:
- Primary Text: #212121
- Secondary Text: #757575
- Accent Text: #2E7D32
```

**Typography:**
```
Heading 1: 24px, Bold, Primary Text
Heading 2: 20px, Semi-bold, Primary Text
Heading 3: 18px, Semi-bold, Primary Text
Body 1: 16px, Regular, Primary Text
Body 2: 14px, Regular, Secondary Text
Caption: 12px, Regular, Secondary Text
```

---

## API Integration

### 1. Create API Group

**Navigation:**
API Calls → Add Group

**Configuration:**
```
Group Name: WasteManagementAPI
Base URL: http://YOUR_IP:5000
(Use your local IP address, not localhost)

Headers:
  Content-Type: application/json
```

### 2. Import API Specification

**Option A: Import from Swagger**
1. Go to API Calls → Import
2. Upload `swagger.json` from backend
3. Select endpoints to import
4. Review and confirm

**Option B: Manual Creation** (if import fails)
Create each endpoint individually (covered below)

---

## App State Management

### 1. Create App State Variables

**Navigation:**
App Settings → App State

**Variables to Create:**

```
1. currentUser
   Type: JSON
   Default: {}
   Persisted: Yes
   Description: Stores logged-in user data

2. currentRole
   Type: String
   Default: "citizen"
   Persisted: Yes
   Options: citizen, coordinator, technician, admin

3. isLoggedIn
   Type: Boolean
   Default: false
   Persisted: Yes

4. activeRequests
   Type: List<JSON>
   Default: []
   Persisted: No
   Description: Cached active waste requests

5. selectedRequest
   Type: JSON
   Default: {}
   Persisted: No

6. activeFilters
   Type: JSON
   Default: {"status": "all", "sortBy": "date"}
   Persisted: No
```

---

## Page Structure

### Navigation Architecture

```
App Entry
├── Role Selection Page (first launch)
├── Citizen App
│   ├── Citizen Home
│   ├── Create Request
│   ├── My Requests
│   └── Request Details
├── Coordinator App
│   ├── Coordinator Dashboard
│   ├── Route Builder
│   └── Route Monitor
├── Technician App
│   ├── Work Orders List
│   └── Work Order Details
└── Admin App
    ├── User Management
    ├── Reports Dashboard
    └── System Health
```

---

## Building Citizen App

### Page 1: Role Selection (Entry Point)

**Purpose:** First-time user selects their role

**Layout:**
```
AppBar: None
Body:
  - Column
    - Image (App Logo)
    - Text: "Welcome to Smart Waste Management"
    - Text: "Please select your role"
    - Container (Role Cards)
      - Card: Citizen
      - Card: Coordinator
      - Card: Technician
      - Card: Admin
```

**Actions:**
- On Card Tap:
  - Set App State: `currentRole` = selected role
  - Set App State: `isLoggedIn` = true
  - Navigate to respective home page

**Build Steps:**
1. Create blank page: "RoleSelectionPage"
2. Add Column widget
3. Add Image widget → Upload logo
4. Add 2 Text widgets for heading and subheading
5. Add 4 Container widgets styled as cards
6. Style cards with icons and labels
7. Add OnTap actions to each card

---

### Page 2: Citizen Home

**Purpose:** Dashboard for residents

**Layout:**
```
AppBar:
  Title: "Home"
  Actions: [Notification Icon]

Body:
  - SingleChildScrollView
    - Column
      - Welcome Card
        - Text: "Hello, [User Name]"
        - Text: "Track your waste collections"
      
      - Quick Action Card
        - Large Button: "Request Pickup"
          Icon: Add
          Color: Primary
      
      - Active Requests Summary
        - Text: "My Active Requests"
        - If no requests:
          - EmptyState widget
        - Else:
          - ListView (show 3 recent)
            - RequestCard widgets
        - Button: "View All"
      
      - Nearby Bins Section
        - Text: "Nearby Bins"
        - MapView (simplified)
        - Button: "Find Bins"

BottomNavigationBar:
  Items: [Home, Requests, Profile]
```

**API Calls:**
1. Get Active Requests on page load
2. Refresh on pull-down

**Build Steps:**
1. Create page: "CitizenHomePage"
2. Add AppBar with title
3. Add SingleChildScrollView
4. Add Column with spacing
5. Create custom widget "WelcomeCard"
6. Add Container styled as card
7. Add large ElevatedButton for quick action
8. Add conditional builder for requests
9. Add ListView with RequestCard widgets
10. Add BottomNavigationBar

---

### Page 3: Create Request

**Purpose:** Submit new waste pickup request

**Layout:**
```
AppBar:
  Title: "Request Pickup"
  Leading: Back Button

Body:
  - Form (Scrollable)
    - Column with spacing
      
      - Section: Waste Details
        - Dropdown: Waste Type
          Options: Household, Bulky, E-waste, Recyclable
        - TextField: Quantity
          Hint: "e.g., 2 bags, 1 item"
        - TextField: Description (optional)
          Multiline: true
      
      - Section: Collection Address
        - TextField: Street Address
        - Row
          - TextField: City
          - TextField: Postal Code
        - Button: "Use Current Location"
      
      - Section: Preferred Date
        - DatePicker Field
          Min Date: Tomorrow
          Max Date: 30 days from now
      
      - Cost Preview (if applicable)
        - Text: "Estimated Cost: LKR XXX"
        - Conditional: only show for bulky items
      
      - Submit Button
        - Text: "Submit Request"
        - Full width
        - Disabled until form valid

BottomSheet (on submit):
  - Success message
  - Tracking ID display
  - Buttons: "Track Request" | "Done"
```

**Validation Rules:**
- Waste Type: Required
- Quantity: Required, text
- Address: Required
- Preferred Date: Required, future date

**API Call: Create Request**
```
Endpoint: POST /api/citizen/requests
Body: {
  userId: [App State: currentUser.id],
  wasteType: [Form Field],
  quantity: [Form Field],
  address: {
    street: [Form Field],
    city: [Form Field],
    postalCode: [Form Field]
  },
  preferredDate: [Form Field],
  description: [Form Field]
}
Response: Save tracking ID to show in success dialog
```

**Build Steps:**
1. Create page: "CreateRequestPage"
2. Add Form widget
3. Add Column in Form
4. Add DropdownFormField for waste type
5. Add TextFormField for quantity with validation
6. Add TextFormField for description (optional)
7. Add TextFormField for street address with validation
8. Add Row with 2 TextFormFields for city and postal
9. Add DatePickerField with min/max constraints
10. Add conditional Text widget for cost (only if wasteType == 'bulky')
11. Add ElevatedButton for submit
12. Create API call in Actions
13. Add BottomSheet to show on success
14. Handle errors with SnackBar

---

### Page 4: My Requests

**Purpose:** View and filter all requests

**Layout:**
```
AppBar:
  Title: "My Requests"
  Actions: [Filter Icon]

Body:
  - Column
    
    - Filter Chips Row (horizontal scroll)
      - Chip: All
      - Chip: Pending
      - Chip: Scheduled
      - Chip: Completed
      - Chip: Sort by Date
    
    - Conditional Builder
      
      If loading:
        - CircularProgressIndicator
      
      If empty:
        - EmptyState
          Icon: Inbox
          Text: "No requests found"
          Button: "Create Request"
      
      Else:
        - RefreshIndicator
          - ListView.builder
            - RequestCard widgets
              Properties:
                - Tracking ID
                - Waste Type Icon
                - Status Badge
                - Date
                - OnTap: Navigate to details
            - Pagination: Load more on scroll
```

**Request Card Widget Design:**
```
Container (Card)
  - Row
    - Column (icon)
      - Icon: based on wasteType
    - Column (details)
      - Text: Tracking ID (bold)
      - Text: Waste Type
      - Text: Date
      - StatusBadge: Color-coded
    - Icon: ChevronRight
```

**API Call: Get Requests**
```
Endpoint: GET /api/citizen/requests
Query Parameters:
  userId: [App State: currentUser.id]
  status[in]: [based on selected filter]
  sort: createdAt:desc
  page: [current page]
  limit: 20

On Response:
  - Update list
  - Cache in App State (optional)
```

**Filter Logic:**
- All: No status filter
- Pending: status=pending
- Scheduled: status[in]=scheduled,in-progress
- Completed: status=completed

**Build Steps:**
1. Create page: "MyRequestsPage"
2. Add AppBar with filter icon
3. Add Row with FilterChip widgets
4. Create Page State variable: `selectedFilter` (string)
5. Create Page State variable: `requestsList` (list)
6. Add Conditional Builder
7. Add loading state: CircularProgressIndicator
8. Add empty state: EmptyState widget
9. Add RefreshIndicator with ListView.builder
10. Create custom widget: "RequestCard"
11. Configure API call with dynamic query params
12. Add pagination logic (load more on scroll end)
13. Update filter chips to trigger API reload

---

### Page 5: Request Details

**Purpose:** Track specific request with timeline

**Layout:**
```
AppBar:
  Title: "Request Details"
  Leading: Back Button
  Actions: [More Menu - Cancel option]

Body:
  - SingleChildScrollView
    - Column
      
      - Hero Section
        - Container (colored by status)
          - Icon: Large waste type icon
          - Text: Tracking ID (large)
          - StatusBadge: Current status
      
      - Details Card
        - Row: Waste Type | Value
        - Row: Quantity | Value
        - Row: Address | Value
        - Row: Requested Date | Value
        - Row: Scheduled Date | Value (if available)
        - Row: Cost | Value (if applicable)
        - Row: Payment | Badge (if applicable)
      
      - Timeline Section
        - Text: "Progress Timeline"
        - ListView (vertical timeline)
          - TimelineItem: Request Submitted ✓
          - TimelineItem: Approved ✓ (if applicable)
          - TimelineItem: Scheduled (if applicable)
          - TimelineItem: In Progress (if current)
          - TimelineItem: Completed (if done)
      
      - Actions Section (if status = pending/scheduled)
        - Button: Cancel Request (outline, red)
```

**Timeline Item Widget:**
```
Row
  - Container (circle)
    - Icon: Check (if completed)
    - Icon: Clock (if current)
    - Opacity 0.3 (if future)
  - Column
    - Text: Status label (bold)
    - Text: Date/time
    - Divider (vertical line to next item)
```

**API Call: Get Request Details**
```
Endpoint: GET /api/citizen/requests/:id
Path Param: requestId from navigation

On Response:
  - Display all details
  - Build timeline from response.timeline array
```

**Build Steps:**
1. Create page: "RequestDetailsPage"
2. Add AppBar
3. Add SingleChildScrollView with Column
4. Add Container for hero section, style with gradient
5. Add Icon and Text widgets for tracking ID
6. Add StatusBadge custom widget
7. Create "DetailsCard" custom widget with rows
8. Add timeline section header
9. Create "TimelineItem" custom widget
10. Add ListView for timeline items
11. Map timeline data to widgets
12. Add conditional action buttons
13. Configure API call with request ID parameter

---

## Building Coordinator App

### Page 6: Coordinator Dashboard

**Purpose:** Overview of bins and pending requests

**Layout:**
```
AppBar:
  Title: "Collection Dashboard"
  Actions: [Refresh Icon]

Body:
  - Column
    
    - Statistics Row
      - StatCard: Total Bins
        Value: 156
        Trend: +5 from yesterday
      - StatCard: Full Bins (>90%)
        Value: 12
        Color: Red
      - StatCard: Pending Requests
        Value: 8
        Color: Orange
    
    - Map Section
      - Text: "Bin Status Map"
      - Container (Map View)
        - Custom markers for bins
        - Color-coded: Red (>90%), Yellow (70-90%), Green (<70%)
        - OnTap marker: Show bin details
      - Legend Row
        - Red circle + "Full >90%"
        - Yellow circle + "Filling 70-90%"
        - Green circle + "Available <70%"
    
    - Pending Requests Section
      - Row: Text "Special Requests" | Button "View All"
      - ListView (horizontal scroll)
        - RequestCard (compact)
          - Tracking ID
          - Address
          - Date
          - Actions: Approve | Reject
    
    - Quick Actions
      - Button: "Generate Route" (primary, full width)
      - Button: "Active Routes" (outline)

BottomNavigationBar:
  Items: [Dashboard, Routes, Profile]
```

**API Calls:**
1. Get Dashboard Data:
   ```
   GET /api/coordinator/dashboard
   Response: { bins, pendingRequests, statistics }
   ```

2. Get Bins for Map:
   ```
   GET /api/coordinator/bins
   Query: status=active
   Response: List of bins with coordinates and fill levels
   ```

**Build Steps:**
1. Create page: "CoordinatorDashboardPage"
2. Add AppBar
3. Add Column with spacing
4. Create custom widget: "StatCard"
5. Add Row with 3 StatCard widgets
6. Add Text header for map
7. Add Container for map placeholder (use GoogleMap widget if available)
8. Add Row for legend with color circles
9. Add Row with section header and "View All" button
10. Add ListView horizontal scroll
11. Create custom widget: "CompactRequestCard"
12. Add approve/reject IconButtons to cards
13. Add 2 ElevatedButton widgets for quick actions
14. Configure dashboard API call on page load
15. Add refresh action to AppBar icon

**Map Implementation:**
- Use FlutterFlow's GoogleMap widget (if available)
- Or use WebView with embedded Google Maps
- Or simple image placeholder with overlay markers for MVP

---

### Page 7: Route Builder

**Purpose:** Create optimized collection route

**Layout:**
```
AppBar:
  Title: "Build Route"
  Leading: Back Button

Body:
  - Column
    
    - Configuration Section
      - Text: "Route Parameters"
      - Slider: Fill Level Threshold
        Label: "Include bins above: [value]%"
        Min: 70, Max: 100, Default: 90
      - Checkbox: "Include pending requests"
      - Checkbox: "Include scheduled requests"
      - TextField: Route Name
        Default: "Route - [Date]"
    
    - Preview Section
      - Text: "Selected Stops"
      - Container (Map Preview)
        - Show selected bins and requests as markers
      - Stats Row
        - Text: "Total Stops: XX"
        - Text: "Est. Distance: XX km"
        - Text: "Est. Duration: XX min"
    
    - Selected Items List
      - ListView
        - StopItem widgets
          - Icon: Bin or Request
          - Address
          - Fill Level (if bin) or Waste Type (if request)
          - Remove icon
    
    - Bottom Actions
      - Row
        - Button: "Cancel" (outline)
        - Button: "Generate Route" (primary)

After Generation (Dialog):
  - Text: "Route generated successfully"
  - Route Summary
  - Dropdown: Assign to Crew
  - Button: "Assign & Dispatch"
```

**API Calls:**

1. Generate Route:
   ```
   POST /api/coordinator/routes/optimize
   Body: {
     fillLevelThreshold: [slider value],
     includePendingRequests: [checkbox],
     includeScheduledRequests: [checkbox]
   }
   Response: {
     route: { id, stops, distance, duration }
   }
   ```

2. Assign Route:
   ```
   PUT /api/coordinator/routes/:id/assign
   Body: {
     crewId: [selected crew],
     vehicleId: [optional]
   }
   ```

**Build Steps:**
1. Create page: "RoutBuilderPage"
2. Add AppBar
3. Add Column with sections
4. Add Slider widget with label
5. Add 2 Checkbox widgets
6. Add TextField for route name
7. Add Container for map preview
8. Add Row with statistics Text widgets
9. Add ListView for selected items
10. Create custom widget: "StopItem"
11. Add Row at bottom with 2 buttons
12. Configure optimize route API call
13. Show Dialog on success
14. Add Dropdown for crew selection in dialog
15. Configure assign route API call

---

### Page 8: Route Monitor

**Purpose:** Track active routes in real-time

**Layout:**
```
AppBar:
  Title: "Active Routes"
  Actions: [Filter Icon]

Body:
  - ListView.builder
    - RouteCard widgets
      
      RouteCard:
        - Header Row
          - Text: Route Name
          - StatusBadge: In Progress / Completed
        - Details Row
          - Icon + Text: Crew Name
          - Icon + Text: Vehicle ID
          - Icon + Text: Start Time
        - Progress Section
          - LinearProgressIndicator
            Value: completionPercentage
          - Text: "X of Y stops completed"
        - Actions Row
          - Button: "View Details"
          - IconButton: More options
    
    - Pull to refresh

RouteDetails BottomSheet:
  - Route info
  - Map with completed stops (green) and pending (grey)
  - ListView of stops with status
  - Button: "Reassign" (if needed)
```

**API Call: Get Active Routes**
```
GET /api/coordinator/routes
Query: status[in]=assigned,in-progress&sort=startTime:desc
Response: List of routes with completion data
```

**Build Steps:**
1. Create page: "RouteMonitorPage"
2. Add AppBar
3. Add RefreshIndicator
4. Add ListView.builder
5. Create custom widget: "RouteCard"
6. Add LinearProgressIndicator with dynamic value
7. Add IconButton to show details
8. Create custom BottomSheet widget for route details
9. Configure API call with auto-refresh (every 30s)

---

## Building Technician App

### Page 9: Work Orders List

**Purpose:** View assigned repair tasks

**Layout:**
```
AppBar:
  Title: "Work Orders"
  Actions: [Filter Icon]

Body:
  - Column
    
    - Priority Filter Chips
      - Chip: All
      - Chip: Urgent (red)
      - Chip: High (orange)
      - Chip: Medium (blue)
      - Chip: Low (grey)
    
    - Conditional Builder
      
      If empty:
        - EmptyState
          Icon: CheckCircle
          Text: "All caught up!"
          Subtext: "No pending work orders"
      
      Else:
        - ListView.builder
          - WorkOrderCard widgets
            
            WorkOrderCard:
              - Priority Badge (color-coded)
              - Column
                - Text: Work Order ID (bold)
                - Text: Device ID
                - Text: Bin Location
                - Text: Issue description (truncated)
                - Text: Time since reported
              - Row
                - Button: "View Details"
                - StatusBadge
```

**API Call: Get Work Orders**
```
GET /api/technician/work-orders
Query: 
  status[in]=pending,assigned
  priority: [selected filter, if not "All"]
  sort=priority:desc,createdAt:asc
Response: List of work orders
```

**Build Steps:**
1. Create page: "WorkOrdersPage"
2. Add AppBar
3. Add Row with FilterChip widgets
4. Add Conditional Builder
5. Add empty state widgets
6. Add ListView.builder
7. Create custom widget: "WorkOrderCard"
8. Add priority badge with color logic
9. Add Details button with navigation
10. Configure API call with dynamic filters

---

### Page 10: Work Order Details

**Purpose:** View and resolve device issues

**Layout:**
```
AppBar:
  Title: "Work Order Details"
  Leading: Back Button

Body:
  - SingleChildScrollView
    - Column
      
      - Priority Banner
        - Container (full width, colored by priority)
          - Text: "URGENT" / "HIGH" / etc.
      
      - Device Info Card
        - Row: Work Order ID | Value
        - Row: Device ID | Value
        - Row: Device Type | Value
        - Row: Status | Badge
        - Row: Bin Location | Value with Map icon
        - Button: "Navigate" (open maps)
      
      - Issue Details Card
        - Text: "Issue Description"
        - Text: [Full description]
        - Text: "Reported" | [Date/time]
        - Text: "Error Log" (if available)
        - Code block: [Error details]
      
      - Resolution Section
        - Text: "Resolution Actions"
        - RadioButton Group
          - Option: Repaired
          - Option: Replaced
        
        - Conditional (if Replaced selected)
          - TextField: New Device ID
          - Button: "Scan Device" (with QR scanner)
        
        - TextField: Resolution Notes (multiline)
          Hint: "Describe the work performed"
          Required: true
      
      - Action Buttons
        - Row
          - Button: "Escalate" (outline, grey)
          - Button: "Resolve" (primary, green)
            Enabled: only if form valid

Success Dialog:
  - Icon: CheckCircle (green)
  - Text: "Work order resolved"
  - Button: "Back to List"
```

**API Calls:**

1. Get Work Order:
   ```
   GET /api/technician/work-orders/:id
   Response: Full work order details
   ```

2. Resolve Work Order:
   ```
   PUT /api/technician/work-orders/:id/resolve
   Body: {
     actionTaken: "repaired" | "replaced",
     resolutionNotes: [text],
     newDeviceId: [if replaced]
   }
   ```

**Build Steps:**
1. Create page: "WorkOrderDetailsPage"
2. Add AppBar
3. Add SingleChildScrollView with Column
4. Add Container for priority banner with conditional color
5. Create "InfoCard" custom widget
6. Add multiple Rows for device info
7. Add "Navigate" button that opens external maps app
8. Add issue details in separate card
9. Add RadioListTile widgets for action options
10. Add conditional TextField for new device ID
11. Add "Scan Device" button (use barcode_scan plugin)
12. Add TextField for resolution notes with validation
13. Add Row with action buttons at bottom
14. Configure resolve API call
15. Show success dialog and navigate back

---

## Building Admin App

### Page 11: User Management

**Purpose:** Manage system users

**Layout:**
```
AppBar:
  Title: "User Management"
  Actions: [Add User Icon, Search Icon]

Body:
  - Column
    
    - Role Filter Tabs
      - Tab: All
      - Tab: Citizens
      - Tab: Coordinators
      - Tab: Technicians
    
    - Search Bar
      - TextField: Search by name or email
    
    - ListView.builder
      - UserCard widgets
        
        UserCard:
          - Leading: Avatar with role color
          - Column
            - Text: Name (bold)
            - Text: Email
            - Text: Role badge
            - Text: Last active: [date]
          - Trailing: More menu icon
          
          OnTap: Show user details

User Details BottomSheet:
  - User info summary
  - Dropdown: Change role
  - Switch: Active/Inactive
  - Button: "Save Changes"
  - Button: "View Activity"
```

**API Calls:**

1. Get Users:
   ```
   GET /api/admin/users
   Query:
     role: [selected tab filter]
     email[contains]: [search text]
     sort=createdAt:desc
     page, limit
   ```

2. Update User:
   ```
   PUT /api/admin/users/:id/role
   Body: {
     role: [new role],
     status: [active/inactive]
   }
   ```

**Build Steps:**
1. Create page: "UserManagementPage"
2. Add AppBar with action icons
3. Add TabBar widget with 4 tabs
4. Add TextField for search
5. Add ListView.builder
6. Create custom widget: "UserCard"
7. Add CircleAvatar with initials
8. Add PopupMenuButton for more actions
9. Create BottomSheet for user details
10. Add Dropdown for role change
11. Add Switch widget for status
12. Configure API call with dynamic filters
13. Implement search with debouncing (wait 500ms after typing)

---

### Page 12: Reports Dashboard

**Purpose:** View system analytics

**Layout:**
```
AppBar:
  Title: "Reports & Analytics"
  Actions: [Date Range Picker Icon]

Body:
  - SingleChildScrollView
    - Column
      
      - Date Range Selector
        - Row
          - Text: "From: [date]"
          - Text: "To: [date]"
          - IconButton: Calendar
      
      - Metrics Grid (2 columns)
        - MetricCard: Total Collections
          Value: 1,247
          Change: +12% from last period
        - MetricCard: Avg Response Time
          Value: 2.3 hours
          Change: -15% (improvement)
        - MetricCard: Device Uptime
          Value: 94.2%
          Status: Good
        - MetricCard: Recycling Rate
          Value: 67%
          Change: +5%
      
      - Charts Section
        - Text: "Collection Trends"
        - LineChart Widget
          - X: Days
          - Y: Number of collections
        
        - Text: "Route Efficiency"
        - BarChart Widget
          - X: Routes
          - Y: Fuel saved (%)
      
      - Top Performers Section
        - Text: "Top Coordinators"
        - ListView
          - LeaderboardItem widgets
      
      - Export Button
        - Button: "Export Report (PDF)"
```

**API Call: Get Reports**
```
GET /api/admin/reports/collections
Query:
  startDate: [selected start]
  endDate: [selected end]
Response: {
  totalCollections,
  avgResponseTime,
  deviceUptime,
  recyclingRate,
  trends: [],
  routeEfficiency: []
}
```

**Build Steps:**
1. Create page: "ReportsDashboardPage"
2. Add AppBar with action
3. Add SingleChildScrollView
4. Add Row for date range display
5. Add IconButton to open date range picker dialog
6. Create "MetricCard" custom widget
7. Add GridView with 4 MetricCard widgets
8. Add chart widgets (use fl_chart package if available)
9. Add ListView for top performers
10. Add export button
11. Configure API call with date parameters
12. Implement date range picker dialog

---

## Common Widgets Library

### Create Reusable Custom Widgets

**1. StatusBadge**
```
Purpose: Color-coded status indicator
Props:
  - status: String (pending, scheduled, completed, etc.)
  - size: small | medium | large

Design:
  - Container with rounded corners
  - Background color based on status:
    - pending: orange
    - scheduled: blue
    - in-progress: purple
    - completed: green
    - rejected: red
  - Text: status in uppercase
  - Padding: horizontal 12, vertical 6
```

**2. EmptyState**
```
Purpose: Show when no data available
Props:
  - icon: IconData
  - message: String
  - actionButton: Widget (optional)

Design:
  - Center Column
  - Large icon (grey, opacity 0.5)
  - Text message (grey)
  - Optional button below
```

**3. LoadingCard**
```
Purpose: Placeholder while loading
Design:
  - Shimmer effect (use shimmer package)
  - Card-shaped containers
  - Animated pulse
```

**4. InfoRow**
```
Purpose: Label-value pair display
Props:
  - label: String
  - value: String
  - icon: IconData (optional)

Design:
  - Row
  - Text: label (secondary color)
  - Spacer
  - Text: value (primary color, bold)
```

---

## API Call Configuration

### Dynamic Query Building

**Example: Get Requests with Filters**

```dart
// In FlutterFlow Actions:

// Build query parameters
String buildQueryParams() {
  List<String> params = [];
  
  // Always include user ID
  params.add('userId=${FFAppState().currentUser.id}');
  
  // Add status filter if not "all"
  if (FFAppState().activeFilters['status'] != 'all') {
    params.add('status=${FFAppState().activeFilters['status']}');
  }
  
  // Add date filter if selected
  if (FFAppState().activeFilters['startDate'] != null) {
    params.add('createdAt[gte]=${FFAppState().activeFilters['startDate']}');
  }
  
  // Add sorting
  params.add('sort=createdAt:desc');
  
  // Add pagination
  params.add('page=${pageNumber}');
  params.add('limit=20');
  
  return params.join('&');
}

// Use in API call
String endpoint = '/api/citizen/requests?' + buildQueryParams();
```

### Error Handling

**Pattern for all API calls:**

```dart
// In API Response Actions:

// Check if success
if (response.success == true) {
  // Handle success
  // Update state
  // Show success message
} else {
  // Handle error
  // Show SnackBar with error message
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(response.message ?? 'Something went wrong'),
      backgroundColor: Colors.red,
    )
  );
}
```

---

## State Management Best Practices

### When to Use App State vs Page State

**App State (Persisted):**
- User authentication data
- User role
- App-wide settings
- Frequently accessed data (cache)

**Page State (Temporary):**
- Form inputs
- UI states (loading, expanded, selected)
- Temporary filters
- List data before saving

**Example Pattern:**

```
1. Load data from API → Store in Page State
2. User makes selection → Update Page State
3. User confirms action → Update App State + Call API
4. Navigate to new page → Pass data via parameters
```

---

## Testing Checklist

### Functional Testing

**Citizen App:**
- [ ] Can create request with all waste types
- [ ] Form validation works (required fields)
- [ ] Date picker restricts past dates
- [ ] Cost calculation shows correctly for bulky items
- [ ] Request list loads and filters work
- [ ] Request details shows timeline
- [ ] Can view nearby bins on map

**Coordinator App:**
- [ ] Dashboard loads statistics correctly
- [ ] Map shows color-coded bins
- [ ] Can filter pending requests
- [ ] Route generation returns valid route
- [ ] Can assign route to crew
- [ ] Active routes show progress

**Technician App:**
- [ ] Work orders list loads
- [ ] Can filter by priority
- [ ] Work order details show all info
- [ ] Can resolve with repair action
- [ ] Can resolve with replacement (new device ID)
- [ ] Resolution notes are required

**Admin App:**
- [ ] User list loads with filters
- [ ] Can search users
- [ ] Can change user roles
- [ ] Reports load with date range
- [ ] Charts display correctly

### API Integration Testing

**For Each Endpoint:**
1. Test with valid data → Success
2. Test with invalid data → Error message
3. Test with missing fields → Validation error
4. Test pagination → Next page loads
5. Test filters → Results filter correctly
6. Test sorting → Results sort correctly

---

## Performance Optimization

### Best Practices

**1. List Performance:**
- Use ListView.builder (not ListView with children)
- Implement pagination (load 20 items at a time)
- Cache images
- Use const widgets where possible

**2. API Calls:**
- Debounce search inputs (wait 500ms)
- Cache frequently accessed data in App State
- Implement pull-to-refresh
- Show loading states

**3. Images:**
- Compress before upload
- Use cached_network_image package
- Implement lazy loading

**4. Navigation:**
- Clear route stack when needed
- Pass minimal data between pages
- Use page parameters instead of global state when possible

---

## Deployment Preparation

### 1. Update App Icons

**Navigation:** Settings → App Icon
- Upload icon for iOS (1024x1024)
- Upload icon for Android (various sizes)

### 2. Configure Splash Screen

**Navigation:** Settings → Launch Screen
- Upload splash image
- Set background color
- Set display duration

### 3. App Permissions

**iOS (Info.plist additions):**
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to find nearby bins</string>

<key>NSCameraUsageDescription</key>
<string>Scan device barcodes</string>
```

**Android (AndroidManifest.xml):**
```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.CAMERA"/>
```

### 4. Build for Testing

**iOS:**
1. Settings → iOS Settings
2. Set bundle ID
3. Set Team ID (Apple Developer)
4. Generate → Download IPA
5. Upload to TestFlight

**Android:**
1. Settings → Android Settings
2. Set package name
3. Generate signing key
4. Build → Download APK/AAB
5. Upload to Play Console Internal Testing

---

## Troubleshooting Guide

### Common Issues

**1. API calls returning null:**
- Check base URL (use IP, not localhost)
- Verify backend is running
- Check CORS settings
- View network logs in browser

**2. Lists not updating:**
- Ensure setState() is called after API response
- Check if Page State variable is bound to ListView
- Verify data structure matches expected format

**3. Navigation not working:**
- Check page parameters are passed correctly
- Ensure navigation action is added to button
- Verify destination page exists

**4. Filters not applying:**
- Debug query parameter building
- Check if query builder function returns correct string
- View actual API call in Logger UI

**5. Images not loading:**
- Check image URL format
- Verify CORS allows image domain
- Use full URLs, not relative paths

---

## Next Steps

### Phase 2 Enhancements

**Features to Add:**
1. Real-time notifications (Firebase Cloud Messaging)
2. Photo upload for requests
3. Offline mode with local storage
4. In-app messaging between users
5. Advanced analytics dashboard
6. Dark mode support
7. Multi-language support (Sinhala, Tamil, English)
8. Voice input for requests
9. Barcode scanning for bins
10. Route navigation with turn-by-turn

**Technical Improvements:**
1. Implement proper authentication
2. Add biometric login
3. Optimize images (compression, caching)
4. Add crash reporting (Sentry/Firebase Crashlytics)
5. Implement analytics (Firebase Analytics)
6. Add unit tests
7. Set up CI/CD pipeline
8. Performance monitoring

---

## Resources

### FlutterFlow Documentation
- https://docs.flutterflow.io
- API Calls Guide
- Custom Widgets Tutorial
- State Management Guide

### Design Inspiration
- Material Design 3 Guidelines
- FlutterFlow Template Library
- Dribbble (waste management UI)

### Support
- FlutterFlow Community Forum
- Stack Overflow (#flutterflow)
- FlutterFlow Discord

---

**Version:** 1.0  
**Last Updated:** October 2025  
**Build Time:** ~8 hours for complete MVP