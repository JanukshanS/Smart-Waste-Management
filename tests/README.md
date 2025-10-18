# Smart Waste Management - Test Suite

This directory contains comprehensive tests for the Smart Waste Management frontend application.

## Test Structure

```
tests/
├── __mocks__/              # Mock files for external dependencies
├── api/                    # API function tests
├── components/             # Component unit tests
├── contexts/               # Context provider tests
├── integration/            # Integration and flow tests
├── screens/                # Screen component tests
├── setup/                  # Test configuration and setup
└── utils/                  # Utility function tests
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### CI Mode
```bash
npm run test:ci
```

## Test Categories

### 1. Unit Tests
- **Components**: Test individual React components in isolation
- **Utils**: Test utility functions and helpers
- **API**: Test API client and service functions

### 2. Integration Tests
- **Auth Flow**: Complete authentication workflow
- **Navigation Flow**: Screen-to-screen navigation
- **Data Flow**: Component interaction with contexts and APIs

### 3. Context Tests
- **AuthContext**: Authentication state management
- **UserDetailsContext**: User data management

## Test Coverage

The test suite aims for:
- **Components**: 90%+ coverage
- **Utils**: 95%+ coverage
- **API**: 85%+ coverage
- **Critical Flows**: 100% coverage

## Key Features Tested

### Authentication
- Login validation and flow
- Signup process
- Logout functionality
- Token management
- Role-based navigation

### Components
- Button interactions
- Form validation
- Data display
- Navigation triggers
- Error handling

### API Integration
- HTTP client functionality
- Error handling
- Response parsing
- Network failure scenarios

### Navigation
- Route transitions
- Parameter passing
- Back navigation
- Role-based routing

## Mock Strategy

### External Dependencies
- **expo-router**: Navigation mocking
- **react-native-maps**: Map component mocking
- **AsyncStorage**: Storage operations
- **expo-location**: Location services
- **expo-notifications**: Push notifications

### Internal Dependencies
- **API calls**: Mocked responses
- **Context providers**: Controlled state
- **Navigation**: Route tracking

## Writing New Tests

### Component Tests
```javascript
import { render, fireEvent } from '@testing-library/react-native';
import MyComponent from '../src/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<MyComponent title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });
});
```

### API Tests
```javascript
import { myApi } from '../src/api/myApi';
import client from '../src/api/client';

jest.mock('../src/api/client');

describe('myApi', () => {
  it('handles successful request', async () => {
    client.get.mockResolvedValue({ data: 'test' });
    const result = await myApi.getData();
    expect(result.success).toBe(true);
  });
});
```

### Integration Tests
```javascript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '../src/contexts/AuthContext';
import LoginScreen from '../src/screens/LoginScreen';

describe('Login Flow', () => {
  it('completes login successfully', async () => {
    const { getByText } = render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );
    // Test complete flow...
  });
});
```

## Best Practices

### 1. Test Behavior, Not Implementation
- Focus on what the component does, not how it does it
- Test user interactions and expected outcomes
- Avoid testing internal state directly

### 2. Use Descriptive Test Names
- Clearly describe what is being tested
- Include the expected behavior
- Make failures easy to understand

### 3. Setup and Teardown
- Clear mocks between tests
- Reset state to avoid test pollution
- Use beforeEach/afterEach appropriately

### 4. Mock External Dependencies
- Mock all external services and APIs
- Use consistent mock data
- Test both success and failure scenarios

### 5. Test Edge Cases
- Empty states
- Error conditions
- Network failures
- Invalid inputs

## Debugging Tests

### Common Issues
1. **Mock not working**: Check mock setup in setupTests.js
2. **Async test failing**: Use waitFor() for async operations
3. **Component not rendering**: Verify all required props are provided
4. **Navigation test failing**: Ensure expo-router mock is properly configured

### Debug Commands
```bash
# Run specific test file
npm test -- RequestCard.test.js

# Run tests matching pattern
npm test -- --testNamePattern="login"

# Run with verbose output
npm test -- --verbose

# Debug mode
npm test -- --detectOpenHandles
```

## Continuous Integration

The test suite is designed to run in CI environments:
- All tests must pass before merging
- Coverage thresholds must be met
- No console errors or warnings allowed
- Tests must run in under 2 minutes

## Contributing

When adding new features:
1. Write tests for new components
2. Update existing tests if behavior changes
3. Maintain or improve coverage percentages
4. Follow existing test patterns and naming conventions
5. Add integration tests for new user flows

## Troubleshooting

### Common Test Failures

1. **"Cannot find module"**
   - Check import paths
   - Verify mock files exist
   - Update Jest configuration if needed

2. **"Component did not render"**
   - Provide all required props
   - Check for missing context providers
   - Verify component exports

3. **"Async operation timeout"**
   - Increase test timeout
   - Use proper async/await patterns
   - Check for unresolved promises

4. **"Mock function not called"**
   - Verify mock setup
   - Check function binding
   - Ensure proper event triggering
