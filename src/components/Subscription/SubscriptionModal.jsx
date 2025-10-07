import { useState, useEffect } from 'react';
import { useSubscription } from '../../hooks/useSubscription';

export const SubscriptionModal = ({ 
  isOpen, 
  onClose, 
  onPlanSelected, 
  limitInfo = null,
  autoUpgrade = false 
}) => {
  const {
    availablePlans,
    subscription,
    createSubscription,
    upgradeSubscription,
    loading,
    error,
    formatCurrency,
    getPlanBadgeColor,
    isRecommendedPlan
  } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processingPlan, setProcessingPlan] = useState(null);

  useEffect(() => {
    if (isOpen && autoUpgrade && availablePlans.length > 0) {
      // Auto-select recommended plan (month) for upgrade
      const recommendedPlan = availablePlans.find(plan => isRecommendedPlan(plan.plan_type));
      if (recommendedPlan) {
        setSelectedPlan(recommendedPlan.plan_type);
      }
    }
  }, [isOpen, autoUpgrade, availablePlans, isRecommendedPlan]);

  const handleSelectPlan = async (planType) => {
    if (loading || processingPlan) return;
    
    setProcessingPlan(planType);
    
    try {
      let result;
      
      if (subscription) {
        // Upgrade existing subscription
        result = await upgradeSubscription(planType);
      } else {
        // Create new subscription
        result = await createSubscription(planType);
      }
      
      if (result.success) {
        onPlanSelected?.(result.subscription);
        onClose();
      }
    } catch (err) {
      console.error('Error selecting plan:', err);
    } finally {
      setProcessingPlan(null);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getButtonText = (plan) => {
    if (processingPlan === plan.plan_type) {
      return 'Đang xử lý...';
    }
    
    if (subscription?.plan_type === plan.plan_type) {
      return 'Gói hiện tại';
    }
    
    if (subscription && plan.price > 0) {
      return 'Nâng cấp';
    }
    
    if (plan.price === 0) {
      return 'Sử dụng miễn phí';
    }
    
    return 'Chọn gói';
  };

  const isCurrentPlan = (plan) => subscription?.plan_type === plan.plan_type;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="w-full">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {limitInfo ? 'Giới hạn subscription đã đạt' : 'Chọn gói subscription'}
                </h3>
                
                <p className="text-gray-600">
                  {limitInfo 
                    ? `${limitInfo.reason}. Vui lòng nâng cấp gói để tiếp tục sử dụng.`
                    : 'Chọn gói phù hợp với nhu cầu sử dụng của bạn'
                  }
                </p>
              </div>

              {/* Limit Info Alert */}
              {limitInfo && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800 font-medium">
                        {limitInfo.reason}
                      </p>
                      {limitInfo.subscription && (
                        <div className="mt-2 text-xs text-red-600">
                          <p>
                            Gói hiện tại: {limitInfo.subscription.plan_type} | 
                            Tokens: {formatNumber(limitInfo.subscription.tokens_used)}/{formatNumber(limitInfo.subscription.tokens_limit)} |
                            Requests: {formatNumber(limitInfo.subscription.requests_used)}/{formatNumber(limitInfo.subscription.requests_limit)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availablePlans.map((plan) => {
                  const isSelected = selectedPlan === plan.plan_type;
                  const isCurrent = isCurrentPlan(plan);
                  
                  return (
                    <div
                      key={plan.plan_type}
                      className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                          : isCurrent
                          ? 'border-gray-300 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => !isCurrent && setSelectedPlan(plan.plan_type)}
                    >
                      {/* Recommended badge */}
                      {isRecommendedPlan(plan.plan_type) && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Đề xuất
                          </span>
                        </div>
                      )}

                      <div className="text-center">
                        {/* Plan name and badge */}
                        <div className="flex items-center justify-center mb-2">
                          <h4 className="text-lg font-semibold text-gray-900 mr-2">
                            {plan.name}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(plan.plan_type)}`}>
                            {plan.plan_type.toUpperCase()}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="mb-3">
                          {plan.price === 0 ? (
                            <span className="text-2xl font-bold text-gray-900">Miễn phí</span>
                          ) : plan.plan_type === 'pay_as_you_go' ? (
                            <div>
                              <span className="text-xl font-bold text-gray-900">
                                {formatCurrency(1000)}
                              </span>
                              <span className="text-gray-500 text-sm">/1K tokens</span>
                            </div>
                          ) : (
                            <div>
                              <span className="text-2xl font-bold text-gray-900">
                                {formatCurrency(plan.price)}
                              </span>
                              <span className="text-gray-500 text-sm">
                                /{plan.plan_type === 'year' ? 'năm' : plan.plan_type === 'month' ? 'tháng' : 'tuần'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Key features */}
                        <div className="text-left space-y-1 mb-4">
                          <div className="flex items-center text-xs text-gray-600">
                            <svg className="h-3 w-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {plan.tokens_limit < 999999999 ? `${formatNumber(plan.tokens_limit)} tokens` : 'Unlimited tokens'}
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <svg className="h-3 w-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {plan.requests_limit < 999999 ? `${formatNumber(plan.requests_limit)} requests` : 'Unlimited requests'}
                          </div>
                          {plan.features.slice(0, 1).map((feature, index) => (
                            <div key={index} className="flex items-center text-xs text-gray-600">
                              <svg className="h-3 w-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {feature}
                            </div>
                          ))}
                        </div>

                        {/* Select button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPlan(plan.plan_type);
                          }}
                          disabled={loading || processingPlan || isCurrent}
                          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            isCurrent
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : isRecommendedPlan(plan.plan_type)
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                          } ${
                            (loading || processingPlan) && !isCurrent
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                        >
                          {getButtonText(plan)}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 mb-4">
                  Bạn có thể thay đổi hoặc hủy gói bất cứ lúc nào. 
                  Không có phí ẩn và có chính sách hoàn tiền trong 30 ngày.
                </p>
                
                <div className="flex justify-center space-x-4">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={onClose}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};