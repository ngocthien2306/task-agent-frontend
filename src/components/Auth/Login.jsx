import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatedBackground } from "../Animations/AnimatedBackground";
import { FloatingShapes } from "../Animations/FloatingShapes";
import { authService } from "../../services/api";
import { ValidatedInput } from "../Common/ValidatedInput";
import { validateRequired } from "../../utils/validation";

export const Login = ({ onSwitchToRegister, onLoginSuccess, onSwitchToForgotPassword }) => {
  const pythonApiUrl = import.meta.env.VITE_PYTHON_API_URL || "http://localhost:8000";
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [validationResults, setValidationResults] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    // Check for success messages from URL params
    if (searchParams.get("verified") === "true") {
      setSuccessMessage("Email verified successfully! You can now log in.");
    } else if (searchParams.get("reset") === "true") {
      setSuccessMessage("Password reset successfully! You can now log in with your new password.");
    }
  }, [searchParams]);

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
      
      // Check if all required fields are valid and have values
      const allValid = formData.username.trim() && formData.password.trim();
      setIsFormValid(allValid);
      
      return newResults;
    });
  };

  // Update form validity when form data changes
  useEffect(() => {
    const isValid = formData.username.trim() && formData.password.trim();
    setIsFormValid(isValid);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const loginResult = await authService.login({
        username: formData.username,
        password: formData.password
      });

      // Store the JWT token in localStorage
      localStorage.setItem("token", loginResult.access_token);
      localStorage.setItem("tokenType", loginResult.token_type);
      
      // Get user info
      const userResponse = await fetch(`${pythonApiUrl}/api/v1/auth/me`, {
        headers: {
          "Authorization": `${loginResult.token_type} ${loginResult.access_token}`
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        localStorage.setItem("user", JSON.stringify(userData));
        onLoginSuccess(userData, loginResult.access_token);
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
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
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your AI Assistant</p>
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
          <ValidatedInput
            type="text"
            name="username"
            label="Tên đăng nhập"
            value={formData.username}
            onChange={handleInputChange}
            validation={(value) => validateRequired(value, 'Tên đăng nhập')}
            onValidation={handleValidation}
            required
            placeholder="Nhập tên đăng nhập"
            className="px-4 py-3 border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:ring-opacity-50 focus:border-pink-500 bg-white bg-opacity-80 backdrop-blur-sm"
          />

          <ValidatedInput
            type="password"
            name="password"
            label="Mật khẩu"
            value={formData.password}
            onChange={handleInputChange}
            validation={(value) => validateRequired(value, 'Mật khẩu')}
            onValidation={handleValidation}
            required
            placeholder="Nhập mật khẩu"
            className="px-4 py-3 border-gray-300 rounded-xl focus:ring-3 focus:ring-pink-500 focus:ring-opacity-50 focus:border-pink-500 bg-white bg-opacity-80 backdrop-blur-sm"
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
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang đăng nhập...
              </div>
            ) : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Chưa có tài khoản?{" "}
            <button
              onClick={onSwitchToRegister}
              className="text-pink-600 hover:text-pink-700 font-semibold underline"
            >
              Tạo tài khoản
            </button>
          </p>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onSwitchToForgotPassword}
            className="text-sm text-gray-500 hover:text-pink-600 underline transition duration-200"
          >
            Quên mật khẩu?
          </button>
        </div>
      </div>
    </div>
  );
};