# Citizen User Stories - Smart Waste Management System

## Epic 1.1: Waste Pickup Request Management

### User Story 1.1.1: Create Waste Pickup Request ✓

**As a** Citizen  
**I want to** create a waste pickup request  
**So that** I can schedule collection for my waste

**API Endpoint:** `POST /api/citizen/requests`

**Acceptance Criteria:**

- [x] Select waste type (household, bulky, e-waste, recyclable)
- [x] Enter quantity with helper text
- [x] Add optional description
- [x] Input/confirm collection address
- [x] Select preferred date (tomorrow onwards, max 30 days)
- [x] Cost preview shown for applicable waste types
- [x] Form validation works (required fields, date constraints)
- [x] Success message shows tracking ID
- [x] Navigate to track the request immediately

**Implementation Status:** ✅ **COMPLETED**

**Files Implemented:**
- `CreateRequestActivity.java`
- `activity_create_request.xml`
- `WasteRequest` model
- API integration with `POST /api/citizen/requests`

**Testing Checklist:**

- [x] All waste types selectable
- [x] Date picker restricts past dates
- [x] Required field validation works
- [x] Cost calculation displays correctly
- [x] API call succeeds with valid data
- [x] Tracking ID displayed on success
- [x] Error handling shows user-friendly messages

---

### User Story 1.1.2: View My Requests List ✓

**As a** Citizen  
**I want to** view all my waste pickup requests  
**So that** I can track multiple requests and their status

**API Endpoint:** `GET /api/citizen/requests?userId=...&status=...&page=...&limit=...`

**Acceptance Criteria:**

- [x] Display list of user's requests (newest first)
- [x] Show tracking ID, waste type, date, status badge
- [x] Empty state shown when no requests exist
- [x] Filter by status (All, Pending, Scheduled, Completed)
- [x] Pull to refresh updates list
- [x] Pagination loads more on scroll
- [x] Tapping request navigates to details

**Implementation Status:** ✅ **COMPLETED**

**Files Implemented:**
- `RequestsListActivity.java`
- `activity_requests_list.xml`
- `RequestAdapter.java`
- `item_request_card.xml`

**Testing Checklist:**

- [x] List loads on open
- [x] Filter chips work correctly
- [x] Status badges color-coded properly
- [x] Pull to refresh updates data
- [x] Pagination implemented
- [x] Empty state displays appropriately
- [x] Navigation to details works

---

### User Story 1.1.3: Track Request with Timeline ✓

**As a** Citizen  
**I want to** see detailed status of my request with timeline  
**So that** I know when my waste will be collected

**API Endpoint:** `GET /api/citizen/requests/{id}/track`

**Acceptance Criteria:**

- [x] Show all request details (type, quantity, address, dates)
- [x] Display status timeline with visual indicators
- [x] Show estimated/actual cost
- [x] Show payment status if applicable
- [x] Can cancel request if status is pending/scheduled
- [x] Cancellation requires confirmation

**Implementation Status:** ✅ **COMPLETED**

**Files Implemented:**
- `RequestDetailsActivity.java`
- `activity_request_details.xml`
- Custom timeline view component
- API integration with `GET /api/citizen/requests/{id}`

**Testing Checklist:**

- [x] All details display correctly
- [x] Timeline shows progression visually
- [x] Cost and payment status visible
- [x] Cancel button enabled/disabled appropriately
- [x] Cancellation confirmation works
- [x] Status updates reflect immediately

---

### User Story 1.1.4: Cancel Pending Request ✓

**As a** Citizen  
**I want to** cancel my pending or scheduled requests  
**So that** I can change my plans if needed

**API Endpoint:** `PUT /api/citizen/requests/{id}/cancel`

**Acceptance Criteria:**

- [x] "Cancel Request" button in request details
- [x] Button enabled only for pending/scheduled status
- [x] Confirmation dialog with warning message
- [x] Request status updates to "cancelled"
- [x] Success message displayed
- [x] Request removed from active list
- [x] Cannot cancel in-progress or completed requests

**Implementation Status:** ✅ **COMPLETED**

**Files Implemented:**
- Cancel functionality in `RequestDetailsActivity.java`
- Confirmation dialog
- API integration with `PUT /api/citizen/requests/{id}/cancel`

**Testing Checklist:**

- [x] Cancel button shows only for cancellable statuses
- [x] Confirmation dialog appears
- [x] Status updates correctly
- [x] Success feedback shown
- [x] UI updates after cancellation

---

### User Story 1.1.5: Record Payment for Request ✓

**As a** Citizen  
**I want to** record payment for my waste collection  
**So that** my payment status is tracked

**API Endpoint:** `PUT /api/citizen/requests/{id}/payment`

**Acceptance Criteria:**

- [x] "Record Payment" button for approved requests
- [x] Payment amount input field
- [x] Payment method selection (optional)
- [x] Confirmation dialog
- [x] Payment status updates to "paid"
- [x] Success message displayed
- [x] Receipt/confirmation shown

**Implementation Status:** ✅ **COMPLETED**

**Files Implemented:**
- Payment recording in `RequestDetailsActivity.java`
- Payment dialog
- API integration with `PUT /api/citizen/requests/{id}/payment`

**Testing Checklist:**

- [x] Payment button shows for applicable requests
- [x] Amount validation works
- [x] Payment records successfully
- [x] Status updates correctly
- [x] Success confirmation shown

---

## Epic 1.2: Nearby Bins Discovery

### User Story 1.2.1: Find Nearby Smart Bins on Map ✓

**As a** Citizen  
**I want to** find smart bins near my location  
**So that** I can dispose waste at convenient public bins

**API Endpoint:** `GET /api/citizen/bins/nearby?lat=...&lng=...&radius=...&binType=...`

**Acceptance Criteria:**

- [x] Show map with current location
- [x] Display nearby bins as markers (within 2km radius)
- [x] Bin markers color-coded by fill level (red/yellow/green)
- [x] Tapping marker shows bin details (address, type, fill level)
- [x] Can get directions to selected bin
- [x] Can filter by bin type
- [x] Location permission handling

**Implementation Status:** ✅ **COMPLETED**

**Files Implemented:**
- `NearbyBinsActivity.java`
- `activity_nearby_bins.xml`
- OSMDroid map integration (free alternative to Google Maps)
- Custom marker icons for bins
- API integration with `GET /api/citizen/bins/nearby`

**Testing Checklist:**

- [x] Location permission requested and handled
- [x] Map loads with current location
- [x] Bins display as markers
- [x] Color coding works (red>90%, yellow 70-90%, green<70%)
- [x] Marker tap shows details
- [x] Filter by bin type works
- [x] Navigation to Google Maps works

---

## Epic 1.3: User Profile Management

### User Story 1.3.1: View and Edit Profile ✓

**As a** Citizen  
**I want to** view and update my profile information  
**So that** I can keep my contact details current

**API Endpoint:** `GET /api/users/{id}` and `PUT /api/users/{id}`

**Acceptance Criteria:**

- [x] Display current user info (name, email, phone, address)
- [x] Show user role badge
- [x] Can edit name, phone, address
- [x] Email is read-only
- [x] Changes saved with confirmation
- [x] Can change password
- [x] Can logout
- [x] Session cleared on logout

**Implementation Status:** ✅ **COMPLETED**

**Files Implemented:**
- `ProfileActivity.java`
- `activity_profile.xml`
- `dialog_change_password.xml`
- Session management integration
- API integration with `PUT /api/users/{id}`

**Testing Checklist:**

- [x] Profile data loads correctly
- [x] Edit mode enables fields
- [x] Email field is read-only
- [x] Validation works
- [x] Changes save successfully
- [x] Password change works
- [x] Logout clears session
- [x] Redirects to login after logout

---

## Implementation Summary

**Total User Stories:** 7  
**Status:** ✅ **ALL COMPLETED**

**API Endpoints Implemented:**
- `POST /api/citizen/requests` - Create request
- `GET /api/citizen/requests` - List requests
- `GET /api/citizen/requests/{id}` - Request details
- `GET /api/citizen/requests/{id}/track` - Track with timeline
- `PUT /api/citizen/requests/{id}/cancel` - Cancel request
- `PUT /api/citizen/requests/{id}/payment` - Record payment
- `GET /api/citizen/bins/nearby` - Find nearby bins
- `GET /api/users/{id}` - Get user profile
- `PUT /api/users/{id}` - Update user profile

**Key Features Implemented:**
- Complete waste pickup request lifecycle
- Real-time request tracking with timeline
- Nearby bins discovery with map
- User profile management with edit capability
- Payment recording
- Request cancellation workflow
- Role-based navigation
- Material Design 3 UI components
- Pull-to-refresh functionality
- Empty state handling
- Error handling and validation

**Technical Highlights:**
- MVVM architecture
- Retrofit API integration
- Custom response deserializers for API inconsistencies
- OSMDroid for offline-capable maps
- Encrypted session management
- RecyclerView adapters with ViewBinding
- Material Design 3 components
- Adaptive layouts

**Testing Status:** ✅ All features tested and working

**Known Issues:** None critical - API response format inconsistencies handled with custom deserializers

**Next Steps for Citizen Features:**
- [ ] Push notifications for status updates
- [ ] Photo upload for waste requests
- [ ] Offline mode with data synchronization
- [ ] QR code scanning for bins
- [ ] Gamification/rewards system
- [ ] Collection schedule calendar view
- [ ] Waste sorting guide/education section

---

## Navigation Flow

**Main Citizen Flow:**
1. Login → MainActivity (Citizen Dashboard)
2. Create Request → CreateRequestActivity → Success → RequestDetailsActivity
3. View Requests → RequestsListActivity → RequestDetailsActivity
4. Find Bins → NearbyBinsActivity (with map)
5. Profile → ProfileActivity → Edit/Change Password/Logout

**Bottom Navigation:**
- Home (MainActivity)
- My Requests (RequestsListActivity)
- Nearby Bins (NearbyBinsActivity)
- Profile (ProfileActivity)

All citizen features are production-ready and fully functional!

