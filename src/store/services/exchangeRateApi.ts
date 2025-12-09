import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface ExchangeRateResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

interface ConvertResponse {
  success: boolean;
  query: {
    from: string;
    to: string;
    amount: number;
  };
  info: {
    timestamp: number;
    rate: number;
  };
  date: string;
  result: number;
}

export const exchangeRateApi = createApi({
  reducerPath: 'exchangeRateApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.exchangerate.host/',
  }),
  tagTypes: ['ExchangeRate'],
  endpoints: (builder) => ({
    getExchangeRates: builder.query<ExchangeRateResponse, string>({
      query: (baseCurrency) => `latest?base=${baseCurrency}`,
      providesTags: ['ExchangeRate'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),
    getMultipleCurrencyRates: builder.query<ExchangeRateResponse, { base: string; symbols: string[] }>({
      query: ({ base, symbols }) => `latest?base=${base}&symbols=${symbols.join(',')}`,
      providesTags: ['ExchangeRate'],
      keepUnusedDataFor: 300,
    }),
    convertCurrency: builder.query<ConvertResponse, { from: string; to: string; amount: number }>({
      query: ({ from, to, amount }) => `convert?from=${from}&to=${to}&amount=${amount}`,
      keepUnusedDataFor: 60, // Cache conversions for 1 minute
    }),
  }),
});

export const { 
  useGetExchangeRatesQuery, 
  useGetMultipleCurrencyRatesQuery,
  useConvertCurrencyQuery 
} = exchangeRateApi;