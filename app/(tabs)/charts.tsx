import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator, Modal, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { ALL_CURRENCIES } from '@/utils/currency';
import { getCurrencyFlag } from '@/utils/currencyFlags';

const { width: screenWidth } = Dimensions.get('window');

interface HistoricalRate {
  date: string;
  rate: number;
}

export default function ChartsScreen() {
  const { selectedCurrencies, baseCurrency } = useSelector((state: RootState) => state.currency);
  const { theme } = useTheme();
  const [fromCurrency, setFromCurrency] = useState<string>('');
  const [toCurrency, setToCurrency] = useState<string>('');
  const [historicalData, setHistoricalData] = useState<HistoricalRate[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(false);
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize with first available currencies
  useEffect(() => {
    if (selectedCurrencies.length >= 2) {
      if (!fromCurrency) setFromCurrency(selectedCurrencies[0].code);
      if (!toCurrency) setToCurrency(selectedCurrencies[1].code);
    }
  }, [selectedCurrencies, fromCurrency, toCurrency]);

  // Get organized currencies for selection (selected ones first, then all others)
  const getOrganizedCurrencies = () => {
    const selectedCodes = selectedCurrencies.map(c => c.code);
    
    // Filter all currencies based on search query
    const filteredAll = ALL_CURRENCIES.filter(currency => {
      if (!searchQuery) return true;
      return currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
             currency.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
    
    // Split into selected and other currencies
    const selectedFiltered = filteredAll.filter(currency => 
      selectedCodes.includes(currency.code)
    );
    
    const otherFiltered = filteredAll.filter(currency => 
      !selectedCodes.includes(currency.code)
    );
    
    return {
      selected: selectedFiltered,
      others: otherFiltered,
      all: [...selectedFiltered, ...otherFiltered]
    };
  };

  // Handle currency selection
  const handleFromCurrencySelect = (currencyCode: string) => {
    setFromCurrency(currencyCode);
    setShowFromModal(false);
    setSearchQuery('');
  };

  const handleToCurrencySelect = (currencyCode: string) => {
    setToCurrency(currencyCode);
    setShowToModal(false);
    setSearchQuery('');
  };

  // Swap currencies
  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  // Generate mock historical data for demonstration
  const generateMockData = (days: number): HistoricalRate[] => {
    const data: HistoricalRate[] = [];
    const baseRate = 1 + Math.random() * 2; // Random base rate between 1-3
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic fluctuation around base rate
      const fluctuation = (Math.random() - 0.5) * 0.1 * baseRate; // ±10% fluctuation
      const rate = Math.max(0.01, baseRate + fluctuation + (Math.sin(i / 10) * 0.05 * baseRate));
      
      data.push({
        date: date.toISOString().split('T')[0],
        rate: parseFloat(rate.toFixed(4))
      });
    }
    return data;
  };

  // Fetch historical data (mock implementation)
  useEffect(() => {
    if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return;

    setLoading(true);
    
    // Simulate API call delay
    const timeout = setTimeout(() => {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const mockData = generateMockData(days);
      setHistoricalData(mockData);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [fromCurrency, toCurrency, timeRange]);

  const getChartData = () => {
    if (historicalData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }]
      };
    }

    // Sample data points to fit screen
    const sampleSize = timeRange === '7d' ? 7 : timeRange === '30d' ? 15 : timeRange === '90d' ? 18 : 24;
    const step = Math.max(1, Math.floor(historicalData.length / sampleSize));
    const sampledData = historicalData.filter((_, index) => index % step === 0);

    return {
      labels: sampledData.map(item => {
        const date = new Date(item.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [{
        data: sampledData.map(item => item.rate),
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 4,
    propsForLabels: {
      fontSize: 10,
    },
    propsForVerticalLabels: {
      fontSize: 8,
    },
    style: {
      borderRadius: 16
    }
  };

  const getCurrentRate = (): string => {
    if (historicalData.length === 0) return '0.0000';
    return historicalData[historicalData.length - 1].rate.toFixed(4);
  };

  const getRateChange = (): { change: string; percentage: string; isPositive: boolean } => {
    if (historicalData.length < 2) return { change: '0.0000', percentage: '0.00', isPositive: true };
    
    const latest = historicalData[historicalData.length - 1].rate;
    const previous = historicalData[historicalData.length - 2].rate;
    const change = latest - previous;
    const percentage = ((change / previous) * 100);
    
    return {
      change: change.toFixed(4),
      percentage: Math.abs(percentage).toFixed(2),
      isPositive: change >= 0
    };
  };

  const styles = createStyles(theme);

  if (selectedCurrencies.length < 2) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="analytics-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Currency Pairs</Text>
          <Text style={styles.emptySubtitle}>Add at least 2 currencies to view historical charts</Text>
        </View>
      </SafeAreaView>
    );
  }

  const rateChange = getRateChange();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Exchange Rate History</Text>
          
          {/* Currency Selectors */}
          <View style={styles.currencySelectorsContainer}>
            {/* From Currency */}
            <TouchableOpacity 
              style={[styles.currencyButton, styles.fromButton]}
              onPress={() => setShowFromModal(true)}
            >
              <View style={styles.currencyButtonContent}>
                <Text style={styles.currencyFlag}>{fromCurrency ? getCurrencyFlag(fromCurrency) : '🏳️'}</Text>
                <Text style={styles.currencyCode}>{fromCurrency || 'Select'}</Text>
              </View>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
            
            {/* Swap Button */}
            <TouchableOpacity 
              style={styles.swapButton} 
              onPress={swapCurrencies}
              disabled={!fromCurrency || !toCurrency}
            >
              <Ionicons name="swap-horizontal" size={20} color={!fromCurrency || !toCurrency ? "#ccc" : "#007AFF"} />
            </TouchableOpacity>
            
            {/* To Currency */}
            <TouchableOpacity 
              style={[styles.currencyButton, styles.toButton]}
              onPress={() => setShowToModal(true)}
            >
              <View style={styles.currencyButtonContent}>
                <Text style={styles.currencyFlag}>{toCurrency ? getCurrencyFlag(toCurrency) : '🏳️'}</Text>
                <Text style={styles.currencyCode}>{toCurrency || 'Select'}</Text>
              </View>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>
          {/* Current Rate Display */}
          <View style={styles.rateCard}>
            <Text style={styles.currentRate}>{getCurrentRate()}</Text>
            <View style={styles.rateChangeContainer}>
              <Ionicons 
                name={rateChange.isPositive ? "trending-up" : "trending-down"} 
                size={16} 
                color={rateChange.isPositive ? "#34c759" : "#ff3b30"} 
              />
              <Text style={[styles.rateChange, { color: rateChange.isPositive ? "#34c759" : "#ff3b30" }]}>
                {rateChange.isPositive ? '+' : '-'}{rateChange.change} ({rateChange.percentage}%)
              </Text>
            </View>
          </View>

          {/* Time Range Selector */}
          <View style={styles.timeRangeContainer}>
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <TouchableOpacity
                key={range}
                style={[styles.timeRangeButton, timeRange === range && styles.timeRangeButtonActive]}
                onPress={() => setTimeRange(range)}
              >
                <Text style={[styles.timeRangeText, timeRange === range && styles.timeRangeTextActive]}>
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading chart data...</Text>
            </View>
          ) : (
            <LineChart
              data={getChartData()}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              fromZero={false}
            />
          )}
        </View>

        {/* Chart Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>About This Chart</Text>
          <Text style={styles.infoText}>
            This chart shows the historical exchange rate between {fromCurrency || 'the selected base currency'} and {toCurrency || 'the target currency'} over the selected time period. 
            The data is updated regularly and shows market fluctuations.
          </Text>
        </View>
      </ScrollView>

      {/* From Currency Selection Modal */}
      <Modal
        visible={showFromModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFromModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFromModal(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select From Currency</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search currencies..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.modalContent}>
            {(() => {
              const organizedCurrencies = getOrganizedCurrencies();
              return (
                <>
                  {/* Selected Currencies Section */}
                  {organizedCurrencies.selected.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Your Selected Currencies</Text>
                      {organizedCurrencies.selected.map((currency, index) => (
                        <TouchableOpacity
                          key={`from-selected-${currency.code}-${index}`}
                          style={styles.currencyOption}
                          onPress={() => handleFromCurrencySelect(currency.code)}
                        >
                          <View style={styles.currencyOptionContent}>
                            <Text style={styles.currencyOptionFlag}>{getCurrencyFlag(currency.code)}</Text>
                            <View style={styles.currencyOptionText}>
                              <Text style={styles.currencyOptionCode}>{currency.code}</Text>
                              <Text style={styles.currencyOptionName}>{currency.name}</Text>
                            </View>
                          </View>
                          {fromCurrency === currency.code && (
                            <Ionicons name="checkmark" size={20} color="#007AFF" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  
                  {/* All Other Currencies Section */}
                  {organizedCurrencies.others.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>
                        {searchQuery ? 'Other Search Results' : 'All Other Currencies'}
                      </Text>
                      {organizedCurrencies.others.map((currency, index) => (
                        <TouchableOpacity
                          key={`from-other-${currency.code}-${index}`}
                          style={styles.currencyOption}
                          onPress={() => handleFromCurrencySelect(currency.code)}
                        >
                          <View style={styles.currencyOptionContent}>
                            <Text style={styles.currencyOptionFlag}>{getCurrencyFlag(currency.code)}</Text>
                            <View style={styles.currencyOptionText}>
                              <Text style={styles.currencyOptionCode}>{currency.code}</Text>
                              <Text style={styles.currencyOptionName}>{currency.name}</Text>
                            </View>
                          </View>
                          {fromCurrency === currency.code && (
                            <Ionicons name="checkmark" size={20} color="#007AFF" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </>
              );
            })()}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* To Currency Selection Modal */}
      <Modal
        visible={showToModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowToModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowToModal(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select To Currency</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search currencies..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.modalContent}>
            {(() => {
              const organizedCurrencies = getOrganizedCurrencies();
              return (
                <>
                  {/* Selected Currencies Section */}
                  {organizedCurrencies.selected.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Your Selected Currencies</Text>
                      {organizedCurrencies.selected.map((currency, index) => (
                        <TouchableOpacity
                          key={`to-selected-${currency.code}-${index}`}
                          style={styles.currencyOption}
                          onPress={() => handleToCurrencySelect(currency.code)}
                        >
                          <View style={styles.currencyOptionContent}>
                            <Text style={styles.currencyOptionFlag}>{getCurrencyFlag(currency.code)}</Text>
                            <View style={styles.currencyOptionText}>
                              <Text style={styles.currencyOptionCode}>{currency.code}</Text>
                              <Text style={styles.currencyOptionName}>{currency.name}</Text>
                            </View>
                          </View>
                          {toCurrency === currency.code && (
                            <Ionicons name="checkmark" size={20} color="#007AFF" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  
                  {/* All Other Currencies Section */}
                  {organizedCurrencies.others.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>
                        {searchQuery ? 'Other Search Results' : 'All Other Currencies'}
                      </Text>
                      {organizedCurrencies.others.map((currency, index) => (
                        <TouchableOpacity
                          key={`to-other-${currency.code}-${index}`}
                          style={styles.currencyOption}
                          onPress={() => handleToCurrencySelect(currency.code)}
                        >
                          <View style={styles.currencyOptionContent}>
                            <Text style={styles.currencyOptionFlag}>{getCurrencyFlag(currency.code)}</Text>
                            <View style={styles.currencyOptionText}>
                              <Text style={styles.currencyOptionCode}>{currency.code}</Text>
                              <Text style={styles.currencyOptionName}>{currency.name}</Text>
                            </View>
                          </View>
                          {toCurrency === currency.code && (
                            <Ionicons name="checkmark" size={20} color="#007AFF" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </>
              );
            })()}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 20,
  },
  currencySelectorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currencyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  fromButton: {
    marginRight: 8,
  },
  toButton: {
    marginLeft: 8,
  },
  currencyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyFlag: {
    fontSize: 18,
    marginRight: 8,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  swapButton: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalCancelButton: {
    fontSize: 16,
    color: theme.colors.primary,
  },
  modalHeaderSpacer: {
    width: 50,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  clearButton: {
    marginLeft: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  currencyOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencyOptionFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  currencyOptionText: {
    flex: 1,
  },
  currencyOptionCode: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  currencyOptionName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  rateCard: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
    alignItems: 'center',
  },
  currentRate: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  rateChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateChange: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  timeRangeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  timeRangeTextActive: {
    color: 'white',
  },
  chartContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  loadingContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  infoContainer: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});