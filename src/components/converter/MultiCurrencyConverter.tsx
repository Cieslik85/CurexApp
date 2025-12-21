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
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { 
  updateCurrencyValue, 
  setLastUpdated, 
  removeCurrency,
  Currency 
} from '@/store/slices/currencySlice';
import { useGetSpecificRatesQuery } from '@/store/services/exchangeRateApi';
import { CurrencySelector } from './CurrencySelector';
import { useTheme } from '@/contexts/ThemeContext';

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

interface CurrencyItemProps {
  currency: Currency;
  onValueChange: (code: string, value: string) => void;
  onRemove: (code: string) => void;
  isCalculating: boolean;
  theme: any;
  styles: any;
}

const CurrencyItem: React.FC<CurrencyItemProps> = ({ 
  currency, 
  onValueChange, 
  onRemove,
  isCalculating,
  theme,
  styles
}) => {
  const [localValue, setLocalValue] = useState(currency.value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(currency.value);
    }
  }, [currency.value, isFocused]);

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

  return (
    <View style={styles.currencyItem}>
      <View style={styles.inputContainer}>
        <Text style={styles.currencyFlag}>{getCurrencyFlag(currency.code)}</Text>
        <Text style={styles.currencyCode}>{currency.code}</Text>
        <Text style={styles.currencySymbol}>{currency.symbol}</Text>
        <TextInput
          style={[styles.currencyInput, isFocused && styles.inputFocused]}
          value={isFocused ? localValue : formatDisplayValue(currency.value)}
          onChangeText={handleValueChange}
          onFocus={() => {
            setIsFocused(true);
            setLocalValue(currency.value);
          }}
          onBlur={() => setIsFocused(false)}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor={theme.colors.textSecondary}
          editable={!isCalculating}
        />
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

export function MultiCurrencyConverter() {
  const dispatch = useDispatch();
  const { selectedCurrencies, baseCurrency, lastUpdated } = useSelector((state: RootState) => state.currency);
  const { theme } = useTheme();
  
  const [inputCurrency, setInputCurrency] = useState<string | null>(null);
  const [inputAmount, setInputAmount] = useState<string>('0');
  const [refreshing, setRefreshing] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);

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
          dispatch(updateCurrencyValue({ code: currency.code, value: inputAmount }));
        } else {
          const rate = ratesData.rates[currency.code];
          if (rate) {
            const convertedValue = (amount * rate).toString();
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
            const convertedValue = (referenceAmount * rate).toString();
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
      isCalculating={isLoading}
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
        <Text style={styles.title}>Multi-Currency Converter</Text>
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
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
    paddingBottom: 80,
  },
  currencyItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  currencyFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    marginRight: 8,
    minWidth: 45,
  },
  removeButton: {
    marginLeft: 8,
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    position: 'relative',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginRight: 8,
  },
  currencyInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    paddingVertical: 8,
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