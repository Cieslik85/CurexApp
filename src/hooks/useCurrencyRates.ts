import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setLastUpdated } from '@/store/slices/currencySlice';
import { useGetMultipleCurrencyRatesQuery } from '@/store/services/exchangeRateApi';

interface UseAutoRefreshRatesProps {
  enabled: boolean;
  baseCurrency: string;
  targetCurrencies: string[];
}

export function useAutoRefreshRates({ 
  enabled, 
  baseCurrency, 
  targetCurrencies 
}: UseAutoRefreshRatesProps) {
  const dispatch = useDispatch();
  const { refreshInterval } = useSelector((state: RootState) => state.currency);

  const { 
    data: ratesData, 
    isLoading,
    refetch 
  } = useGetMultipleCurrencyRatesQuery(
    { 
      base: baseCurrency, 
      symbols: targetCurrencies.filter(code => code !== baseCurrency)
    },
    { 
      skip: !enabled || targetCurrencies.length === 0,
      pollingInterval: refreshInterval * 1000, // Convert to milliseconds
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true,
    }
  );

  const manualRefresh = useCallback(async () => {
    try {
      await refetch();
      dispatch(setLastUpdated(Date.now()));
    } catch (error) {
      console.error('Failed to refresh rates:', error);
    }
  }, [refetch, dispatch]);

  // Update last updated timestamp when data changes
  useEffect(() => {
    if (ratesData) {
      dispatch(setLastUpdated(Date.now()));
    }
  }, [ratesData, dispatch]);

  return {
    ratesData,
    isLoading,
    manualRefresh,
  };
}

export function useCurrencyFormatter() {
  const formatValue = useCallback((value: string | number, currencyCode: string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue) || numValue === 0) return '0';

    // Different formatting for different currency types
    const majorCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF'];
    const cryptoCurrencies = ['BTC', 'ETH'];
    const highValueCurrencies = ['JPY', 'KRW', 'IDR'];

    if (cryptoCurrencies.includes(currencyCode)) {
      // Crypto currencies - up to 8 decimal places
      return numValue.toFixed(8).replace(/\.?0+$/, '');
    } else if (highValueCurrencies.includes(currencyCode)) {
      // High value currencies - no decimal places for large numbers
      if (numValue >= 100) {
        return Math.round(numValue).toLocaleString();
      }
      return numValue.toFixed(2);
    } else {
      // Standard currencies
      if (numValue >= 1000) {
        return numValue.toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        });
      }
      return numValue.toFixed(4).replace(/\.?0+$/, '');
    }
  }, []);

  const parseInputValue = useCallback((value: string): string => {
    // Remove any non-numeric characters except decimal point
    let cleaned = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Remove leading zeros unless it's a decimal
    if (cleaned.length > 1 && cleaned[0] === '0' && cleaned[1] !== '.') {
      cleaned = cleaned.substring(1);
    }
    
    return cleaned;
  }, []);

  return {
    formatValue,
    parseInputValue,
  };
}