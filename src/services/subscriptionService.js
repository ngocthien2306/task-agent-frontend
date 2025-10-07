/**
 * Subscription Service - Handle all subscription related API calls
 */

const API_BASE_URL = import.meta.env.VITE_PYTHON_API_URL || "http://localhost:8000";
const NODE_API_URL = import.meta.env.VITE_NODE_API_URL || "http://localhost:3000";

export class SubscriptionService {
  constructor(authFetch = null) {
    this.authFetch = authFetch || this.defaultFetch;
  }

  async defaultFetch(url, options = {}) {
    return fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
  }

  /**
   * Get available subscription plans
   */
  async getAvailablePlans() {
    try {
      const response = await this.authFetch(`${API_BASE_URL}/api/v1/plans`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const plans = await response.json();
      return { success: true, plans };
    } catch (error) {
      console.error('Error getting available plans:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's current subscription
   * @param {string} userId - User ID
   */
  async getUserSubscription(userId) {
    try {
      // Try Node.js API first (has middleware integration)
      let response = await this.authFetch(`${NODE_API_URL}/subscription/${userId}`);
      
      if (!response.ok && response.status !== 404) {
        // Fallback to Python API
        response = await this.authFetch(`${API_BASE_URL}/api/v1/subscription/${userId}`);
      }
      
      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'No subscription found', needsSubscription: true };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return { success: true, ...result };
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create new subscription
   * @param {string} userId - User ID
   * @param {string} planType - Plan type (free, week, month, year, pay_as_you_go)
   */
  async createSubscription(userId, planType) {
    try {
      const response = await this.authFetch(`${API_BASE_URL}/api/v1/subscription/create`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          plan_type: planType,
          payment_method: 'manual'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return { success: true, ...result };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upgrade subscription plan
   * @param {string} userId - User ID
   * @param {string} newPlanType - New plan type
   */
  async upgradeSubscription(userId, newPlanType) {
    try {
      const response = await this.authFetch(`${API_BASE_URL}/api/v1/subscription/${userId}/upgrade`, {
        method: 'PUT',
        body: JSON.stringify({
          user_id: userId,
          new_plan_type: newPlanType,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return { success: true, ...result };
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if user can proceed with request
   * @param {string} userId - User ID
   * @param {number} estimatedTokens - Estimated tokens for request
   */
  async checkUsageLimits(userId, estimatedTokens = 1000) {
    try {
      const response = await this.authFetch(`${API_BASE_URL}/api/v1/usage/check-limit`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          estimated_tokens: estimatedTokens,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return { success: true, ...result };
    } catch (error) {
      console.error('Error checking usage limits:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get usage statistics
   * @param {string} userId - User ID
   * @param {number} days - Number of days to get stats for
   */
  async getUsageStats(userId, days = 30) {
    try {
      const response = await this.authFetch(`${API_BASE_URL}/api/v1/usage/${userId}/stats?days=${days}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const stats = await response.json();
      return { success: true, stats };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel subscription
   * @param {string} userId - User ID
   * @param {string} reason - Cancellation reason
   */
  async cancelSubscription(userId, reason = '') {
    try {
      const response = await this.authFetch(`${API_BASE_URL}/api/v1/subscription/${userId}?reason=${encodeURIComponent(reason)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return { success: true, ...result };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Format currency amount
   * @param {number} amount - Amount in VND
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  /**
   * Calculate savings for yearly plan
   * @param {number} monthlyPrice - Monthly plan price
   * @param {number} yearlyPrice - Yearly plan price
   */
  calculateYearlySavings(monthlyPrice, yearlyPrice) {
    const monthlyTotal = monthlyPrice * 12;
    const savings = monthlyTotal - yearlyPrice;
    const savingsPercent = Math.round((savings / monthlyTotal) * 100);
    return { savings, savingsPercent };
  }

  /**
   * Get plan badge color
   * @param {string} planType - Plan type
   */
  getPlanBadgeColor(planType) {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      week: 'bg-blue-100 text-blue-800',
      month: 'bg-green-100 text-green-800',
      year: 'bg-purple-100 text-purple-800',
      pay_as_you_go: 'bg-orange-100 text-orange-800'
    };
    return colors[planType] || colors.free;
  }

  /**
   * Get plan display name
   * @param {string} planType - Plan type
   */
  getPlanDisplayName(planType) {
    const names = {
      free: 'Miễn Phí',
      week: 'Tuần',
      month: 'Tháng',
      year: 'Năm',
      pay_as_you_go: 'Theo Sử Dụng'
    };
    return names[planType] || planType;
  }

  /**
   * Check if plan is recommended
   * @param {string} planType - Plan type
   */
  isRecommendedPlan(planType) {
    return planType === 'month';
  }

  /**
   * Get quota usage percentage
   * @param {number} used - Used amount
   * @param {number} limit - Limit amount
   */
  getUsagePercentage(used, limit) {
    if (limit === 0) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  }

  /**
   * Get usage status color
   * @param {number} percentage - Usage percentage
   */
  getUsageStatusColor(percentage) {
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-50';
    if (percentage >= 50) return 'text-blue-600 bg-blue-50';
    return 'text-green-600 bg-green-50';
  }

  /**
   * Format large numbers
   * @param {number} num - Number to format
   */
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();

export default SubscriptionService;