import React, { useCallback, useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  ActivityIndicator,
  RefreshControl,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { 
  updateCurrencyValue, 
  setLastUpdated, 
  removeCurrency,
  loadPersistedCurrencies,
  Currency 
} from '@/store/slices/currencySlice';
import { useGetSpecificRatesQuery } from '@/store/services/exchangeRateApi';
import { CurrencySelector } from './CurrencySelector';
import { useTheme } from '@/contexts/ThemeContext';
import { saveSelectedCurrencies, loadSelectedCurrencies } from '@/utils/currencyPersistence';

// Permanent keyboard interface
interface PermanentKeyboardProps {
  onKeyPress: (key: string) => void;
  theme: any;
}

// Currency flag mapping
const CURRENCY_FLAGS: Record<string, string> = {
  'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'JPY': '🇯🇵', 'AUD': '🇦🇺', 'CAD': '🇨🇦', 'CHF': '🇨🇭',
  'CNY': '🇨🇳', 'SEK': '🇸🇪', 'NZD': '🇳🇿', 'MXN': '🇲🇽', 'SGD': '🇸🇬', 'HKD': '🇭🇰', 'NOK': '🇳🇴',
  'TRY': '🇹🇷', 'RUB': '🇷🇺', 'INR': '🇮🇳', 'BRL': '🇧🇷', 'ZAR': '🇿🇦', 'PLN': '🇵🇱', 'DKK': '🇩🇰',
  'CZK': '🇨🇿', 'HUF': '🇭🇺', 'RON': '🇷🇴', 'BGN': '🇧🇬', 'HRK': '🇭🇷', 'ISK': '🇮🇸', 'THB': '🇹🇭',
  'MYR': '🇲🇾', 'PHP': '🇵🇭', 'IDR': '🇮🇩', 'KRW': '🇰🇷', 'ILS': '🇮🇱', 'AED': '🇦🇪', 'SAR': '🇸🇦',
  'EGP': '🇪🇬', 'NGN': '🇳🇬', 'GHS': '🇬🇭', 'KES': '🇰🇪', 'UGX': '🇺🇬', 'TZS': '🇹🇿', 'MAD': '🇲🇦',
  'TND': '🇹🇳', 'DZD': '🇩🇿', 'LYD': '🇱🇾', 'ETB': '🇪🇹', 'CLP': '🇨🇱', 'COP': '🇨🇴', 'PEN': '🇵🇪',
  'ARS': '🇦🇷', 'UYU': '🇺🇾', 'BOB': '🇧🇴', 'PYG': '🇵🇾', 'VES': '🇻🇪', 'GYD': '🇬🇾', 'SRD': '🇸🇷',
  'TTD': '🇹🇹', 'JMD': '🇯🇲', 'BBD': '🇧🇧', 'BSD': '🇧🇸', 'BZD': '🇧🇿', 'GTQ': '🇬🇹', 'HNL': '🇭🇳',
  'NIO': '🇳🇮', 'CRC': '🇨🇷', 'PAB': '🇵🇦', 'DOP': '🇩🇴', 'HTG': '🇭🇹', 'CUP': '🇨🇺', 'XCD': '🇦🇬',
  'AWG': '🇦🇼', 'ANG': '🇨🇼', 'SVC': '🇸🇻', 'UAH': '🇺🇦', 'BYN': '🇧🇾', 'MDL': '🇲🇩', 'GEL': '🇬🇪',
  'AMD': '🇦🇲', 'AZN': '🇦🇿', 'KZT': '🇰🇿', 'UZS': '🇺🇿', 'KGS': '🇰🇬', 'TJS': '🇹🇯', 'TMT': '🇹🇲',
  'AFN': '🇦🇫', 'PKR': '🇵🇰', 'NPR': '🇳🇵', 'LKR': '🇱🇰', 'MVR': '🇲🇻', 'BDT': '🇧🇩', 'BTN': '🇧🇹',
  'MMK': '🇲🇲', 'LAK': '🇱🇦', 'KHR': '🇰🇭', 'VND': '🇻🇳', 'TWD': '🇹🇼', 'MOP': '🇲🇴', 'BND': '🇧🇳',
  'FJD': '🇫🇯', 'PGK': '🇵🇬', 'SBD': '🇸🇧', 'VUV': '🇻🇺', 'WST': '🇼🇸', 'TOP': '🇹🇴', 'KPW': '🇰🇵'
};

const getCurrencyFlag = (currencyCode: string): string => {
  return CURRENCY_FLAGS[currencyCode] || '🏳️';
};

// Permanent Keyboard Component
const PermanentKeyboard: React.FC<PermanentKeyboardProps> = ({ onKeyPress, theme }) => {
  const keyboardButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '⌫']
  ];

  const handleKeyPress = (key: string) => {
    onKeyPress(key);
  };

  return (
    <View style={[keyboardStyles.container, { backgroundColor: theme.colors.surface }]}>
      {keyboardButtons.map((row, rowIndex) => (
        <View key={rowIndex} style={keyboardStyles.row}>
          {row.map((key) => (
            <TouchableOpacity
              key={key}
              style={[
                keyboardStyles.key,
                { backgroundColor: theme.colors.background },
                key === '⌫' && { backgroundColor: theme.colors.error + '20' }
              ]}
              onPress={() => handleKeyPress(key)}
              activeOpacity={0.7}
            >
              {key === '⌫' ? (
                <Ionicons name="backspace-outline" size={24} color={theme.colors.error} />
              ) : (
                <Text style={[keyboardStyles.keyText, { color: theme.colors.text }]}>
                  {key}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};

const keyboardStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  key: {
    flex: 1,
    aspectRatio: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
  },
});

interface CurrencyItemProps {
  currency: Currency;
  onValueChange: (code: string, value: string) => void;
  onRemove: (code: string) => void;
  onFocus: (code: string) => void;
  isCalculating: boolean;
  isActive: boolean;
  currentValue?: string;
  theme: any;
  styles: any;
}

const CurrencyItem: React.FC<CurrencyItemProps> = ({ 
  currency, 
  onValueChange, 
  onRemove,
  onFocus,
  isCalculating,
  isActive,
  currentValue,
  theme,
  styles
}) => {
  const [localValue, setLocalValue] = useState(currency.value);

  useEffect(() => {
    if (!isActive) {
      // Always trim the stored value to 2 decimals before setting local value
      const trimmedValue = trimToTwoDecimals(currency.value);
      setLocalValue(trimmedValue);
    }
  }, [currency.value, isActive]);

  const handleValueChange = (value: string) => {
    // Allow only numbers and decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const decimalCount = (cleanValue.match(/\./g) || []).length;
    if (decimalCount <= 1) {
      setLocalValue(cleanValue);
      onValueChange(currency.code, cleanValue);
    }
  };

  const formatDisplayValue = (value: string): string => {
    if (!value || value === '0') return '0.00';
    const num = parseFloat(value);
    if (isNaN(num)) return '0.00';
    
    // Always format with 2 decimal places
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const trimToTwoDecimals = (value: string): string => {
    if (!value || value === '') return '0';
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    
    // Round to 2 decimal places and convert back to string
    return (Math.round(num * 100) / 100).toString();
  };

  const handlePress = () => {
    // Dismiss system keyboard and activate this field
    Keyboard.dismiss();
    onFocus(currency.code);
    
    // Clear the field if it only contains "0" or "0.00"
    const numValue = parseFloat(currency.value);
    if (numValue === 0) {
      setLocalValue('');
    } else {
      // Always trim to 2 decimals when focusing
      const trimmedValue = trimToTwoDecimals(currency.value);
      setLocalValue(trimmedValue);
    }
  };

  const getDisplayValue = () => {
    if (isActive) {
      // Show the current typing value when active
      return currentValue !== undefined ? currentValue : '';
    } else {
      // Show formatted value when not active
      return formatDisplayValue(currency.value);
    }
  };

  return (
    <View style={styles.currencyItem}>
      <View style={styles.inputContainer}>
        <Text style={styles.currencyFlag}>{getCurrencyFlag(currency.code)}</Text>
        <Text style={styles.currencyCode}>{currency.code}</Text>
        <Text style={styles.currencySymbol}>{currency.symbol}</Text>
        <TouchableOpacity
          style={[
            styles.currencyInput,
            styles.currencyInputTouchable,
            isActive && styles.inputFocused
          ]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.currencyInputText,
            { color: theme.colors.text },
            (!getDisplayValue() && !isActive) && { color: theme.colors.textSecondary }
          ]}>
            {getDisplayValue() || (isActive ? '' : '0.00')}
            {isActive && <Text style={[styles.cursor, { color: theme.colors.primary }]}>|</Text>}
          </Text>
        </TouchableOpacity>
        {isCalculating && (
          <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loadingIndicator} />
        )}
        <TouchableOpacity 
          onPress={() => onRemove(currency.code)}
          style={styles.removeButton}
        >
          <Ionicons name="close-circle" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Helper function to trim values to 2 decimal places
const trimToTwoDecimals = (value: string | number): string => {
  if (!value || value === '') return '0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  
  // Round to 2 decimal places and convert back to string
  return (Math.round(num * 100) / 100).toString();
};

export function MultiCurrencyConverter() {
  const dispatch = useDispatch();
  const { selectedCurrencies, baseCurrency, lastUpdated } = useSelector((state: RootState) => state.currency);
  const { theme } = useTheme();
  
  const [inputCurrency, setInputCurrency] = useState<string | null>(null);
  const [inputAmount, setInputAmount] = useState<string>('0');
  const [refreshing, setRefreshing] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  // Ensure theme is loaded
  if (!theme || !theme.colors) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Create styles object
  const styles = createStyles(theme);

  // Load persisted currencies on component mount
  useEffect(() => {
    const loadCurrencies = async () => {
      const persistedCurrencies = await loadSelectedCurrencies();
      if (persistedCurrencies && persistedCurrencies.length > 0) {
        dispatch(loadPersistedCurrencies(persistedCurrencies));
      }
    };
    
    loadCurrencies();
  }, [dispatch]);

  // Save currencies whenever selectedCurrencies changes
  useEffect(() => {
    if (selectedCurrencies.length > 0) {
      saveSelectedCurrencies(selectedCurrencies);
    }
  }, [selectedCurrencies]);

  // Auto-focus on the first currency when currencies are available
  useEffect(() => {
    if (selectedCurrencies.length > 0 && !activeField) {
      const firstCurrency = selectedCurrencies[0];
      setActiveField(firstCurrency.code);
      
      // Initialize field value
      const numValue = parseFloat(firstCurrency.value);
      setFieldValues({
        [firstCurrency.code]: numValue === 0 ? '' : trimToTwoDecimals(firstCurrency.value)
      });
    }
  }, [selectedCurrencies, activeField]);

  // Get exchange rates for selected currencies
  const currencyCodes = selectedCurrencies.map(c => c.code);
  const { 
    data: ratesData, 
    isLoading, 
    refetch,
    error 
  } = useGetSpecificRatesQuery(
    { 
      base: inputCurrency || baseCurrency, 
      targets: currencyCodes.filter(code => code !== (inputCurrency || baseCurrency))
    },
    { 
      skip: !inputCurrency && !inputAmount,
      refetchOnMountOrArgChange: true 
    }
  );

  // Calculate exchange rates when input changes
  useEffect(() => {
    if (inputCurrency && inputAmount && ratesData?.rates && parseFloat(inputAmount) > 0) {
      const amount = parseFloat(inputAmount);
      
      selectedCurrencies.forEach(currency => {
        if (currency.code === inputCurrency) {
          const trimmedValue = trimToTwoDecimals(inputAmount);
          dispatch(updateCurrencyValue({ code: currency.code, value: trimmedValue }));
        } else {
          const rate = ratesData.rates[currency.code];
          if (rate) {
            const convertedValue = trimToTwoDecimals(amount * rate);
            dispatch(updateCurrencyValue({ code: currency.code, value: convertedValue }));
          }
        }
      });

      dispatch(setLastUpdated(Date.now()));
    }
  }, [inputCurrency, inputAmount, ratesData, dispatch, selectedCurrencies]);

  // Calculate values for newly added currencies based on existing non-zero values
  useEffect(() => {
    const currenciesWithValues = selectedCurrencies.filter(c => parseFloat(c.value) > 0);
    const currenciesWithZero = selectedCurrencies.filter(c => parseFloat(c.value) === 0);
    
    // If we have currencies with values and currencies with zero values, convert them
    if (currenciesWithValues.length > 0 && currenciesWithZero.length > 0 && ratesData?.rates) {
      const referenceCurrency = currenciesWithValues[0];
      const referenceAmount = parseFloat(referenceCurrency.value);
      
      // Set the reference currency as the input currency temporarily
      if (!inputCurrency || inputAmount === '0') {
        setInputCurrency(referenceCurrency.code);
        setInputAmount(referenceCurrency.value);
      }
      
      // Convert zero-value currencies
      currenciesWithZero.forEach(currency => {
        if (currency.code !== referenceCurrency.code) {
          const rate = ratesData.rates[currency.code];
          if (rate) {
            const convertedValue = trimToTwoDecimals(referenceAmount * rate);
            dispatch(updateCurrencyValue({ code: currency.code, value: convertedValue }));
          }
        }
      });
    }
  }, [selectedCurrencies.length, ratesData, dispatch]); // Only trigger when currencies are added/removed

  const handleValueChange = useCallback((code: string, value: string) => {
    setInputCurrency(code);
    setInputAmount(value);
    
    // Clear other currencies if input is empty
    if (!value || value === '0') {
      selectedCurrencies.forEach(currency => {
        dispatch(updateCurrencyValue({ code: currency.code, value: '0' }));
      });
      setInputCurrency(null);
      setInputAmount('0');
    }
  }, [dispatch, selectedCurrencies]);

  const handleRemoveCurrency = useCallback((code: string) => {
    if (selectedCurrencies.length <= 2) {
      Alert.alert('Minimum Currencies', 'You need at least 2 currencies for conversion.');
      return;
    }
    dispatch(removeCurrency(code));
  }, [dispatch, selectedCurrencies.length]);

  const handleFieldFocus = useCallback((currencyCode: string) => {
    setActiveField(currencyCode);
    // Initialize field value if not exists
    const currentCurrency = selectedCurrencies.find(c => c.code === currencyCode);
    if (currentCurrency) {
      const numValue = parseFloat(currentCurrency.value);
      setFieldValues(prev => ({
        ...prev,
        [currencyCode]: numValue === 0 ? '' : trimToTwoDecimals(currentCurrency.value)
      }));
    }
  }, [selectedCurrencies]);

  const handleKeyboardInput = useCallback((key: string) => {
    if (!activeField) return;

    setFieldValues(prev => {
      const currentValue = prev[activeField] || '';
      let newValue = currentValue;

      if (key === '⌫') {
        // Backspace
        newValue = currentValue.slice(0, -1);
      } else if (key === '.') {
        // Decimal point - only allow one
        if (!currentValue.includes('.')) {
          newValue = currentValue + '.';
        }
      } else {
        // Numbers
        newValue = currentValue + key;
      }

      // Validate the new value
      if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
        // Update the currency value
        handleValueChange(activeField, newValue);
        return { ...prev, [activeField]: newValue };
      }
      
      return prev;
    });
  }, [activeField, handleValueChange]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to refresh rates:', error);
    }
    setRefreshing(false);
  }, [refetch]);

  const renderCurrencyItem = ({ item }: { item: Currency }) => (
    <CurrencyItem 
      currency={item}
      onValueChange={handleValueChange}
      onRemove={handleRemoveCurrency}
      onFocus={handleFieldFocus}
      isCalculating={isLoading}
      isActive={activeField === item.code}
      currentValue={fieldValues[item.code]}
      theme={theme}
      styles={styles}
    />
  );

  const getLastUpdatedText = () => {
    if (!lastUpdated) return 'Never updated';
    
    const now = Date.now();
    const diff = now - lastUpdated;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just updated';
    if (minutes < 60) return `Updated ${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    return `Updated ${hours}h ago`;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusRow}>
          <Text style={styles.lastUpdated}>{getLastUpdatedText()}</Text>
          {error && (
            <Text style={styles.errorText}>Failed to load rates</Text>
          )}
        </View>
      </View>

      <FlatList
        data={selectedCurrencies}
        renderItem={renderCurrencyItem}
        keyExtractor={(item) => item.code}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowCurrencySelector(true)}
      >
        <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
        <Text style={styles.addButtonText}>Add Currency</Text>
      </TouchableOpacity>

      <PermanentKeyboard 
        onKeyPress={handleKeyboardInput}
        theme={theme}
      />

      <CurrencySelector
        visible={showCurrencySelector}
        onClose={() => setShowCurrencySelector(false)}
      />
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdated: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  currencyItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 3,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  currencyFlag: {
    fontSize: 18,
    marginRight: 6,
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
    marginRight: 6,
    minWidth: 40,
  },
  removeButton: {
    marginLeft: 6,
    padding: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    position: 'relative',
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginRight: 6,
  },
  currencyInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    paddingVertical: 4,
  },
  currencyInputTouchable: {
    justifyContent: 'center',
    minHeight: 28,
  },
  currencyInputText: {
    fontSize: 18,
    fontWeight: '600',
  },
  cursor: {
    fontSize: 20,
    fontWeight: '300',
  },
  inputFocused: {
    backgroundColor: theme.colors.primary + '20',
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: 8,
  },
});