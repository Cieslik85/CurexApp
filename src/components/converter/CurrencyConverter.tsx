import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function CurrencyConverter() {
  const [fromAmount, setFromAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [convertedAmount, setConvertedAmount] = useState('0.85');

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>From</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.amountInput}
            value={fromAmount}
            onChangeText={setFromAmount}
            keyboardType="numeric"
            placeholder="0"
          />
          <TouchableOpacity style={styles.currencyButton}>
            <Text style={styles.currencyText}>{fromCurrency}</Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.swapButton} onPress={swapCurrencies}>
        <Ionicons name="swap-vertical" size={24} color="#007AFF" />
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>To</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.amountInput, styles.resultInput]}
            value={convertedAmount}
            editable={false}
          />
          <TouchableOpacity style={styles.currencyButton}>
            <Text style={styles.currencyText}>{toCurrency}</Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.rateInfo}>
        1 {fromCurrency} = 0.85 {toCurrency}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  inputContainer: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  resultInput: {
    color: '#007AFF',
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
  swapButton: {
    alignSelf: 'center',
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 24,
    marginVertical: 8,
  },
  rateInfo: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 16,
  },
});