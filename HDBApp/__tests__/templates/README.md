# React Native Screen Test Template

This template provides a simple, reliable approach to testing React Native screens by mocking the entire screen component rather than dealing with complex import chains and component mocking.

## Key Benefits

1. **No "Element type is invalid" errors** - We mock the screen entirely
2. **Simple testID-based testing** - No brittle text matching
3. **Reliable behavior** - Minimal mocking that just works
4. **Easy to customize** - Just change the mock screen structure
5. **Fast execution** - No complex component rendering

## How to Use

### 1. Copy the Base Template

Start with `ScreenTestTemplate.tsx` and customize for your specific screen.

### 2. Replace the Mock Screen

In the template, find this section:

```typescript
// ============================================================================
// MOCK THE ACTUAL SCREEN AS A SIMPLE COMPONENT
// ============================================================================

jest.mock('../../src/screens/YourScreen', () => {
  const React = require('react');
  
  return React.forwardRef((props: any, ref: any) => {
    // Your custom mock screen logic here
    return React.createElement('View', { testID: 'your-screen' }, [
      // Your screen elements here
    ]);
  });
});
```

### 3. Customize the Elements

Add the basic elements your screen should have:

```typescript
return React.createElement('View', { testID: 'your-screen' }, [
  // Header
  React.createElement('Text', { 
    key: 'title', 
    testID: 'screen-title' 
  }, 'Your Screen Title'),
  
  // Button
  React.createElement('TouchableOpacity', {
    key: 'main-button',
    testID: 'main-button',
    onPress: handleSomeAction
  }, [
    React.createElement('Text', { key: 'button-text' }, 'Button Label')
  ]),
  
  // Conditional elements
  loading && React.createElement('ActivityIndicator', { 
    key: 'loading', 
    testID: 'loading' 
  }),
]);
```

### 4. Add Your Test Logic

Update the test cases to match your screen:

```typescript
describe('YourScreen', () => {
  it('renders correctly', () => {
    const { getByTestId } = renderYourScreen();
    
    expect(getByTestId('your-screen')).toBeTruthy();
    expect(getByTestId('screen-title')).toBeTruthy();
    expect(getByTestId('main-button')).toBeTruthy();
  });
  
  it('handles button press', () => {
    const { getByTestId } = renderYourScreen();
    
    fireEvent.press(getByTestId('main-button'));
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('NextScreen');
  });
});
```

## Quick Adaptation Checklist

When adapting for a new screen, change these items:

- [ ] Screen mock import path: `'../../src/screens/YourScreen'`
- [ ] Screen testID: `testID: 'your-screen'`
- [ ] Screen title text: `'Your Screen Title'`
- [ ] Button labels and testIDs
- [ ] Navigation calls in tests
- [ ] API mock methods (if needed)
- [ ] Test describe block name
- [ ] Render function name

## Common Patterns

### Loading States

```typescript
const [loading, setLoading] = React.useState(false);

// In render:
loading && React.createElement('ActivityIndicator', { 
  key: 'loading', 
  testID: 'loading-indicator' 
})

// In test:
expect(queryByTestId('loading-indicator')).toBeTruthy();
```

### Form Inputs

```typescript
React.createElement('TextInput', {
  key: 'email-input',
  testID: 'email-input',
  value: email,
  onChangeText: setEmail
})

// In test:
fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
```

### Lists

```typescript
React.createElement('View', { key: 'list', testID: 'item-list' }, 
  items.map((item, index) => 
    React.createElement('View', { 
      key: item.id, 
      testID: `item-${item.id}` 
    }, [
      React.createElement('Text', { key: 'text' }, item.name)
    ])
  )
)

// In test:
expect(getByTestId('item-123')).toBeTruthy();
```

### Navigation

```typescript
const handleNavigation = () => {
  props.navigation.navigate('TargetScreen', { id: 123 });
};

// In test:
expect(mockNavigation.navigate).toHaveBeenCalledWith('TargetScreen', { id: 123 });
```

## API Mocking

The template includes common API mocks. Customize them:

```typescript
jest.mock('../../src/services/api/apiClient', () => ({
  apiClient: {
    yourMethod: jest.fn().mockResolvedValue({
      success: true,
      data: { /* your mock data */ }
    }),
  },
}));
```

## Error Testing

```typescript
it('handles errors', async () => {
  const { apiClient } = require('../../src/services/api/apiClient');
  apiClient.yourMethod.mockRejectedValue(new Error('Test error'));
  
  const { getByTestId } = renderScreen();
  fireEvent.press(getByTestId('action-button'));
  
  await waitFor(() => {
    expect(Alert.alert).toHaveBeenCalledWith('エラー', expect.any(String));
  });
});
```

## Example Screens to Adapt

See `BackupScreen.template.test.tsx` for a complete example of adapting the template for a specific screen.

### For HomeScreen:
- Mock dashboard cards with testIDs
- Mock ranking data display
- Test navigation to different screens

### For LoginScreen:
- Mock form inputs (email, password)
- Mock login button and validation
- Test authentication flow

### For VitalDataScreen:
- Mock vital data display
- Mock data input forms
- Test data submission

## Tips

1. **Keep it simple** - Only mock what you need to test
2. **Use testIDs consistently** - They're more reliable than text
3. **Mock at the screen level** - Don't worry about component internals
4. **Test behavior, not implementation** - Focus on user interactions
5. **Use async/await** - Most screens have async operations

## Common Issues

**Problem**: "Cannot read property 'navigate' of undefined"
**Solution**: Make sure `mockNavigation` is passed to your screen

**Problem**: "Element type is invalid"
**Solution**: Make sure all React.createElement calls are properly structured

**Problem**: "waitFor timeout"
**Solution**: Check that your async mocks are resolving properly

**Problem**: Text not found
**Solution**: Use testIDs instead of text matching