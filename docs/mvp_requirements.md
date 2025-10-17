# Smart Waste Management System - MVP Requirements

## Executive Summary

A mobile application that modernizes urban waste collection in Sri Lanka by connecting residents, collection coordinators, field technicians, and administrators through real-time communication and intelligent scheduling.

---

## Problem Statement

### Current Challenges
- **Irregular Collection**: Residents don't know when waste will be collected
- **Inefficient Routes**: Crews visit empty bins while full bins overflow
- **Poor Communication**: No way to request special pickups or report issues
- **Device Failures**: Tracking devices break with no systematic repair process
- **Lack of Accountability**: No visibility into collection performance or costs
- **Manual Processes**: Paper-based scheduling and route planning

### Impact
- Overflowing bins creating health hazards
- Wasted fuel on inefficient routes
- Frustrated residents with no recourse
- High operational costs
- Poor recycling rates

---

## Solution Overview

A mobile-first system connecting four user types through streamlined workflows:

1. **Residents** request pickups, track collection status, and report issues
2. **Coordinators** plan optimal routes based on real-time bin fill levels
3. **Technicians** receive and resolve device repair requests
4. **Administrators** manage users, monitor performance, and generate reports

---

## MVP Scope

### In Scope ✅
- Core workflows for all four user types
- Waste pickup request and tracking
- Route planning and crew assignment
- Device maintenance work orders
- User and role management
- Basic reporting and analytics
- Mobile-optimized interface

### Out of Scope ❌
- Live IoT sensor integration (use simulated data)
- Real-time GPS vehicle tracking (status updates only)
- Payment processing (track status, no transactions)
- Push notifications (in-app only)
- Offline mode
- Multi-language support
- Image recognition for waste classification

---

## User Roles & Capabilities

### 1. Citizen (Resident)

**Primary Goals:**
- Schedule waste pickups conveniently
- Know when collection will occur
- Track request status
- Understand costs for special items

**Key Capabilities:**
- Create pickup request (waste type, quantity, preferred date)
- View request history with status updates
- Track individual request progress
- See estimated or actual costs
- Find nearby public bins
- Report illegal dumping or bin issues

**Success Metrics:**
- Request completion rate >95%
- Average wait time <48 hours
- User satisfaction score >4/5

---

### 2. Waste Collection Coordinator

**Primary Goals:**
- Maximize collection efficiency
- Reduce fuel costs and travel time
- Respond to urgent requests quickly
- Ensure crew utilization

**Key Capabilities:**
- View dashboard with bin fill levels (color-coded map)
- See pending special pickup requests
- Generate optimized collection routes
- Review and approve/reject special requests
- Assign routes to collection crews
- Monitor route completion status
- Reassign stops if vehicle breaks down
- View crew performance metrics

**Route Optimization Parameters:**
- Include bins above 90% full
- Include all approved special requests
- Consider vehicle capacity
- Minimize travel distance
- Balance crew workload

**Success Metrics:**
- Route efficiency improvement >30%
- Fuel cost reduction >20%
- Special request response <24 hours

---

### 3. Field Technician

**Primary Goals:**
- Fix broken tracking devices quickly
- Minimize bin downtime
- Track repair history
- Manage spare parts inventory

**Key Capabilities:**
- View assigned work orders (by priority)
- See device details and error history
- Navigate to device location
- Record repair actions (repaired/replaced)
- Scan and register replacement devices
- Add maintenance notes
- Request supervisor escalation if needed
- Track work order completion time

**Work Order Information:**
- Device ID and type
- Bin location
- Error/offline timestamp
- Previous repair history
- Priority level

**Success Metrics:**
- Device uptime >95%
- Average repair time <4 hours
- First-time fix rate >85%

---

### 4. System Administrator

**Primary Goals:**
- Manage user accounts and permissions
- Monitor system health
- Generate performance reports
- Ensure data privacy compliance

**Key Capabilities:**
- Create and manage user accounts
- Assign and modify user roles
- View collection statistics
- Generate efficiency reports
- Monitor device status overview
- Review system logs
- Update privacy settings
- Export data for analysis

**Reporting Categories:**
- Collection metrics (total, on-time %)
- Route efficiency trends
- Device uptime statistics
- Request fulfillment rates
- Crew performance comparison
- Cost per collection analysis

**Success Metrics:**
- System uptime >99%
- User onboarding time <5 minutes
- Report generation time <30 seconds

---

## Core Workflows

### Workflow 1: Resident Requests Pickup

**Trigger:** Resident has special waste (bulky items, e-waste, extra household)

**Steps:**
1. Open app and select "Request Pickup"
2. Choose waste type from list
3. Enter quantity and description
4. Select preferred date
5. Confirm address
6. Submit request
7. Receive tracking ID and estimated timeline
8. Get status updates (Pending → Scheduled → Completed)
9. View cost if applicable
10. Confirm payment status

**Alternative Flows:**
- If preferred date unavailable, system suggests alternatives
- If waste type prohibited, request rejected with explanation
- If payment required, show amount and payment options

**Outcome:** Request created and visible to coordinators

---

### Workflow 2: Coordinator Plans Route

**Trigger:** Daily route planning or urgent request received

**Steps:**
1. Open route dashboard
2. View color-coded bin map (red >90%, yellow 70-90%, green <70%)
3. Review pending special pickup requests
4. Select "Generate Optimized Route"
5. System suggests efficient route
6. Review suggested stops on map
7. Manually add/remove stops if needed
8. Assign route to available crew
9. Crew receives route on their device
10. Monitor completion throughout day
11. Handle exceptions (breakdown, blocked access)

**Route Information Displayed:**
- Total stops
- Estimated distance
- Estimated duration
- Vehicle capacity needed
- Crew assigned
- Current progress

**Outcome:** Crew has clear route, residents notified of scheduling

---

### Workflow 3: Technician Resolves Device Issue

**Trigger:** Device goes offline or reports error

**Steps:**
1. Receive work order notification
2. View work order details (location, error, priority)
3. Navigate to device location
4. Diagnose issue on-site
5. If repairable:
   - Fix device
   - Select "Repaired" in app
   - Add notes describing fix
6. If replacement needed:
   - Install new device
   - Scan new device ID
   - System links new device to bin
   - Old device marked as decommissioned
7. Submit resolution
8. System updates device status to Active
9. Work order closed

**Alternative Flows:**
- If cannot fix on-site, escalate to supervisor
- If replacement device not available, request parts
- If wrong location, update work order details

**Outcome:** Device operational, bin back in tracking system

---

### Workflow 4: Admin Manages Users

**Trigger:** New user needs access or role change required

**Steps:**
1. Access user management screen
2. View list of all users with filters
3. For new user:
   - Enter user details (name, email, phone)
   - Assign role (Citizen/Coordinator/Technician)
   - Set permissions
   - Send activation link
4. For existing user:
   - Search by name or email
   - Update role or permissions
   - Deactivate if needed
5. Generate user activity report
6. Review privacy compliance status

**User Information Displayed:**
- Name, contact, role
- Account status (Active/Inactive)
- Last login date
- Request/route/work order count
- Performance metrics

**Outcome:** Users have appropriate access, system secured

---

## User Interface Requirements

### General Principles
- Mobile-first design
- Maximum 3 taps to complete any action
- Clear visual hierarchy
- Status indicators with colors (red/yellow/green)
- Offline-friendly forms (save locally, sync later)
- Accessible to users with limited tech literacy

### Screen Requirements by Role

**Citizen Screens (4 required):**
1. Home - Quick request button, request summary, nearby bins
2. Create Request - Simple form with dropdowns and date picker
3. Request List - Filterable by status and date
4. Request Details - Timeline view showing status progression

**Coordinator Screens (3 required):**
1. Dashboard - Interactive map with bin markers, request counter
2. Route Builder - Select bins/requests, preview route, assign crew
3. Route Monitor - Live view of active routes with crew locations

**Technician Screens (2 required):**
1. Work Order List - Prioritized list with filters
2. Work Order Details - Device info, action buttons, notes field

**Admin Screens (3 required):**
1. User Management - Searchable list with role filters
2. Reports Dashboard - Key metrics with charts
3. System Health - Status indicators for all system components

### Key UI Elements
- **Status Badges**: Color-coded (Pending/Scheduled/In Progress/Completed)
- **Progress Bars**: Visual completion indicators
- **Maps**: Interactive with custom markers and clustering
- **Forms**: Auto-validation, clear error messages
- **Lists**: Sortable, filterable, paginated
- **Cards**: Summary information with tap-to-expand

---

## Data Requirements

### Core Entities

**User**
- ID, name, email, phone, role, address, status, registration date

**Waste Request**
- ID, tracking ID, resident ID, waste type, quantity, address, preferred date, status, notes, cost, payment status, created date, scheduled date, completed date

**Smart Bin**
- ID, location, fill level (%), status, last updated, device ID, capacity, bin type, maintenance history

**Collection Route**
- ID, route name, coordinator ID, crew ID, vehicle ID, stops (bins + requests), status, distance, estimated duration, start time, end time, completion %

**Work Order**
- ID, technician ID, device ID, bin ID, priority, status, error description, action taken (repaired/replaced), notes, created date, resolved date

**Device**
- ID, type, bin ID, status (Active/Offline/Decommissioned), installation date, last signal, error log

**Report**
- Report type, date range, generated by, metrics (collections, efficiency, costs, uptime), export format

### Data Relationships
- User → Multiple Requests (one-to-many)
- Route → Multiple Bins and Requests (one-to-many)
- Bin → One Device (one-to-one)
- Work Order → One Device/Bin (many-to-one)
- Coordinator → Multiple Routes (one-to-many)
- Technician → Multiple Work Orders (one-to-many)

### Data Storage Needs
- **Retention**: Active data 2 years, archived 5 years
- **Backup**: Daily automated backups
- **Privacy**: Personal data encrypted, anonymized in reports
- **Access**: Role-based access control

---

## Business Rules

### Request Management
- Household waste: Free, no advance booking needed
- Bulky items: Fee applies, minimum 24-hour notice
- E-waste: Free, scheduled pickups only
- Hazardous waste: Not accepted, rejection notice sent
- Maximum 3 pending requests per resident
- Cancellation allowed up to 2 hours before scheduled time

### Route Planning
- Routes generated daily for next business day
- Maximum 50 stops per route
- Bins >90% full automatically included
- Special requests reviewed before inclusion
- Emergency requests processed within 4 hours
- Routes optimized for fuel efficiency

### Device Management
- Offline devices generate work order after 4 hours
- High-priority work orders: main collection areas
- Low-priority work orders: low-traffic areas
- Replacement devices must be scanned and validated
- Decommissioned devices cannot be reactivated
- Device error logs retained for 90 days

### User Management
- Email verification required for registration
- Phone number used for critical notifications
- Citizens can self-register
- Staff accounts created by administrators only
- Inactive accounts disabled after 180 days
- Role changes require supervisor approval

### Reporting
- Real-time dashboards updated every 5 minutes
- Historical reports generated on-demand
- Data exports limited to last 2 years
- Anonymized data for public reports
- Full data access for authorized administrators only

---

## Success Criteria

### Quantitative Metrics

**Operational Efficiency:**
- Route distance reduction: >30%
- Fuel cost savings: >20%
- Collection completion rate: >95%
- Average response time: <48 hours

**System Performance:**
- Device uptime: >95%
- App response time: <2 seconds
- System availability: >99%
- Data accuracy: >98%

**User Adoption:**
- Active residents: >1,000 in first 3 months
- Request completion: >90%
- App rating: >4.0/5.0
- Feature utilization: >70% of capabilities used

### Qualitative Goals
- Residents report improved service satisfaction
- Coordinators praise route planning efficiency
- Technicians complete repairs faster
- Administrators access actionable insights
- Reduced environmental impact through optimized operations

---

## Constraints & Assumptions

### Technical Constraints
- Must work on both iOS and Android devices
- Must function with intermittent mobile connectivity
- Must handle 10,000+ concurrent users
- Must support future IoT sensor integration
- Must comply with data protection regulations

### Business Constraints
- MVP delivery in 3 weeks
- Budget for cloud infrastructure: $500/month
- Support team availability: Business hours only
- Training required for coordinators and technicians

### Assumptions
- Users have smartphones with internet access
- Bins have unique identifiers for tracking
- Collection crews have mobile devices
- GPS coordinates available for all locations
- Users willing to adopt new system

---

## Risk Assessment

### High Priority Risks
1. **Low Adoption**: Mitigation - User training, incentives for early adopters
2. **System Downtime**: Mitigation - Redundant infrastructure, monitoring alerts
3. **Data Privacy Breach**: Mitigation - Encryption, regular security audits
4. **Poor Route Optimization**: Mitigation - Algorithm tuning, manual override option

### Medium Priority Risks
1. Connectivity issues in remote areas
2. Device inventory shortage
3. Coordinator resistance to change
4. Scalability limits reached

### Mitigation Strategy
- Phased rollout starting with pilot area
- Extensive user testing before launch
- 24/7 monitoring during first month
- Dedicated support hotline
- Regular feedback collection and iteration

---

## Next Steps (Post-MVP)

### Phase 2 Enhancements
- Real IoT sensor integration
- Live GPS vehicle tracking
- Payment gateway integration
- Push notifications
- Offline mode support
- Image upload for waste verification
- Gamification for residents (rewards for proper sorting)

### Phase 3 Expansion
- AI-powered demand forecasting
- Predictive maintenance for bins
- Multi-language support
- Public API for third-party integrations
- Advanced analytics and machine learning
- Carbon footprint tracking
- Integration with recycling facilities

---

## Glossary

**Special Pickup**: Non-routine collection for bulky items, e-waste, or additional household waste

**Fill Level**: Percentage of bin capacity currently occupied, measured by sensor or estimated

**Work Order**: Assignment for technician to repair or replace a device

**Route Optimization**: Algorithm-based calculation of most efficient collection sequence

**Device**: Electronic tracking unit attached to waste bin (RFID tag, QR code, or sensor)

**Tracking ID**: Unique identifier for each waste collection request

**Decommissioned**: Device permanently removed from service

**Escalation**: Transfer of work order to supervisor due to complexity

---

**Document Version:** 1.0  
**Last Updated:** October 2025  
**Owner:** Product Team  
**Status:** Approved for Development