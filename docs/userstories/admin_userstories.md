# Admin User Stories - Smart Waste Management System

## Epic 4.1: User Management

### User Story 4.1.1: View All System Users

**As an** Admin  
**I want to** view a list of all system users with filtering options  
**So that** I can monitor user accounts and their roles

**API Endpoint:** `GET /api/admin/users?role=...&status=...&page=...&limit=...`

**Acceptance Criteria:**

- [ ] Display list of all users in the system
- [ ] Show user details: name, email, phone, role, status
- [ ] Filter by role (citizen, coordinator, technician, admin)
- [ ] Filter by status (active, inactive, suspended)
- [ ] Search by name or email
- [ ] Pagination support (page, limit)
- [ ] Pull to refresh functionality
- [ ] Empty state when no users found
- [ ] Loading indicator during API call
- [ ] Error handling with user-friendly messages

**Implementation Checklist:**

- [ ] Create/verify `UserManagementActivity.java`
- [ ] Create/verify `activity_user_management.xml` layout
- [ ] Create `UserAdapter.java` with RecyclerView
- [ ] Create `item_user.xml` for user card layout
- [ ] Implement role filter chips
- [ ] Implement status filter chips
- [ ] Integrate `GET /api/admin/users` API
- [ ] Add SwipeRefreshLayout
- [ ] Handle pagination
- [ ] Add empty state view
- [ ] Test all filter combinations

---

### User Story 4.1.2: Create New User Account

**As an** Admin  
**I want to** create new user accounts  
**So that** I can onboard users to the system

**API Endpoint:** `POST /api/admin/users`

**Acceptance Criteria:**

- [ ] FAB button to open create user dialog
- [ ] Input field for full name (required)
- [ ] Input field for email (required, validation)
- [ ] Input field for phone number (required)
- [ ] Role selection dropdown (citizen, coordinator, technician, admin)
- [ ] Optional status selection (defaults to active)
- [ ] Optional address fields
- [ ] Form validation before submission
- [ ] Success message after creation
- [ ] User list refreshes automatically
- [ ] Handle duplicate email error

**Implementation Checklist:**

- [ ] Add FAB in `activity_user_management.xml`
- [ ] Create `dialog_create_user.xml`
- [ ] Implement form validation
- [ ] Add role Spinner with all roles
- [ ] Integrate `POST /api/admin/users` API
- [ ] Handle API errors (duplicate email)
- [ ] Show success Toast/Snackbar
- [ ] Refresh user list after creation
- [ ] Test with all role types

---

### User Story 4.1.3: Update User Roles

**As an** Admin  
**I want to** change user roles  
**So that** I can promote/demote users as needed

**API Endpoint:** `PUT /api/admin/users/{id}/role`

**Acceptance Criteria:**

- [ ] Menu option in user card to change role
- [ ] Dialog showing current role
- [ ] Dropdown to select new role
- [ ] Confirmation before role change
- [ ] Success message after update
- [ ] User card updates immediately
- [ ] Cannot change own role
- [ ] Audit log of role changes (if available)

**Implementation Checklist:**

- [ ] Add "Change Role" menu item in user card
- [ ] Create role selection dialog
- [ ] Integrate `PUT /api/admin/users/{id}/role` API
- [ ] Add confirmation dialog
- [ ] Prevent self-role change
- [ ] Update RecyclerView item
- [ ] Show success feedback
- [ ] Handle errors gracefully

---

### User Story 4.1.4: Activate/Suspend User Accounts

**As an** Admin  
**I want to** activate or suspend user accounts  
**So that** I can control system access

**API Endpoint:** `PUT /api/users/{id}` (update status field)

**Acceptance Criteria:**

- [ ] Menu option to change user status
- [ ] View current status in user card
- [ ] Options: Active, Inactive, Suspended
- [ ] Confirmation dialog for suspension
- [ ] Reason field for suspension (optional)
- [ ] Success message after status change
- [ ] User card reflects new status
- [ ] Cannot suspend own account
- [ ] Status badge color-coded (green/gray/red)

**Implementation Checklist:**

- [ ] Add "Change Status" menu item
- [ ] Create status selection dialog
- [ ] Add confirmation for suspension
- [ ] Integrate `PUT /api/users/{id}` API
- [ ] Update status field in payload
- [ ] Prevent self-suspension
- [ ] Update UI with new status
- [ ] Add color-coded status badges

---

### User Story 4.1.5: Delete User Accounts

**As an** Admin  
**I want to** delete user accounts  
**So that** I can remove invalid or duplicate accounts

**API Endpoint:** `DELETE /api/admin/users/{id}`

**Acceptance Criteria:**

- [ ] Menu option to delete user
- [ ] Confirmation dialog with warning
- [ ] Require typing user email to confirm
- [ ] Success message after deletion
- [ ] User removed from list immediately
- [ ] Cannot delete own account
- [ ] Cannot delete last admin account
- [ ] Handle foreign key constraints error

**Implementation Checklist:**

- [ ] Add "Delete User" menu item
- [ ] Create confirmation dialog
- [ ] Add email verification input
- [ ] Integrate `DELETE /api/admin/users/{id}` API
- [ ] Remove item from RecyclerView
- [ ] Prevent self-deletion
- [ ] Show appropriate error messages
- [ ] Test cascade delete scenarios

---

## Epic 4.2: System Reports and Analytics

### User Story 4.2.1: View Collection Statistics Report

**As an** Admin  
**I want to** view collection statistics  
**So that** I can monitor waste collection performance

**API Endpoint:** `GET /api/admin/reports/collections?startDate=...&endDate=...`

**Acceptance Criteria:**

- [ ] Display total number of collections
- [ ] Display total weight collected (kg)
- [ ] Display breakdown by waste type
- [ ] Date range selector (default: last 30 days)
- [ ] Visual charts/graphs
- [ ] Comparison with previous period
- [ ] Export data option
- [ ] Refresh button
- [ ] Loading state during fetch

**Implementation Checklist:**

- [ ] Create/verify `SystemReportsActivity.java`
- [ ] Create/verify `activity_system_reports.xml`
- [ ] Add Material Cards for statistics
- [ ] Implement date range picker
- [ ] Integrate `GET /api/admin/reports/collections` API
- [ ] Add chart library (MPAndroidChart)
- [ ] Display data in cards and charts
- [ ] Add refresh functionality
- [ ] Test with different date ranges

---

### User Story 4.2.2: View Route Efficiency Report

**As an** Admin  
**I want to** view route efficiency metrics  
**So that** I can optimize collection operations

**API Endpoint:** `GET /api/admin/reports/efficiency?startDate=...&endDate=...`

**Acceptance Criteria:**

- [ ] Display average response time (days)
- [ ] Display route completion rate (%)
- [ ] Display average stops per route
- [ ] Display fuel efficiency metrics
- [ ] Date range filter
- [ ] Visual progress indicators
- [ ] Comparison trends
- [ ] Export functionality

**Implementation Checklist:**

- [ ] Add efficiency section in SystemReportsActivity
- [ ] Create stat cards for metrics
- [ ] Integrate `GET /api/admin/reports/efficiency` API
- [ ] Add progress bars for percentages
- [ ] Display trends with indicators
- [ ] Test with various date ranges

---

### User Story 4.2.3: View Device Uptime Report

**As an** Admin  
**I want to** view device status and uptime  
**So that** I can monitor system reliability

**API Endpoint:** `GET /api/admin/reports/devices`

**Acceptance Criteria:**

- [ ] Display total number of devices
- [ ] Display online devices count
- [ ] Display offline devices count
- [ ] Display maintenance devices count
- [ ] Uptime percentage
- [ ] Color-coded status indicators
- [ ] List of offline devices
- [ ] Device type breakdown
- [ ] Last signal timestamp for offline devices

**Implementation Checklist:**

- [ ] Add device section in SystemReportsActivity
- [ ] Create device status cards
- [ ] Integrate `GET /api/admin/reports/devices` API
- [ ] Add color-coded indicators (green/red/yellow)
- [ ] Display device list with status
- [ ] Show uptime percentage
- [ ] Test with various device states

---

### User Story 4.2.4: Monitor System Health

**As an** Admin  
**I want to** view system health status  
**So that** I can ensure the system is running smoothly

**API Endpoint:** `GET /api/admin/system/health`

**Acceptance Criteria:**

- [ ] Display API server status
- [ ] Display database status
- [ ] Display response time
- [ ] Display system uptime
- [ ] Memory usage metrics
- [ ] Active connections count
- [ ] Color-coded health status
- [ ] Auto-refresh every 30 seconds
- [ ] Alert on critical issues

**Implementation Checklist:**

- [ ] Create `SystemHealthActivity.java`
- [ ] Create `activity_system_health.xml`
- [ ] Integrate `GET /api/admin/system/health` API
- [ ] Add health status cards
- [ ] Implement auto-refresh
- [ ] Add color indicators
- [ ] Display metrics in readable format
- [ ] Test with different system states

---

### User Story 4.2.5: Export System Data

**As an** Admin  
**I want to** export system data  
**So that** I can analyze data externally or create backups

**API Endpoint:** `GET /api/admin/export?format=...&type=...`

**Acceptance Criteria:**

- [ ] Export button in reports screen
- [ ] Format selection: JSON or CSV
- [ ] Data type selection: users, requests, bins, routes
- [ ] Download to device storage
- [ ] Success message with file location
- [ ] Option to share exported file
- [ ] Progress indicator during export
- [ ] Handle large file exports
- [ ] Proper file naming with timestamp

**Implementation Checklist:**

- [ ] Add export button in SystemReportsActivity
- [ ] Create format selection dialog
- [ ] Create data type selection dialog
- [ ] Integrate `GET /api/admin/export` API
- [ ] Implement file download handling
- [ ] Request storage permissions
- [ ] Save file to Downloads folder
- [ ] Show success message with path
- [ ] Add share intent
- [ ] Test with large datasets

---

## Epic 4.3: Admin Dashboard

### User Story 4.3.1: View Admin Dashboard Overview

**As an** Admin  
**I want to** see a dashboard with system overview  
**So that** I can quickly assess system status

**API Endpoint:** `GET /api/admin/dashboard`

**Acceptance Criteria:**

- [ ] Display total users count
- [ ] Display users by role breakdown
- [ ] Display total waste requests count
- [ ] Display total bins count
- [ ] Display active routes count
- [ ] Display recent system activities
- [ ] Quick action buttons: Manage Users, View Reports
- [ ] System health indicator
- [ ] Auto-refresh option
- [ ] Material Design 3 cards

**Implementation Checklist:**

- [ ] Verify `AdminDashboardActivity.java` exists
- [ ] Verify `activity_admin_dashboard.xml` layout
- [ ] Integrate `GET /api/admin/dashboard` API
- [ ] Display statistics in Material Cards
- [ ] Add quick action buttons
- [ ] Add system health indicator
- [ ] Implement navigation to sub-screens
- [ ] Add pull-to-refresh
- [ ] Test with real data

---

## Implementation Summary

**Total User Stories:** 11

**API Endpoints Used:**
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/{id}/role` - Update role
- `PUT /api/users/{id}` - Update user status
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/reports/collections` - Collection stats
- `GET /api/admin/reports/efficiency` - Efficiency report
- `GET /api/admin/reports/devices` - Device report
- `GET /api/admin/system/health` - System health
- `GET /api/admin/export` - Export data
- `GET /api/admin/dashboard` - Dashboard overview

**Estimated Implementation Time:** 12-15 hours

**Priority Order:**
1. User Management (Stories 4.1.1 - 4.1.5)
2. System Reports (Stories 4.2.1 - 4.2.5)
3. Dashboard Overview (Story 4.3.1)
4. Smart Bin Management (Stories 4.4.1 - 4.4.7)

---

## Epic 4.4: Smart Bin Management

### User Story 4.4.1: View All Smart Bins

**As an** Admin  
**I want to** view all smart bins in the system with filtering  
**So that** I can monitor bin status and locations

**API Endpoint:** `GET /api/bins?status=...&binType=...&fillLevel=...`

**Acceptance Criteria:**

- [ ] Display list of all bins with fill levels
- [ ] Show bin details: binId, location, fill level, capacity, type, status
- [ ] Filter by status (active, offline, maintenance, full)
- [ ] Filter by bin type (household, recyclable, organic, general)
- [ ] Filter by fill level (e.g., >= 70%)
- [ ] Color-coded fill level indicators (green/yellow/red)
- [ ] Search by bin ID or location
- [ ] Sort by fill level, location, or last updated
- [ ] Pull to refresh functionality
- [ ] Map view showing bin locations
- [ ] List view with detailed information

**Implementation Checklist:**

- [ ] Create `BinManagementActivity.java`
- [ ] Create `activity_bin_management.xml` layout
- [ ] Create `BinAdapter.java` with RecyclerView
- [ ] Create `item_bin.xml` for bin card layout
- [ ] Implement filter chips (status, type)
- [ ] Add fill level color indicators
- [ ] Integrate `GET /api/bins` API
- [ ] Add SwipeRefreshLayout
- [ ] Implement search functionality
- [ ] Add toggle between Map/List view
- [ ] Test all filter combinations

---

### User Story 4.4.2: Create New Smart Bin ✅

**As an** Admin  
**I want to** register new smart bins in the system  
**So that** I can add bins when they are deployed

**API Endpoint:** `POST /api/bins`

**Acceptance Criteria:**

- [x] FAB button to open create bin dialog
- [x] Input field for Bin ID (required, unique)
- [x] Input field for capacity in liters (default 240)
- [x] Bin type selection (household, recyclable, organic, general) via Spinner
- [x] Address input
- [x] Area/district selection
- [x] Manual coordinate entry (latitude/longitude)
- [x] Initial fill level (default 0)
- [x] Form validation before submission
- [x] Success message after creation
- [x] Bin list refreshes automatically
- [x] Handle duplicate Bin ID error (409 response)
- [x] Error handling with user-friendly messages
- [ ] Map interface to select coordinates (tap to place pin) - Future enhancement
- [ ] Address autocomplete - Future enhancement
- [ ] Show bin location on map preview - Future enhancement

**Implementation Checklist:**

- [x] Add FAB in `activity_bin_management.xml`
- [x] Create `dialog_create_bin.xml` with all form fields
- [x] Add bin type Spinner with dropdown options
- [x] Add manual coordinate inputs (lat/lng)
- [x] Add address and area text inputs
- [x] Integrate `POST /api/bins` API
- [x] Implement form validation
- [x] Handle duplicate Bin ID error (409)
- [x] Handle all API errors with proper messages
- [x] Show success Toast
- [x] Refresh bin list after creation
- [x] Test with valid data
- [x] Test with duplicate Bin ID
- [x] Test with invalid coordinates
- [ ] Future: OSMDroid map for coordinate selection
- [ ] Future: Reverse geocoding for address

---

### User Story 4.4.3: Update Bin Information

**As an** Admin  
**I want to** update bin details  
**So that** I can correct information or update bin configuration

**API Endpoint:** `PUT /api/bins/{id}`

**Acceptance Criteria:**

- [ ] Menu option in bin card to edit
- [ ] Pre-fill form with current bin data
- [ ] Update location (address, coordinates)
- [ ] Update capacity
- [ ] Update bin type
- [ ] Update associated device ID
- [ ] Map interface for updating coordinates
- [ ] Validation before update
- [ ] Confirmation for major changes
- [ ] Success message after update
- [ ] Bin card updates immediately
- [ ] Cannot change Bin ID (immutable)

**Implementation Checklist:**

- [ ] Add "Edit Bin" menu item in bin card
- [ ] Create update dialog/activity
- [ ] Pre-fill all fields with current data
- [ ] Reuse map interface from create
- [ ] Integrate `PUT /api/bins/{id}` API
- [ ] Lock Bin ID field (read-only)
- [ ] Show confirmation dialog
- [ ] Handle API errors
- [ ] Update UI immediately
- [ ] Test all updatable fields

---

### User Story 4.4.4: Update Bin Fill Level Manually

**As an** Admin  
**I want to** manually update bin fill levels  
**So that** I can correct inaccurate sensor readings

**API Endpoint:** `PUT /api/bins/{id}/fill-level`

**Acceptance Criteria:**

- [ ] Quick action in bin card to update fill level
- [ ] Slider or number input (0-100%)
- [ ] Visual preview of fill level
- [ ] Current fill level displayed
- [ ] Validation (0-100 range)
- [ ] Automatic status update if >= 90% (sets to "full")
- [ ] Success message
- [ ] Bin card updates color indicator
- [ ] Show last updated timestamp

**Implementation Checklist:**

- [ ] Add "Update Fill Level" action
- [ ] Create fill level dialog with Slider
- [ ] Show visual fill indicator
- [ ] Add number input with validation
- [ ] Integrate `PUT /api/bins/{id}/fill-level` API
- [ ] Update card UI immediately
- [ ] Show timestamp
- [ ] Test boundary values (0, 100, 90)

---

### User Story 4.4.5: Empty Smart Bin

**As an** Admin  
**I want to** mark bins as emptied  
**So that** I can record collection actions

**API Endpoint:** `PUT /api/bins/{id}/empty`

**Acceptance Criteria:**

- [ ] "Empty Bin" action in bin card menu
- [ ] Confirmation dialog before emptying
- [ ] Sets fill level to 0%
- [ ] Increments collection count
- [ ] Records lastEmptied timestamp
- [ ] Changes status from "full" to "active"
- [ ] Success message with collection count
- [ ] Bin card updates immediately
- [ ] Show collection history (if available)

**Implementation Checklist:**

- [ ] Add "Empty Bin" menu item
- [ ] Show confirmation dialog
- [ ] Integrate `PUT /api/bins/{id}/empty` API
- [ ] Update fill level to 0 in UI
- [ ] Update collection count display
- [ ] Update status badge
- [ ] Show timestamp
- [ ] Test with full bins
- [ ] Test with already empty bins

---

### User Story 4.4.6: Set Bin Maintenance Mode

**As an** Admin  
**I want to** put bins into maintenance mode  
**So that** I can indicate when bins are being serviced

**API Endpoint:** `PUT /api/bins/{id}/maintenance`

**Acceptance Criteria:**

- [ ] "Maintenance Mode" toggle in bin card
- [ ] Confirmation when enabling maintenance
- [ ] Sets status to "maintenance"
- [ ] Visual indicator (orange badge/color)
- [ ] Cannot be collected while in maintenance
- [ ] Option to disable maintenance mode
- [ ] Returns status to previous value when disabled
- [ ] Success message
- [ ] Bin card updates immediately

**Implementation Checklist:**

- [ ] Add "Maintenance" menu item
- [ ] Create toggle dialog
- [ ] Integrate `PUT /api/bins/{id}/maintenance` API
- [ ] Add maintenance badge/indicator
- [ ] Update card styling for maintenance
- [ ] Handle enable/disable
- [ ] Show confirmation
- [ ] Test status transitions

---

### User Story 4.4.7: Delete Smart Bin

**As an** Admin  
**I want to** remove bins from the system  
**So that** I can delete decommissioned bins

**API Endpoint:** `DELETE /api/bins/{id}`

**Acceptance Criteria:**

- [ ] "Delete Bin" action in bin card menu
- [ ] Strong confirmation dialog with warning
- [ ] Require reason for deletion
- [ ] Cannot undo deletion
- [ ] Success message after deletion
- [ ] Bin removed from list immediately
- [ ] Handle associated data (devices, routes)
- [ ] Error if bin is in active route

**Implementation Checklist:**

- [ ] Add "Delete Bin" menu item
- [ ] Create confirmation dialog with reason input
- [ ] Integrate `DELETE /api/bins/{id}` API
- [ ] Remove item from adapter
- [ ] Handle API errors
- [ ] Show warning about irreversible action
- [ ] Test deletion with associated data
- [ ] Test with non-existent bin ID

---

## Updated Implementation Summary

**Total User Stories:** 18 (11 existing + 7 bin management)

**New API Endpoints:**
- `GET /api/bins` - List all bins
- `POST /api/bins` - Create bin
- `GET /api/bins/{id}` - Get bin details
- `PUT /api/bins/{id}` - Update bin
- `PUT /api/bins/{id}/fill-level` - Update fill level
- `PUT /api/bins/{id}/empty` - Empty bin
- `PUT /api/bins/{id}/maintenance` - Set maintenance
- `DELETE /api/bins/{id}` - Delete bin

**Updated Priority Order:**
1. User Management (Stories 4.1.1 - 4.1.5) ✅ COMPLETE
2. Dashboard Overview (Story 4.3.1) ✅ COMPLETE
3. System Reports (Stories 4.2.1 - 4.2.5) ✅ COMPLETE
4. **Smart Bin Management (Stories 4.4.1 - 4.4.7)** 🔄 IN PROGRESS

