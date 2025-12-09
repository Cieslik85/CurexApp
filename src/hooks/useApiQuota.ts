import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { updateApiQuota } from '@/store/slices/currencySlice';
import { getQuotaUsage } from '@/store/services/exchangeRateApi';

export const useApiQuota = () => {
  const dispatch = useDispatch();
  const apiQuota = useSelector((state: RootState) => state.currency.apiQuota);
  const [isLoading, setIsLoading] = useState(false);

  // Check and update quota on mount
  useEffect(() => {
    const updateQuota = async () => {
      setIsLoading(true);
      try {
        const quotaData = await getQuotaUsage();
        dispatch(updateApiQuota({
          used: quotaData.today,
          limit: 48, // Daily limit
        }));
      } catch (error) {
        console.error('Failed to update quota:', error);
      } finally {
        setIsLoading(false);
      }
    };

    updateQuota();
  }, [dispatch]);

  const isNearLimit = apiQuota.dailyUsed >= apiQuota.dailyLimit * 0.8; // 80% of limit
  const isAtLimit = apiQuota.dailyUsed >= apiQuota.dailyLimit;
  const remainingRequests = Math.max(0, apiQuota.dailyLimit - apiQuota.dailyUsed);
  const usagePercentage = Math.round((apiQuota.dailyUsed / apiQuota.dailyLimit) * 100);

  // Calculate days until monthly reset (9th of each month)
  const getDaysUntilReset = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Next reset date (9th of current month or next month)
    let resetDate = new Date(currentYear, currentMonth, 9);
    if (now.getDate() >= 9) {
      // If we're past the 9th, next reset is next month
      resetDate = new Date(currentYear, currentMonth + 1, 9);
    }
    
    const timeDiff = resetDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const daysUntilReset = getDaysUntilReset();

  return {
    quota: apiQuota,
    isLoading,
    isNearLimit,
    isAtLimit,
    remainingRequests,
    usagePercentage,
    daysUntilReset,
    
    // Helper function to check if a request can be made
    canMakeRequest: () => !isAtLimit,
    
    // Get smart refresh interval based on quota usage
    getOptimalRefreshInterval: () => {
      if (isAtLimit) return 24 * 60 * 60; // 24 hours if at limit
      if (isNearLimit) return 8 * 60 * 60; // 8 hours if near limit
      return 4 * 60 * 60; // 4 hours normal operation
    },
  };
};