# Find Nearby Bins - Quick Reference

## 🚀 Quick Start

### Running the Feature
```bash
cd frontend
npm start
```

### Navigation Path
```
Citizen Dashboard → Find Bins Button → Find Nearby Bins Screen
```

## 📱 Screen Breakdown

### Main Screen Components

```
┌─────────────────────────────────────┐
│         MAP VIEW (Full Screen)       │
│                                      │
│  🔵 User Location (Blue Dot)        │
│  ⭕ Search Radius Circle            │
│  📍 Bin Markers (Color-coded)       │
│                                      │
│  Green Marker = Available (0-49%)   │
│  Yellow Marker = Filling (50-79%)   │
│  Red Marker = Full (80-100%)        │
│                                      │
├─────────────────────────────────────┤
│   INFO PANEL (Bottom Overlay)       │
│                                      │
│   Nearby Bins             [🔄]      │
│                                      │
│   ┌──────┬──────┬──────────┐       │
│   │  15  │  8   │    7     │       │
│   │Total │Avail.│ Needs    │       │
│   └──────┴──────┴──────────┘       │
│                                      │
│   Search Radius:                    │
│   [2km] [5km✓] [10km]              │
│                                      │
│   Status: 🟢Available 🟡Filling 🔴Full│
└─────────────────────────────────────┘
```

### Bin Details Bottom Sheet

```
┌─────────────────────────────────────┐
│         ──  (Drag Handle)           │
│                                      │
│  🗑️  BIN-001           [Available]  │
│      General Bin                    │
│ ─────────────────────────────────── │
│                                      │
│  Fill Level                         │
│  ██████████░░░░░░░░░░  75%         │
│  Capacity: 240L                     │
│                                      │
│  Location                           │
│  ┌──────────────────────────┐      │
│  │ Address: 123 Main St     │      │
│  │ Area: Colombo            │      │
│  │ Coords: 6.9271, 79.8612  │      │
│  └──────────────────────────┘      │
│                                      │
│  ┌──────────────────────────┐      │
│  │      MAP PREVIEW          │      │
│  │         📍               │      │
│  └──────────────────────────┘      │
│                                      │
│  Bin Details                        │
│  ┌──────────────────────────┐      │
│  │ Status: Active            │      │
│  │ Collections: 5 times      │      │
│  │ Last Updated: Oct 17      │      │
│  └──────────────────────────┘      │
│                                      │
│  [        Close        ]            │
└─────────────────────────────────────┘
```

## 🎯 Key Features

### 1. Location-Based Search
- **Automatic**: Gets user location on screen load
- **Permission**: Requests location permission if not granted
- **Accuracy**: Uses balanced accuracy for optimal performance

### 2. Interactive Map
- **Pan**: Drag to explore different areas
- **Zoom**: Pinch to zoom in/out
- **My Location**: Shows user's position
- **Radius**: Visual circle showing search area

### 3. Smart Markers
- **Color-Coded**: Instant visual status
- **Fill Percentage**: Shows how full each bin is
- **Interactive**: Tap to see details

### 4. Search Radius
- **2km**: Nearby bins (walking distance)
- **5km**: Moderate area (default)
- **10km**: Wide area (driving distance)

### 5. Statistics Dashboard
- **Total Bins**: All bins in radius
- **Available**: Bins with < 50% fill
- **Needs Collection**: Bins flagged for pickup

## 🔧 API Integration

### Endpoint Used
```
GET /api/citizen/bins/nearby
```

### Parameters
```javascript
{
  lat: 6.9271,      // User latitude
  lng: 79.8612,     // User longitude
  radius: 5000      // Search radius in meters
}
```

### Response Data Used
```javascript
{
  binId: "BIN-001",
  fillLevel: 75,
  binType: "general",
  status: "active",
  location: {
    coordinates: { lat, lng },
    address: "123 Main St",
    area: "Colombo"
  },
  fillStatusColor: "yellow",
  needsCollection: true,
  isUrgent: false
}
```

## 🎨 Visual States

### Loading State
```
┌─────────────────────────┐
│                         │
│       🔄 Loading        │
│   Getting your          │
│   location...           │
│                         │
└─────────────────────────┘
```

### Error State
```
┌─────────────────────────┐
│        📍               │
│   Location Not          │
│   Available             │
│                         │
│   Please enable         │
│   location services     │
│                         │
│   [  Try Again  ]       │
└─────────────────────────┘
```

## 💡 User Interactions

### Primary Actions
1. **View Bin Details**: Tap any marker
2. **Change Radius**: Tap radius button (2km/5km/10km)
3. **Refresh Location**: Tap refresh button (🔄)
4. **Close Details**: Tap "Close" or backdrop

### Gestures
- **Pan**: Move around map
- **Pinch**: Zoom in/out
- **Tap Marker**: View bin details
- **Tap Backdrop**: Close bottom sheet
- **Drag Handle**: Dismiss bottom sheet

## 🏗️ Code Structure

### Main Files
```
citizenApi.js           → getNearbyBins()
FindBinsScreen.js       → Main screen logic
BinDetailsBottomSheet.js → Bin details modal
```

### Key Functions
```javascript
// Get nearby bins
const fetchNearbyBins = async () => {
  const response = await citizenApi.getNearbyBins({
    lat: location.lat,
    lng: location.lng,
    radius: searchRadius,
  });
  setBins(response.data);
};

// Handle marker press
const handleBinMarkerPress = (bin) => {
  setSelectedBin(bin);
  setShowBottomSheet(true);
};

// Change search radius
const changeRadius = (newRadius) => {
  setSearchRadius(newRadius);
  // Automatically refetches bins
};
```

## 🧪 Testing Checklist

### Functional Tests
- [ ] Location permission request works
- [ ] Current location displays on map
- [ ] Bins load and display as markers
- [ ] Marker colors match fill levels
- [ ] Bottom sheet opens on marker tap
- [ ] All bin details display correctly
- [ ] Radius controls change search area
- [ ] Refresh button updates location
- [ ] Statistics calculate correctly

### UI/UX Tests
- [ ] Loading states show properly
- [ ] Error handling works
- [ ] Animations are smooth
- [ ] Bottom sheet is scrollable
- [ ] Map is interactive
- [ ] Colors follow design system
- [ ] Text is readable
- [ ] Buttons are responsive

### Edge Cases
- [ ] No bins found in radius
- [ ] Location permission denied
- [ ] No internet connection
- [ ] Invalid coordinates
- [ ] API timeout

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Location Not Available" | Enable location services in device settings |
| Bins not loading | Check internet connection and API status |
| Markers not showing | Verify bin data has valid coordinates |
| Map frozen | Try refresh button or restart app |
| Permission denied | Grant location permission in app settings |

## 📊 Performance Notes

- **Initial Load**: ~2-3 seconds
- **Bin Fetch**: ~1-2 seconds
- **Marker Render**: Instant (< 100 bins)
- **Bottom Sheet**: Smooth 300ms animation

## 🎓 Learning Resources

### React Native Maps
- Docs: https://github.com/react-native-maps/react-native-maps

### Expo Location
- Docs: https://docs.expo.dev/versions/latest/sdk/location/

### Implementation Guide
- Full details: `FIND_NEARBY_BINS_FEATURE.md`

---

**Quick Tip**: For best results, ensure GPS is enabled and you're testing outdoors or with a good location signal!

