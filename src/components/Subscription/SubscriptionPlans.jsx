import { useState } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../hooks/useAuth';
import { StripeCheckout } from '../Payment/StripeCheckout';

export const SubscriptionPlans = ({ onPlanSelected, currentPlan = null }) => {
  const { user } = useAuth();
  const {
    availablePlans,
    plansLoading,
    createSubscription,
    upgradeSubscription,
    loading,
    error,
    formatCurrency,
    getPlanBadgeColor,
    isRecommendedPlan,
    calculateYearlySavings
  } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [planToPayFor, setPlanToPayFor] = useState(null);

  const handleSelectPlan = async (plan) => {
    if (loading || processingPlan) return;

    // If paid plan, show payment modal
    if (plan.price > 0 && plan.plan_type !== 'pay_as_you_go') {
      setPlanToPayFor(plan);
      setShowPayment(true);
      return;
    }

    setProcessingPlan(plan.plan_type);

    try {
      let result;

      if (currentPlan) {
        // Upgrade existing subscription
        result = await upgradeSubscription(plan.plan_type);
      } else {
        // Create new subscription
        result = await createSubscription(plan.plan_type);
      }

      if (result.success) {
        onPlanSelected?.(result.subscription);
      }
    } catch (err) {
      console.error('Error selecting plan:', err);
    } finally {
      setProcessingPlan(null);
    }
  };

  const getPlanFeatures = (plan) => {
    const features = [...plan.features];
    
    // Add token and request limits as features
    if (plan.tokens_limit < 999999999) {
      features.unshift(`${formatNumber(plan.tokens_limit)} tokens`);
    } else {
      features.unshift('Unlimited tokens');
    }
    
    if (plan.requests_limit < 999999) {
      features.unshift(`${formatNumber(plan.requests_limit)} requests`);
    } else {
      features.unshift('Unlimited requests');
    }
    
    return features;
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
    
    if (currentPlan?.plan_type === plan.plan_type) {
      return 'Gói hiện tại';
    }
    
    if (currentPlan && plan.price > 0) {
      return 'Nâng cấp';
    }
    
    if (plan.price === 0) {
      return 'Sử dụng miễn phí';
    }
    
    return 'Chọn gói';
  };

  const isCurrentPlan = (plan) => currentPlan?.plan_type === plan.plan_type;
  const isUpgrade = (plan) => currentPlan && plan.price > (currentPlan.price || 0);

  if (plansLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Đang tải gói dịch vụ...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-indigo-100 mb-6">
            <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm text-indigo-700 font-medium">Chọn gói subscription phù hợp</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 bg-clip-text text-transparent mb-6">
            Gói dịch vụ linh hoạt
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Từ miễn phí đến không giới hạn, chúng tôi có gói phù hợp cho mọi nhu cầu của bạn
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-red-800 mb-1">Có lỗi xảy ra</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-6">
          {availablePlans.map((plan) => {
            const savings = plan.plan_type === 'year' ? 
              calculateYearlySavings(
                availablePlans.find(p => p.plan_type === 'month')?.price || 0, 
                plan.price
              ) : null;

            return (
              <div
                key={plan.plan_type}
                className={`group relative rounded-3xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl flex flex-col h-full ${
                  isRecommendedPlan(plan.plan_type)
                    ? 'bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-teal-500/10 border-2 border-indigo-300 ring-4 ring-indigo-100'
                    : isCurrentPlan(plan)
                    ? 'bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border-2 border-green-300'
                    : 'bg-white/70 backdrop-blur-sm border border-gray-200 hover:border-indigo-200'
                } shadow-xl`}
                style={{
                  backgroundImage: isRecommendedPlan(plan.plan_type) 
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(20, 184, 166, 0.1) 100%)'
                    : isCurrentPlan(plan)
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)'
                }}
              >
                {/* Recommended badge */}
                {isRecommendedPlan(plan.plan_type) && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg border-2 border-white">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                        Được đề xuất
                      </div>
                    </div>
                  </div>
                )}

                {/* Current plan badge */}
                {isCurrentPlan(plan) && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg border-2 border-white">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Đang sử dụng
                      </div>
                    </div>
                  </div>
                )}

                {/* Savings badge for yearly */}
                {savings && savings.savingsPercent > 0 && (
                  <div className="absolute -top-3 -right-3 z-10">
                    <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                      -{savings.savingsPercent}%
                    </div>
                  </div>
                )}

                <div className="text-center flex-grow flex flex-col">
                  {/* Plan name and badge */}
                  <div className="flex flex-col items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getPlanBadgeColor(plan.plan_type)} shadow-md`}>
                      {plan.plan_type.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6 p-4 bg-white/50 rounded-2xl border border-white/50">
                    {plan.price === 0 ? (
                      <div className="text-center">
                        <span className="text-5xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">Miễn phí</span>
                        <p className="text-sm text-gray-600 mt-2">Hoàn toàn miễn phí</p>
                      </div>
                    ) : plan.plan_type === 'pay_as_you_go' ? (
                      <div className="text-center">
                        <span className="text-3xl font-bold text-gray-900">
                          {formatCurrency(plan.cost_per_1k_tokens || 1000)}
                        </span>
                        <span className="text-gray-600 ml-1 text-lg font-medium">/1K tokens</span>
                        <p className="text-sm text-gray-500 mt-2">Linh hoạt theo nhu cầu</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {formatCurrency(plan.price)}
                        </span>
                        <span className="text-gray-600 ml-2 text-lg font-medium">
                          /{plan.plan_type === 'year' ? 'năm' : plan.plan_type === 'month' ? 'tháng' : 'tuần'}
                        </span>
                        <p className="text-sm text-gray-500 mt-2">
                          {plan.plan_type === 'year' ? 'Tiết kiệm tối đa' : plan.plan_type === 'month' ? 'Phổ biến nhất' : 'Dùng thử ngắn hạn'}
                        </p>
                      </div>
                    )}

                    {savings && (
                      <div className="mt-4 p-2 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700 font-semibold text-center">
                          💰 Tiết kiệm {formatCurrency(savings.savings)} so với gói tháng
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-blue-100">
                    <p className="text-gray-700 text-sm font-medium">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="mb-8 flex-grow">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      Tính năng bao gồm:
                    </h4>
                    <ul className="space-y-3">
                      {getPlanFeatures(plan).map((feature, index) => (
                        <li key={index} className="flex items-start group">
                          <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                            <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-700 font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <div className="space-y-3 mt-auto">
                    {/* Additional info above button */}
                    {plan.plan_type === 'pay_as_you_go' && (
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-sm text-blue-700 font-medium text-center">
                          🎯 Chỉ trả tiền cho những gì bạn sử dụng
                        </p>
                      </div>
                    )}
                    {plan.plan_type === 'free' && (
                      <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                        <p className="text-sm text-green-700 font-medium text-center">
                          🆓 Hoàn toàn miễn phí, không cần thẻ tín dụng
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={loading || processingPlan || isCurrentPlan(plan)}
                      className={`group relative w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                        isCurrentPlan(plan)
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-200 cursor-not-allowed'
                          : isRecommendedPlan(plan.plan_type)
                          ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 text-white shadow-2xl hover:shadow-3xl border-0'
                          : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 shadow-xl'
                      } ${
                        (loading || processingPlan) && !isCurrentPlan(plan)
                          ? 'opacity-50 cursor-not-allowed transform-none'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        {processingPlan === plan.plan_type && (
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        {getButtonText(plan)}
                      </div>
                      {!isCurrentPlan(plan) && !loading && !processingPlan && (
                        <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-indigo-100 mb-4">
              <svg className="w-4 h-4 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-indigo-700 font-medium">Câu hỏi thường gặp</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Có thắc mắc gì không?
            </h3>
            <p className="text-gray-600">Những câu hỏi phổ biến từ khách hàng</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 text-lg">Token là gì?</h4>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Token là đơn vị đo lường văn bản được AI xử lý. Khoảng 1000 token tương đương 750 từ tiếng Anh hoặc 1 trang văn bản thông thường.
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 text-lg">Có thể thay đổi gói không?</h4>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Có, bạn có thể nâng cấp hoặc hạ cấp gói bất cứ lúc nào. Thay đổi có hiệu lực ngay lập tức và được tính theo tỷ lệ.
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 text-lg">Gói trả theo sử dụng?</h4>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Bạn chỉ trả tiền cho số token thực tế sử dụng, không có giới hạn tháng. Phù hợp cho usage không đều và tiết kiệm chi phí.
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 text-lg">Chính sách hoàn tiền?</h4>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Chúng tôi có chính sách hoàn tiền 100% trong 30 ngày đầu nếu bạn không hài lòng với dịch vụ. Không cần lý do.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPayment && planToPayFor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Thanh toán</h3>
                <button
                  onClick={() => setShowPayment(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <h4 className="font-bold text-gray-900 mb-2">{planToPayFor.name}</h4>
                <p className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(planToPayFor.price)}
                  <span className="text-sm text-gray-600 ml-1">
                    /{planToPayFor.plan_type === 'year' ? 'năm' : planToPayFor.plan_type === 'month' ? 'tháng' : 'tuần'}
                  </span>
                </p>
              </div>

              <StripeCheckout
                plan={planToPayFor}
                userId={user?.user_id || user?.id || user?.username}
                onSuccess={() => {
                  setShowPayment(false);
                  onPlanSelected?.(planToPayFor);
                }}
                onCancel={() => setShowPayment(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};