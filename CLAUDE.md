# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Health Data Bank (HDB) mobile application project, built with React Native for iOS and Android platforms. The project includes a fully functional React Native app in the `HDBApp/` directory with TypeScript, navigation, authentication, and health data management features.

## Development Commands

### Setup
```bash
cd HDBApp
npm install
cd ios && pod install && cd ..  # iOS only
```

### Development
```bash
cd HDBApp
npm start                    # Start Metro bundler
npm run ios                  # Run on iOS simulator
npm run android             # Run on Android emulator
```

### Testing and Code Quality
```bash
cd HDBApp
npm test                    # Run Jest tests
npm run lint               # Run ESLint
```

### Building
```bash
cd HDBApp
# iOS build via Xcode
npx react-native run-ios --configuration Release

# Android build
npx react-native run-android --variant=release
```

## Code Architecture

### Core Structure
- `App.tsx` - Main app entry point with error boundary and navigation setup
- `src/navigation/AppNavigator.tsx` - Navigation structure with Stack and Drawer navigators
- `src/screens/` - Screen components (Home, Login, Splash, WebView)
- `src/components/` - Reusable UI components (Button, Card, Input)
- `src/hooks/` - Custom React hooks (useAuth for authentication)
- `src/types/` - TypeScript type definitions for the entire app
- `src/utils/` - Utility functions and error handling

### Navigation Architecture
- **Stack Navigator**: Main navigation flow (Splash → Login → Main)
- **Drawer Navigator**: Main app navigation (Home, Profile, Settings, Notifications)  
- **Type Safety**: Strongly typed navigation with `RootStackParamList` and `MainDrawerParamList`

### Authentication Flow
- `useAuth` hook manages authentication state
- Mock authentication system (ready for real API integration)
- Persistent state management planned with AsyncStorage

### Health Data Management
- Type definitions for vital data (steps, weight, temperature, blood pressure, heart rate)
- Support for multiple data sources (manual, HealthKit, Google Fit)
- Structured data models in `src/types/index.ts`

### Platform Integration
- iOS: HealthKit integration planned
- Android: Google Fit/Health Connect integration planned
- WebView component for external HDB system integration

## Key Features Implemented

### User Interface
- Dashboard with health data cards
- Drawer navigation with Japanese labels
- Responsive design with proper styling
- Error boundary for crash protection

### Authentication System
- Login screen with form validation
- User state management with hooks
- Token-based authentication structure

### Health Data Display
- Mock health data display (steps, weight, temperature, blood pressure)
- Card-based dashboard layout
- Notifications and quick actions

### Navigation
- Multi-level navigation (Stack + Drawer)
- WebView integration for external content
- Proper TypeScript typing for navigation props

## Development Notes

### Environment Requirements
- Node.js 18+
- React Native 0.80.0
- TypeScript 5.0.4
- Xcode (iOS development)
- Android Studio (Android development)

### Testing
- Jest configuration for React Native
- Test files in `__tests__/` directory
- React Test Renderer for component testing

### Code Style
- ESLint with React Native config
- Prettier for code formatting
- TypeScript strict mode enabled

### Health Platform Integration
- HealthKit integration pending (iOS)
- Google Fit/Health Connect integration pending (Android)
- WebView for existing HDB system integration
- Data synchronization architecture planned