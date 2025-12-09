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
import { useGetMultipleCurrencyRatesQuery } from '@/store/services/exchangeRateApi';
import { CurrencySelector } from './CurrencySelector';

interface CurrencyItemProps {
  currency: Currency;
  onValueChange: (code: string, value: string) => void;
  onRemove: (code: string) => void;
  isCalculating: boolean;
}

const CurrencyItem: React.FC<CurrencyItemProps> = ({ 
  currency, 
  onValueChange, 
  onRemove,
  isCalculating 
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
    if (!value || value === '0') return '0';
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    
    // Format with appropriate decimal places
    if (num >= 1000) {
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return num.toFixed(4).replace(/\.?0+$/, '');
  };

  return (
    <View style={styles.currencyItem}>
      <View style={styles.currencyHeader}>
        <View style={styles.currencyInfo}>
          <Text style={styles.currencyCode}>{currency.code}</Text>
          <Text style={styles.currencyName}>{currency.name}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => onRemove(currency.code)}
          style={styles.removeButton}
        >
          <Ionicons name="close-circle" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputContainer}>
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
          placeholder="0"
          placeholderTextColor="#999"
          editable={!isCalculating}
        />
        {isCalculating && (
          <ActivityIndicator size="small" color="#007AFF" style={styles.loadingIndicator} />
        )}
      </View>
    </View>
  );
};

export function MultiCurrencyConverter() {
  const dispatch = useDispatch();
  const { selectedCurrencies, baseCurrency, lastUpdated } = useSelector((state: RootState) => state.currency);
  
  const [inputCurrency, setInputCurrency] = useState<string | null>(null);
  const [inputAmount, setInputAmount] = useState<string>('0');
  const [refreshing, setRefreshing] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);

  // Get exchange rates for selected currencies
  const currencyCodes = selectedCurrencies.map(c => c.code);
  const { 
    data: ratesData, 
    isLoading, 
    refetch,
    error 
  } = useGetMultipleCurrencyRatesQuery(
    { 
      base: inputCurrency || baseCurrency, 
      symbols: currencyCodes.filter(code => code !== (inputCurrency || baseCurrency))
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
            tintColor="#007AFF"
          />
        }
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowCurrencySelector(true)}
      >
        <Ionicons name="add-circle" size={24} color="#007AFF" />
        <Text style={styles.addButtonText}>Add Currency</Text>
      </TouchableOpacity>

      <CurrencySelector
        visible={showCurrencySelector}
        onClose={() => setShowCurrencySelector(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666',
  },
  errorText: {
    fontSize: 12,
    color: '#ff4444',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 80,
  },
  currencyItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  currencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  currencyName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'relative',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 8,
  },
  currencyInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    paddingVertical: 8,
  },
  inputFocused: {
    backgroundColor: '#e6f3ff',
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
});