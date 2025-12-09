# CurexApp

A cross-platform mobile currency exchange application built with Expo and React Native that provides real-time currency conversion, rate tracking, and offline functionality for travelers and international users.

## 🚀 Quick Start

### Environment Setup

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Get your API key from [ExchangeRate-API](https://app.exchangerate-api.com/) and update `.env`:
   ```env
   EXPO_PUBLIC_EXCHANGE_RATE_API_KEY=your_actual_api_key_here
   ```

### Installation & Run

```bash
npm install
npm start
```

## 📱 Features

- **170+ World Currencies** - Comprehensive currency support including cryptocurrencies
- **Real-time Exchange Rates** - Live rates with smart quota management
- **Intelligent Caching** - 4-hour cache system to optimize API usage
- **Quota Management** - Built-in tracking of daily/monthly API limits
- **Offline-Friendly** - Works with cached data when API limits reached
- **Favorites Management** - Save frequently used currencies
- **Clean Interface** - Intuitive design with section organization

## 📝 Tech Stack

- React Native with Expo
- TypeScript
- Redux Toolkit with RTK Query
- ExchangeRate-API
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
