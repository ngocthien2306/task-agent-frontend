import { useState } from "react";
import { AnimatedBackground } from "./AnimatedBackground";
import { FloatingShapes } from "./FloatingShapes";

export const ForgotPassword = ({ onBackToLogin, onResetSuccess }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("email"); // "email" or "success"

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // TODO: Implement actual forgot password API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success
      setStep("success");
      if (onResetSuccess) {
        onResetSuccess(email);
      }
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnother = () => {
    setStep("email");
    setEmail("");
    setError("");
  };

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
        <AnimatedBackground />
        <FloatingShapes />
        
        <div className="max-w-md w-full bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-8 relative z-10 transform hover:scale-[1.02] transition-transform duration-300">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a1 1 0 001.42 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              Check Your Email
            </h2>
            
            <p className="text-gray-600 mb-2">
              We've sent a password reset link to:
            </p>
            <p className="text-pink-600 font-semibold mb-6 break-all">
              {email}
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Didn't receive the email?</p>
                  <p>Check your spam folder or wait a few minutes for it to arrive.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleSendAnother}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold transition duration-300 shadow-lg hover:shadow-xl hover:from-pink-600 hover:to-purple-700 transform hover:scale-[1.02] hover:shadow-pink-500/25"
              >
                Send Another Email
              </button>
              
              <button
                onClick={onBackToLogin}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition duration-300"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <AnimatedBackground />
      <FloatingShapes />
      
      <div className="max-w-md w-full bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-8 relative z-10 transform hover:scale-[1.02] transition-transform duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Forgot Password?</h2>
          <p className="text-gray-600 mt-2">No worries! Enter your email and we'll send you a reset link.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-orange-500 focus:ring-opacity-50 focus:border-orange-500 transition duration-300 bg-white bg-opacity-80 backdrop-blur-sm"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-xl font-semibold transition duration-300 shadow-lg hover:shadow-xl ${
              loading 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:from-orange-600 hover:to-red-700 transform hover:scale-[1.02] hover:shadow-orange-500/25"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending Reset Link...
              </div>
            ) : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onBackToLogin}
              className="text-pink-600 hover:text-pink-700 font-semibold underline transition duration-200"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};