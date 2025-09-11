import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Routes, Route } from "react-router-dom";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { AuthScreen } from "./components/AuthScreen";
import { OnboardingFlow } from "./components/Onboarding/OnboardingFlow";
import CalendarPage from "./components/CalendarPage";
import { useAuth } from "./hooks/useAuth";
import { useState, useEffect } from "react";

function App() {
  const { isAuthenticated, loading, user, logout, authFetch } = useAuth();
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);

  // Check onboarding status when user is authenticated
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isAuthenticated || !user) return;
      
      console.log("Checking onboarding for user:", user);
      
      setCheckingOnboarding(true);
      try {
        // Try different user ID fields
        const userId = user.user_id || user.id || user.username;
        console.log("Using user ID:", userId);
        
        const pythonApiUrl = import.meta.env.VITE_PYTHON_API_URL || "http://localhost:8000";
        const response = await authFetch(`${pythonApiUrl}/api/v1/onboarding/status/${userId}`);
        console.log("Onboarding status response:", response);
        
        if (response.ok) {
          const status = await response.json();
          console.log("Onboarding status:", status);
          setOnboardingStatus(status);
        } else {
          console.log("API call failed, assuming onboarding not completed");
          setOnboardingStatus({ is_onboarding_completed: false });
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // If error checking status, assume onboarding not completed
        console.log("Error occurred, assuming onboarding not completed");
        setOnboardingStatus({ is_onboarding_completed: false });
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [isAuthenticated, user, authFetch]);

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Show onboarding if user hasn't completed it or if we can't determine status
  if (onboardingStatus && !onboardingStatus.is_onboarding_completed) {
    return (
      <OnboardingFlow 
        user={user} 
        onComplete={() => setOnboardingStatus({ is_onboarding_completed: true })}
        onLogout={logout}
      />
    );
  }
  
  // Temporary: Force show onboarding if status check failed (for testing)
  // You can remove this after confirming the API works
  if (onboardingStatus === null) {
    console.log("No onboarding status - showing onboarding flow for testing");
    return (
      <OnboardingFlow 
        user={user} 
        onComplete={() => setOnboardingStatus({ is_onboarding_completed: true })}
        onLogout={logout}
      />
    );
  }

  return (
    <>
      <Loader />
      <Leva hidden />
      <Routes>
        <Route path="/" element={
          <>
            <UI user={user} onLogout={logout} />
            <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
              <Experience />
            </Canvas>
          </>
        } />
        <Route path="/calendar" element={<CalendarPage user={user} />} />
      </Routes>
    </>
  );
}

export default App;
