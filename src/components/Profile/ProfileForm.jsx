import React, { useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage'

const ProfileForm = ({ initialData, onSave, onCancel, loading }) => {
  const { t } = useLanguage()
  
  const [formData, setFormData] = useState({
    // Personal Info
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    phone: initialData?.phone || '',
    date_of_birth: initialData?.date_of_birth || '',
    
    // Professional Info
    occupation: initialData?.occupation || '',
    company: initialData?.company || '',
    industry: initialData?.industry || '',
    position_level: initialData?.position_level || '',
    work_location: initialData?.work_location || '',
    
    // Interests
    interests: initialData?.interests || [],
    
    // Personality/Preferences
    work_style: initialData?.personality?.work_style || '',
    communication_style: initialData?.personality?.communication_style || '',
    interaction_preference: initialData?.personality?.interaction_preference || '',
    timezone: initialData?.personality?.timezone || 'UTC',
    language_preference: initialData?.personality?.language_preference || 'en',
    custom_instructions: initialData?.personality?.custom_instructions || '',
  })

  const [newInterest, setNewInterest] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }))
      setNewInterest('')
    }
  }

  const handleRemoveInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(item => item !== interest)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const workStyleOptions = [
    { value: 'organized', label: t('workStyles.organized') },
    { value: 'flexible', label: t('workStyles.flexible') },
    { value: 'creative', label: t('workStyles.creative') },
    { value: 'analytical', label: t('workStyles.analytical') },
  ]

  const communicationStyleOptions = [
    { value: 'friendly', label: t('communicationStyles.friendly') },
    { value: 'professional', label: t('communicationStyles.professional') },
    { value: 'direct', label: t('communicationStyles.direct') },
    { value: 'casual', label: t('communicationStyles.casual') },
  ]

  const interactionPreferenceOptions = [
    { value: 'detailed', label: t('interactionPreferences.detailed') },
    { value: 'concise', label: t('interactionPreferences.concise') },
    { value: 'conversational', label: t('interactionPreferences.conversational') },
  ]

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh City (ICT)' },
  ]

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'vi', label: 'Tiếng Việt' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {t('profile.personalInfo')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.firstName')}
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.lastName')}
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.phone')}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.dateOfBirth')}
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {t('profile.professionalInfo')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.occupation')}
            </label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.company')}
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.industry')}
            </label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.position')}
            </label>
            <input
              type="text"
              name="position_level"
              value={formData.position_level}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.workLocation')}
            </label>
            <input
              type="text"
              name="work_location"
              value={formData.work_location}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {t('profile.preferences')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('onboarding.workStyle')}
            </label>
            <select
              name="work_style"
              value={formData.work_style}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('common.select')}</option>
              {workStyleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('onboarding.communicationStyle')}
            </label>
            <select
              name="communication_style"
              value={formData.communication_style}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('common.select')}</option>
              {communicationStyleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('onboarding.interactionPreference')}
            </label>
            <select
              name="interaction_preference"
              value={formData.interaction_preference}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('common.select')}</option>
              {interactionPreferenceOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.timezone')}
            </label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.language')}
            </label>
            <select
              name="language_preference"
              value={formData.language_preference}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Interests */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {t('onboarding.interests')}
        </h2>
        
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
              placeholder={t('placeholders.addInterest')}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleAddInterest}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {t('messages.add')}
            </button>
          </div>
        </div>
        
        {formData.interests.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.interests.map((interest, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('onboarding.customInstructions')}
          </label>
          <textarea
            name="custom_instructions"
            value={formData.custom_instructions}
            onChange={handleInputChange}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('placeholders.customInstructions')}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center"
        >
          {loading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {t('common.save')}
        </button>
      </div>
    </form>
  )
}

export default ProfileForm