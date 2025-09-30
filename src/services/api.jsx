// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000'

export const apiEndpoints = {
  // Auth endpoints
  auth: {
    login: `${API_BASE_URL}/api/v1/auth/login`,
    register: `${API_BASE_URL}/api/v1/auth/register`,
    logout: `${API_BASE_URL}/api/v1/auth/logout`,
    verifyEmail: `${API_BASE_URL}/api/v1/auth/verify-email`,
    resendVerification: `${API_BASE_URL}/api/v1/auth/resend-verification`,
    forgotPassword: `${API_BASE_URL}/api/v1/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/api/v1/auth/reset-password`,
  },
  
  // Onboarding/Profile endpoints
  onboarding: {
    complete: `${API_BASE_URL}/api/v1/onboarding/complete`,
    status: (userId) => `${API_BASE_URL}/api/v1/onboarding/status/${userId}`,
    skip: (userId) => `${API_BASE_URL}/api/v1/onboarding/skip/${userId}`,
    profile: (userId) => `${API_BASE_URL}/api/v1/onboarding/profile/${userId}`,
    updateProfile: (userId) => `${API_BASE_URL}/api/v1/onboarding/profile/${userId}`,
  },

  // Task endpoints
  tasks: {
    getUserTasks: (userId) => `${API_BASE_URL}/api/v1/tasks/${userId}`,
  },
}

// Task API service functions
export const taskService = {
  // Get user tasks with filters
  getUserTasks: async (userId, filters = {}, authFetch) => {
    console.log('taskService.getUserTasks called with:', { userId, filters });
    
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      
      const url = `${apiEndpoints.tasks.getUserTasks(userId)}?${queryParams.toString()}`;
      console.log('Fetching from URL:', url);
      
      const response = await authFetch(url, {
        method: 'GET',
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      throw error;
    }
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

// Auth API service functions
export const authService = {
  // Register user
  register: async (userData) => {
    try {
      const response = await fetch(apiEndpoints.auth.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await fetch(apiEndpoints.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      const response = await fetch(apiEndpoints.auth.verifyEmail, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Email verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  },

  // Resend verification email
  resendVerification: async (email) => {
    try {
      const response = await fetch(apiEndpoints.auth.resendVerification, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to resend verification email');
      }

      return await response.json();
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await fetch(apiEndpoints.auth.forgotPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send password reset email');
      }

      return await response.json();
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await fetch(apiEndpoints.auth.resetPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Password reset failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },
}