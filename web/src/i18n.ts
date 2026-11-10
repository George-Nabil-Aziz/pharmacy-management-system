import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar/common.json';
import en from './locales/en/common.json';

void i18n.use(initReactI18next).init({
  resources: { en: { common: en }, ar: { common: ar } },
  lng: 'ar',
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

export default i18n;
