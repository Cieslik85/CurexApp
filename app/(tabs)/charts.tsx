import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator, Modal, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

// Currency flag mapping
const CURRENCY_FLAGS: Record<string, string> = {
  'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'JPY': '🇯🇵', 'AUD': '🇦🇺', 'CAD': '🇨🇦', 'CHF': '🇨🇭',
  'CNY': '🇨🇳', 'SEK': '🇸🇪', 'NZD': '🇳🇿', 'MXN': '🇲🇽', 'SGD': '🇸🇬', 'HKD': '🇭🇰', 'NOK': '🇳🇴',
  'TRY': '🇹🇷', 'RUB': '🇷🇺', 'INR': '🇮🇳', 'BRL': '🇧🇷', 'ZAR': '🇿🇦', 'PLN': '🇵🇱', 'DKK': '🇩🇰',
  'CZK': '🇨🇿', 'HUF': '🇭🇺', 'RON': '🇷🇴', 'BGN': '🇧🇬', 'HRK': '🇭🇷', 'ISK': '🇮🇸', 'THB': '🇹🇭'
};

const getCurrencyFlag = (currencyCode: string): string => {
  return CURRENCY_FLAGS[currencyCode] || '🏳️';
};

// Popular currency pairs for quick access
const POPULAR_PAIRS = [
  { from: 'USD', to: 'EUR' },
  { from: 'USD', to: 'GBP' },
  { from: 'EUR', to: 'GBP' },
  { from: 'USD', to: 'JPY' },
  { from: 'GBP', to: 'EUR' },
  { from: 'USD', to: 'CAD' }
];

interface HistoricalRate {
  date: string;
  rate: number;
}

interface CurrencyPair {
  from: string;
  to: string;
}

export default function ChartsScreen() {
  const { selectedCurrencies, baseCurrency } = useSelector((state: RootState) => state.currency);
  const { theme } = useTheme();
  const [selectedPair, setSelectedPair] = useState<CurrencyPair | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalRate[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(false);
  const [showPairModal, setShowPairModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentPairs, setRecentPairs] = useState<CurrencyPair[]>([]);

  // Initialize with first available currency pair
  useEffect(() => {
    if (selectedCurrencies.length >= 2 && !selectedPair) {
      setSelectedPair({
        from: selectedCurrencies[0].code,
        to: selectedCurrencies[1].code
      });
    }
  }, [selectedCurrencies, selectedPair]);

  // Get all possible currency pairs
  const getAllPossiblePairs = (): CurrencyPair[] => {
    const pairs: CurrencyPair[] = [];
    for (let i = 0; i < selectedCurrencies.length; i++) {
      for (let j = 0; j < selectedCurrencies.length; j++) {
        if (i !== j) {
          pairs.push({
            from: selectedCurrencies[i].code,
            to: selectedCurrencies[j].code
          });
        }
      }
    }
    return pairs;
  };

  // Filter pairs based on search query
  const getFilteredPairs = (): CurrencyPair[] => {
    const allPairs = getAllPossiblePairs();
    if (!searchQuery) return allPairs;
    
    return allPairs.filter(pair => 
      pair.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pair.to.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Get popular pairs that are available
  const getAvailablePopularPairs = (): CurrencyPair[] => {
    const availableCodes = selectedCurrencies.map(c => c.code);
    return POPULAR_PAIRS.filter(pair => 
      availableCodes.includes(pair.from) && availableCodes.includes(pair.to)
    );
  };

  // Handle pair selection
  const handlePairSelect = (pair: CurrencyPair) => {
    setSelectedPair(pair);
    setShowPairModal(false);
    setSearchQuery('');
    
    // Add to recent pairs
    setRecentPairs(prev => {
      const filtered = prev.filter(p => !(p.from === pair.from && p.to === pair.to));
      return [pair, ...filtered].slice(0, 5); // Keep only 5 recent pairs
    });
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
    if (!selectedPair) return;

    setLoading(true);
    
    // Simulate API call delay
    const timeout = setTimeout(() => {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const mockData = generateMockData(days);
      setHistoricalData(mockData);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [selectedPair, timeRange]);

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
          
          {/* Currency Pair Selector */}
          <View style={styles.pairSelector}>
            <TouchableOpacity 
              style={styles.pairButton}
              onPress={() => setShowPairModal(true)}
            >
              <View style={styles.pairButtonContent}>
                <View style={styles.pairFlags}>
                  <Text style={styles.flagText}>{getCurrencyFlag(selectedPair?.from || '')}</Text>
                  <Text style={styles.flagText}>{getCurrencyFlag(selectedPair?.to || '')}</Text>
                </View>
                <Text style={styles.pairText}>
                  {selectedPair?.from} → {selectedPair?.to}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={16} color="#007AFF" />
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
            This chart shows the historical exchange rate between {selectedPair?.from} and {selectedPair?.to} over the selected time period. 
            The data is updated regularly and shows market fluctuations.
          </Text>
        </View>
      </ScrollView>

      {/* Currency Pair Selection Modal */}
      <Modal
        visible={showPairModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPairModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPairModal(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Currency Pair</Text>
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
            {/* Popular Pairs */}
            {getAvailablePopularPairs().length > 0 && searchQuery === '' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Popular Pairs</Text>
                {getAvailablePopularPairs().map((pair, index) => (
                  <TouchableOpacity
                    key={`popular-${index}`}
                    style={styles.pairOption}
                    onPress={() => handlePairSelect(pair)}
                  >
                    <View style={styles.pairOptionContent}>
                      <View style={styles.pairOptionFlags}>
                        <Text style={styles.pairOptionFlag}>{getCurrencyFlag(pair.from)}</Text>
                        <Text style={styles.pairOptionFlag}>{getCurrencyFlag(pair.to)}</Text>
                      </View>
                      <Text style={styles.pairOptionText}>{pair.from} → {pair.to}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#ccc" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Recent Pairs */}
            {recentPairs.length > 0 && searchQuery === '' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent</Text>
                {recentPairs.map((pair, index) => (
                  <TouchableOpacity
                    key={`recent-${index}`}
                    style={styles.pairOption}
                    onPress={() => handlePairSelect(pair)}
                  >
                    <View style={styles.pairOptionContent}>
                      <View style={styles.pairOptionFlags}>
                        <Text style={styles.pairOptionFlag}>{getCurrencyFlag(pair.from)}</Text>
                        <Text style={styles.pairOptionFlag}>{getCurrencyFlag(pair.to)}</Text>
                      </View>
                      <Text style={styles.pairOptionText}>{pair.from} → {pair.to}</Text>
                    </View>
                    <Ionicons name="time" size={16} color="#ccc" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* All Available Pairs */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{searchQuery ? 'Search Results' : 'All Pairs'}</Text>
              <FlatList
                data={getFilteredPairs()}
                keyExtractor={(item, index) => `${item.from}-${item.to}-${index}`}
                renderItem={({ item: pair }) => (
                  <TouchableOpacity
                    style={styles.pairOption}
                    onPress={() => handlePairSelect(pair)}
                  >
                    <View style={styles.pairOptionContent}>
                      <View style={styles.pairOptionFlags}>
                        <Text style={styles.pairOptionFlag}>{getCurrencyFlag(pair.from)}</Text>
                        <Text style={styles.pairOptionFlag}>{getCurrencyFlag(pair.to)}</Text>
                      </View>
                      <Text style={styles.pairOptionText}>{pair.from} → {pair.to}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#ccc" />
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            </View>
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
  pairSelector: {
    marginBottom: 16,
  },
  pairButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pairButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pairFlags: {
    flexDirection: 'row',
    marginRight: 12,
  },
  flagText: {
    fontSize: 20,
    marginRight: 4,
  },
  pairText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
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
  pairOption: {
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
  pairOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pairOptionFlags: {
    flexDirection: 'row',
    marginRight: 12,
  },
  pairOptionFlag: {
    fontSize: 18,
    marginRight: 4,
  },
  pairOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
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