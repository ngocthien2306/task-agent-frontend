import { OnboardingFormModal } from './OnboardingFormModal';
import { API_BASE_URL } from '../../config/api';

const OnboardingFlow = ({ user, onComplete, onLogout }) => {
  const handleComplete = async (formData) => {
    try {
      // API call to save onboarding data
      const userId = user.user_id || user.id || user.username;

      const response = await fetch(`${API_BASE_URL}/api/v1/onboarding/complete`, {
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