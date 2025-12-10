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
  refreshInterval: 1800, // 30 minutes (more frequent updates since no limits)
  availableCurrencies,
  fromCurrency: 'USD',
  toCurrency: 'EUR',
  amount: '1',

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
} = currencySlice.actions;

export default currencySlice.reducer;