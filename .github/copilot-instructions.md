# CurexApp - AI Coding Assistant Instructions

## Project Overview

This is a cross-platform mobile currency exchange application built with Expo and React Native that provides real-time currency conversion, rate tracking, and offline functionality for travelers and international users.

## Architecture & Key Components

### Mobile-Specific Architecture

- **Expo SDK**: Managed workflow with access to native APIs and services
- **React Native Core**: Cross-platform UI with Expo's optimized components
- **Navigation Stack**: Expo Router (file-based routing) with tab-based main flow
- **State Management**: Redux Toolkit with RTK Query for API caching
- **Offline Storage**: Expo SecureStore for sensitive data, Expo SQLite for transactions
- **Background Services**: Expo TaskManager for rate updates and push notifications

### Core Mobile Services

- **Rate Service**: Fetches live rates with offline caching and background sync
- **Conversion Calculator**: Real-time calculations with haptic feedback
- **Favorites Manager**: User's preferred currency pairs with quick access
- **Notification Service**: Rate alerts and transaction confirmations
- **Biometric Auth**: Touch/Face ID for secure access

### Data Flow

1. App launch → Check connectivity → Load cached rates → Background refresh
2. User input → Real-time calculation → Haptic feedback → Auto-save to favorites
3. Background sync → Rate updates → Push notifications → UI refresh

## Development Workflows

### Environment Setup

```bash
# Install dependencies
npm install

# Development with Expo Go
npx expo start

# iOS development (requires Xcode)
npx expo run:ios

# Android development
npx expo run:android

# Run tests
npm run test

# Build for production
eas build --platform all

# Submit to stores
eas submit --platform all
```

### Key Configuration Files

- `app.json` - Expo app configuration and metadata
- `eas.json` - Expo Application Services build and submit configuration
- `expo.json` - Additional Expo configuration (if needed)
- `metro.config.js` - Metro bundler configuration for Expo
- `.env.example` - API keys and environment variables

## Code Patterns & Conventions

### Currency Handling

- Use `react-native-currency-formatter` for locale-specific formatting
- Store amounts as integers (cents) in AsyncStorage and SQLite
- Display formatting happens in custom hooks: `useCurrencyFormat()`
- Example: Store 1234 cents, display as $12.34 or €12,34 based on locale

### Mobile UX Patterns

- **Pull-to-refresh**: Standard pattern for rate updates on main screen
- **Swipe gestures**: Swipe between currency pairs, swipe-to-delete favorites
- **Haptic feedback**: Confirm calculations and successful transactions
- **Loading states**: Skeleton screens while fetching rates
- **Error boundaries**: Graceful handling with retry options

### Offline Handling

- Cache last 24 hours of rates in SQLite
- Show "offline" indicator when no connectivity
- Queue rate requests for when connection returns
- Sync transaction history when back online

### Platform-Specific Code

```javascript
// Use Platform.select() for different behaviors
const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.select({
      ios: 44, // Account for status bar
      android: StatusBar.currentHeight,
    }),
  },
});

// Platform-specific components in /src/components/ios/ and /src/components/android/
```

### Navigation Patterns

- **Tab Navigator**: Main currencies, favorites, history, settings
- **Stack Navigator**: Nested flows within each tab
- **Modal Stack**: Rate alerts, settings overlays
- **Deep Linking**: Support currency pair URLs: `app://convert/USD/EUR`

## Testing Strategies

### Mobile Testing

- **Component Tests**: React Native Testing Library for UI components
- **Hook Tests**: Custom hooks like `useCurrencyConverter`, `useRates`
- **Navigation Tests**: Test screen transitions and deep linking
- **Platform Tests**: iOS/Android specific behavior verification
- **Offline Tests**: Simulate network conditions

### Device Testing

- **iOS Simulator**: Test on multiple device sizes and iOS versions
- **Android Emulator**: Test different Android versions and screen densities
- **Physical Devices**: Test performance, haptics, and biometric auth

## Performance Considerations

- **Image Optimization**: Use WebP format, lazy load currency flag icons
- **Bundle Splitting**: Code splitting for different currency regions
- **Memory Management**: Limit cached rates, cleanup unused screens
- **Animation Performance**: Use native animations, avoid sync calculations during gestures
- **Network Optimization**: Batch API requests, compress responses

## Security & Privacy

- **Biometric Authentication**: Store sensitive data behind Touch/Face ID
- **Keychain Storage**: Use `react-native-keychain` for API keys
- **Certificate Pinning**: Secure API communications
- **No PII Storage**: Don't store personal transaction details locally
- **App Transport Security**: Enforce HTTPS on iOS

## External Dependencies

- **Rate APIs**: ExchangeRate-API, Fixer.io (with fallbacks)
- **UI Components**: React Native Elements, react-native-vector-icons
- **Navigation**: React Navigation v6
- **State**: Redux Toolkit, RTK Query
- **Storage**: AsyncStorage, react-native-sqlite-2
- **Notifications**: React Native Push Notifications
- **Biometrics**: react-native-biometrics

## Common Mobile Debugging

- **Metro bundler issues**: Clear cache with `npx react-native start --reset-cache`
- **iOS build failures**: Clean build folder, check pod versions
- **Android APK size**: Analyze bundle with `npx react-native bundle --analyze`
- **Performance issues**: Use Flipper for React Native debugging
- **Offline sync problems**: Check AsyncStorage keys and SQLite schema

## File Organization

```
/src
  /screens/           # Main app screens (Home, Favorites, History, Settings)
  /components/        # Reusable UI components
    /ios/            # iOS-specific components
    /android/        # Android-specific components
  /hooks/             # Custom hooks (useRates, useCurrency, useOffline)
  /services/          # API services and background tasks
  /store/             # Redux store, slices, and RTK Query APIs
  /utils/             # Currency formatting, validation, constants
  /navigation/        # Navigation configuration and deep linking
/android              # Android native code and assets
/ios                  # iOS native code and assets
/assets               # Images, fonts, currency flags
/__tests__            # Test files mirroring src structure
```

## App Store Considerations

- **iOS**: Handle App Store review guidelines for financial apps
- **Android**: Optimize for Google Play Console requirements
- **Permissions**: Request only necessary permissions (internet, storage)
- **App Size**: Keep APK/IPA under size limits with asset optimization

---

_Update this file as mobile-specific patterns emerge. Focus on React Native best practices and mobile UX conventions._
