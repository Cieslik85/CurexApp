import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  SectionList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { Currency, addCurrency } from '@/store/slices/currencySlice';
import { POPULAR_CURRENCIES } from '@/utils/currency';

interface CurrencySelectorProps {
  visible: boolean;
  onClose: () => void;
}

export function CurrencySelector({ visible, onClose }: CurrencySelectorProps) {
  const dispatch = useDispatch();
  const { availableCurrencies, selectedCurrencies } = useSelector(
    (state: RootState) => state.currency
  );
  
  const [searchQuery, setSearchQuery] = useState('');

  // Filter available currencies excluding already selected ones
  const availableToAdd = availableCurrencies.filter(
    currency => !selectedCurrencies.find(selected => selected.code === currency.code)
  );

  // Create sections for popular and other currencies
  const currencySections = useMemo(() => {
    let filteredCurrencies = availableToAdd;

    // Filter based on search query if there is one
    if (searchQuery.trim()) {
      filteredCurrencies = availableToAdd.filter(
        currency =>
          currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          currency.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      // If searching, return as a single flat list
      return [{ title: 'Search Results', data: filteredCurrencies }];
    }

    // Separate popular and other currencies
    const popularCodes = POPULAR_CURRENCIES.map(c => c.code);
    const popular = filteredCurrencies.filter(currency => 
      popularCodes.includes(currency.code)
    );
    const others = filteredCurrencies.filter(currency => 
      !popularCodes.includes(currency.code)
    );

    const sections = [];
    if (popular.length > 0) {
      sections.push({ title: 'Popular Currencies', data: popular });
    }
    if (others.length > 0) {
      sections.push({ title: 'All Currencies', data: others });
    }

    return sections;
  }, [availableToAdd, searchQuery]);

  const handleSelectCurrency = (currency: Currency) => {
    dispatch(addCurrency({ ...currency, value: '0' }));
    onClose();
    setSearchQuery('');
  };

  const renderCurrencyItem = ({ item }: { item: Currency }) => (
    <TouchableOpacity
      style={styles.currencyItem}
      onPress={() => handleSelectCurrency(item)}
    >
      <View style={styles.currencyInfo}>
        <Text style={styles.currencyCode}>{item.code}</Text>
        <Text style={styles.currencyName}>{item.name}</Text>
      </View>
      <Text style={styles.currencySymbol}>{item.symbol}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Currency</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search currencies..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="characters"
          />
        </View>

        <SectionList
          sections={currencySections}
          renderItem={renderCurrencyItem}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
          keyExtractor={(item) => item.code}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
        />

        {currencySections.every(section => section.data.length === 0) && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No currencies found' : 'All currencies are already added'}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContent: {
    padding: 16,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  currencyName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
  sectionHeader: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
});