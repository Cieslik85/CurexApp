import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV_CONFIG } from '@/config/env';

// ExchangeRate-API response interface
interface ExchangeRateApiResponse {
  result: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  conversion_rates: Record<string, number>;
}

interface ConversionResponse {
  result: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  target_code: string;
  conversion_rate: number;
  conversion_result: number;
}

// Internal interface for consistency with existing code
interface ExchangeRateResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

// API Configuration from environment variables
const API_KEY = ENV_CONFIG.EXCHANGE_RATE_API_KEY;
const BASE_URL = API_KEY ? `https://v6.exchangerate-api.com/v6/${API_KEY}` : '';

// Quota management - 1500 requests/month, resets on 9th
const MONTHLY_QUOTA = 1500;
const DAILY_LIMIT = ENV_CONFIG.DAILY_REQUEST_LIMIT;
const CACHE_DURATION = ENV_CONFIG.CACHE_DURATION_HOURS * 60 * 60 * 1000;

// Check if we're within quota
const checkQuotaLimit = async (): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const requestsToday = await AsyncStorage.getItem(`api_requests_${today}`);
    const dailyCount = requestsToday ? parseInt(requestsToday) : 0;
    
    return dailyCount < DAILY_LIMIT;
  } catch (error) {
    console.warn('Failed to check quota limit:', error);
    return true; // Allow request if check fails
  }
};

// Increment daily request count
const incrementRequestCount = async (): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const requestsToday = await AsyncStorage.getItem(`api_requests_${today}`);
    const dailyCount = requestsToday ? parseInt(requestsToday) : 0;
    await AsyncStorage.setItem(`api_requests_${today}`, (dailyCount + 1).toString());
  } catch (error) {
    console.warn('Failed to increment request count:', error);
  }
};

// Transform API response to our internal format
const transformResponse = (data: ExchangeRateApiResponse): ExchangeRateResponse => ({
  success: data.result === 'success',
  timestamp: data.time_last_update_unix,
  base: data.base_code,
  date: data.time_last_update_utc.split(' ')[0],
  rates: data.conversion_rates,
});

export const exchangeRateApi = createApi({
  reducerPath: 'exchangeRateApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: async (headers) => {
      // Check if API key is configured
      if (!API_KEY) {
        throw new Error('Exchange rate API key not configured');
      }
      
      // Check quota before making request
      const withinLimit = await checkQuotaLimit();
      if (!withinLimit) {
        throw new Error('Daily API quota exceeded');
      }
      return headers;
    },
  }),
  tagTypes: ['ExchangeRate'],
  endpoints: (builder) => ({
    getExchangeRates: builder.query<ExchangeRateResponse, string>({
      query: (baseCurrency) => `/latest/${baseCurrency}`,
      transformResponse: (response: ExchangeRateApiResponse) => {
        incrementRequestCount(); // Track API usage
        return transformResponse(response);
      },
      providesTags: ['ExchangeRate'],
      keepUnusedDataFor: CACHE_DURATION / 1000, // 4 hours cache
    }),
    
    getSpecificRates: builder.query<ExchangeRateResponse, { base: string; targets: string[] }>({
      query: ({ base }) => `/latest/${base}`,
      transformResponse: (response: ExchangeRateApiResponse, meta, { base, targets }) => {
        incrementRequestCount(); // Track API usage
        const transformedData = transformResponse(response);
        
        // Filter to requested currencies only if targets specified
        if (targets && targets.length > 0) {
          const filteredRates: Record<string, number> = {};
          targets.forEach(target => {
            if (transformedData.rates[target]) {
              filteredRates[target] = transformedData.rates[target];
            }
          });
          
          return {
            ...transformedData,
            rates: filteredRates,
          };
        }
        
        return transformedData;
      },
      providesTags: ['ExchangeRate'],
      keepUnusedDataFor: CACHE_DURATION / 1000,
    }),

    // Pair conversion endpoint for single conversions (saves quota)
    convertCurrencyPair: builder.query<{ rate: number; result: number }, { from: string; to: string; amount: number }>({
      query: ({ from, to, amount }) => `/pair/${from}/${to}/${amount}`,
      transformResponse: (response: ConversionResponse) => {
        incrementRequestCount();
        return {
          rate: response.conversion_rate,
          result: response.conversion_result,
        };
      },
      keepUnusedDataFor: CACHE_DURATION / 1000, // 4 hours cache
    }),
  }),
});

export const { 
  useGetExchangeRatesQuery, 
  useGetSpecificRatesQuery,
  useConvertCurrencyPairQuery,
} = exchangeRateApi;

// Utility function to get current quota usage
export const getQuotaUsage = async (): Promise<{ today: number; remaining: number }> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const requestsToday = await AsyncStorage.getItem(`api_requests_${today}`);
    const dailyCount = requestsToday ? parseInt(requestsToday) : 0;
    
    return {
      today: dailyCount,
      remaining: DAILY_LIMIT - dailyCount,
    };
  } catch (error) {
    return { today: 0, remaining: DAILY_LIMIT };
  }
};