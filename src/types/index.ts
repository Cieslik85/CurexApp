export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag?: string;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: number;
}

export interface ConversionHistory {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  timestamp: number;
}

export interface UserPreferences {
  defaultFromCurrency: string;
  defaultToCurrency: string;
  favoritesCurrencies: string[];
  enableNotifications: boolean;
  enableBiometricAuth: boolean;
  theme: 'light' | 'dark' | 'auto';
}