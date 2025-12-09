import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useApiQuota } from '@/hooks/useApiQuota';

export function ApiQuotaStatus() {
  const { 
    quota, 
    isLoading, 
    isNearLimit, 
    isAtLimit, 
    remainingRequests, 
    usagePercentage, 
    daysUntilReset 
  } = useApiQuota();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading quota info...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.quotaBar}>
        <View 
          style={[
            styles.quotaFill, 
            { 
              width: `${usagePercentage}%`,
              backgroundColor: isAtLimit ? '#FF3B30' : isNearLimit ? '#FF9500' : '#34C759'
            }
          ]} 
        />
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>
          API Usage: {quota.dailyUsed}/{quota.dailyLimit} ({usagePercentage}%)
        </Text>
        <Text style={styles.infoText}>
          Remaining: {remainingRequests}
        </Text>
      </View>
      
      <Text style={styles.resetText}>
        Monthly reset in {daysUntilReset} days (9th of month)
      </Text>
      
      {isAtLimit && (
        <Text style={styles.warningText}>
          ⚠️ Daily quota exceeded - using cached data only
        </Text>
      )}
      
      {isNearLimit && !isAtLimit && (
        <Text style={styles.cautionText}>
          ⚠️ Approaching daily limit - limited updates
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quotaBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  quotaFill: {
    height: '100%',
    borderRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  resetText: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
  },
  warningText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
    marginTop: 4,
  },
  cautionText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '600',
    marginTop: 4,
  },
  loadingText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});