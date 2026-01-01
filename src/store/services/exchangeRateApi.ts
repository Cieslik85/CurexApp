import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Frankfurter.dev API response interface
interface FrankfurterResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

// Internal interface for consistency with existing code
interface ExchangeRateResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

// API Configuration - Frankfurter.dev (free, no limits!)
const BASE_URL = 'https://api.frankfurter.app';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes - optimal balance for offline functionality
const IN_MEMORY_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for aggressive caching

// Transform Frankfurter response to our internal format
const transformResponse = (data: FrankfurterResponse): ExchangeRateResponse => ({
  success: true,
  timestamp: Date.now() / 1000, // Convert to Unix timestamp
  base: data.base,
  date: data.date,
  rates: data.rates,
});

export const exchangeRateApi = createApi({
  reducerPath: 'exchangeRateApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ['ExchangeRate'],
  endpoints: (builder) => ({
    getExchangeRates: builder.query<ExchangeRateResponse, string>({
      query: (baseCurrency) => `/latest?from=${baseCurrency}`,
      transformResponse: (response: FrankfurterResponse) => transformResponse(response),
      providesTags: ['ExchangeRate'],
      keepUnusedDataFor: CACHE_DURATION / 1000, // 2 hours cache
    }),
    
    getSpecificRates: builder.query<ExchangeRateResponse, { base: string; targets: string[] }>({
      query: ({ base, targets }) => {
        const targetParams = targets.length > 0 ? `&to=${targets.join(',')}` : '';
        return `/latest?from=${base}${targetParams}`;
      },
      transformResponse: (response: FrankfurterResponse) => transformResponse(response),
      providesTags: ['ExchangeRate'],
      keepUnusedDataFor: CACHE_DURATION / 1000,
    }),

    // Convert specific amount between currencies
    convertCurrencyPair: builder.query<{ rate: number; result: number }, { from: string; to: string; amount: number }>({
      query: ({ from, to, amount }) => `/${amount}?from=${from}&to=${to}`,
      transformResponse: (response: FrankfurterResponse) => {
        const rate = response.rates[Object.keys(response.rates)[0]];
        return {
          rate,
          result: response.amount * rate,
        };
      },
      keepUnusedDataFor: CACHE_DURATION / 1000,
    }),

    // Get all major currency rates for instant local conversions
    getAllMajorRates: builder.query<ExchangeRateResponse, string>({
      query: (baseCurrency) => `/latest?from=${baseCurrency}`,
      transformResponse: (response: FrankfurterResponse) => transformResponse(response),
      providesTags: ['ExchangeRate'],
      keepUnusedDataFor: IN_MEMORY_CACHE_DURATION / 1000, // Aggressive caching for instant conversions
    }),
  }),
});

export const { 
  useGetExchangeRatesQuery, 
  useGetSpecificRatesQuery,
  useConvertCurrencyPairQuery,
  useGetAllMajorRatesQuery,
} = exchangeRateApi;