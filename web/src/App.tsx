import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';
import { usePreferences } from './stores/preferences';

export default function App() {
  const { language, theme } = usePreferences();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    void i18n.changeLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language, i18n]);

  useEffect(() => {
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && prefersDark));
  }, [theme]);

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl">{t('appTitle')}</h1>
    </main>
  );
}
