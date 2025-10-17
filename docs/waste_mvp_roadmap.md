# 3-Day MVP Development Roadmap
## Smart Waste Management System

---

## 🎯 MVP Scope (Based on Your Case Study)

### Core Actors & Features
1. **Citizen** - Request waste pickup, track requests, make payments
2. **Coordinator** - Manage collection routes, assign crews
3. **Technician** - Handle device repairs/replacements
4. **Admin** - System management, user roles, reports

### Out of Scope for MVP
- ❌ Real IoT sensors (use mock data)
- ❌ Real GPS tracking (simulate coordinates)
- ❌ Payment gateway (status tracking only)
- ❌ Push notifications (in-app status only)

---

## 📅 Day 1: Backend Foundation (8 hours)

### Morning (4h): Setup & Core API Structure

#### 1. Initialize Project (30 min)
```bash
mkdir waste-management-backend
cd waste-management-backend
npm init -y

# Install dependencies
npm install express mongoose cors dotenv
npm install swagger-ui-express swagger-jsdoc socket.io
npm install nodemon --save-dev
```

**package.json scripts:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

#### 2. Project Structure (30 min)
```
waste-management-backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── User.model.js         # All user types
│   │   ├── WasteRequest.model.js # Citizen requests
│   │   ├── SmartBin.model.js     # Bin tracking
│   │   ├── Route.model.js        # Collection routes
│   │   └── WorkOrder.model.js    # Technician tasks
│   ├── controllers/
│   │   ├── citizen.controller.js
│   │   ├── coordinator.controller.js
│   │   ├── technician.controller.js
│   │   └── admin.controller.js
│   ├── routes/
│   │   ├── citizen.routes.js
│   │   ├── coordinator.routes.js
│   │   ├── technician.routes.js
│   │   └── admin.routes.js
│   ├── middleware/
│   │   ├── logger.js             # Request logger
│   │   ├── queryBuilder.js       # OData-like queries
│   │   └── errorHandler.js
│   ├── services/
│   │   ├── socketLogger.service.js
│   │   └── route-optimizer.service.js (mock)
│   └── utils/
│       └── response.js           # Standard responses
├── docs/
│   └── swagger.js                # API documentation
├── uploads/                      # Auto-created
├── .env.example
├── .env
├── server.js
└── package.json
```

#### 3. Core Models (2h)
Create MongoDB schemas for all entities from your class diagram.

**Priority Models:**
- `User.model.js` - Citizen, Coordinator, Technician, Admin
- `WasteRequest.model.js` - Pickup requests with tracking
- `SmartBin.model.js` - Bins with fill levels
- `Route.model.js` - Collection routes
- `WorkOrder.model.js` - Device repairs

#### 4. Environment Setup (30 min)
```env
# .env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/waste-management

# Feature flags
ENABLE_SWAGGER=true
ENABLE_LOGGER_UI=true
```

#### 5. Server Setup with Logging UI (30 min)
```javascript
// server.js - Basic structure with Socket.IO logger
```

### Afternoon (4h): Core Endpoints

#### 6. Implement Citizen APIs (2h)
Based on your use case scenarios:

**Endpoints:**
- `POST /api/citizen/requests` - Create waste pickup request
- `GET /api/citizen/requests` - List user's requests (with OData)
- `GET /api/citizen/requests/:id` - Track specific request
- `PUT /api/citizen/requests/:id/payment` - Record payment
- `GET /api/citizen/bins/nearby` - Find nearby bins (mock GPS)

**OData Support:**
```bash
# Filter by status
GET /api/citizen/requests?status=pending

# Filter by date range
GET /api/citizen/requests?createdAt[gte]=2025-10-01

# Search by waste type
GET /api/citizen/requests?wasteType[in]=household,e-waste

# Sort and paginate
GET /api/citizen/requests?sort=createdAt:desc&page=1&limit=10
```

#### 7. Implement Coordinator APIs (2h)
Based on Member 01's use case:

**Endpoints:**
- `GET /api/coordinator/dashboard` - Route management view
- `GET /api/coordinator/bins` - Bins with fill levels (color-coded)
- `GET /api/coordinator/requests/pending` - Special pickup requests
- `POST /api/coordinator/routes/optimize` - Generate optimized route
- `PUT /api/coordinator/routes/:id/assign` - Assign to crew
- `PUT /api/coordinator/routes/:id/status` - Update route status

**Mock Route Optimization:**
```javascript
// Simple algorithm for MVP: sort by fill level + distance
function optimizeRoute(bins, requests) {
  // Priority: bins >90% full, then pending requests
  // Sort by proximity (mock coordinates)
  return sortedStops;
}
```

---

## 📅 Day 2: Complete Backend Features (8 hours)

### Morning (4h): Remaining APIs & Advanced Queries

#### 8. Implement Technician APIs (1.5h)
Based on Member 04's use case:

**Endpoints:**
- `GET /api/technician/work-orders` - List assigned work orders
- `GET /api/technician/work-orders/:id` - Work order details
- `PUT /api/technician/work-orders/:id/resolve` - Mark repaired/replaced
- `POST /api/technician/devices/scan` - Register new device

**Device Status Flow:**
```
OFFLINE → (technician fixes) → ACTIVE
OFFLINE → (replaced) → DECOMMISSIONED (old) + ACTIVE (new)
```

#### 9. Implement Admin APIs (1.5h)
Based on Member 02's use case:

**Endpoints:**
- `GET /api/admin/users` - User management (with OData)
- `PUT /api/admin/users/:id/role` - Update user roles
- `GET /api/admin/reports/collections` - Collection statistics
- `GET /api/admin/reports/efficiency` - Route efficiency metrics
- `GET /api/admin/system/health` - System status

**Reports Mock Data:**
```javascript
{
  totalCollections: 1247,
  avgResponseTime: "2.3 hours",
  deviceUptime: "94.2%",
  recyclingRate: "67%"
}
```

#### 10. OData Query Middleware (1h)
Implement the query builder from your QUERY_GUIDE.md:

```javascript
// middleware/queryBuilder.js
// Support operators: eq, ne, gt, gte, lt, lte, contains, in, nin
// Support: sort, select, page, limit
```

### Afternoon (4h): Swagger UI & Logger UI

#### 11. Swagger Documentation (2h)
Generate interactive API docs:

```javascript
// docs/swagger.js
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Smart Waste Management API',
    version: '1.0.0',
    description: 'MVP Backend for Urban Waste Collection',
  },
  servers: [{
    url: 'http://localhost:5000',
    description: 'Development server'
  }],
  tags: [
    { name: 'Citizen', description: 'Resident operations' },
    { name: 'Coordinator', description: 'Route management' },
    { name: 'Technician', description: 'Device maintenance' },
    { name: 'Admin', description: 'System administration' }
  ]
};
```

**Document all endpoints with:**
- Request/response schemas
- Query parameter examples
- OData operator examples
- Error responses

**Access at:** `http://localhost:5000/api-docs`

#### 12. Runtime Logger UI (2h)
Implement Socket.IO-based real-time logger:

**Features:**
- Live request/response monitoring
- Color-coded by HTTP method and status
- Filter by endpoint, method, status
- Search functionality
- Export logs as JSON
- Auto-reconnection

**Access at:** `http://localhost:5000/logs`

Use your existing implementation from CHANGELOG.md (Socket.IO-based).

---

## 📅 Day 3: FlutterFlow Integration & Testing (8 hours)

### Morning (4h): FlutterFlow Setup

#### 13. Export API Specification (30 min)
```bash
# Generate from Swagger UI
curl http://localhost:5000/api-docs.json > swagger.json
```

Or manually create `swagger.yaml` for FlutterFlow.

#### 14. FlutterFlow Project Setup (1h)

**Create API Group:**
```
Name: WasteManagementAPI
Base URL: http://YOUR-IP:5000
(Use your local IP, not localhost, for mobile testing)
```

**Variable Groups:**
```
currentUserId: String
currentRole: String (citizen/coordinator/technician/admin)
```

#### 15. Import Key Endpoints (2.5h)

**For Each Actor, Create:**

**Citizen Endpoints:**
```
1. CreateWasteRequest (POST /api/citizen/requests)
   Body: { wasteType, quantity, address, preferredDate, description }
   Returns: { trackingId, status, estimatedCost }

2. GetMyRequests (GET /api/citizen/requests)
   Query: { status[in], sort, page, limit }
   Returns: List of requests with pagination

3. TrackRequest (GET /api/citizen/requests/:id)
   Path param: requestId
   Returns: Request details with status timeline

4. ConfirmPayment (PUT /api/citizen/requests/:id/payment)
   Body: { amount, paymentMethod }
```

**Coordinator Endpoints:**
```
1. GetDashboard (GET /api/coordinator/dashboard)
   Returns: { bins, pendingRequests, activeRoutes }

2. OptimizeRoute (POST /api/coordinator/routes/optimize)
   Body: { binIds, requestIds, fillLevelThreshold }
   Returns: Optimized route with stops

3. AssignRoute (PUT /api/coordinator/routes/:id/assign)
   Body: { crewId, vehicleId }
```

**Technician Endpoints:**
```
1. GetWorkOrders (GET /api/technician/work-orders)
   Query: { status, sort }

2. ResolveWorkOrder (PUT /api/technician/work-orders/:id/resolve)
   Body: { action: "repaired"|"replaced", notes, newDeviceId? }
```

**Admin Endpoints:**
```
1. GetUsers (GET /api/admin/users)
   Query: { role, sort, page, limit }

2. GetReports (GET /api/admin/reports/collections)
   Query: { startDate, endDate }
```

### Afternoon (4h): Testing & Documentation

#### 16. API Testing (2h)

**Test Each Endpoint:**
```bash
# Use Postman, Thunder Client, or curl

# Example: Create waste request
curl -X POST http://localhost:5000/api/citizen/requests \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "citizen123",
    "wasteType": "household",
    "quantity": "2 bags",
    "address": "123 Main St, Malabe",
    "preferredDate": "2025-10-20"
  }'

# Example: OData filtering
curl "http://localhost:5000/api/citizen/requests?status[in]=pending,scheduled&sort=createdAt:desc"
```

**Test Cases:**
- ✅ CRUD operations for all entities
- ✅ OData operators (eq, gt, contains, in, etc.)
- ✅ Sorting and pagination
- ✅ Field selection
- ✅ Error responses
- ✅ Mock data scenarios (bins 90% full, overdue routes, etc.)

#### 17. FlutterFlow Integration Testing (1h)

**Build Test Screens:**
1. Citizen: Request form + request list
2. Coordinator: Dashboard with bin map + route optimizer
3. Technician: Work order list + resolve form
4. Admin: User list + reports

**Test OData in FlutterFlow:**
```dart
// Example: Dynamic query building
String buildQuery() {
  List<String> params = ['page=1', 'limit=20'];
  
  if (filterStatus.isNotEmpty) {
    params.add('status=${filterStatus}');
  }
  
  if (searchText.isNotEmpty) {
    params.add('address[contains]=${searchText}');
  }
  
  return params.join('&');
}
```

#### 18. Documentation & Deployment Prep (1h)

**Create README.md:**
```markdown
# Smart Waste Management - MVP Backend

## Quick Start
npm install
npm run dev

## Access Points
- API: http://localhost:5000
- Swagger UI: http://localhost:5000/api-docs
- Logger UI: http://localhost:5000/logs

## FlutterFlow Setup
1. Import swagger.json
2. Set base URL to your local IP
3. No authentication required (MVP)

## OData Query Examples
[Include examples from QUERY_GUIDE.md]
```

**Prepare for deployment:**
- Set up MongoDB Atlas (free tier)
- Deploy to Heroku/Railway/Render
- Update FlutterFlow base URL to deployed URL

---

## 📊 MVP Feature Checklist

### Backend ✅
- [x] MongoDB models for all entities
- [x] RESTful APIs for all 4 actors
- [x] OData-like query system (operators, sorting, pagination)
- [x] Swagger UI at `/api-docs`
- [x] Real-time logger UI at `/logs`
- [x] Mock route optimization
- [x] Mock device status management
- [x] Standard error handling
- [x] CORS enabled for mobile

### FlutterFlow Integration ✅
- [x] API group created
- [x] All endpoints imported
- [x] Dynamic query building
- [x] Test screens for each actor
- [x] Response parsing

### Testing ✅
- [x] All CRUD operations
- [x] OData operators
- [x] Error scenarios
- [x] Mobile connectivity

---

## 🚀 Post-MVP Enhancements

### Week 2 (Optional)
- Real-time updates with Socket.IO
- Image upload for waste photos
- PDF report generation
- Email notifications
- Basic analytics dashboard

### Future
- Authentication & authorization
- Real IoT sensor integration
- Payment gateway
- Push notifications
- Route optimization AI
- Mobile app (driver/collector)

---

## 📱 Mobile App Screens (FlutterFlow)

### Citizen App (4 screens)
1. **Home** - Quick request button, nearby bins map
2. **Create Request** - Form (waste type, quantity, date)
3. **My Requests** - List with OData filters (status, date)
4. **Request Details** - Tracking timeline, payment status

### Coordinator App (3 screens)
1. **Dashboard** - Map with color-coded bins, pending requests count
2. **Route Optimizer** - Select bins/requests, generate route
3. **Route Details** - Stops list, assign crew, track progress

### Technician App (2 screens)
1. **Work Orders** - List with filters (status, priority)
2. **Resolve Order** - Device info, action buttons (repair/replace)

### Admin App (3 screens)
1. **Users** - List with role filters
2. **Reports** - Collection stats, efficiency metrics
3. **System Health** - API status, device uptime

---

## 💡 Quick Tips

### OData in FlutterFlow
Always use query parameters, not URL segments:
```
✅ Good: /api/citizen/requests?status=pending
❌ Bad: /api/citizen/requests/pending
```

### Logger UI
Keep it open during testing to see real-time API calls from FlutterFlow.

### Mock Data
Seed database with realistic data:
- 50 bins at various fill levels
- 20 pending requests
- 10 completed routes
- 5 work orders

### Performance
For MVP, keep limits low:
- Default page size: 20
- Max page size: 50
- Response time: <500ms

---

## 🎯 Success Criteria

By end of Day 3:
- ✅ Backend running with all APIs
- ✅ Swagger UI accessible
- ✅ Logger UI working
- ✅ FlutterFlow connected
- ✅ Test flows working for all actors
- ✅ OData queries functioning
- ✅ Ready for demo

---

**Total Development Time: 24 hours (3 days)**
**Stack: Node.js + Express + MongoDB + Socket.IO + Swagger + FlutterFlow**
