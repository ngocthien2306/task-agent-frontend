import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { profileService } from '../../services/api';
import { PersonalInfoStepEnhanced } from '../Onboarding/steps/PersonalInfoStepEnhanced';
import { WorkStyleStep } from '../Onboarding/steps/WorkStyleStep';
import { GoalsStep } from '../Onboarding/steps/GoalsStep';
import { InterestsStep } from '../Onboarding/steps/InterestsStep';
import { TechSettingsStep } from '../Onboarding/steps/TechSettingsStep';
import { AICustomizationStep } from '../Onboarding/steps/AICustomizationStep';
import LoadingSpinner from './LoadingSpinner';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, authFetch, updateUser } = useAuth();
  const { t } = useLanguage();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      initializeFormData(profile);
    }
  }, [profile, user]);

  const handleStartEditing = () => {
    if (profile) {
      initializeFormData(profile);
    }
    setIsEditing(true);
    setCurrentStep(1);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentStep(1);
    setFormData({});
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSave(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (stepData) => {
    setFormData(prev => ({
      ...prev,
      ...stepData
    }));
  };

  const steps = [
    {
      id: 1,
      title: "Thông tin cá nhân",
      subtitle: "Hãy cho chúng tôi biết về bản thân và công việc của bạn",
      icon: "👤",
      component: PersonalInfoStepEnhanced
    },
    {
      id: 2,
      title: "Phong cách làm việc", 
      subtitle: "Cách bạn thích làm việc và giao tiếp",
      icon: "⚡",
      component: WorkStyleStep
    },
    {
      id: 3,
      title: "Mục tiêu & Ưu tiên",
      subtitle: "Những gì bạn muốn đạt được",
      icon: "🎯", 
      component: GoalsStep
    },
    {
      id: 4,
      title: "Sở thích cá nhân",
      subtitle: "Để AI hiểu bạn hơn",
      icon: "❤️",
      component: InterestsStep
    },
    {
      id: 5,
      title: "Cài đặt kỹ thuật",
      subtitle: "Tùy chỉnh trải nghiệm công nghệ",
      icon: "⚙️",
      component: TechSettingsStep
    },
    {
      id: 6,
      title: "Tùy chỉnh AI Assistant", 
      subtitle: "Cách AI sẽ hỗ trợ bạn",
      icon: "🤖",
      component: AICustomizationStep
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);
  const StepComponent = currentStepData?.component;
  const progressPercentage = (currentStep / steps.length) * 100;
  }, []);

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const profileData = await profileService.getProfile(user.id, authFetch);
      setProfile(profileData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const initializeFormData = (profileData) => {
    setFormData({
      // Personal Info
      first_name: profileData?.first_name || user?.profile?.first_name || '',
      last_name: profileData?.last_name || user?.profile?.last_name || '',
      phone: profileData?.phone || user?.profile?.phone || '',
      date_of_birth: profileData?.date_of_birth || user?.profile?.date_of_birth || '',
      avatar_url: profileData?.avatar_url || user?.profile?.avatar_url || '',
      
      // Professional Info
      occupation: profileData?.occupation || '',
      company: profileData?.company || '',
      industry: profileData?.industry || '',
      position_level: profileData?.position_level || '',
      work_location: profileData?.work_location || '',
      
      // Work Style
      work_style: profileData?.work_style || user?.personality?.work_style || 'organized',
      communication_style: profileData?.communication_style || user?.personality?.communication_style || 'friendly',
      working_hours: profileData?.working_hours || '',
      break_style: profileData?.break_style || '',
      
      // Goals & Priorities
      primary_goals: profileData?.primary_goals || [],
      task_priorities: profileData?.task_priorities || '',
      planning_horizon: profileData?.planning_horizon || '',
      success_metrics: profileData?.success_metrics || [],
      
      // Personal Interests
      interests: profileData?.interests || user?.interests || [],
      learning_style: profileData?.learning_style || '',
      motivation_factors: profileData?.motivation_factors || [],
      stress_management: profileData?.stress_management || [],
      
      // Tech Settings
      timezone: profileData?.timezone || user?.timezone || 'UTC',
      language_preference: profileData?.language_preference || user?.language_preference || 'en',
      notification_preferences: profileData?.notification_preferences || [],
      device_usage: profileData?.device_usage || '',
      tech_level: profileData?.tech_level || '',
      
      // AI Customization
      interaction_preference: profileData?.interaction_preference || user?.personality?.interaction_preference || 'detailed',
      custom_instructions: profileData?.custom_instructions || user?.custom_instructions || '',
      reminder_style: profileData?.reminder_style || '',
      feedback_preference: profileData?.feedback_preference || '',
      privacy_level: profileData?.privacy_level || ''
    });
  };

  const handleSave = async (finalFormData) => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');
      
      const response = await profileService.updateProfile(user.id, finalFormData, authFetch);
      
      if (response.success) {
        setProfile(response.profile);
        setSuccessMessage('Cập nhật thông tin thành công!');
        setIsEditing(false);
        
        // Update user context if needed
        if (updateUser) {
          updateUser({ ...user, ...response.profile });
        }
      } else {
        setError('Không thể cập nhật thông tin. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Có lỗi xảy ra khi lưu thông tin.');
    } finally {
      setSaving(false);
    }
  };

  const ProfileView = ({ profile }) => {
    const renderField = (label, value, key) => (
      <div key={key} className="bg-gray-50 p-4 rounded-lg">
        <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
        <dd className="text-lg text-gray-900">
          {Array.isArray(value) ? value.join(', ') : (value || 'Chưa cập nhật')}
        </dd>
      </div>
    );

    return (
      <div className="space-y-8">
        {/* Basic Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('Tên', profile.name, 'name')}
            {renderField('Email', profile.email, 'email')}
            {renderField('Tuổi', profile.age, 'age')}
            {renderField('Giới tính', profile.gender, 'gender')}
            {renderField('Nghề nghiệp', profile.occupation, 'occupation')}
            {renderField('Địa điểm', profile.location, 'location')}
          </div>
        </div>

        {/* Work Style */}
        {profile.work_style && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Phong cách làm việc</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Môi trường ưa thích', profile.work_style.preferred_environment, 'work_env')}
              {renderField('Thời gian hiệu quả', profile.work_style.productive_time, 'work_time')}
              {renderField('Phong cách giao tiếp', profile.work_style.communication_style, 'comm_style')}
              {renderField('Cách tiếp cận nhiệm vụ', profile.work_style.task_approach, 'task_approach')}
            </div>
          </div>
        )}

        {/* Goals */}
        {profile.goals && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mục tiêu</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Mục tiêu ngắn hạn', profile.goals.short_term, 'short_goals')}
              {renderField('Mục tiêu dài hạn', profile.goals.long_term, 'long_goals')}
              {renderField('Ưu tiên chính', profile.goals.main_priorities, 'priorities')}
            </div>
          </div>
        )}

        {/* Interests */}
        {profile.interests && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sở thích</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Hobbies', profile.interests.hobbies, 'hobbies')}
              {renderField('Thể loại giải trí ưa thích', profile.interests.entertainment_preferences, 'entertainment')}
              {renderField('Chủ đề quan tâm', profile.interests.topics_of_interest, 'topics')}
            </div>
          </div>
        )}

        {/* AI Customization */}
        {profile.ai_customization && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tùy chỉnh AI</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Phong cách giao tiếp AI', profile.ai_customization.communication_tone, 'ai_tone')}
              {renderField('Mức độ chi tiết phản hồi', profile.ai_customization.response_detail_level, 'ai_detail')}
              {renderField('Tần suất nhắc nhở', profile.ai_customization.reminder_frequency, 'ai_reminder')}
              {renderField('Chủ đề tránh', profile.ai_customization.topics_to_avoid, 'ai_avoid')}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left - Back Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-white/50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Về trang chính
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <nav className="hidden sm:flex space-x-6">
                <button
                  onClick={() => navigate('/calendar')}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Calendar
                </button>
                <button
                  onClick={() => navigate('/notifications')}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Thông báo
                </button>
                <button
                  onClick={() => navigate('/subscription')}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Subscription
                </button>
                <button
                  onClick={() => navigate('/animation-studio')}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Animation Studio
                </button>
              </nav>
            </div>

            {/* Center - Title */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Thông tin cá nhân
              </h1>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center space-x-3">
              {!isEditing && (
                <button
                  onClick={handleStartEditing}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Chỉnh sửa
                </button>
              )}
              
              {isEditing && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCancelEdit}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Hủy
                  </button>
                  <span className="text-sm text-gray-600">
                    Bước {currentStep} / {steps.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-green-800 mb-1">Thành công!</h3>
                <p className="text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-6 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-red-800 mb-1">Có lỗi xảy ra</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 overflow-hidden">
          {isEditing ? (
            /* Editing Mode - Inline Form */
            <div>
              {/* Progress Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Cập nhật thông tin cá nhân</h2>
                    <p className="text-blue-100">Chỉnh sửa thông tin để AI có thể hỗ trợ bạn tốt hơn</p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-blue-400 bg-opacity-30 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-blue-100 mt-2">
                  <span>Bước {currentStep} / {steps.length}</span>
                  <span>{Math.round(progressPercentage)}% hoàn thành</span>
                </div>
              </div>

              {/* Step Content */}
              <div className="p-8">
                {currentStepData && (
                  <>
                    <div className="text-center mb-8">
                      <div className="text-4xl mb-3">{currentStepData.icon}</div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {currentStepData.title}
                      </h3>
                      <p className="text-gray-600">
                        {currentStepData.subtitle}
                      </p>
                    </div>

                    {StepComponent && (
                      <StepComponent 
                        data={formData}
                        onChange={updateFormData}
                      />
                    )}
                  </>
                )}
              </div>

              {/* Footer Navigation */}
              <div className="bg-gray-50 px-8 py-6 flex justify-between items-center">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    currentStep === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  ← Trước
                </button>

                <div className="flex gap-2">
                  {steps.map(step => (
                    <div
                      key={step.id}
                      className={`w-3 h-3 rounded-full transition-all ${
                        step.id === currentStep
                          ? 'bg-blue-500 scale-125'
                          : step.id < currentStep
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-2 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Đang lưu...' : currentStep === steps.length ? 'Cập nhật' : 'Tiếp theo →'}
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="p-8">
              {profile ? (
                <ProfileView profile={profile} />
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto h-16 w-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có thông tin cá nhân
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Tạo profile để cá nhân hóa trải nghiệm AI của bạn
                  </p>
                  <button
                    onClick={handleStartEditing}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tạo profile
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProfilePage;