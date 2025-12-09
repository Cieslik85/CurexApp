import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store/store';
import { setFromCurrency, setToCurrency, setAmount, swapCurrencies } from '@/store/slices/currencySlice';
import { useGetExchangeRatesQuery } from '@/store/services/exchangeRateApi';
import { calculateConversion } from '@/utils/currency';

export const useCurrencyConverter = () => {
  const dispatch = useDispatch();
  const { fromCurrency, toCurrency, amount } = useSelector((state: RootState) => state.currency);
  
  const { data: exchangeRates, isLoading, error } = useGetExchangeRatesQuery(fromCurrency);
  
  const convertedAmount = exchangeRates && exchangeRates.rates[toCurrency] 
    ? calculateConversion(parseFloat(amount) || 0, exchangeRates.rates[toCurrency])
    : 0;

  const currentRate = exchangeRates?.rates[toCurrency] || 0;

  return {
    fromCurrency,
    toCurrency,
    amount,
    convertedAmount,
    currentRate,
    isLoading,
    error,
    setFromCurrency: (currency: string) => dispatch(setFromCurrency(currency)),
    setToCurrency: (currency: string) => dispatch(setToCurrency(currency)),
    setAmount: (value: string) => dispatch(setAmount(value)),
    swapCurrencies: () => dispatch(swapCurrencies()),
  };
};