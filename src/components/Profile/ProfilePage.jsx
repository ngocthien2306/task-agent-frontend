import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { profileService } from '../../services/api';
import { OnboardingFormModal } from '../Onboarding/OnboardingFormModal';
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

  useEffect(() => {
    fetchProfile();
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

  const handleSave = async (formData) => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');
      
      const response = await profileService.updateProfile(user.id, formData, authFetch);
      
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
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Chỉnh sửa
                </button>
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
                  onClick={() => setIsEditing(true)}
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
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <OnboardingFormModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          initialData={profile}
          onSubmit={handleSave}
          isLoading={saving}
          title="Cập nhật thông tin cá nhân"
          submitText="Lưu thông tin"
        />
      )}
    </div>
  );
};

export default ProfilePage;