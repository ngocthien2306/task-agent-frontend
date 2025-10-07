import { useState } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { SubscriptionModal } from './SubscriptionModal';

export const SubscriptionLimitBanner = ({ 
  limitInfo, 
  onClose, 
  onPlanSelected,
  compact = false 
}) => {
  const [showModal, setShowModal] = useState(false);
  const { formatNumber } = useSubscription();

  if (!limitInfo) return null;

  const handleUpgrade = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handlePlanSelected = (subscription) => {
    setShowModal(false);
    onPlanSelected?.(subscription);
    onClose?.(); // Close the banner after successful upgrade
  };

  const getIconColor = () => {
    if (limitInfo.reason?.includes('token')) return 'text-red-500';
    if (limitInfo.reason?.includes('request')) return 'text-orange-500';
    return 'text-yellow-500';
  };

  const getBannerColor = () => {
    if (limitInfo.reason?.includes('token')) return 'bg-red-50 border-red-200';
    if (limitInfo.reason?.includes('request')) return 'bg-orange-50 border-orange-200';
    return 'bg-yellow-50 border-yellow-200';
  };

  const getTextColor = () => {
    if (limitInfo.reason?.includes('token')) return 'text-red-800';
    if (limitInfo.reason?.includes('request')) return 'text-orange-800';
    return 'text-yellow-800';
  };

  if (compact) {
    return (
      <>
        <div className={`rounded-lg border p-3 ${getBannerColor()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div className="flex-shrink-0">
                <svg className={`h-4 w-4 ${getIconColor()}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2 flex-1 min-w-0">
                <p className={`text-xs font-medium ${getTextColor()} truncate`}>
                  Giới hạn đạt tới
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={handleUpgrade}
                className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
              >
                Nâng cấp
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <SubscriptionModal
          isOpen={showModal}
          onClose={handleModalClose}
          onPlanSelected={handlePlanSelected}
          limitInfo={limitInfo}
          autoUpgrade={true}
        />
      </>
    );
  }

  return (
    <>
      <div className={`rounded-lg border p-6 ${getBannerColor()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className={`h-6 w-6 ${getIconColor()}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          
          <div className="ml-3 flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${getTextColor()} mb-2`}>
                  Giới hạn subscription đã đạt
                </h3>
                
                <p className={`text-sm ${getTextColor()} mb-4`}>
                  {limitInfo.reason}
                </p>

                {/* Current usage info */}
                {limitInfo.subscription && (
                  <div className={`bg-white bg-opacity-50 rounded-md p-3 mb-4 text-xs ${getTextColor()}`}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium">Tokens đã dùng</div>
                        <div>
                          {formatNumber(limitInfo.subscription.tokens_used)} / {formatNumber(limitInfo.subscription.tokens_limit)}
                          <span className="ml-1 text-opacity-75">
                            ({Math.round((limitInfo.subscription.tokens_used / limitInfo.subscription.tokens_limit) * 100)}%)
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Requests đã dùng</div>
                        <div>
                          {formatNumber(limitInfo.subscription.requests_used)} / {formatNumber(limitInfo.subscription.requests_limit)}
                          <span className="ml-1 text-opacity-75">
                            ({Math.round((limitInfo.subscription.requests_used / limitInfo.subscription.requests_limit) * 100)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleUpgrade}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Nâng cấp gói ngay
                  </button>
                  
                  <button
                    onClick={onClose}
                    className={`${getTextColor()} hover:opacity-75 text-sm font-medium`}
                  >
                    Đóng thông báo
                  </button>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 ml-4"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Suggested actions */}
        <div className="mt-4 pt-4 border-t border-current border-opacity-20">
          <div className="flex items-center text-xs text-current text-opacity-75">
            <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>
              {limitInfo.suggested_action === 'upgrade_plan' 
                ? 'Gói cao hơn sẽ có limits lớn hơn và nhiều tính năng hơn'
                : 'Liên hệ support để được hỗ trợ thêm'
              }
            </span>
          </div>
        </div>
      </div>

      <SubscriptionModal
        isOpen={showModal}
        onClose={handleModalClose}
        onPlanSelected={handlePlanSelected}
        limitInfo={limitInfo}
        autoUpgrade={true}
      />
    </>
  );
};