# CurexApp

A cross-platform mobile currency exchange application built with Expo and React Native that provides real-time currency conversion, rate tracking, and offline functionality for travelers and international users.

## 🚀 Quick Start

### Installation & Run

```bash
npm install
npm start
```

## 📱 Features

- **170+ World Currencies** - Comprehensive currency support including cryptocurrencies
- **Real-time Exchange Rates** - Live rates from Frankfurter.dev (no limits!)
- **Intelligent Caching** - 30-minute cache for optimal performance
- **Always Available** - Free API with no rate limits or authentication
- **Offline-Friendly** - Works with cached data when offline
- **Favorites Management** - Save frequently used currencies
- **Clean Interface** - Intuitive design with section organization

## 📝 Tech Stack

- React Native with Expo
- TypeScript
- Redux Toolkit with RTK Query
- Frankfurter.dev API (free, no limits)
- AsyncStorage for caching

## 🔧 API Configuration

The app uses [ExchangeRate-API](https://app.exchangerate-api.com/) with the following limits:

- **Monthly Quota**: 1,500 requests (resets 9th of each month)
- **Daily Limit**: 48 requests/day (automatically managed)
- **Cache Duration**: 4 hours (configurable via environment)

### Environment Variables

```env
EXPO_PUBLIC_EXCHANGE_RATE_API_KEY=your_api_key_here
EXPO_PUBLIC_DAILY_REQUEST_LIMIT=48
EXPO_PUBLIC_CACHE_DURATION_HOURS=4
```

**⚠️ Important**: Never commit your `.env` file to version control. The API key should be kept private.

- Expo Router for navigation
- Redux Toolkit for state management
- React Native Paper for UI components
