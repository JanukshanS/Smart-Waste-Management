# Technician User Stories - Smart Waste Management System

## Epic 3.1: Work Order Management

### User Story 3.1.1: View Assigned Work Orders

**As a** Technician  
**I want to** view my assigned work orders  
**So that** I can prioritize and complete device maintenance tasks

**API Endpoint:** `GET /api/technician/work-orders?status=...&priority=...`

**Acceptance Criteria:**

- [ ] Display list of assigned work orders
- [ ] Show work order ID, device ID, bin location
- [ ] Show priority level with color coding (urgent/high/medium/low)
- [ ] Show status (pending, assigned, in-progress, resolved)
- [ ] Filter by priority
- [ ] Filter by status
- [ ] Sort by priority (urgent first)
- [ ] Pull to refresh functionality
- [ ] Empty state when no work orders
- [ ] Tap to view work order details

**Implementation Checklist:**

- [ ] Create `WorkOrdersListActivity.java`
- [ ] Create `activity_work_orders_list.xml`
- [ ] Create `WorkOrderAdapter.java`
- [ ] Create `item_work_order.xml`
- [ ] Integrate `GET /api/technician/work-orders` API
- [ ] Add priority filter chips
- [ ] Add status filter chips
- [ ] Implement color-coded priority badges
- [ ] Add SwipeRefreshLayout
- [ ] Handle empty state

---

### User Story 3.1.2: Self-Assign Work Orders

**As a** Technician  
**I want to** self-assign unassigned work orders  
**So that** I can take ownership of maintenance tasks

**API Endpoint:** `PUT /api/technician/work-orders/{id}/assign`

**Acceptance Criteria:**

- [ ] Show unassigned work orders in list
- [ ] "Assign to Me" button visible for unassigned orders
- [ ] Confirmation dialog before assignment
- [ ] Success message after assignment
- [ ] Work order status updates to "assigned"
- [ ] Assigned work orders appear in "My Work Orders"
- [ ] Cannot assign work order already assigned to others

**Implementation Checklist:**

- [ ] Add "Assign to Me" button in work order card
- [ ] Show only for unassigned work orders
- [ ] Create confirmation dialog
- [ ] Integrate `PUT /api/technician/work-orders/{id}/assign` API
- [ ] Update UI after assignment
- [ ] Show success feedback
- [ ] Test assignment flow

---

### User Story 3.1.3: Start Work Order

**As a** Technician  
**I want to** mark a work order as in-progress  
**So that** coordinators know I'm working on it

**API Endpoint:** `PUT /api/technician/work-orders/{id}/start`

**Acceptance Criteria:**

- [ ] "Start Work" button in work order details
- [ ] Button enabled only for assigned status
- [ ] Work order status updates to "in-progress"
- [ ] Timestamp recorded when started
- [ ] Success confirmation message
- [ ] Status badge updates in UI

**Implementation Checklist:**

- [ ] Create `WorkOrderDetailsActivity.java`
- [ ] Create `activity_work_order_details.xml`
- [ ] Add "Start Work" button
- [ ] Integrate `PUT /api/technician/work-orders/{id}/start` API
- [ ] Update status in UI
- [ ] Show start timestamp
- [ ] Test state transitions

---

### User Story 3.1.4: Resolve Work Order

**As a** Technician  
**I want to** resolve work orders by marking them as repaired or replaced  
**So that** bins return to operational status

**API Endpoint:** `PUT /api/technician/work-orders/{id}/resolve`

**Acceptance Criteria:**

- [ ] "Resolve" button in work order details
- [ ] Action selection: Repaired or Replaced
- [ ] Resolution notes text field (required)
- [ ] For "Replaced": new device ID input field
- [ ] QR code scanner for new device ID
- [ ] Photo upload of completed work (optional)
- [ ] Confirmation before submission
- [ ] Work order status updates to "resolved"
- [ ] Success message with work order ID
- [ ] Bin status updates to active

**Implementation Checklist:**

- [ ] Add "Resolve" button in details screen
- [ ] Create resolution dialog
- [ ] Add action radio buttons (Repaired/Replaced)
- [ ] Add resolution notes field
- [ ] Add new device ID field (conditional)
- [ ] Integrate QR code scanner library
- [ ] Integrate `PUT /api/technician/work-orders/{id}/resolve` API
- [ ] Handle photo upload (if implemented)
- [ ] Update work order status
- [ ] Test both repair and replacement flows

---

### User Story 3.1.5: Escalate Complex Work Orders

**As a** Technician  
**I want to** escalate work orders I cannot resolve  
**So that** senior technicians or coordinators can assist

**API Endpoint:** `PUT /api/technician/work-orders/{id}/escalate`

**Acceptance Criteria:**

- [ ] "Escalate" button in work order details
- [ ] Reason for escalation text field (required)
- [ ] Severity selection (if applicable)
- [ ] Confirmation dialog
- [ ] Work order status updates to "escalated"
- [ ] Notification sent to coordinators
- [ ] Success message displayed
- [ ] Work order remains in technician's list

**Implementation Checklist:**

- [ ] Add "Escalate" button in details screen
- [ ] Create escalation dialog
- [ ] Add reason text field with validation
- [ ] Integrate `PUT /api/technician/work-orders/{id}/escalate` API
- [ ] Update status in UI
- [ ] Show escalation confirmation
- [ ] Test escalation flow

---

## Epic 3.2: Device Management

### User Story 3.2.1: Register New Devices

**As a** Technician  
**I want to** register new devices in the system  
**So that** bins can be monitored

**API Endpoint:** `POST /api/technician/devices/register`

**Acceptance Criteria:**

- [ ] "Register Device" button in dashboard/menu
- [ ] Device ID input (manual or QR scan)
- [ ] Device type selection (RFID, QR-code, sensor)
- [ ] Bin ID association (required)
- [ ] QR code scanner for device ID
- [ ] QR code scanner for bin ID
- [ ] Initial status set to "active"
- [ ] Success message with device details
- [ ] Device appears in system immediately

**Implementation Checklist:**

- [ ] Add "Register Device" FAB/button
- [ ] Create `RegisterDeviceActivity.java`
- [ ] Create `activity_register_device.xml`
- [ ] Add device ID input with QR scanner
- [ ] Add device type spinner
- [ ] Add bin ID input with QR scanner
- [ ] Integrate `POST /api/technician/devices/register` API
- [ ] Validate all required fields
- [ ] Show success confirmation
- [ ] Test with QR scanning

---

### User Story 3.2.2: View Device Details

**As a** Technician  
**I want to** view device details and history  
**So that** I can diagnose issues

**API Endpoint:** `GET /api/technician/devices/{id}`

**Acceptance Criteria:**

- [ ] Display device ID and type
- [ ] Display associated bin ID
- [ ] Display current status
- [ ] Display battery level (if applicable)
- [ ] Display last signal timestamp
- [ ] Display maintenance history
- [ ] Navigate to bin location on map
- [ ] Option to update device status

**Implementation Checklist:**

- [ ] Create `DeviceDetailsActivity.java`
- [ ] Create `activity_device_details.xml`
- [ ] Integrate `GET /api/technician/devices/{id}` API
- [ ] Display all device information
- [ ] Add battery indicator
- [ ] Show maintenance history list
- [ ] Add "View Location" button
- [ ] Test with different device types

---

### User Story 3.2.3: Update Device Status

**As a** Technician  
**I want to** update device status  
**So that** the system reflects current device state

**API Endpoint:** `PUT /api/technician/devices/{id}/status`

**Acceptance Criteria:**

- [ ] "Update Status" button in device details
- [ ] Status selection: Active, Offline, Decommissioned
- [ ] Reason field for status change (optional)
- [ ] Confirmation dialog
- [ ] Status updates immediately
- [ ] Success message displayed
- [ ] Bin status may update accordingly

**Implementation Checklist:**

- [ ] Add "Update Status" button
- [ ] Create status selection dialog
- [ ] Add status options (active, offline, decommissioned)
- [ ] Add reason text field
- [ ] Integrate `PUT /api/technician/devices/{id}/status` API
- [ ] Update UI with new status
- [ ] Show success feedback
- [ ] Test all status transitions

---

## Epic 3.3: Technician Dashboard

### User Story 3.3.1: View Technician Dashboard

**As a** Technician  
**I want to** see an overview of my work orders and metrics  
**So that** I can manage my daily tasks efficiently

**API Endpoint:** Multiple endpoints for dashboard data

**Acceptance Criteria:**

- [ ] Display pending work orders count
- [ ] Display in-progress work orders count
- [ ] Display resolved work orders count (today)
- [ ] Display urgent work orders list
- [ ] Quick action: View All Work Orders
- [ ] Quick action: Register New Device
- [ ] Quick action: Scan QR Code
- [ ] Display recent activity timeline
- [ ] Pull to refresh

**Implementation Checklist:**

- [ ] Verify `TechnicianDashboardActivity.java` exists
- [ ] Verify `activity_technician_dashboard.xml`
- [ ] Add statistics cards
- [ ] Integrate work orders API for counts
- [ ] Display urgent work orders section
- [ ] Add quick action buttons
- [ ] Implement navigation to sub-screens
- [ ] Add refresh functionality
- [ ] Test with real data

---

## Implementation Summary

**Total User Stories:** 9

**API Endpoints Used:**
- `GET /api/technician/work-orders` - List work orders
- `GET /api/technician/work-orders/{id}` - Work order details
- `PUT /api/technician/work-orders/{id}/assign` - Self-assign
- `PUT /api/technician/work-orders/{id}/start` - Start work
- `PUT /api/technician/work-orders/{id}/resolve` - Resolve work
- `PUT /api/technician/work-orders/{id}/escalate` - Escalate
- `POST /api/technician/devices/register` - Register device
- `GET /api/technician/devices/{id}` - Device details
- `PUT /api/technician/devices/{id}/status` - Update device status

**Key Features:**
- Work order lifecycle management
- Priority-based task sorting
- Device registration and management
- QR code scanning for devices and bins
- Resolution tracking (repair vs replace)
- Escalation workflow

**Estimated Implementation Time:** 10-12 hours

**Priority Order:**
1. Work Order List and Details (Stories 3.1.1, 3.1.3)
2. Work Order Actions (Stories 3.1.2, 3.1.4, 3.1.5)
3. Device Management (Stories 3.2.1 - 3.2.3)
4. Technician Dashboard (Story 3.3.1)

**Implementation Status:** 0/9 Stories Completed (0%)

**Backend APIs Ready (Frontend Not Implemented):**
- 🔧 3.1.1-3.1.5: Work Order Management endpoints exist
- 🔧 3.2.1-3.2.3: Device Management endpoints exist
- 🔧 3.3.1: Dashboard data endpoints exist

**Note:** React Native frontend for Technician role has NO implementation yet. All features require full frontend development following the project's component structure and design patterns. Backend APIs are fully functional and tested.

