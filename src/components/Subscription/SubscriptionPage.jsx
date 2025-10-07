import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../hooks/useSubscription';
import { SubscriptionPlans } from './SubscriptionPlans';
import { SubscriptionStatus } from './SubscriptionStatus';

export const SubscriptionPage = ({ onPlanSelected }) => {
  const navigate = useNavigate();
  const {
    subscription,
    hasActiveSubscription,
    needsSubscription,
    loading,
    error,
    refresh
  } = useSubscription();

  const [showPlans, setShowPlans] = useState(false);

  useEffect(() => {
    // Auto-show plans if user needs subscription
    if (needsSubscription && !loading) {
      setShowPlans(true);
    }
  }, [needsSubscription, loading]);

  const handlePlanSelected = async (newSubscription) => {
    console.log('Plan selected:', newSubscription);
    
    // Refresh subscription data
    await refresh();
    
    // Notify parent component
    onPlanSelected?.(newSubscription);
    
    // Hide plans selection
    setShowPlans(false);
  };

  const handleUpgrade = () => {
    setShowPlans(true);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left - Back Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToHome}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-white/50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Về trang chính
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <nav className="hidden sm:flex space-x-6">
                <button
                  onClick={() => navigate('/calendar')}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Calendar
                </button>
                <button
                  onClick={() => navigate('/notifications')}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Thông báo
                </button>
                <button
                  onClick={() => navigate('/animation-studio')}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Animation Studio
                </button>
              </nav>
            </div>

            {/* Center - Title */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Subscription Management
              </h1>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center space-x-3">
              {hasActiveSubscription && (
                <button
                  onClick={handleUpgrade}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Nâng cấp
                </button>
              )}
              
              <button
                onClick={refresh}
                className="inline-flex items-center p-2 text-gray-500 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-colors"
                title="Refresh"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0V9a8 8 0 1115.356 2M15 15v5h-.582M4.582 15A8.001 8.001 0 0019.418 15m0 0V15a8 8 0 01-15.356-2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Subscription Status - Top Section */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Subscription hiện tại
                </h2>
                {hasActiveSubscription && (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleUpgrade}
                      className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Nâng cấp
                    </button>
                    <button
                      onClick={refresh}
                      className="inline-flex items-center p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200"
                      title="Refresh"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0V9a8 8 0 1115.356 2M15 15v5h-.582M4.582 15A8.001 8.001 0 0019.418 15m0 0V15a8 8 0 01-15.356-2" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {hasActiveSubscription ? (
                <SubscriptionStatus showDetails={true} compact={false} />
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto h-16 w-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có subscription
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Chọn gói phù hợp để bắt đầu sử dụng dịch vụ với đầy đủ tính năng
                  </p>
                  <button
                    onClick={() => setShowPlans(true)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Chọn gói ngay
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Plans Section */}
        {showPlans || needsSubscription ? (
          <div>
            {!needsSubscription && (
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Nâng cấp gói subscription
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Nâng cấp để có thêm quota và tính năng mới
                  </p>
                </div>
                <button
                  onClick={() => setShowPlans(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white/50 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
            <SubscriptionPlans
              onPlanSelected={handlePlanSelected}
              currentPlan={subscription}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tips Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200/50 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  💡 Tips để tối ưu usage
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start p-4 bg-white/50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Câu hỏi ngắn gọn</h4>
                      <p className="text-sm text-blue-800">Sử dụng câu hỏi ngắn gọn để tiết kiệm tokens</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-4 bg-white/50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Tránh context dài</h4>
                      <p className="text-sm text-blue-800">Tránh gửi quá nhiều context không cần thiết</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-4 bg-white/50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Pay-as-you-go</h4>
                      <p className="text-sm text-blue-800">Phù hợp nếu usage không đều đặn</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-4 bg-white/50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Theo dõi statistics</h4>
                      <p className="text-sm text-blue-800">Xem usage để chọn gói phù hợp</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};