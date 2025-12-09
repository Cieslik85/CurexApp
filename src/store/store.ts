import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { exchangeRateApi } from './services/exchangeRateApi';
import currencyReducer from './slices/currencySlice';

export const store = configureStore({
  reducer: {
    currency: currencyReducer,
    [exchangeRateApi.reducerPath]: exchangeRateApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(exchangeRateApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;