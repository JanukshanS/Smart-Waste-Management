# API Structure Documentation

## Overview

This directory contains all API-related code, organized for easy maintenance and scalability.

## File Structure

```
src/api/
├── client.js          # HTTP client with request/response handling
├── authApi.js         # Authentication-related API calls
├── index.js           # Export all API modules
└── README.md          # This file
```

## Usage

### 1. Adding a New Endpoint

**Step 1:** Add the endpoint to `src/constants/config.js`

```javascript
export const ENDPOINTS = {
  SIGNUP: '/admin/users',
  LOGIN: '/auth/login',           // New endpoint
  GET_PROFILE: '/users/profile',  // New endpoint
};
```

**Step 2:** Create a new API file (e.g., `userApi.js`)

```javascript
import client from './client';
import { ENDPOINTS } from '../constants/config';

export const userApi = {
  getProfile: async (userId) => {
    try {
      const response = await client.get(`${ENDPOINTS.GET_PROFILE}/${userId}`);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to get profile',
      };
    }
  },

  updateProfile: async (userId, profileData) => {
    try {
      const response = await client.put(
        `${ENDPOINTS.GET_PROFILE}/${userId}`,
        profileData
      );
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to update profile',
      };
    }
  },
};
```

**Step 3:** Export it in `index.js`

```javascript
export { authApi } from './authApi';
export { userApi } from './userApi';  // Add this line
export { default as client } from './client';
```

### 2. Using APIs in Components

```javascript
import { authApi, userApi } from '../api';

// In your component
const handleLogin = async () => {
  const result = await authApi.login(email, password);
  if (result.success) {
    console.log('User:', result.data);
  } else {
    console.error('Error:', result.error);
  }
};
```

## API Client Methods

The `client` provides these methods:

- `client.get(endpoint, options)` - GET request
- `client.post(endpoint, data, options)` - POST request
- `client.put(endpoint, data, options)` - PUT request
- `client.delete(endpoint, options)` - DELETE request

## Configuration

Update the base URL in `src/constants/config.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',  // Change this for production
  TIMEOUT: 10000,
};
```

## Error Handling

All API calls return an object with this structure:

```javascript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  success: false,
  error: "Error message"
}
```

## Examples

### POST Request (Signup)

```javascript
const userData = {
  name: "John Doe",
  email: "john@example.com",
  phone: "+94771234567",
  role: "citizen",
  address: {
    street: "123 Main St",
    city: "Colombo",
    postalCode: "10100"
  }
};

const result = await authApi.signup(userData);
```

### GET Request

```javascript
const result = await client.get('/users/123');
```

### PUT Request

```javascript
const result = await client.put('/users/123', { name: 'New Name' });
```

### DELETE Request

```javascript
const result = await client.delete('/users/123');
```

## Adding Authorization Headers

To add auth tokens, update the client request method:

```javascript
// In client.js
async request(endpoint, options = {}) {
  const token = await getAuthToken(); // Your token retrieval function
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`, // Add this
      ...options.headers,
    },
  };
  // ... rest of the code
}
```

