import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AnimatedBackground } from "../Animations/AnimatedBackground";
import { FloatingShapes } from "../Animations/FloatingShapes";
import { authService } from "../../services/api";

export const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. Please check your email for the correct link.");
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      await authService.verifyEmail(token);
      setStatus("success");
      setMessage("Your email has been verified successfully! You can now log in to your account.");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/?verified=true");
      }, 3000);
      
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Email verification failed. The link may be expired or invalid.");
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setResendLoading(true);
    try {
      await authService.resendVerification(resendEmail);
      setMessage("Verification email sent! Please check your inbox.");
      setResendEmail("");
    } catch (error) {
      setMessage(error.message || "Failed to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "verifying":
        return (
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        );
      case "success":
        return (
          <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "error":
        return (
          <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case "verifying":
        return "Verifying Email...";
      case "success":
        return "Email Verified!";
      case "error":
        return "Verification Failed";
      default:
        return "";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "verifying":
        return "text-blue-600";
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <AnimatedBackground />
      <FloatingShapes />
      
      <div className="max-w-md w-full bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white border-opacity-20 p-8 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>
          
          <h2 className={`text-3xl font-bold mb-4 ${getStatusColor()}`}>
            {getStatusTitle()}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {status === "error" && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Need a new verification email?
              </h3>
              <form onSubmit={handleResendVerification} className="space-y-3">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={resendLoading || !resendEmail.trim()}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition duration-300 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {resendLoading ? "Sending..." : "Resend Verification Email"}
                </button>
              </form>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};