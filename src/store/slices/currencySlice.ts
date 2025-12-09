import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
}

const initialState: CurrencyState = {
  selectedCurrencies: [
    { code: 'USD', name: 'US Dollar', symbol: '$', value: '0' },
    { code: 'EUR', name: 'Euro', symbol: '€', value: '0' },
    { code: 'GBP', name: 'British Pound', symbol: '£', value: '0' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', value: '0' },
  ],
  baseCurrency: 'USD',
  lastUpdated: null,
  refreshInterval: 300, // 5 minutes
  availableCurrencies: [
    { code: 'USD', name: 'US Dollar', symbol: '$', value: '0' },
    { code: 'EUR', name: 'Euro', symbol: '€', value: '0' },
    { code: 'GBP', name: 'British Pound', symbol: '£', value: '0' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', value: '0' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', value: '0' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿', value: '0' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', value: '0' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', value: '0' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', value: '0' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', value: '0' },
  ],
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
} = currencySlice.actions;

export default currencySlice.reducer;