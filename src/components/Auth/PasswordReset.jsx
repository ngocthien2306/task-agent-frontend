import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AnimatedBackground } from "../Animations/AnimatedBackground";
import { FloatingShapes } from "../Animations/FloatingShapes";
import { authService } from "../../services/api";
import { ValidatedInput } from "../Common/ValidatedInput";
import { validatePassword, validateConfirmPassword } from "../../utils/validation";

export const PasswordReset = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationResults, setValidationResults] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError("Link đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới.");
    }
  }, [searchParams]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'newPassword') {
      setNewPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }
    if (error) setError("");
  };

  // Handle validation results
  const handleValidation = (fieldName, result) => {
    setValidationResults(prev => {
      const newResults = {
        ...prev,
        [fieldName]: result
      };
      
      // Check if all required fields are valid
      const passwordValid = newResults.newPassword && newResults.newPassword.isValid;
      const confirmPasswordValid = newResults.confirmPassword && newResults.confirmPassword.isValid;
      
      setIsFormValid(passwordValid && confirmPasswordValid);
      return newResults;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation
    const passwordResult = validatePassword(newPassword);
    const confirmPasswordResult = validateConfirmPassword(newPassword, confirmPassword);
    
    const finalValidation = {
      newPassword: passwordResult,
      confirmPassword: confirmPasswordResult
    };
    
    setValidationResults(finalValidation);
    
    // Check if any field is invalid
    const hasErrors = Object.values(finalValidation).some(result => !result.isValid);
    if (hasErrors) {
      setError("Vui lòng sửa các lỗi trong form trước khi đặt lại mật khẩu");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/?reset=true");
      }, 3000);
      
    } catch (error) {
      setError(error.message || "Password reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
        <AnimatedBackground />
        <FloatingShapes />
        
        <div className="max-w-md w-full bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-8 relative z-10">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              Đặt lại mật khẩu thành công!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới.
            </p>
            
            <p className="text-sm text-gray-500">
              Đang chuyển hướng đến trang đăng nhập...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
        <AnimatedBackground />
        <FloatingShapes />
        
        <div className="max-w-md w-full bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-8 relative z-10">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-red-600 mb-4">
              Link không hợp lệ
            </h2>
            
            <p className="text-gray-600 mb-6">
              Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.
            </p>
            
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Về trang đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <AnimatedBackground />
      <FloatingShapes />
      
      <div className="max-w-md w-full bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Đặt lại mật khẩu
          </h2>
          <p className="text-gray-600 mt-2">Nhập mật khẩu mới của bạn</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <ValidatedInput
            type="password"
            name="newPassword"
            label="Mật khẩu mới"
            value={newPassword}
            onChange={handleInputChange}
            validation={validatePassword}
            onValidation={handleValidation}
            required
            showPasswordStrength
            placeholder="Ít nhất 8 ký tự"
            className="px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />

          <ValidatedInput
            type="password"
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={handleInputChange}
            validation={(value) => validateConfirmPassword(newPassword, value)}
            onValidation={handleValidation}
            required
            placeholder="Nhập lại mật khẩu mới"
            className="px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold transition duration-300 shadow-lg hover:shadow-xl ${
              loading || !isFormValid
                ? "opacity-50 cursor-not-allowed" 
                : "hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.02] hover:shadow-blue-500/25"
            }`}
          >
            {loading ? "Đang đặt lại mật khẩu..." : "Đặt lại mật khẩu"}
          </button>
          
          {/* Form validation status */}
          {Object.keys(validationResults).length > 0 && !isFormValid && (
            <div className="text-center text-sm text-gray-600">
              <span className="inline-flex items-center text-yellow-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Vui lòng hoàn thành tất cả các trường bắt buộc
              </span>
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-700 font-medium underline"
          >
            Về trang đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};