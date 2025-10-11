import { useState } from "react";
import { AnimatedBackground } from "../Animations/AnimatedBackground";
import { FloatingShapes } from "../Animations/FloatingShapes";
import { authService } from "../../services/api";
import { ValidatedInput } from "../Common/ValidatedInput";
import { 
  validateEmail, 
  validateUsername, 
  validatePassword, 
  validateConfirmPassword, 
  validateName 
} from "../../utils/validation";

export const Register = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [validationResults, setValidationResults] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError("");
    if (successMessage) setSuccessMessage("");
  };

  // Handle validation results
  const handleValidation = (fieldName, result) => {
    setValidationResults(prev => {
      const newResults = {
        ...prev,
        [fieldName]: result
      };
      
      // Check if all required fields are valid
      const requiredFields = ['email', 'username', 'password', 'confirmPassword'];
      const allValid = requiredFields.every(field => {
        const fieldResult = newResults[field];
        return fieldResult && fieldResult.isValid;
      });
      
      setIsFormValid(allValid);
      return newResults;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation check
    const emailResult = validateEmail(formData.email);
    const usernameResult = validateUsername(formData.username);
    const passwordResult = validatePassword(formData.password);
    const confirmPasswordResult = validateConfirmPassword(formData.password, formData.confirmPassword);
    
    const finalValidation = {
      email: emailResult,
      username: usernameResult,
      password: passwordResult,
      confirmPassword: confirmPasswordResult
    };
    
    setValidationResults(finalValidation);
    
    // Check if any field is invalid
    const hasErrors = Object.values(finalValidation).some(result => !result.isValid);
    if (hasErrors) {
      setError("Vui lòng sửa các lỗi trong form trước khi đăng ký");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await authService.register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        first_name: formData.first_name || null,
        last_name: formData.last_name || null
      });

      // Show success message with email verification note
      setSuccessMessage(
        "Account created successfully! Please check your email to verify your account before logging in."
      );
      
      // Clear form
      setFormData({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        last_name: ""
      });

      // Delay transition to login
      setTimeout(() => {
        onRegisterSuccess();
      }, 3000);

    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <AnimatedBackground />
      <FloatingShapes />
      
      <div className="max-w-md w-full bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-8 relative z-10 transform hover:scale-[1.02] transition-transform duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Create Account</h2>
          <p className="text-gray-600 mt-2">Join our AI Assistant platform</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <ValidatedInput
              type="text"
              name="first_name"
              label="Tên"
              value={formData.first_name}
              onChange={handleInputChange}
              validation={(value) => validateName(value, 'Tên', false)}
              onValidation={handleValidation}
              placeholder="Tùy chọn"
              className="px-4 py-3 border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:ring-opacity-50 focus:border-pink-500 bg-white bg-opacity-80 backdrop-blur-sm"
            />
            <ValidatedInput
              type="text"
              name="last_name"
              label="Họ"
              value={formData.last_name}
              onChange={handleInputChange}
              validation={(value) => validateName(value, 'Họ', false)}
              onValidation={handleValidation}
              placeholder="Tùy chọn"
              className="px-4 py-3 border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:ring-opacity-50 focus:border-pink-500 bg-white bg-opacity-80 backdrop-blur-sm"
            />
          </div>

          <ValidatedInput
            type="email"
            name="email"
            label="Email"
            value={formData.email}
            onChange={handleInputChange}
            validation={validateEmail}
            onValidation={handleValidation}
            required
            placeholder="your.email@example.com"
            className="px-3 py-2 focus:ring-2 focus:ring-pink-500"
          />

          <ValidatedInput
            type="text"
            name="username"
            label="Tên đăng nhập"
            value={formData.username}
            onChange={handleInputChange}
            validation={validateUsername}
            onValidation={handleValidation}
            required
            placeholder="Chọn tên đăng nhập"
            className="px-3 py-2 focus:ring-2 focus:ring-pink-500"
          />

          <ValidatedInput
            type="password"
            name="password"
            label="Mật khẩu"
            value={formData.password}
            onChange={handleInputChange}
            validation={validatePassword}
            onValidation={handleValidation}
            required
            showPasswordStrength
            placeholder="Ít nhất 8 ký tự"
            className="px-3 py-2 focus:ring-2 focus:ring-pink-500"
          />

          <ValidatedInput
            type="password"
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            validation={(value) => validateConfirmPassword(formData.password, value)}
            onValidation={handleValidation}
            required
            placeholder="Nhập lại mật khẩu"
            className="px-3 py-2 focus:ring-2 focus:ring-pink-500"
          />

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold transition duration-300 shadow-lg hover:shadow-xl ${
              loading || !isFormValid
                ? "opacity-50 cursor-not-allowed" 
                : "hover:from-pink-600 hover:to-purple-700 transform hover:scale-[1.02] hover:shadow-pink-500/25"
            }`}
          >
            {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
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
          <p className="text-gray-600">
            Đã có tài khoản?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-pink-600 hover:text-pink-700 font-semibold underline"
            >
              Đăng nhập
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};