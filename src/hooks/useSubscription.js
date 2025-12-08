import { useState, useEffect, useCallback } from 'react';
import { SubscriptionService } from '../services/subscriptionService';
import { useAuth } from './useAuth';

/**
 * Custom hook for subscription management
 */
export const useSubscription = () => {
  const { user, authFetch } = useAuth();
  const [subscriptionService] = useState(() => new SubscriptionService(authFetch));
  
  // Subscription state
  const [subscription, setSubscription] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [usageStats, setUsageStats] = useState(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [usageLoading, setUsageLoading] = useState(false);
  
  // Error states
  const [error, setError] = useState(null);

  const userId = user?.username;

  /**
   * Load user's subscription data
   */
  const loadSubscription = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await subscriptionService.getUserSubscription(userId);
      
      if (result.success) {
        setSubscription(result.subscription);
      } else if (result.needsSubscription) {
        setSubscription(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading subscription:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, subscriptionService]);

  /**
   * Load available plans
   */
  const loadAvailablePlans = useCallback(async () => {
    setPlansLoading(true);
    
    try {
      const result = await subscriptionService.getAvailablePlans();
      
      if (result.success) {
        setAvailablePlans(result.plans);
      } else {
        console.error('Error loading plans:', result.error);
      }
    } catch (err) {
      console.error('Error loading plans:', err);
    } finally {
      setPlansLoading(false);
    }
  }, [subscriptionService]);

  /**
   * Load usage statistics
   */
  const loadUsageStats = useCallback(async (days = 30) => {
    if (!userId) return;
    
    setUsageLoading(true);
    
    try {
      const result = await subscriptionService.getUsageStats(user?.id, days);
      
      if (result.success) {
        setUsageStats(result.stats);
      } else {
        console.error('Error loading usage stats:', result.error);
      }
    } catch (err) {
      console.error('Error loading usage stats:', err);
    } finally {
      setUsageLoading(false);
    }
  }, [userId, subscriptionService]);

  /**
   * Create subscription
   */
  const createSubscription = useCallback(async (planType) => {
    if (!userId) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await subscriptionService.createSubscription(userId, planType);
      
      if (result.success) {
        setSubscription(result.subscription);
        return result;
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, subscriptionService]);

  /**
   * Upgrade subscription
   */
  const upgradeSubscription = useCallback(async (newPlanType) => {
    if (!userId) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await subscriptionService.upgradeSubscription(userId, newPlanType);
      
      if (result.success) {
        setSubscription(result.subscription);
        return result;
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, subscriptionService]);

  /**
   * Check if user can proceed with chat request
   */
  const checkCanProceed = useCallback(async (estimatedTokens = 1000) => {
    if (!userId) return { can_proceed: false, reason: 'User not authenticated' };
    
    try {
      const result = await subscriptionService.checkUsageLimits(userId, estimatedTokens);
      
      if (result.success) {
        return result;
      } else {
        console.error('Error checking usage limits:', result.error);
        return { can_proceed: false, reason: 'Error checking limits' };
      }
    } catch (err) {
      console.error('Error checking limits:', err);
      return { can_proceed: false, reason: err.message };
    }
  }, [userId, subscriptionService]);

  /**
   * Cancel subscription
   */
  const cancelSubscription = useCallback(async (reason = '') => {
    if (!userId) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await subscriptionService.cancelSubscription(userId, reason);
      
      if (result.success) {
        // Reload subscription to get updated status
        await loadSubscription();
        return result;
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, subscriptionService, loadSubscription]);

  /**
   * Refresh all subscription data
   */
  const refresh = useCallback(async () => {
    await Promise.all([
      loadSubscription(),
      loadAvailablePlans(),
      loadUsageStats()
    ]);
  }, [loadSubscription, loadAvailablePlans, loadUsageStats]);

  // Load initial data
  useEffect(() => {
    if (userId) {
      loadSubscription();
      loadUsageStats();
    }
  }, [userId, loadSubscription, loadUsageStats]);

  useEffect(() => {
    loadAvailablePlans();
  }, [loadAvailablePlans]);

  // Computed values
  const hasActiveSubscription = subscription?.status === 'active';
  const needsSubscription = !subscription || subscription?.status !== 'active';
  
  const quotas = subscription ? {
    tokens: {
      used: subscription.tokens_used || 0,
      limit: subscription.tokens_limit || 0,
      remaining: Math.max(0, (subscription.tokens_limit || 0) - (subscription.tokens_used || 0)),
      percentage: subscriptionService.getUsagePercentage(
        subscription.tokens_used || 0,
        subscription.tokens_limit || 0
      )
    },
    requests: {
      used: subscription.requests_used || 0,
      limit: subscription.requests_limit || 0,
      remaining: Math.max(0, (subscription.requests_limit || 0) - (subscription.requests_used || 0)),
      percentage: subscriptionService.getUsagePercentage(
        subscription.requests_used || 0,
        subscription.requests_limit || 0
      )
    }
  } : null;

  return {
    // Data
    subscription,
    availablePlans,
    usageStats,
    quotas,
    
    // State
    loading,
    plansLoading,
    usageLoading,
    error,
    
    // Computed
    hasActiveSubscription,
    needsSubscription,
    userId,
    
    // Actions
    loadSubscription,
    loadAvailablePlans,
    loadUsageStats,
    createSubscription,
    upgradeSubscription,
    cancelSubscription,
    checkCanProceed,
    refresh,
    
    // Utilities
    formatCurrency: subscriptionService.formatCurrency,
    formatNumber: subscriptionService.formatNumber,
    getPlanDisplayName: subscriptionService.getPlanDisplayName,
    getPlanBadgeColor: subscriptionService.getPlanBadgeColor,
    getUsageStatusColor: subscriptionService.getUsageStatusColor,
    isRecommendedPlan: subscriptionService.isRecommendedPlan,
    calculateYearlySavings: subscriptionService.calculateYearlySavings
  };
};