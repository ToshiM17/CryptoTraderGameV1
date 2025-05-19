import React, { createContext, useContext, useState, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en, pl, es } from '@/locales';

// Initialize i18next
i18n.init({
  fallbackLng: 'en',
  debug: false,
  resources: {
    en: { translation: en },
    pl: { translation: pl },
    es: { translation: es },
  },
  interpolation: {
    escapeValue: false,
  },
});

type Language = 'en' | 'pl' | 'es';

interface I18nContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // Load language from AsyncStorage on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem('language');
        if (storedLanguage) {
          changeLanguage(storedLanguage as Language);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      }
    };

    loadLanguage();
  }, []);

  const changeLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
    AsyncStorage.setItem('language', lang).catch(err => 
      console.error('Error saving language:', err)
    );
  };

  return (
    <I18nContext.Provider value={{ language, changeLanguage }}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </I18nContext.Provider>
  );
}

export const useI18nContext = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18nContext must be used within an I18nProvider');
  }
  return context;
};