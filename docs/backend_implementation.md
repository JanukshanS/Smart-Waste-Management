# Backend Implementation Guide
## Smart Waste Management System

---

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: MongoDB 6.x
- **Real-time**: Socket.IO 4.x
- **Documentation**: Swagger UI Express
- **Validation**: Express Validator
- **CORS**: cors package

---

## Project Structure

```
waste-management-backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── User.model.js
│   │   ├── WasteRequest.model.js
│   │   ├── SmartBin.model.js
│   │   ├── Route.model.js
│   │   ├── WorkOrder.model.js
│   │   └── Device.model.js
│   ├── controllers/
│   │   ├── citizen.controller.js
│   │   ├── coordinator.controller.js
│   │   ├── technician.controller.js
│   │   ├── admin.controller.js
│   │   └── logs.controller.js
│   ├── routes/
│   │   ├── citizen.routes.js
│   │   ├── coordinator.routes.js
│   │   ├── technician.routes.js
│   │   ├── admin.routes.js
│   │   └── logs.routes.js
│   ├── middleware/
│   │   ├── logger.js
│   │   ├── queryBuilder.js
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── services/
│   │   ├── socketLogger.service.js
│   │   ├── routeOptimizer.service.js
│   │   └── notification.service.js
│   └── utils/
│       ├── response.js
│       └── helpers.js
├── docs/
│   └── swagger.js
├── uploads/
├── .env.example
├── .env
├── package.json
└── server.js
```

---

## Setup Instructions

### 1. Initialize Project

```bash
mkdir waste-management-backend
cd waste-management-backend
npm init -y
```

### 2. Install Dependencies

```bash
# Core dependencies
npm install express mongoose cors dotenv

# Documentation & Logging
npm install swagger-ui-express swagger-jsdoc socket.io

# Validation & Security
npm install express-validator

# Development
npm install nodemon --save-dev
```

### 3. Configure package.json

```json
{
  "name": "waste-management-backend",
  "version": "1.0.0",
  "description": "Smart Waste Management System API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node src/utils/seed.js"
  },
  "keywords": ["waste", "management", "smart", "iot"],
  "author": "",
  "license": "ISC"
}
```

### 4. Environment Configuration

Create `.env`:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/waste-management

# Features
ENABLE_SWAGGER=true
ENABLE_LOGGER_UI=true
ENABLE_CORS=true

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://192.168.1.100:3000

# Pagination
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
```

Create `.env.example`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/waste-management
ENABLE_SWAGGER=true
ENABLE_LOGGER_UI=true
ENABLE_CORS=true
CORS_ORIGINS=http://localhost:3000
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
```

---

## Core Implementation

### Server Setup (server.js)

```javascript
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Make Socket.IO accessible to routes
app.set('io', io);

// Import middleware
const logger = require('./src/middleware/logger');
app.use(logger);

// Import routes
const citizenRoutes = require('./src/routes/citizen.routes');
const coordinatorRoutes = require('./src/routes/coordinator.routes');
const technicianRoutes = require('./src/routes/technician.routes');
const adminRoutes = require('./src/routes/admin.routes');
const logsRoutes = require('./src/routes/logs.routes');

// Mount routes
app.use('/api/citizen', citizenRoutes);
app.use('/api/coordinator', coordinatorRoutes);
app.use('/api/technician', technicianRoutes);
app.use('/api/admin', adminRoutes);
app.use('/logs', logsRoutes);

// Swagger documentation
if (process.env.ENABLE_SWAGGER === 'true') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerDocument = require('./docs/swagger');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling
const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);

// Socket.IO connection handling
const socketLogger = require('./src/services/socketLogger.service');
io.on('connection', (socket) => {
  console.log('Client connected to logger');
  socketLogger.addClient(socket);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected from logger');
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
      console.log(`📊 Logger UI: http://localhost:${PORT}/logs`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
```

---

## Database Models

### User Model (src/models/User.model.js)

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['citizen', 'coordinator', 'technician', 'admin'],
    required: true
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });

module.exports = mongoose.model('User', userSchema);
```

### WasteRequest Model (src/models/WasteRequest.model.js)

```javascript
const mongoose = require('mongoose');

const wasteRequestSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    unique: true,
    default: () => 'WR-' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase()
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wasteType: {
    type: String,
    enum: ['household', 'bulky', 'e-waste', 'recyclable'],
    required: true
  },
  quantity: {
    type: String,
    required: true
  },
  address: {
    street: { type: String, required: true },
    city: String,
    postalCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  preferredDate: {
    type: Date,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  actualCost: Number,
  paymentStatus: {
    type: String,
    enum: ['not-required', 'pending', 'paid', 'failed'],
    default: 'not-required'
  },
  scheduledDate: Date,
  completedDate: Date,
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  },
  rejectionReason: String,
  notes: String
}, {
  timestamps: true
});

// Indexes
wasteRequestSchema.index({ userId: 1, status: 1 });
wasteRequestSchema.index({ trackingId: 1 });
wasteRequestSchema.index({ status: 1, preferredDate: 1 });

module.exports = mongoose.model('WasteRequest', wasteRequestSchema);
```

### SmartBin Model (src/models/SmartBin.model.js)

```javascript
const mongoose = require('mongoose');

const smartBinSchema = new mongoose.Schema({
  binId: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    address: String,
    area: String,
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  fillLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  capacity: {
    type: Number,
    required: true,
    default: 240 // liters
  },
  binType: {
    type: String,
    enum: ['household', 'recyclable', 'organic', 'general'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['active', 'offline', 'maintenance', 'full'],
    default: 'active'
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device'
  },
  lastEmptied: Date,
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  collectionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual: Get fill status color
smartBinSchema.virtual('fillStatusColor').get(function() {
  if (this.fillLevel >= 90) return 'red';
  if (this.fillLevel >= 70) return 'yellow';
  return 'green';
});

// Indexes
smartBinSchema.index({ status: 1, fillLevel: -1 });
smartBinSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('SmartBin', smartBinSchema);
```

### Route Model (src/models/Route.model.js)

```javascript
const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeName: {
    type: String,
    required: true
  },
  coordinatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  crewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  vehicleId: String,
  stops: [{
    stopType: {
      type: String,
      enum: ['bin', 'request'],
      required: true
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'stops.stopType'
    },
    sequence: Number,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'skipped'],
      default: 'pending'
    },
    completedAt: Date
  }],
  status: {
    type: String,
    enum: ['draft', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'draft'
  },
  scheduledDate: Date,
  startTime: Date,
  endTime: Date,
  totalDistance: Number, // km
  estimatedDuration: Number, // minutes
  actualDuration: Number,
  completionPercentage: {
    type: Number,
    default: 0
  },
  notes: String
}, {
  timestamps: true
});

// Calculate completion percentage
routeSchema.methods.updateCompletion = function() {
  const totalStops = this.stops.length;
  const completedStops = this.stops.filter(s => s.status === 'completed').length;
  this.completionPercentage = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;
};

// Indexes
routeSchema.index({ coordinatorId: 1, status: 1 });
routeSchema.index({ crewId: 1, status: 1 });
routeSchema.index({ scheduledDate: 1 });

module.exports = mongoose.model('Route', routeSchema);
```

### WorkOrder Model (src/models/WorkOrder.model.js)

```javascript
const mongoose = require('mongoose');

const workOrderSchema = new mongoose.Schema({
  workOrderId: {
    type: String,
    required: true,
    unique: true,
    default: () => 'WO-' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase()
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  binId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SmartBin',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'resolved', 'escalated', 'cancelled'],
    default: 'pending'
  },
  issueDescription: {
    type: String,
    required: true
  },
  actionTaken: {
    type: String,
    enum: ['repaired', 'replaced', 'none'],
    default: 'none'
  },
  resolutionNotes: String,
  newDeviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device'
  },
  assignedDate: Date,
  resolvedDate: Date,
  estimatedResolutionTime: Number, // minutes
  actualResolutionTime: Number
}, {
  timestamps: true
});

// Indexes
workOrderSchema.index({ technicianId: 1, status: 1 });
workOrderSchema.index({ status: 1, priority: 1 });
workOrderSchema.index({ workOrderId: 1 });

module.exports = mongoose.model('WorkOrder', workOrderSchema);
```

### Device Model (src/models/Device.model.js)

```javascript
const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  deviceType: {
    type: String,
    enum: ['rfid', 'qr-code', 'sensor'],
    required: true
  },
  binId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SmartBin'
  },
  status: {
    type: String,
    enum: ['active', 'offline', 'decommissioned'],
    default: 'active'
  },
  installationDate: {
    type: Date,
    default: Date.now
  },
  lastSignal: Date,
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100
  },
  errorLog: [{
    timestamp: Date,
    errorCode: String,
    description: String
  }],
  maintenanceHistory: [{
    date: Date,
    action: String,
    technicianId: mongoose.Schema.Types.ObjectId,
    notes: String
  }]
}, {
  timestamps: true
});

// Indexes
deviceSchema.index({ deviceId: 1 });
deviceSchema.index({ status: 1 });
deviceSchema.index({ binId: 1 });

module.exports = mongoose.model('Device', deviceSchema);
```

---

## Middleware

### Logger (src/middleware/logger.js)

```javascript
const socketLogger = require('../services/socketLogger.service');

const logger = (req, res, next) => {
  const startTime = Date.now();
  
  // Capture original send
  const originalSend = res.send;
  
  res.send = function(data) {
    res.send = originalSend;
    
    const duration = Date.now() - startTime;
    
    // Log request/response
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      query: req.query,
      body: sanitizeBody(req.body),
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    };
    
    // Emit to connected clients
    socketLogger.emit('log', logEntry);
    
    // Console log
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    
    return res.send(data);
  };
  
  next();
};

// Sanitize sensitive data
function sanitizeBody(body) {
  if (!body) return {};
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'apiKey'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) sanitized[field] = '***';
  });
  return sanitized;
}

module.exports = logger;
```

### Query Builder (src/middleware/queryBuilder.js)

```javascript
/**
 * OData-like Query Builder Middleware
 * Supports: filtering, sorting, pagination, field selection
 */

const buildQuery = (allowedFields = []) => {
  return (req, res, next) => {
    const query = {};
    const options = {
      sort: {},
      select: '',
      page: parseInt(req.query.page) || 1,
      limit: Math.min(parseInt(req.query.limit) || 20, 100)
    };
    
    // Build filter query
    Object.keys(req.query).forEach(key => {
      // Skip special params
      if (['page', 'limit', 'sort', 'select', 'fields'].includes(key)) return;
      
      // Check if field is allowed
      const fieldName = key.includes('[') ? key.split('[')[0] : key;
      if (allowedFields.length > 0 && !allowedFields.includes(fieldName)) return;
      
      const value = req.query[key];
      
      // Handle operators
      if (typeof value === 'object') {
        Object.keys(value).forEach(operator => {
          const opValue = value[operator];
          
          switch(operator) {
            case 'eq':
              query[fieldName] = castValue(opValue);
              break;
            case 'ne':
              query[fieldName] = { $ne: castValue(opValue) };
              break;
            case 'gt':
              query[fieldName] = { $gt: castValue(opValue) };
              break;
            case 'gte':
              query[fieldName] = { $gte: castValue(opValue) };
              break;
            case 'lt':
              query[fieldName] = { $lt: castValue(opValue) };
              break;
            case 'lte':
              query[fieldName] = { $lte: castValue(opValue) };
              break;
            case 'contains':
              query[fieldName] = { $regex: opValue, $options: 'i' };
              break;
            case 'startsWith':
              query[fieldName] = { $regex: `^${opValue}`, $options: 'i' };
              break;
            case 'endsWith':
              query[fieldName] = { $regex: `${opValue}$`, $options: 'i' };
              break;
            case 'in':
              query[fieldName] = { $in: opValue.split(',').map(castValue) };
              break;
            case 'nin':
              query[fieldName] = { $nin: opValue.split(',').map(castValue) };
              break;
          }
        });
      } else {
        // Default equality
        query[fieldName] = castValue(value);
      }
    });
    
    // Handle sorting
    if (req.query.sort) {
      const sortFields = req.query.sort.split(',');
      sortFields.forEach(field => {
        const [fieldName, order] = field.split(':');
        options.sort[fieldName] = order === 'desc' ? -1 : 1;
      });
    }
    
    // Handle field selection
    if (req.query.select || req.query.fields) {
      options.select = (req.query.select || req.query.fields).split(',').join(' ');
    }
    
    // Attach to request
    req.dbQuery = query;
    req.dbOptions = options;
    
    next();
  };
};

// Type casting helper
function castValue(value) {
  // Boolean
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  // Number
  if (!isNaN(value) && value !== '') return Number(value);
  
  // Date (ISO format)
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const date = new Date(value);
    if (!isNaN(date)) return date;
  }
  
  // String
  return value;
}

module.exports = buildQuery;
```

### Error Handler (src/middleware/errorHandler.js)

```javascript
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // Mongoose cast error
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
```

---

## Controllers

### Citizen Controller (src/controllers/citizen.controller.js)

```javascript
const WasteRequest = require('../models/WasteRequest.model');
const SmartBin = require('../models/SmartBin.model');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Create waste pickup request
 * POST /api/citizen/requests
 */
exports.createRequest = async (req, res) => {
  try {
    const { userId, wasteType, quantity, address, preferredDate, description } = req.body;
    
    // Validate required fields
    if (!userId || !wasteType || !quantity || !address || !preferredDate) {
      return errorResponse(res, 'Missing required fields', 400);
    }
    
    // Calculate estimated cost
    const estimatedCost = calculateCost(wasteType, quantity);
    const paymentStatus = estimatedCost > 0 ? 'pending' : 'not-required';
    
    // Create request
    const request = await WasteRequest.create({
      userId,
      wasteType,
      quantity,
      address,
      preferredDate: new Date(preferredDate),
      description,
      estimatedCost,
      paymentStatus,
      status: 'pending'
    });
    
    return successResponse(res, 'Request created successfully', {
      trackingId: request.trackingId,
      status: request.status,
      estimatedCost: request.estimatedCost,
      paymentRequired: paymentStatus !== 'not-required'
    }, 201);
    
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Get user's requests with OData filtering
 * GET /api/citizen/requests
 */
exports.getRequests = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return errorResponse(res, 'User ID is required', 400);
    }
    
    // Add userId to query
    req.dbQuery.userId = userId;
    
    const { page, limit, sort, select } = req.dbOptions;
    const skip = (page - 1) * limit;
    
    // Execute query
    const requests = await WasteRequest
      .find(req.dbQuery)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('routeId', 'routeName status');
    
    const total = await WasteRequest.countDocuments(req.dbQuery);
    
    return successResponse(res, 'Requests retrieved successfully', requests, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    });
    
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Track specific request
 * GET /api/citizen/requests/:id
 */
exports.trackRequest = async (req, res) => {
  try {
    const request = await WasteRequest
      .findById(req.params.id)
      .populate('routeId', 'routeName status scheduledDate')
      .populate('userId', 'name email phone');
    
    if (!request) {
      return errorResponse(res, 'Request not found', 404);
    }
    
    // Build timeline
    const timeline = [
      { status: 'pending', date: request.createdAt, label: 'Request Submitted' }
    ];
    
    if (request.status !== 'pending') {
      timeline.push({ 
        status: request.status === 'rejected' ? 'rejected' : 'approved', 
        date: request.updatedAt, 
        label: request.status === 'rejected' ? 'Request Rejected' : 'Request Approved' 
      });
    }
    
    if (request.scheduledDate) {
      timeline.push({ status: 'scheduled', date: request.scheduledDate, label: 'Collection Scheduled' });
    }
    
    if (request.status === 'in-progress') {
      timeline.push({ status: 'in-progress', date: new Date(), label: 'Collection In Progress' });
    }
    
    if (request.completedDate) {
      timeline.push({ status: 'completed', date: request.completedDate, label: 'Collection Completed' });
    }
    
    return successResponse(res, 'Request details retrieved', {
      ...request.toObject(),
      timeline
    });
    
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Update payment status
 * PUT /api/citizen/requests/:id/payment
 */
exports.updatePayment = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    
    const request = await WasteRequest.findById(req.params.id);
    
    if (!request) {
      return errorResponse(res, 'Request not found', 404);
    }
    
    if (request.paymentStatus === 'paid') {
      return errorResponse(res, 'Payment already completed', 400);
    }
    
    request.actualCost = amount;
    request.paymentStatus = 'paid';
    await request.save();
    
    return successResponse(res, 'Payment recorded successfully', {
      trackingId: request.trackingId,
      paymentStatus: request.paymentStatus,
      amount
    });
    
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Find nearby bins
 * GET /api/citizen/bins/nearby
 */
exports.getNearbyBins = async (req, res) => {
  try {
    const { lat, lng, radius = 2000 } = req.query; // radius in meters
    
    if (!lat || !lng) {
      return errorResponse(res, 'Latitude and longitude required', 400);
    }
    
    const bins = await SmartBin.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      },
      status: 'active'
    }).limit(20);
    
    return successResponse(res, 'Nearby bins retrieved', bins);
    
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Helper: Calculate cost based on waste type
function calculateCost(wasteType, quantity) {
  const rates = {
    household: 0,
    recyclable: 0,
    'e-waste': 0,
    bulky: 500 // LKR per item
  };
  
  if (wasteType === 'bulky') {
    // Parse quantity (e.g., "2 items")
    const items = parseInt(quantity) || 1;
    return rates.bulky * items;
  }
  
  return rates[wasteType] || 0;
}
```

*(Continue with coordinator, technician, and admin controllers following similar patterns...)*

---

## Utilities

### Response Helper (src/utils/response.js)

```javascript
exports.successResponse = (res, message, data = null, statusCode = 200, pagination = null) => {
  const response = {
    success: true,
    message
  };
  
  if (data !== null) response.data = data;
  if (pagination) response.pagination = pagination;
  
  return res.status(statusCode).json(response);
};

exports.errorResponse = (res, message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) response.errors = errors;
  
  return res.status(statusCode).json(response);
};
```

---

## Swagger Documentation

### Swagger Config (docs/swagger.js)

```javascript
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Smart Waste Management API',
    version: '1.0.0',
    description: 'API documentation for Smart Waste Management System MVP',
    contact: {
      name: 'Development Team'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server'
    }
  ],
  tags: [
    { name: 'Citizen', description: 'Resident operations' },
    { name: 'Coordinator', description: 'Route management' },
    { name: 'Technician', description: 'Device maintenance' },
    { name: 'Admin', description: 'System administration' }
  ],
  components: {
    schemas: {
      WasteRequest: {
        type: 'object',
        properties: {
          trackingId: { type: 'string', example: 'WR-1697123456abc' },
          userId: { type: 'string' },
          wasteType: { type: 'string', enum: ['household', 'bulky', 'e-waste', 'recyclable'] },
          quantity: { type: 'string', example: '2 bags' },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              coordinates: {
                type: 'object',
                properties: {
                  lat: { type: 'number' },
                  lng: { type: 'number' }
                }
              }
            }
          },
          status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'scheduled', 'in-progress', 'completed'] },
          estimatedCost: { type: 'number' },
          paymentStatus: { type: 'string', enum: ['not-required', 'pending', 'paid'] }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' }
        }
      }
    },
    parameters: {
      PageParam: {
        in: 'query',
        name: 'page',
        schema: { type: 'integer', default: 1 },
        description: 'Page number'
      },
      LimitParam: {
        in: 'query',
        name: 'limit',
        schema: { type: 'integer', default: 20, maximum: 100 },
        description: 'Items per page'
      },
      SortParam: {
        in: 'query',
        name: 'sort',
        schema: { type: 'string', example: 'createdAt:desc' },
        description: 'Sort by field:order (asc/desc)'
      }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'] // Path to route files for annotations
};

module.exports = swaggerJSDoc(options);
```

---

## Testing Guide

### Using Postman/Thunder Client

**1. Create Request:**
```http
POST http://localhost:5000/api/citizen/requests
Content-Type: application/json

{
  "userId": "67123abc456def789",
  "wasteType": "household",
  "quantity": "2 bags",
  "address": {
    "street": "123 Main St",
    "city": "Colombo"
  },
  "preferredDate": "2025-10-20",
  "description": "Regular pickup"
}
```

**2. Get Requests with OData:**
```http
GET http://localhost:5000/api/citizen/requests?userId=67123abc456def789&status[in]=pending,scheduled&sort=createdAt:desc&page=1&limit=10
```

**3. Track Request:**
```http
GET http://localhost:5000/api/citizen/requests/67123abc456def789
```

---

## Deployment

### Local Development
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:6

# Start server
npm run dev
```

### Production (Railway/Render/Heroku)

1. **Create MongoDB Atlas cluster** (free tier)
2. **Set environment variables** on platform
3. **Deploy** using Git integration
4. **Update CORS_ORIGINS** with mobile app domains

---

## Next Steps

1. Implement remaining controller methods
2. Add input validation using express-validator
3. Create seed script for test data
4. Write unit tests
5. Add rate limiting
6. Implement authentication (Phase 2)
7. Add file upload for photos
8. Deploy to production

---

**Version:** 1.0  
**Last Updated:** October 2025