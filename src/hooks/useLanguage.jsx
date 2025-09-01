import { useTranslation } from 'react-i18next'

export const useLanguage = () => {
  const { t, i18n } = useTranslation()

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode)
  }

  const getCurrentLanguage = () => {
    return i18n.language || 'en'
  }

  const getLanguageInfo = () => {
    const languages = {
      en: {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        direction: 'ltr'
      },
      vi: {
        code: 'vi',
        name: 'Vietnamese', 
        nativeName: 'Tiếng Việt',
        flag: '🇻🇳',
        direction: 'ltr'
      }
    }

    return languages[getCurrentLanguage()] || languages.en
  }

  const isRTL = () => {
    return getLanguageInfo().direction === 'rtl'
  }

  // Helper function for pluralization
  const tPlural = (key, count, options = {}) => {
    return t(key, { count, ...options })
  }

  // Helper function for interpolation
  const tInterpolate = (key, values = {}) => {
    return t(key, values)
  }

  // Helper function to get translation with fallback
  const tWithFallback = (key, fallback = '') => {
    const translation = t(key)
    return translation === key ? fallback : translation
  }

  // Format numbers according to current locale
  const formatNumber = (number, options = {}) => {
    const locale = getCurrentLanguage() === 'vi' ? 'vi-VN' : 'en-US'
    return new Intl.NumberFormat(locale, options).format(number)
  }

  // Format dates according to current locale
  const formatDate = (date, options = {}) => {
    const locale = getCurrentLanguage() === 'vi' ? 'vi-VN' : 'en-US'
    return new Intl.DateTimeFormat(locale, options).format(new Date(date))
  }

  // Format currency according to current locale
  const formatCurrency = (amount, currency = 'USD') => {
    const locale = getCurrentLanguage() === 'vi' ? 'vi-VN' : 'en-US'
    const currencyCode = getCurrentLanguage() === 'vi' ? 'VND' : currency
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode
    }).format(amount)
  }

  return {
    t,
    i18n,
    changeLanguage,
    getCurrentLanguage,
    getLanguageInfo,
    isRTL,
    tPlural,
    tInterpolate,
    tWithFallback,
    formatNumber,
    formatDate,
    formatCurrency
  }
}