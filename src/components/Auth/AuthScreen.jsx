import { useState } from "react";
import { Login } from "./Login";
import { Register } from "./Register";
import { ForgotPassword } from "./ForgotPassword";
import { useAuth } from "../../hooks/useAuth";

export const AuthScreen = () => {
  const [currentView, setCurrentView] = useState("login"); // "login", "register", "forgot"
  const [showSuccess, setShowSuccess] = useState(false);
  const { login } = useAuth();

  const handleLoginSuccess = (userData, accessToken) => {
    login(userData, accessToken);
  };

  const handleRegisterSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCurrentView("login");
    }, 2000);
  };

  const handleResetSuccess = (email) => {
    // You can add additional logic here if needed
    console.log("Password reset sent to:", email);
  };

  const switchToLogin = () => setCurrentView("login");
  const switchToRegister = () => setCurrentView("register");
  const switchToForgotPassword = () => setCurrentView("forgot");

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
        <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-xl shadow-2xl p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Created Successfully!</h2>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (currentView === "login") {
    return (
      <Login 
        onSwitchToRegister={switchToRegister}
        onSwitchToForgotPassword={switchToForgotPassword}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  } else if (currentView === "register") {
    return (
      <Register 
        onSwitchToLogin={switchToLogin}
        onRegisterSuccess={handleRegisterSuccess}
      />
    );
  } else if (currentView === "forgot") {
    return (
      <ForgotPassword 
        onBackToLogin={switchToLogin}
        onResetSuccess={handleResetSuccess}
      />
    );
  }

  return null;
};