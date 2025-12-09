import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ALL_CURRENCIES } from '@/utils/currency';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  value: string;
}

interface CurrencyState {
  selectedCurrencies: Currency[];
  baseCurrency: string;
  lastUpdated: number | null;
  availableCurrencies: Currency[];
  refreshInterval: number; // in seconds
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  apiQuota: {
    dailyUsed: number;
    dailyLimit: number;
    lastResetDate: string;
  };
}

// Convert ALL_CURRENCIES to Currency format with value field
const availableCurrencies: Currency[] = ALL_CURRENCIES.map(currency => ({
  ...currency,
  value: '0',
}));

const initialState: CurrencyState = {
  selectedCurrencies: [
    { code: 'USD', name: 'US Dollar', symbol: '$', value: '0' },
    { code: 'EUR', name: 'Euro', symbol: '€', value: '0' },
    { code: 'GBP', name: 'British Pound Sterling', symbol: '£', value: '0' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', value: '0' },
  ],
  baseCurrency: 'USD',
  lastUpdated: null,
  refreshInterval: 14400, // 4 hours (optimized for quota management)
  availableCurrencies,
  fromCurrency: 'USD',
  toCurrency: 'EUR',
  amount: '1',
  apiQuota: {
    dailyUsed: 0,
    dailyLimit: 48,
    lastResetDate: new Date().toISOString().split('T')[0],
  },
};

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    updateCurrencyValue: (state, action: PayloadAction<{ code: string; value: string }>) => {
      const currency = state.selectedCurrencies.find(c => c.code === action.payload.code);
      if (currency) {
        currency.value = action.payload.value;
      }
    },
    setBaseCurrency: (state, action: PayloadAction<string>) => {
      state.baseCurrency = action.payload;
    },
    addCurrency: (state, action: PayloadAction<Currency>) => {
      if (!state.selectedCurrencies.find(c => c.code === action.payload.code)) {
        state.selectedCurrencies.push(action.payload);
      }
    },
    removeCurrency: (state, action: PayloadAction<string>) => {
      state.selectedCurrencies = state.selectedCurrencies.filter(c => c.code !== action.payload);
    },
    clearAllValues: (state) => {
      state.selectedCurrencies.forEach(currency => {
        currency.value = '0';
      });
    },
    setLastUpdated: (state, action: PayloadAction<number>) => {
      state.lastUpdated = action.payload;
    },
    reorderCurrencies: (state, action: PayloadAction<Currency[]>) => {
      state.selectedCurrencies = action.payload;
    },
    setFromCurrency: (state, action: PayloadAction<string>) => {
      state.fromCurrency = action.payload;
    },
    setToCurrency: (state, action: PayloadAction<string>) => {
      state.toCurrency = action.payload;
    },
    setAmount: (state, action: PayloadAction<string>) => {
      state.amount = action.payload;
    },
    swapCurrencies: (state) => {
      const temp = state.fromCurrency;
      state.fromCurrency = state.toCurrency;
      state.toCurrency = temp;
    },
    updateApiQuota: (state, action: PayloadAction<{ used: number; limit: number }>) => {
      const today = new Date().toISOString().split('T')[0];
      state.apiQuota = {
        dailyUsed: action.payload.used,
        dailyLimit: action.payload.limit,
        lastResetDate: today,
      };
    },
    incrementApiUsage: (state) => {
      const today = new Date().toISOString().split('T')[0];
      if (state.apiQuota.lastResetDate !== today) {
        // Reset daily usage if it's a new day
        state.apiQuota = {
          dailyUsed: 1,
          dailyLimit: state.apiQuota.dailyLimit,
          lastResetDate: today,
        };
      } else {
        state.apiQuota.dailyUsed += 1;
      }
    },
  },
});

export const {
  updateCurrencyValue,
  setBaseCurrency,
  addCurrency,
  removeCurrency,
  clearAllValues,
  setLastUpdated,
  reorderCurrencies,
  setFromCurrency,
  setToCurrency,
  setAmount,
  swapCurrencies,
  updateApiQuota,
  incrementApiUsage,
} = currencySlice.actions;

export default currencySlice.reducer;