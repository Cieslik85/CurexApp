import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store/store';
import { setFromCurrency, setToCurrency, setAmount, swapCurrencies } from '@/store/slices/currencySlice';
import { useGetAllMajorRatesQuery } from '@/store/services/exchangeRateApi';
import { calculateConversion } from '@/utils/currency';
import { useMemo } from 'react';

export const useCurrencyConverter = () => {
  const dispatch = useDispatch();
  const { fromCurrency, toCurrency, amount } = useSelector((state: RootState) => state.currency);
  
  // Fetch all rates for the base currency with aggressive caching
  const { data: exchangeRates, isLoading, error } = useGetAllMajorRatesQuery(fromCurrency, {
    // Refetch only when absolutely necessary
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: true,
  });
  
  // Memoize calculations for instant performance
  const { convertedAmount, currentRate } = useMemo(() => {
    if (fromCurrency === toCurrency) {
      return { convertedAmount: parseFloat(amount) || 0, currentRate: 1 };
    }
    
    if (!exchangeRates?.rates[toCurrency]) {
      return { convertedAmount: 0, currentRate: 0 };
    }
    
    const rate = exchangeRates.rates[toCurrency];
    const converted = calculateConversion(parseFloat(amount) || 0, rate);
    
    return { convertedAmount: converted, currentRate: rate };
  }, [fromCurrency, toCurrency, amount, exchangeRates]);

  return {
    fromCurrency,
    toCurrency,
    amount,
    convertedAmount,
    currentRate,
    isLoading,
    error,
    exchangeRates, // Expose for other components to use

    setFromCurrency: (currency: string) => dispatch(setFromCurrency(currency)),
    setToCurrency: (currency: string) => dispatch(setToCurrency(currency)),
    setAmount: (value: string) => dispatch(setAmount(value)),
    swapCurrencies: () => dispatch(swapCurrencies()),
  };
};

// New hook for multi-currency instant conversions
export const useInstantConverter = (baseCurrency: string) => {
  const { data: exchangeRates, isLoading, error } = useGetAllMajorRatesQuery(baseCurrency, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false, 
    refetchOnReconnect: true,
  });
  
  const convertAmount = useMemo(() => {
    return (amount: number, targetCurrency: string): number => {
      if (baseCurrency === targetCurrency) return amount;
      if (!exchangeRates?.rates[targetCurrency]) return 0;
      return calculateConversion(amount, exchangeRates.rates[targetCurrency]);
    };
  }, [baseCurrency, exchangeRates]);
  
  const getRate = useMemo(() => {
    return (targetCurrency: string): number => {
      if (baseCurrency === targetCurrency) return 1;
      return exchangeRates?.rates[targetCurrency] || 0;
    };
  }, [baseCurrency, exchangeRates]);
  
  return {
    convertAmount,
    getRate,
    exchangeRates,
    isLoading,
    error,
  };
};