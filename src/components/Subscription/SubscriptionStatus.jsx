import { useState } from 'react';
import { useSubscription } from '../../hooks/useSubscription';

export const SubscriptionStatus = ({ showDetails = true, compact = false }) => {
  const {
    subscription,
    quotas,
    usageStats,
    loading,
    error,
    formatCurrency,
    formatNumber,
    getPlanDisplayName,
    getPlanBadgeColor,
    getUsageStatusColor,
    loadUsageStats,
    usageLoading
  } = useSubscription();

  const [showUsageChart, setShowUsageChart] = useState(false);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-yellow-800 font-medium">
            Chưa có gói subscription
          </span>
        </div>
      </div>
    );
  }

  const isActive = subscription.status === 'active';
  const isExpiringSoon = subscription.end_date && 
    new Date(subscription.end_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  if (compact) {
    return (
      <div className="flex items-center space-x-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(subscription.plan_type)}`}>
          {getPlanDisplayName(subscription.plan_type)}
        </span>
        
        {quotas && (
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <span className="text-gray-600 mr-1">Tokens:</span>
              <span className={`font-medium ${quotas.tokens.percentage >= 90 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatNumber(quotas.tokens.used)}/{formatNumber(quotas.tokens.limit)}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-1">Requests:</span>
              <span className={`font-medium ${quotas.requests.percentage >= 90 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatNumber(quotas.requests.used)}/{formatNumber(quotas.requests.limit)}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Subscription Status
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isActive ? 'Đang hoạt động' : 'Không hoạt động'}
            </span>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanBadgeColor(subscription.plan_type)}`}>
            {getPlanDisplayName(subscription.plan_type)}
          </span>
        </div>

        {/* Expiration warning */}
        {isExpiringSoon && isActive && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex items-center">
              <svg className="h-4 w-4 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-yellow-800 text-sm">
                Subscription sẽ hết hạn vào {new Date(subscription.end_date).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Usage Overview */}
      {showDetails && quotas && (
        <div className="px-6 py-4">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Usage Overview</h4>
          
          <div className="space-y-4">
            {/* Token Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Tokens</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatNumber(quotas.tokens.used)} / {formatNumber(quotas.tokens.limit)}
                  <span className="text-gray-500 ml-1">({quotas.tokens.percentage}%)</span>
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    quotas.tokens.percentage >= 90 ? 'bg-red-500' :
                    quotas.tokens.percentage >= 75 ? 'bg-yellow-500' :
                    quotas.tokens.percentage >= 50 ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, quotas.tokens.percentage)}%` }}
                ></div>
              </div>
            </div>

            {/* Request Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Requests</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatNumber(quotas.requests.used)} / {formatNumber(quotas.requests.limit)}
                  <span className="text-gray-500 ml-1">({quotas.requests.percentage}%)</span>
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    quotas.requests.percentage >= 90 ? 'bg-red-500' :
                    quotas.requests.percentage >= 75 ? 'bg-yellow-500' :
                    quotas.requests.percentage >= 50 ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, quotas.requests.percentage)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Usage warnings */}
          {(quotas.tokens.percentage >= 90 || quotas.requests.percentage >= 90) && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-start">
                <svg className="h-4 w-4 text-red-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">Cảnh báo giới hạn</p>
                  <p>
                    Bạn đã sử dụng gần hết quota. Hãy xem xét nâng cấp gói để tiếp tục sử dụng dịch vụ.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subscription Details */}
      {showDetails && (
        <div className="px-6 py-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Chi tiết gói</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Gói hiện tại:</span>
              <span className="ml-2 font-medium text-gray-900">
                {subscription.plan_type === 'pay_as_you_go' ? 'Trả theo sử dụng' : getPlanDisplayName(subscription.plan_type)}
              </span>
            </div>
            
            <div>
              <span className="text-gray-600">Giá:</span>
              <span className="ml-2 font-medium text-gray-900">
                {subscription.price === 0 ? 'Miễn phí' : formatCurrency(subscription.price)}
              </span>
            </div>
            
            <div>
              <span className="text-gray-600">Ngày bắt đầu:</span>
              <span className="ml-2 font-medium text-gray-900">
                {new Date(subscription.start_date).toLocaleDateString('vi-VN')}
              </span>
            </div>
            
            {subscription.end_date && (
              <div>
                <span className="text-gray-600">Ngày hết hạn:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {new Date(subscription.end_date).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
            
            <div>
              <span className="text-gray-600">Trạng thái thanh toán:</span>
              <span className={`ml-2 font-medium ${
                subscription.payment_status === 'paid' ? 'text-green-600' :
                subscription.payment_status === 'pending' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {subscription.payment_status === 'paid' ? 'Đã thanh toán' :
                 subscription.payment_status === 'pending' ? 'Đang chờ' : 'Thất bại'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Usage Stats Toggle */}
      {showDetails && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              setShowUsageChart(!showUsageChart);
              if (!showUsageChart && !usageStats) {
                loadUsageStats();
              }
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showUsageChart ? 'Ẩn thống kê chi tiết' : 'Xem thống kê chi tiết'}
          </button>
        </div>
      )}

      {/* Usage Chart */}
      {showUsageChart && (
        <div className="px-6 py-4 border-t border-gray-200">
          {usageLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : usageStats ? (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                Thống kê 30 ngày gần nhất
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatNumber(usageStats.totals?.tokens || 0)}
                  </div>
                  <div className="text-sm text-blue-600">Total Tokens</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(usageStats.totals?.requests || 0)}
                  </div>
                  <div className="text-sm text-green-600">Total Requests</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(usageStats.totals?.cost_vnd || 0)}
                  </div>
                  <div className="text-sm text-purple-600">Total Cost</div>
                </div>
              </div>

              {/* Simple daily usage bars */}
              {usageStats.daily_stats && usageStats.daily_stats.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-3">Sử dụng hàng ngày</h5>
                  <div className="space-y-2">
                    {usageStats.daily_stats.slice(-7).map((day, index) => (
                      <div key={day._id} className="flex items-center">
                        <div className="w-20 text-xs text-gray-600">
                          {new Date(day._id).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex-1 ml-3">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${Math.max(5, Math.min(100, (day.total_tokens / Math.max(...usageStats.daily_stats.map(d => d.total_tokens))) * 100))}%`
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-20 text-xs text-gray-600 text-right">
                          {formatNumber(day.total_tokens)} tokens
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Không có dữ liệu thống kê
            </div>
          )}
        </div>
      )}
    </div>
  );
};