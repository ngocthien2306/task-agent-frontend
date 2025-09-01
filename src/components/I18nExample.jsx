import React, { useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import LanguageSwitcher, { 
  LanguageSwitcherButtons, 
  LanguageSwitcherFlags 
} from './LanguageSwitcher'

const I18nExample = () => {
  const { 
    t, 
    tInterpolate, 
    formatNumber, 
    formatDate, 
    formatCurrency,
    getLanguageInfo 
  } = useLanguage()

  const [name, setName] = useState('')
  const [step, setStep] = useState(1)
  const currentDate = new Date()
  const sampleAmount = 1000000

  const languageInfo = getLanguageInfo()

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {t('onboarding.welcome')}
        </h1>
        <p className="text-gray-600">
          {t('onboarding.letsGetStarted')}
        </p>
      </div>

      {/* Language Switcher Demo */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {t('common.language')} Switchers
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Dropdown Style</h3>
            <LanguageSwitcher />
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Button Style</h3>
            <LanguageSwitcherButtons />
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Flag Style</h3>
            <LanguageSwitcherFlags />
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Current language: {languageInfo.flag} {languageInfo.nativeName}
        </div>
      </div>

      {/* Basic Translation Demo */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Basic Translations
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            {t('common.save')}
          </button>
          <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            {t('common.cancel')}
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            {t('common.submit')}
          </button>
          <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            {t('common.delete')}
          </button>
        </div>
      </div>

      {/* Navigation Demo */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Navigation Items
        </h2>
        
        <nav className="flex flex-wrap gap-4 mb-4">
          {['home', 'profile', 'settings', 'dashboard', 'help'].map((item) => (
            <a 
              key={item}
              href="#" 
              className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              {t(`navigation.${item}`)}
            </a>
          ))}
        </nav>
      </div>

      {/* Interpolation Demo */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Text Interpolation
        </h2>
        
        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('auth.firstName')}
              className="px-3 py-2 border border-gray-300 rounded w-full max-w-md"
            />
          </div>
          
          {name && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">
                {tInterpolate('onboarding.step', { current: step, total: 5 })}
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <button 
              onClick={() => setStep(Math.max(1, step - 1))}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              {t('common.previous')}
            </button>
            <button 
              onClick={() => setStep(Math.min(5, step + 1))}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {t('common.next')}
            </button>
          </div>
        </div>
      </div>

      {/* Formatting Demo */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Localized Formatting
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Number</h3>
            <p className="text-lg font-semibold">{formatNumber(sampleAmount)}</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Date</h3>
            <p className="text-lg font-semibold">
              {formatDate(currentDate, { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Currency</h3>
            <p className="text-lg font-semibold">{formatCurrency(sampleAmount)}</p>
          </div>
        </div>
      </div>

      {/* Work Styles Demo */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {t('onboarding.workStyle')}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['organized', 'flexible', 'creative', 'analytical'].map((style) => (
            <div 
              key={style}
              className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <div className="text-center">
                <p className="font-medium text-gray-800">
                  {t(`workStyles.${style}`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Messages Demo */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Error Messages
        </h2>
        
        <div className="space-y-2">
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {t('errors.required')}
          </div>
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {t('errors.invalidEmail')}
          </div>
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {tInterpolate('errors.minLength', { min: 8 })}
          </div>
        </div>
      </div>

      {/* Success Messages Demo */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Success Messages
        </h2>
        
        <div className="space-y-2">
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700">
            {t('success.profileUpdated')}
          </div>
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700">
            {t('success.onboardingComplete')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default I18nExample