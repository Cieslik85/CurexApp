import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store/store';
import { setFromCurrency, setToCurrency, setAmount, swapCurrencies } from '@/store/slices/currencySlice';
import { useGetSpecificRatesQuery, useConvertCurrencyPairQuery } from '@/store/services/exchangeRateApi';
import { calculateConversion } from '@/utils/currency';
import { useApiQuota } from './useApiQuota';

export const useCurrencyConverter = () => {
  const dispatch = useDispatch();
  const { fromCurrency, toCurrency, amount } = useSelector((state: RootState) => state.currency);
  const { canMakeRequest } = useApiQuota();
  
  // Use specific rates query for better quota management
  const { data: exchangeRates, isLoading, error } = useGetSpecificRatesQuery(
    { 
      base: fromCurrency, 
      targets: [toCurrency] 
    },
    { 
      skip: !canMakeRequest() || fromCurrency === toCurrency 
    }
  );
  
  const convertedAmount = exchangeRates && exchangeRates.rates[toCurrency] 
    ? calculateConversion(parseFloat(amount) || 0, exchangeRates.rates[toCurrency])
    : fromCurrency === toCurrency ? parseFloat(amount) || 0 : 0;

  const currentRate = exchangeRates?.rates[toCurrency] || (fromCurrency === toCurrency ? 1 : 0);

  return {
    fromCurrency,
    toCurrency,
    amount,
    convertedAmount,
    currentRate,
    isLoading,
    error,
    quotaExceeded: !canMakeRequest(),
    setFromCurrency: (currency: string) => dispatch(setFromCurrency(currency)),
    setToCurrency: (currency: string) => dispatch(setToCurrency(currency)),
    setAmount: (value: string) => dispatch(setAmount(value)),
    swapCurrencies: () => dispatch(swapCurrencies()),
  };
};