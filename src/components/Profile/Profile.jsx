import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import { profileService } from '../../services/api'
import { OnboardingFormModal } from '../Onboarding/OnboardingFormModal'
import LoadingSpinner from './LoadingSpinner'

const Profile = ({ onClose }) => {
  const { user, authFetch, updateUser } = useAuth()
  const { t } = useLanguage()
  
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      setError(null)
      const profileData = await profileService.getProfile(user.id, authFetch)
      setProfile(profileData)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError(t('errors.networkError'))
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (formData) => {
    if (!user?.id) return
    
    try {
      setSaving(true)
      setError(null)
      setSuccessMessage('')
      
      const response = await profileService.updateProfile(user.id, formData, authFetch)
      
      if (response.success) {
        // Update profile state
        setProfile(response.updated_profile)
        
        // Update user in auth context if needed
        if (response.updated_profile) {
          updateUser({
            ...user,
            profile: response.updated_profile
          })
        }
        
        setSuccessMessage('Thông tin cá nhân đã được cập nhật thành công!')
        setIsEditing(false)
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(response.error || 'Đã có lỗi xảy ra khi cập nhật thông tin')
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Lỗi kết nối. Vui lòng thử lại sau.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError(null)
    setSuccessMessage('')
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <LoadingSpinner />
            <span className="ml-3 text-gray-600">{t('common.loading')}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">
            Thông tin cá nhân
          </h1>
          <div className="flex items-center space-x-3">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Chỉnh sửa
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="m-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">{successMessage}</p>
            </div>
          )}
          
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Profile Content */}
          {profile ? (
            <div className="p-6">
              <ProfileView profile={profile} />
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>Không thể tải thông tin cá nhân</p>
              <button
                onClick={fetchProfile}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Thử lại
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Onboarding Form Modal for Editing */}
      {isEditing && profile && (
        <OnboardingFormModal
          user={user}
          onComplete={handleSave}
          onCancel={handleCancel}
          initialData={profile}
          mode="edit"
          title="Cập nhật thông tin cá nhân"
          subtitle="Chỉnh sửa thông tin để AI có thể hỗ trợ bạn tốt hơn"
        />
      )}
    </div>
  )
}

// Profile View Component (Read-only)
const ProfileView = ({ profile }) => {
  const predefinedInterests = {
    'technology': { label: 'Technology', icon: '💻' },
    'sports': { label: 'Sports', icon: '⚽' },
    'reading': { label: 'Reading', icon: '📚' },
    'music': { label: 'Music', icon: '🎵' },
    'travel': { label: 'Travel', icon: '✈️' },
    'cooking': { label: 'Cooking', icon: '👩‍🍳' },
    'photography': { label: 'Photography', icon: '📷' },
    'art': { label: 'Art', icon: '🎨' },
    'fitness': { label: 'Fitness', icon: '💪' },
    'gaming': { label: 'Gaming', icon: '🎮' },
    'movies': { label: 'Movies', icon: '🎬' },
    'nature': { label: 'Nature', icon: '🌿' },
    'science': { label: 'Science', icon: '🔬' },
    'fashion': { label: 'Fashion', icon: '👗' },
    'food': { label: 'Food', icon: '🍽️' },
    'cars': { label: 'Cars', icon: '🚗' },
    'pets': { label: 'Pets', icon: '🐕' },
    'gardening': { label: 'Gardening', icon: '🌱' },
    'languages': { label: 'Languages', icon: '🗣️' },
    'business': { label: 'Business', icon: '💼' },
    'history': { label: 'History', icon: '📜' },
    'dancing': { label: 'Dancing', icon: '💃' },
    'writing': { label: 'Writing', icon: '✍️' },
    'volunteering': { label: 'Volunteering', icon: '🤝' },
    'meditation': { label: 'Meditation', icon: '🧘' }
  };

  const workStyleLabels = {
    'organized': 'Có tổ chức',
    'flexible': 'Linh hoạt', 
    'creative': 'Sáng tạo',
    'analytical': 'Phân tích'
  };

  const communicationStyleLabels = {
    'friendly': 'Thân thiện',
    'professional': 'Chuyên nghiệp',
    'direct': 'Trực tiếp',
    'casual': 'Thoải mái'
  };

  const interactionPreferenceLabels = {
    'detailed': 'Chi tiết',
    'concise': 'Ngắn gọn',
    'conversational': 'Trò chuyện'
  };

  const sections = [
    {
      title: 'Thông tin cá nhân',
      icon: '👤',
      color: 'blue',
      fields: [
        { label: 'Họ', value: profile.first_name, icon: '👤' },
        { label: 'Tên', value: profile.last_name, icon: '✨' },
        { label: 'Email', value: profile.email, icon: '📧' },
        { label: 'Số điện thoại', value: profile.phone, icon: '📱' },
        { label: 'Ngày sinh', value: profile.date_of_birth, icon: '🎂' },
      ]
    },
    {
      title: 'Thông tin nghề nghiệp',
      icon: '💼',
      color: 'emerald',
      fields: [
        { label: 'Nghề nghiệp', value: profile.occupation, icon: '💼' },
        { label: 'Công ty', value: profile.company, icon: '🏢' },
        { label: 'Ngành nghề', value: profile.industry, icon: '🎯' },
        { label: 'Vị trí', value: profile.position_level, icon: '📊' },
        { label: 'Nơi làm việc', value: profile.work_location, icon: '📍' },
      ]
    },
    {
      title: 'Tùy chọn cá nhân',
      icon: '⚙️',
      color: 'purple',
      fields: [
        { label: 'Phong cách làm việc', value: profile.work_style ? workStyleLabels[profile.work_style] : null, icon: '⚡' },
        { label: 'Phong cách giao tiếp', value: profile.communication_style ? communicationStyleLabels[profile.communication_style] : null, icon: '💬' },
        { label: 'Cách tương tác', value: profile.interaction_preference ? interactionPreferenceLabels[profile.interaction_preference] : null, icon: '🤝' },
        { label: 'Múi giờ', value: profile.timezone, icon: '🌍' },
        { label: 'Ngôn ngữ', value: profile.language_preference === 'vi' ? 'Tiếng Việt' : 'English', icon: '🗣️' },
      ]
    },
    {
      title: 'Sở thích & Hướng dẫn',
      icon: '❤️',
      color: 'pink',
      fields: [
        { 
          label: 'Sở thích', 
          value: profile.interests?.length > 0 ? 'interests_list' : null,
          icon: '🎯',
          isInterestsList: true
        },
        { 
          label: 'Hướng dẫn tùy chỉnh', 
          value: profile.custom_instructions,
          icon: '📝'
        },
      ]
    }
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'from-blue-50 to-indigo-50',
        border: 'border-blue-200',
        header: 'bg-blue-500',
        text: 'text-blue-700'
      },
      emerald: {
        bg: 'from-emerald-50 to-teal-50',
        border: 'border-emerald-200',
        header: 'bg-emerald-500',
        text: 'text-emerald-700'
      },
      purple: {
        bg: 'from-purple-50 to-violet-50',
        border: 'border-purple-200',
        header: 'bg-purple-500',
        text: 'text-purple-700'
      },
      pink: {
        bg: 'from-pink-50 to-rose-50',
        border: 'border-pink-200',
        header: 'bg-pink-500',
        text: 'text-pink-700'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-8">
      {/* Avatar Display */}
      {profile.avatar_url && (
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <img
              src={profile.avatar_url}
              alt="User Avatar"
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white rounded-full w-8 h-8 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {sections.map((section, sectionIndex) => {
        const colorClasses = getColorClasses(section.color);
        return (
          <div key={sectionIndex} className={`bg-gradient-to-r ${colorClasses.bg} border ${colorClasses.border} rounded-2xl overflow-hidden shadow-sm`}>
            {/* Section Header */}
            <div className={`${colorClasses.header} px-6 py-4`}>
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
                  <span className="text-lg">{section.icon}</span>
                </div>
                <h2 className="text-lg font-semibold text-white">
                  {section.title}
                </h2>
              </div>
            </div>

            {/* Section Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="bg-white rounded-xl p-4 shadow-sm border border-white border-opacity-50">
                    <label className={`text-sm font-medium ${colorClasses.text} flex items-center mb-2`}>
                      <span className="text-base mr-2">{field.icon}</span>
                      {field.label}
                    </label>
                    <div className="text-gray-800 min-h-[24px]">
                      {field.isInterestsList && profile.interests?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.interests.map((interest, idx) => {
                            const interestData = predefinedInterests[interest];
                            return (
                              <span
                                key={idx}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-800"
                              >
                                {interestData && (
                                  <span className="mr-2 text-base">{interestData.icon}</span>
                                )}
                                {interestData ? interestData.label : interest}
                              </span>
                            );
                          })}
                        </div>
                      ) : field.value && !field.isInterestsList ? (
                        <p className="flex items-center">{field.value}</p>
                      ) : (
                        <p className="flex items-center">
                          <span className="text-gray-400 italic">
                            Chưa thiết lập
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Onboarding Status */}
      {profile.is_onboarding_completed && (
        <div className="bg-green-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-800 mb-2">
            Thiết lập hoàn tất ✅
          </h2>
          <p className="text-green-600">
            AI Assistant đã được cá nhân hóa và sẵn sàng hỗ trợ bạn!
          </p>
          {profile.onboarding_completed_at && (
            <p className="text-sm text-green-600 mt-2">
              Hoàn thành: {new Date(profile.onboarding_completed_at).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default Profile