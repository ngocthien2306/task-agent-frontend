import React from 'react'
import { useTranslation } from 'react-i18next'

const LanguageSwitcher = ({ className = '' }) => {
  const { i18n, t } = useTranslation()

  const languages = [
    {
      code: 'en',
      name: 'English',
      flag: '🇺🇸'
    },
    {
      code: 'vi', 
      name: 'Tiếng Việt',
      flag: '🇻🇳'
    }
  ]

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode)
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   cursor-pointer text-sm font-medium"
        aria-label={t('common.language')}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
      
      {/* Custom dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

// Alternative button-style language switcher
export const LanguageSwitcherButtons = ({ className = '' }) => {
  const { i18n } = useTranslation()

  const languages = [
    {
      code: 'en',
      name: 'EN',
      fullName: 'English',
      flag: '🇺🇸'
    },
    {
      code: 'vi',
      name: 'VI', 
      fullName: 'Tiếng Việt',
      flag: '🇻🇳'
    }
  ]

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode)
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                     ${i18n.language === lang.code 
                       ? 'bg-blue-500 text-white shadow-md' 
                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                     }`}
          title={lang.fullName}
          aria-label={`Switch to ${lang.fullName}`}
        >
          <span className="mr-1">{lang.flag}</span>
          {lang.name}
        </button>
      ))}
    </div>
  )
}

// Minimal flag-only switcher
export const LanguageSwitcherFlags = ({ className = '' }) => {
  const { i18n } = useTranslation()

  const languages = [
    { code: 'en', flag: '🇺🇸', name: 'English' },
    { code: 'vi', flag: '🇻🇳', name: 'Tiếng Việt' }
  ]

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode)
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`p-2 rounded-full text-lg transition-all duration-200 hover:scale-110
                     ${i18n.language === lang.code 
                       ? 'ring-2 ring-blue-500 bg-blue-50' 
                       : 'hover:bg-gray-100'
                     }`}
          title={lang.name}
          aria-label={`Switch to ${lang.name}`}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher