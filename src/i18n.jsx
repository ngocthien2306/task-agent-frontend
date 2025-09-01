import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import enTranslation from './locales/en/translation.json'
import viTranslation from './locales/vi/translation.json'

const resources = {
  en: {
    translation: enTranslation
  },
  vi: {
    translation: viTranslation
  }
}

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    
    // Language detection options
    detection: {
      // Order and types of detection methods
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      
      // Keys to look for in localStorage
      lookupLocalStorage: 'i18nextLng',
      
      // Cache user language on localStorage
      caches: ['localStorage'],
    },
    
    fallbackLng: 'en', // Default language when detection fails
    
    // Debug mode (set to false in production)
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // React specific options
    react: {
      useSuspense: false, // Set to false to avoid suspense in React 18
    },
    
    // Additional options
    returnObjects: false,
    returnEmptyString: false,
    
    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_',
    
    // Loading
    load: 'languageOnly', // Load only language (en) not region (en-US)
  })

export default i18n