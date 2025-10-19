import { useNavigate } from 'react-router-dom';

export const PaymentCancel = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate('/subscription');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Thanh toán đã bị hủy</h2>
          <p className="text-gray-600 mb-8">
            Bạn đã hủy thanh toán. Đừng lo, bạn có thể thử lại bất cứ lúc nào.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
            >
              Thử lại
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-white text-gray-700 py-3 px-6 rounded-lg font-semibold border-2 border-gray-200 hover:bg-gray-50 transition-all"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
