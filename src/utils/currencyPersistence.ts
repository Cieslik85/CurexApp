import AsyncStorage from '@react-native-async-storage/async-storage';
import { Currency } from '@/store/slices/currencySlice';

const STORAGE_KEY = 'selected_currencies';

export const saveSelectedCurrencies = async (currencies: Currency[]): Promise<void> => {
  try {
    // Only save the currency metadata, not the values
    const currenciesToSave = currencies.map(({ code, name, symbol }) => ({
      code,
      name,
      symbol,
      value: '0' // Always reset values when saving
    }));
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currenciesToSave));
  } catch (error) {
    console.error('Failed to save selected currencies:', error);
  }
};

export const loadSelectedCurrencies = async (): Promise<Currency[] | null> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const currencies = JSON.parse(stored);
      // Ensure all currencies have value set to '0' for fresh session
      return currencies.map((currency: Currency) => ({
        ...currency,
        value: '0'
      }));
    }
    return null;
  } catch (error) {
    console.error('Failed to load selected currencies:', error);
    return null;
  }
};

export const clearPersistedCurrencies = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear persisted currencies:', error);
  }
};