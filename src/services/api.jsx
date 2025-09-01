// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000'

export const apiEndpoints = {
  // Auth endpoints
  auth: {
    login: `${API_BASE_URL}/api/v1/auth/login`,
    register: `${API_BASE_URL}/api/v1/auth/register`,
    logout: `${API_BASE_URL}/api/v1/auth/logout`,
  },
  
  // Onboarding/Profile endpoints
  onboarding: {
    complete: `${API_BASE_URL}/api/v1/onboarding/complete`,
    status: (userId) => `${API_BASE_URL}/api/v1/onboarding/status/${userId}`,
    skip: (userId) => `${API_BASE_URL}/api/v1/onboarding/skip/${userId}`,
    profile: (userId) => `${API_BASE_URL}/api/v1/onboarding/profile/${userId}`,
    updateProfile: (userId) => `${API_BASE_URL}/api/v1/onboarding/profile/${userId}`,
  },
}

// Profile API service functions
export const profileService = {
  // Get user profile
  getProfile: async (userId, authFetch) => {
    try {
      const response = await authFetch(apiEndpoints.onboarding.profile(userId), {
        method: 'GET',
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw error
    }
  },

  // Update user profile
  updateProfile: async (userId, profileData, authFetch) => {
    try {
      const response = await authFetch(apiEndpoints.onboarding.updateProfile(userId), {
        method: 'PUT',
        body: JSON.stringify(profileData),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  },

  // Get onboarding status
  getOnboardingStatus: async (userId, authFetch) => {
    try {
      const response = await authFetch(apiEndpoints.onboarding.status(userId), {
        method: 'GET',
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch onboarding status: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching onboarding status:', error)
      throw error
    }
  },

  // Complete onboarding
  completeOnboarding: async (userId, onboardingData, authFetch) => {
    try {
      const requestData = {
        user_id: userId,
        onboarding_data: onboardingData,
        completed_at: new Date().toISOString()
      }
      
      const response = await authFetch(apiEndpoints.onboarding.complete, {
        method: 'POST',
        body: JSON.stringify(requestData),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to complete onboarding: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error completing onboarding:', error)
      throw error
    }
  },

  // Skip onboarding
  skipOnboarding: async (userId, authFetch) => {
    try {
      const response = await authFetch(apiEndpoints.onboarding.skip(userId), {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error(`Failed to skip onboarding: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error skipping onboarding:', error)
      throw error
    }
  },
}