import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import { profileService } from '../../services/api'
import ProfileForm from './ProfileForm'
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
        
        setSuccessMessage(t('success.profileUpdated'))
        setIsEditing(false)
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(response.error || t('errors.serverError'))
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(t('errors.networkError'))
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
            {t('navigation.profile')}
          </h1>
          <div className="flex items-center space-x-3">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {t('common.edit')}
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
              {isEditing ? (
                <ProfileForm
                  initialData={profile}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  loading={saving}
                />
              ) : (
                <ProfileView profile={profile} />
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>{t('errors.unknownError')}</p>
              <button
                onClick={fetchProfile}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {t('messages.retry')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Profile View Component (Read-only)
const ProfileView = ({ profile }) => {
  const { t } = useLanguage()

  const sections = [
    {
      title: t('profile.personalInfo'),
      fields: [
        { label: t('auth.firstName'), value: profile.first_name },
        { label: t('auth.lastName'), value: profile.last_name },
        { label: t('auth.email'), value: profile.email },
        { label: t('profile.phone'), value: profile.phone },
        { label: t('profile.dateOfBirth'), value: profile.date_of_birth },
      ]
    },
    {
      title: t('profile.professionalInfo'),
      fields: [
        { label: t('profile.occupation'), value: profile.occupation },
        { label: t('profile.company'), value: profile.company },
        { label: t('profile.industry'), value: profile.industry },
        { label: t('profile.position'), value: profile.position_level },
        { label: t('profile.workLocation'), value: profile.work_location },
      ]
    },
    {
      title: t('profile.preferences'),
      fields: [
        { label: t('onboarding.workStyle'), value: profile.personality?.work_style ? t(`workStyles.${profile.personality.work_style}`) : null },
        { label: t('onboarding.communicationStyle'), value: profile.personality?.communication_style ? t(`communicationStyles.${profile.personality.communication_style}`) : null },
        { label: t('onboarding.interactionPreference'), value: profile.personality?.interaction_preference ? t(`interactionPreferences.${profile.personality.interaction_preference}`) : null },
        { label: t('profile.timezone'), value: profile.personality?.timezone },
        { label: t('profile.language'), value: profile.personality?.language_preference },
      ]
    },
    {
      title: t('onboarding.interests'),
      fields: [
        { 
          label: t('onboarding.interests'), 
          value: profile.interests?.length > 0 ? profile.interests.join(', ') : null 
        },
        { 
          label: t('onboarding.customInstructions'), 
          value: profile.personality?.custom_instructions 
        },
      ]
    }
  ]

  return (
    <div className="space-y-8">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {section.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map((field, fieldIndex) => (
              <div key={fieldIndex} className="space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  {field.label}
                </label>
                <p className="text-gray-800 bg-white p-3 rounded border min-h-[48px] flex items-center">
                  {field.value || (
                    <span className="text-gray-400 italic">
                      {t('messages.notSet')}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Onboarding Status */}
      {profile.is_onboarding_completed && (
        <div className="bg-green-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-800 mb-2">
            {t('onboarding.setupComplete')}
          </h2>
          <p className="text-green-600">
            {t('onboarding.readyToUse')}
          </p>
          {profile.onboarding_completed_at && (
            <p className="text-sm text-green-600 mt-2">
              Completed: {new Date(profile.onboarding_completed_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default Profile