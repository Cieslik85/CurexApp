import React, { useCallback, useEffect, useState, useRef } from 'react';
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
import DraggableFlatList, { 
  ScaleDecorator,
  RenderItemParams
} from 'react-native-draggable-flatlist';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { 
  updateCurrencyValue, 
  setLastUpdated, 
  removeCurrency,
  loadPersistedCurrencies,
  reorderCurrencies,
  Currency 
} from '@/store/slices/currencySlice';
import { useInstantConverter } from '@/hooks/useCurrencyConverter';
import { useGetAllMajorRatesQuery } from '@/store/services/exchangeRateApi';
import { CurrencySelector } from './CurrencySelector';
import { useTheme } from '@/contexts/ThemeContext';
import { saveSelectedCurrencies, loadSelectedCurrencies } from '@/utils/currencyPersistence';
import { getCurrencyFlag } from '@/utils/currencyFlags';

// Permanent keyboard interface
interface PermanentKeyboardProps {
  onKeyPress: (key: string) => void;
  theme: any;
}

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
  drag?: () => void;
  isBeingDragged?: boolean;
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
  styles,
  drag,
  isBeingDragged
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
    <View style={[
      styles.currencyItem,
      isBeingDragged && { opacity: 0.8, elevation: 8, shadowOpacity: 0.3 }
    ]}>
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          onPressIn={drag}
          style={styles.dragHandle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
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
  const [freshlyFocused, setFreshlyFocused] = useState<boolean>(false);
  const conversionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use instant converter for real-time calculations  
  const { data: allRates, isLoading: ratesLoading, error: ratesError } = useGetAllMajorRatesQuery('USD', {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: true,
  });

  // Instant conversion function using cached rates
  const instantConvert = useCallback((amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount;
    if (!allRates?.rates || amount === 0) return 0;
    
    // Convert through USD as base currency
    const toUsdRate = fromCurrency === 'USD' ? 1 : (1 / (allRates.rates[fromCurrency] || 1));
    const fromUsdRate = toCurrency === 'USD' ? 1 : (allRates.rates[toCurrency] || 1);
    
    return Math.round((amount * toUsdRate * fromUsdRate) * 10000) / 10000;
  }, [allRates]);

  // Manual refresh function
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Force a small delay to show refresh indicator, then update timestamp
    setTimeout(() => {
      dispatch(setLastUpdated(Date.now()));
      setRefreshing(false);
    }, 500);
  }, [dispatch]);

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

  // Calculate values for newly added currencies based on existing non-zero values
  useEffect(() => {
    const currenciesWithValues = selectedCurrencies.filter(c => parseFloat(c.value) > 0);
    const currenciesWithZero = selectedCurrencies.filter(c => parseFloat(c.value) === 0);
    
    // If we have currencies with values and currencies with zero values, convert them
    if (currenciesWithValues.length > 0 && currenciesWithZero.length > 0) {
      const referenceCurrency = currenciesWithValues[0];
      const referenceAmount = parseFloat(referenceCurrency.value);
      
      // Set the reference currency as the input currency temporarily
      if (!inputCurrency || inputAmount === '0') {
        setInputCurrency(referenceCurrency.code);
        setInputAmount(referenceCurrency.value);
      }
      
      // Convert zero-value currencies instantly
      currenciesWithZero.forEach(currency => {
        if (currency.code !== referenceCurrency.code) {
          const convertedValue = instantConvert(referenceAmount, referenceCurrency.code, currency.code);
          const trimmedConvertedValue = trimToTwoDecimals(convertedValue.toString());
          dispatch(updateCurrencyValue({ code: currency.code, value: trimmedConvertedValue }));
        }
      });
    }
  }, [selectedCurrencies.length, instantConvert, dispatch]); // Only trigger when currencies are added/removed

  const handleValueChange = useCallback((code: string, value: string) => {
    // Set this as the input currency
    setInputCurrency(code);
    setInputAmount(value);
    
    const amount = parseFloat(value) || 0;
    
    // Update all currencies including the active one
    selectedCurrencies.forEach(currency => {
      if (currency.code === code) {
        // Update the input currency directly
        dispatch(updateCurrencyValue({ code: currency.code, value: value || '0' }));
      } else if (amount > 0) {
        // Instantly convert to other currencies
        const convertedValue = instantConvert(amount, code, currency.code);
        const trimmedValue = trimToTwoDecimals(convertedValue.toString());
        dispatch(updateCurrencyValue({ code: currency.code, value: trimmedValue }));
      } else {
        // Clear other currencies if input is empty/zero
        dispatch(updateCurrencyValue({ code: currency.code, value: '0' }));
      }
    });
    
    dispatch(setLastUpdated(Date.now()));
  }, [dispatch, selectedCurrencies, instantConvert]);

  const handleRemoveCurrency = useCallback((code: string) => {
    if (selectedCurrencies.length <= 2) {
      Alert.alert('Minimum Currencies', 'You need at least 2 currencies for conversion.');
      return;
    }
    dispatch(removeCurrency(code));
  }, [dispatch, selectedCurrencies.length]);

  const handleFieldFocus = useCallback((currencyCode: string) => {
    setActiveField(currencyCode);
    setFreshlyFocused(true);
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

    const currentValue = fieldValues[activeField] || '';
    let newValue = currentValue;

    if (key === '⌫') {
      // Backspace
      newValue = currentValue.slice(0, -1);
      setFreshlyFocused(false);
    } else if (key === '.') {
      // Decimal point - only allow one
      if (freshlyFocused) {
        // If freshly focused, replace with just the decimal
        newValue = '0.';
        setFreshlyFocused(false);
      } else if (!currentValue.includes('.')) {
        newValue = currentValue + '.';
      }
    } else {
      // Numbers
      if (freshlyFocused) {
        // If freshly focused, replace the entire value
        newValue = key;
        setFreshlyFocused(false);
      } else {
        newValue = currentValue + key;
      }
    }

    // Validate the new value
    if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
      // Immediately update local state for instant feedback
      setFieldValues(prev => ({ ...prev, [activeField]: newValue }));
      // Update Redux (with debounced conversions)
      handleValueChange(activeField, newValue);
    }
  }, [activeField, fieldValues, handleValueChange, freshlyFocused]);

  const renderCurrencyItem = ({ item, drag, isActive: isDragging }: RenderItemParams<Currency>) => (
    <ScaleDecorator>
      <CurrencyItem 
        currency={item}
        onValueChange={handleValueChange}
        onRemove={handleRemoveCurrency}
        onFocus={handleFieldFocus}
        isCalculating={ratesLoading}
        isActive={activeField === item.code}
        currentValue={fieldValues[item.code]}
        theme={theme}
        styles={styles}
        drag={drag}
        isBeingDragged={isDragging}
      />
    </ScaleDecorator>
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
  
  const handleDragEnd = ({ data }: { data: Currency[] }) => {
    dispatch(reorderCurrencies(data));
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusRow}>
          <Text style={styles.lastUpdated}>{getLastUpdatedText()}</Text>
          {ratesError && (
            <Text style={styles.errorText}>Failed to load rates</Text>
          )}
        </View>
      </View>

      <View style={styles.contentContainer}>
        <DraggableFlatList
          data={selectedCurrencies}
          renderItem={renderCurrencyItem}
          keyExtractor={(item) => item.code}
          onDragEnd={handleDragEnd}
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
      </View>

      <View style={styles.bottomSection}>
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
      </View>

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
  contentContainer: {
    flex: 1,
  },
  bottomSection: {
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
  dragHandle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
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