# Citizen Create Request Feature 📋

This document outlines the Create Waste Collection Request feature for Citizens.

## Overview
A comprehensive form that allows citizens to submit waste collection requests with map-based location selection, waste type categorization, and schedule preferences.

## Features
✅ Multiple waste type selection (Household, Recyclable, Organic, Electronic, Hazardous)
✅ Interactive map-based location picker
✅ Manual coordinate entry option
✅ Date selection for preferred collection
✅ Address input with city and street
✅ Quantity specification
✅ Optional additional notes
✅ Form validation
✅ Loading states
✅ Success/Error handling

## Components Structure

### Main Component
- **Location**: `src/screens/Citizen/CreateRequestScreen.js`
- **Route**: `app/citizen/create-request.js`

### Dependencies
- **API**: `src/api/citizenApi.js` - New citizen API module
- **Shared Component**: `src/components/Admin/MapPicker.js` - Reused for location selection
- **Theme**: `src/constants/theme.js` - COLORS and SPACING

## API Integration

### Endpoint
```
POST /citizen/requests
```

### Request Body
```json
{
  "userId": "string",
  "wasteType": "household" | "recyclable" | "organic" | "electronic" | "hazardous",
  "quantity": "string",
  "address": {
    "street": "string",
    "city": "string",
    "coordinates": {
      "lat": 0,
      "lng": 0
    }
  },
  "preferredDate": "2025-10-19",
  "description": "string"
}
```

### Response Handling
- **Success**: Shows alert with options to view requests or create another
- **Error**: Displays error message with retry option

## Form Fields

### Required Fields (*)
1. **User ID** (Temporary)
   - Text input
   - Will be automatic in future (from auth context)
   - Currently hardcoded for development

2. **Waste Type**
   - Visual card selector
   - Options: Household 🏠, Recyclable ♻️, Organic 🌱, Electronic 📱, Hazardous ⚠️
   - Single selection

3. **Quantity**
   - Text input
   - Examples: "3 bags", "1 item", "Small/Medium/Large"

4. **Street Address**
   - Text input
   - Pickup location address

5. **City**
   - Text input
   - City name

6. **Coordinates**
   - Two options:
     a. **Map Picker** (default)
        - Interactive map with marker
        - Drag to select location
        - Uses `MapPicker` component
     b. **Manual Entry**
        - Latitude input (decimal)
        - Longitude input (decimal)

7. **Preferred Date**
   - Text input
   - Format: YYYY-MM-DD
   - Example: 2025-10-19
   - Shows format help text

### Optional Fields
1. **Description**
   - Multiline text area
   - Additional notes or special instructions

## User Experience

### Flow
1. User opens Create Request screen
2. Enters User ID (temporary requirement)
3. Selects waste type from visual cards
4. Enters quantity
5. Fills address details
6. Selects location using map OR enters coordinates manually
7. Chooses preferred collection date
8. Optionally adds notes
9. Submits form
10. Receives success confirmation with navigation options

### Validation
- All required fields must be filled
- Coordinates must be valid numbers
- Date must be in correct format
- Shows specific error alerts for each validation failure

### Toggle Between Map/Manual
- Toggle buttons at top of location section
- Switch between "🗺️ Use Map" and "⌨️ Manual Entry"
- Smooth transition
- Selected option highlighted

## Design Highlights

### Color Usage
- **Primary**: Header background, submit button, selected waste type
- **White**: Form backgrounds, card backgrounds
- **Background**: Page background
- **Warning**: Temporary notice background
- **TextLight**: Placeholder text, help text
- **Border**: Input borders, card borders

### Layout
- **Header**: Fixed with title and subtitle
- **Form**: Scrollable content area
- **Waste Types**: 3-column grid layout
- **Map/Manual Toggle**: Full-width toggle buttons
- **Buttons**: Full-width submit and cancel

### Interactive Elements
1. **Waste Type Cards**
   - Visual icons
   - Selected state with border highlight
   - Background color change on selection

2. **Toggle Buttons**
   - Active state styling
   - Smooth background transition
   - Clear visual feedback

3. **Map Picker**
   - Interactive draggable marker
   - Current location button
   - Zoom controls

4. **Submit Button**
   - Loading spinner during submission
   - Disabled state while processing
   - Shadow for depth

## State Management

### Form State
```javascript
const [formData, setFormData] = useState({
  userId: '',
  wasteType: 'household',
  quantity: '',
  address: {
    street: '',
    city: '',
    coordinates: {
      lat: '',
      lng: '',
    },
  },
  preferredDate: '',
  description: '',
});
```

### UI State
- `loading`: Submission status
- `useMapPicker`: Toggle between map and manual entry

## API Module (citizenApi.js)

### Functions
1. **createRequest(requestData)**
   - Creates new waste collection request
   - POST /citizen/requests

2. **getMyRequests(params)**
   - Retrieves user's requests (for future use)
   - GET /citizen/requests

3. **getRequestById(requestId)**
   - Gets specific request details (for future use)
   - GET /citizen/requests/:id

4. **cancelRequest(requestId)**
   - Cancels a request (for future use)
   - DELETE /citizen/requests/:id

## Future Enhancements

### Authentication Integration
- Remove User ID input field
- Auto-populate from AuthContext
- Add user session management

### Date Picker
- Add native date picker component
- Calendar view
- Date validation (no past dates)
- Holiday/weekend warnings

### Address Autocomplete
- Google Places API integration
- Auto-fill coordinates from address
- Reverse geocoding for map selection

### Saved Addresses
- Save frequently used addresses
- Quick select from saved locations
- Default address preference

### Request Templates
- Save common request types
- Quick create from template
- Edit and reuse templates

### Image Upload
- Add photo of waste
- Multiple image support
- Compress before upload

### Estimated Cost
- Show estimated collection cost
- Based on waste type and quantity
- Payment integration

## Testing Instructions

### Manual Testing
1. **Form Validation**
   ```
   - Try submitting empty form → Should show alerts
   - Fill only some fields → Should show specific missing field alerts
   - Enter invalid coordinates → Should show error
   ```

2. **Waste Type Selection**
   ```
   - Click each waste type card
   - Verify visual selection feedback
   - Only one should be selected at a time
   ```

3. **Location Selection**
   ```
   Map Mode:
   - Toggle to "Use Map"
   - Drag marker on map
   - Verify coordinates update
   - Click "Confirm Location"
   
   Manual Mode:
   - Toggle to "Manual Entry"
   - Enter latitude and longitude
   - Verify format validation
   ```

4. **Submit Flow**
   ```
   - Fill all required fields
   - Click "Submit Request"
   - Verify loading spinner appears
   - Check success alert
   - Test "View My Requests" navigation
   - Test "Create Another" reset
   ```

5. **Cancel Flow**
   ```
   - Fill form partially
   - Click "Cancel"
   - Should navigate back
   ```

### API Testing
```bash
# Test with curl
curl -X 'POST' \
  'https://api.csse.icy-r.dev/api/citizen/requests' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "userId": "test-user-id",
  "wasteType": "household",
  "quantity": "3 bags",
  "address": {
    "street": "123 Main Street",
    "city": "Colombo",
    "coordinates": {
      "lat": 6.9271,
      "lng": 79.8612
    }
  },
  "preferredDate": "2025-10-19",
  "description": "Please collect in the morning"
}'
```

### Error Scenarios
1. **Network Error**
   - Disconnect internet
   - Try to submit
   - Should show error alert

2. **Invalid Data**
   - Submit with invalid coordinates
   - Submit with past date
   - Should show validation errors

3. **Server Error**
   - Test with 500 response
   - Should handle gracefully

## Code Standards Compliance

### ✅ Follows .cursorrules
- Uses COLORS constants from theme.js
- Uses SPACING constants
- Consistent file naming
- Proper component structure
- StyleSheet.create() for all styles
- No inline styles
- Proper imports organization

### ✅ Best Practices
- Form validation before submission
- Loading states
- Error handling
- User feedback
- Accessible design
- Responsive layout
- Reusable API module

## Files Modified/Created

### New Files
- `src/api/citizenApi.js` - Citizen API module
- `src/screens/Citizen/CreateRequestScreen.js` - Main screen
- `CITIZEN_CREATE_REQUEST_FEATURE.md` - This documentation

### Modified Files
- `src/api/index.js` - Added citizenApi export

### Existing Files Used
- `app/citizen/create-request.js` - Route (already existed)
- `src/screens/Citizen/index.js` - Export (already existed)
- `src/components/Admin/MapPicker.js` - Reused component
- `src/constants/theme.js` - Theme constants

## Navigation Integration

### From Citizen Dashboard
```javascript
<Button 
  title="Create Request" 
  onPress={() => router.push('/citizen/create-request')}
/>
```

### After Submission
```javascript
// Option 1: View My Requests
router.push('/citizen/my-requests')

// Option 2: Stay and reset form
resetForm()
```

## Screenshots Description

### Header Section
- Green background with title "Create Waste Request"
- Subtitle "Schedule your waste collection"

### Temporary Notice
- Yellow/orange warning box
- Text explaining User ID is temporary

### Waste Type Selection
- 5 cards in 3-column grid
- Icons: 🏠 ♻️ 🌱 📱 ⚠️
- Selected card has green border and light green background

### Address Section
- Street input field
- City input field
- Map/Manual toggle buttons
- Either map view or coordinate inputs

### Date & Description
- Date input with format helper
- Multiline description text area

### Action Buttons
- Large green "Submit Request" button
- White "Cancel" button below

## Success Metrics
- Time to complete form: < 2 minutes
- Successful submission rate: > 95%
- User satisfaction: Clear feedback at each step
- Error rate: < 5% (mostly validation errors)

## Support & Maintenance
- Regularly update waste type options
- Monitor API response times
- Collect user feedback on form usability
- Track most used waste types for better UX

---

**Last Updated**: October 16, 2025
**Version**: 1.0.0
**Status**: ✅ Implemented & Ready for Testing

