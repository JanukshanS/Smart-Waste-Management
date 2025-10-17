# Coordinator User Stories - Smart Waste Management System

## Epic 2.1: Dashboard and Monitoring

### User Story 2.1.1: View Coordinator Dashboard

**As a** Coordinator  
**I want to** see an overview of bins, requests, and routes  
**So that** I can plan collection operations efficiently

**API Endpoint:** `GET /api/coordinator/dashboard`

**Acceptance Criteria:**

- [ ] Display total bins count
- [ ] Display full bins count (≥90% fill level)
- [ ] Display filling bins count (70-89% fill level)
- [ ] Display pending requests count
- [ ] Display approved requests count
- [ ] Display active routes count
- [ ] Quick action buttons
- [ ] Map view with color-coded bin markers
- [ ] Auto-refresh every 5 minutes
- [ ] Pull to refresh manually

**Implementation Checklist:**

- [x] Verify `CoordinatorDashboardActivity.java` exists
- [ ] Verify all statistics display correctly
- [ ] Integrate `GET /api/coordinator/dashboard` API
- [ ] Add statistics Material Cards
- [ ] Add map view with bin markers
- [ ] Implement auto-refresh timer
- [ ] Add pull-to-refresh
- [ ] Test with real data
- [ ] Verify quick action navigation

---

### User Story 2.1.2: View All Smart Bins with Fill Levels ✅

**As a** Coordinator  
**I want to** view all smart bins and their fill levels  
**So that** I can identify bins needing collection

**API Endpoint:** `GET /api/coordinator/bins?fillLevel[gte]=...&status=...&sort=...`

**Acceptance Criteria:**

- [x] Display list of all bins
- [x] Show bin ID, location, fill level, status
- [x] Visual fill level indicator (color bar)
- [x] Color coding: red (>90%), yellow (70-89%), green (<70%)
- [x] Filter by fill level threshold
- [x] Filter by bin status (active, offline, maintenance, full)
- [ ] Sort by fill level (descending)
- [ ] Sort by location
- [ ] Tap bin to view on map
- [x] Pull to refresh
- [x] Auto-refresh every 30 seconds
- [x] Statistics summary (Total, Full, Filling, Normal counts)

**Implementation Checklist:**

- [x] Create `BinsMonitoringActivity.java`
- [x] Create `activity_bins_monitoring.xml`
- [x] Create `SmartBinAdapter.java`
- [x] Create `item_smart_bin.xml`
- [x] Integrate `GET /api/coordinator/bins` API
- [x] Add fill level color indicators
- [x] Implement color coding logic
- [x] Add filter chips
- [x] Add statistics cards
- [x] Implement auto-refresh mechanism
- [ ] Add sort options
- [ ] Add map view button
- [x] Test with various fill levels

---

### User Story 2.1.3: Filter Bins by Status and Fill Level ✅

**As a** Coordinator  
**I want to** filter bins by status and fill level  
**So that** I can focus on bins requiring attention

**API Endpoint:** `GET /api/coordinator/bins?fillLevel[gte]=...&status=...`

**Acceptance Criteria:**

- [x] Filter chip: All Bins
- [x] Filter chip: Full (≥90%)
- [x] Filter chip: Filling (70-89%)
- [x] Filter chip: Active
- [x] Results update immediately
- [x] Empty state when no bins match filter
- [x] Statistics update with filtered results

**Implementation Checklist:**

- [x] Add filter ChipGroup in BinsMonitoringActivity
- [x] Implement filter logic
- [x] Update API query parameters
- [x] Handle filter combinations
- [x] Add empty state view
- [x] Add statistics calculation
- [x] Test all filter combinations
- [x] Fix API response parsing with custom deserializer

---

## Epic 2.2: Waste Request Management

### User Story 2.2.1: View Pending Waste Requests

**As a** Coordinator  
**I want to** view all pending waste pickup requests  
**So that** I can review and approve them

**API Endpoint:** `GET /api/coordinator/requests/pending`

**Acceptance Criteria:**

- [ ] Display list of pending requests
- [ ] Show tracking ID, waste type, location, date
- [ ] Show requester name and contact
- [ ] Sort by request date (oldest first)
- [ ] Tap to view full request details
- [ ] Quick approve/reject buttons
- [ ] Empty state when no pending requests
- [ ] Pull to refresh
- [ ] Badge count of pending requests

**Implementation Checklist:**

- [ ] Create `PendingRequestsActivity.java`
- [ ] Create `activity_pending_requests.xml`
- [ ] Create `PendingRequestAdapter.java`
- [ ] Create `item_pending_request.xml`
- [ ] Integrate `GET /api/coordinator/requests/pending` API
- [ ] Add approve/reject buttons
- [ ] Display request details
- [ ] Add SwipeRefreshLayout
- [ ] Test with multiple pending requests

---

### User Story 2.2.2: Approve Waste Requests

**As a** Coordinator  
**I want to** approve valid waste pickup requests  
**So that** they can be scheduled for collection

**API Endpoint:** `PUT /api/coordinator/requests/{id}/approve`

**Acceptance Criteria:**

- [ ] "Approve" button in request details
- [ ] Confirmation dialog with request summary
- [ ] Request status updates to "approved"
- [ ] Success message displayed
- [ ] Request removed from pending list
- [ ] Request appears in approved/scheduled list
- [ ] Notification sent to citizen (if implemented)
- [ ] Request becomes eligible for route optimization

**Implementation Checklist:**

- [ ] Add "Approve" button in request details
- [ ] Create approval confirmation dialog
- [ ] Integrate `PUT /api/coordinator/requests/{id}/approve` API
- [ ] Update UI after approval
- [ ] Remove from pending list
- [ ] Show success feedback
- [ ] Test approval workflow

---

### User Story 2.2.3: Reject Waste Requests with Reason

**As a** Coordinator  
**I want to** reject invalid requests with a reason  
**So that** citizens understand why their request was denied

**API Endpoint:** `PUT /api/coordinator/requests/{id}/reject`

**Acceptance Criteria:**

- [ ] "Reject" button in request details
- [ ] Rejection reason dropdown or text field (required)
- [ ] Common reasons: Invalid address, Unsupported waste type, etc.
- [ ] Confirmation dialog
- [ ] Request status updates to "rejected"
- [ ] Rejection reason stored
- [ ] Success message displayed
- [ ] Notification sent to citizen with reason
- [ ] Request removed from pending list

**Implementation Checklist:**

- [ ] Add "Reject" button in request details
- [ ] Create rejection dialog
- [ ] Add reason text field (required)
- [ ] Add common reasons dropdown/chips
- [ ] Integrate `PUT /api/coordinator/requests/{id}/reject` API
- [ ] Update UI after rejection
- [ ] Show success feedback
- [ ] Test rejection workflow

---

## Epic 2.3: Route Management

### User Story 2.3.1: Generate Optimized Collection Route

**As a** Coordinator  
**I want to** generate optimized collection routes automatically  
**So that** I can minimize fuel costs and collection time

**API Endpoint:** `POST /api/coordinator/routes/optimize`

**Acceptance Criteria:**

- [ ] "Generate Route" button in dashboard
- [ ] Configuration options dialog
- [ ] Fill level threshold slider (default 90%)
- [ ] Include approved requests checkbox (default true)
- [ ] Max stops input field (default 50)
- [ ] Route preview on map with polyline
- [ ] Display route statistics: distance, duration, stops
- [ ] List of stops in sequence
- [ ] Option to manually adjust stops
- [ ] Save route button
- [ ] Cancel and regenerate option

**Implementation Checklist:**

- [ ] Create `RouteBuilderActivity.java`
- [ ] Create `activity_route_builder.xml`
- [ ] Add configuration dialog
- [ ] Integrate `POST /api/coordinator/routes/optimize` API
- [ ] Display route on map with polyline
- [ ] Show route statistics
- [ ] Display stops list
- [ ] Allow manual stop adjustments
- [ ] Implement save route
- [ ] Test optimization with various parameters

---

### User Story 2.3.2: Create Manual Collection Route

**As a** Coordinator  
**I want to** create collection routes manually  
**So that** I can customize routes based on local knowledge

**API Endpoint:** `POST /api/coordinator/routes`

**Acceptance Criteria:**

- [ ] "Create Manual Route" option
- [ ] Route name input field
- [ ] Add stops from bin list
- [ ] Add stops from request list
- [ ] Drag to reorder stops
- [ ] Remove stops
- [ ] Map preview updates as stops change
- [ ] Calculate total distance and duration
- [ ] Save route
- [ ] Validation: at least 2 stops required

**Implementation Checklist:**

- [ ] Add manual route creation mode
- [ ] Create route name input
- [ ] Add stop selection from bins/requests
- [ ] Implement drag-and-drop reordering
- [ ] Update map preview dynamically
- [ ] Calculate route metrics
- [ ] Integrate `POST /api/coordinator/routes` API
- [ ] Validate route before saving
- [ ] Test manual route creation

---

### User Story 2.3.3: View All Routes

**As a** Coordinator  
**I want to** view all collection routes  
**So that** I can monitor and manage them

**API Endpoint:** `GET /api/coordinator/routes?status=...&page=...`

**Acceptance Criteria:**

- [ ] Display list of all routes
- [ ] Show route name, status, assigned crew, date
- [ ] Show completion percentage for active routes
- [ ] Filter by status (draft, assigned, in-progress, completed, cancelled)
- [ ] Sort by date (newest first)
- [ ] Search by route name
- [ ] Tap to view route details
- [ ] Pagination support
- [ ] Pull to refresh

**Implementation Checklist:**

- [ ] Create `RoutesListActivity.java`
- [ ] Create `activity_routes_list.xml`
- [ ] Create `RouteAdapter.java`
- [ ] Create `item_route.xml`
- [ ] Integrate `GET /api/coordinator/routes` API
- [ ] Add status filter chips
- [ ] Add search functionality
- [ ] Display completion progress
- [ ] Implement pagination
- [ ] Test with multiple routes

---

### User Story 2.3.4: View Route Details

**As a** Coordinator  
**I want to** view detailed information about a route  
**So that** I can monitor its progress and stops

**API Endpoint:** `GET /api/coordinator/routes/{id}`

**Acceptance Criteria:**

- [ ] Display route name and status
- [ ] Display assigned crew and vehicle
- [ ] Display total distance and duration
- [ ] Display completion percentage
- [ ] Show list of stops with status
- [ ] Show stop sequence numbers
- [ ] Map view with route polyline
- [ ] Color-coded stop markers (pending/completed/skipped)
- [ ] Options to assign, update status, or cancel
- [ ] View stop details on tap

**Implementation Checklist:**

- [ ] Create `RouteDetailsActivity.java`
- [ ] Create `activity_route_details.xml`
- [ ] Integrate `GET /api/coordinator/routes/{id}` API
- [ ] Display route information
- [ ] Add map with route visualization
- [ ] Display stops list with status
- [ ] Add action buttons
- [ ] Test with active and completed routes

---

### User Story 2.3.5: Assign Route to Crew and Vehicle

**As a** Coordinator  
**I want to** assign routes to collection crews and vehicles  
**So that** routes can be executed

**API Endpoint:** `PUT /api/coordinator/routes/{id}/assign`

**Acceptance Criteria:**

- [ ] "Assign Route" button in route details
- [ ] Crew selection dropdown
- [ ] Vehicle selection dropdown
- [ ] Assignment date picker
- [ ] Confirmation dialog with summary
- [ ] Route status updates to "assigned"
- [ ] Success message displayed
- [ ] Notification sent to crew (if implemented)
- [ ] Cannot assign to unavailable crew/vehicle

**Implementation Checklist:**

- [ ] Add "Assign Route" button
- [ ] Create assignment dialog
- [ ] Add crew selection spinner
- [ ] Add vehicle selection spinner
- [ ] Integrate `PUT /api/coordinator/routes/{id}/assign` API
- [ ] Update route status in UI
- [ ] Show success feedback
- [ ] Test assignment workflow

---

### User Story 2.3.6: Update Route Status

**As a** Coordinator  
**I want to** update route status  
**So that** I can manage route lifecycle

**API Endpoint:** `PUT /api/coordinator/routes/{id}/status`

**Acceptance Criteria:**

- [ ] "Update Status" button in route details
- [ ] Status selection: Draft, Assigned, In-Progress, Completed, Cancelled
- [ ] Status change validation rules
- [ ] Confirmation dialog for status change
- [ ] Route status updates immediately
- [ ] Success message displayed
- [ ] Cannot change status of completed routes

**Implementation Checklist:**

- [ ] Add "Update Status" button
- [ ] Create status selection dialog
- [ ] Implement status transition validation
- [ ] Integrate `PUT /api/coordinator/routes/{id}/status` API
- [ ] Update UI with new status
- [ ] Show success feedback
- [ ] Test all valid status transitions

---

### User Story 2.3.7: Update Stop Status in Route

**As a** Coordinator  
**I want to** update individual stop status  
**So that** I can track route progress manually if needed

**API Endpoint:** `PUT /api/coordinator/routes/{id}/stops/{stopIndex}`

**Acceptance Criteria:**

- [ ] Tap stop in route details to update
- [ ] Status options: Pending, Completed, Skipped
- [ ] Reason field for skipped stops
- [ ] Stop status updates immediately
- [ ] Route completion percentage recalculates
- [ ] Success message displayed
- [ ] Stop marker color updates on map

**Implementation Checklist:**

- [ ] Make stops clickable in route details
- [ ] Create stop status dialog
- [ ] Add reason field for skipped status
- [ ] Integrate `PUT /api/coordinator/routes/{id}/stops/{stopIndex}` API
- [ ] Update stop status in UI
- [ ] Recalculate completion percentage
- [ ] Update map marker color
- [ ] Test all stop status changes

---

## Implementation Summary

**Total User Stories:** 13

**API Endpoints Used:**
- `GET /api/coordinator/dashboard` - Dashboard overview
- `GET /api/coordinator/bins` - List bins with filters
- `GET /api/coordinator/requests/pending` - Pending requests
- `PUT /api/coordinator/requests/{id}/approve` - Approve request
- `PUT /api/coordinator/requests/{id}/reject` - Reject request
- `POST /api/coordinator/routes/optimize` - Generate optimized route
- `POST /api/coordinator/routes` - Create manual route
- `GET /api/coordinator/routes` - List routes
- `GET /api/coordinator/routes/{id}` - Route details
- `PUT /api/coordinator/routes/{id}/assign` - Assign route
- `PUT /api/coordinator/routes/{id}/status` - Update route status
- `PUT /api/coordinator/routes/{id}/stops/{stopIndex}` - Update stop status

**Key Features:**
- Real-time bin monitoring with fill levels
- Request approval workflow
- Automatic route optimization
- Manual route creation and editing
- Route assignment and tracking
- Stop-level status management

**Estimated Implementation Time:** 15-18 hours

**Priority Order:**
1. Dashboard completion (Story 2.1.1)
2. Bins management (Stories 2.1.2, 2.1.3)
3. Request management (Stories 2.2.1 - 2.2.3)
4. Route optimization and creation (Stories 2.3.1, 2.3.2)
5. Route management (Stories 2.3.3 - 2.3.7)

**Status:** 5/13 Stories Completed (38%) - Bin monitoring and request management fully implemented

**Completed (5/13):**
- ✅ 2.1.2: View All Smart Bins with Fill Levels
- ✅ 2.1.3: Filter Bins by Status and Fill Level  
- ✅ 2.2.1: View Pending Waste Requests
- ✅ 2.2.2: Approve Waste Requests
- ✅ 2.2.3: Reject Waste Requests with Reason

**Pending (8/13):**
- ⏳ 2.1.1: View Coordinator Dashboard (partially implemented)
- ⏳ 2.3.1-2.3.7: Route Management Features (requires Route models and map integration)

**Build:** ✅ SUCCESS  
**APK:** Ready for testing implemented features

