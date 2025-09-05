import { OnboardingFormModal } from './OnboardingFormModal';

const OnboardingFlow = ({ user, onComplete, onLogout }) => {
  const handleComplete = async (formData) => {
    try {
      // API call to save onboarding data
      const pythonApiUrl = import.meta.env.VITE_PYTHON_API_URL || "http://localhost:8000";
      const userId = user.user_id || user.id || user.username;
      
      const response = await fetch(`${pythonApiUrl}/api/v1/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          user_id: userId,
          onboarding_data: formData,
          completed_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        onComplete(formData);
      } else {
        throw new Error('Failed to save onboarding data');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      // Still complete onboarding but show warning
      onComplete(formData);
    }
  };

  return (
    <OnboardingFormModal
      user={user}
      onComplete={handleComplete}
      onCancel={onLogout}
      mode="onboarding"
    />
  );
};

export { OnboardingFlow };