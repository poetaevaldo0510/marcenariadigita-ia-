import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Helper to fetch translations with a fallback mechanism
const fetchTranslations = async (lang: string) => {
    try {
        const response = await fetch(`/locales/${lang}.json`);
        if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
        return await response.json();
    } catch (error) {
        console.error(error);
        // Fallback to pt-BR if the desired language fails to load
        if (lang !== 'pt-BR') {
            const fallbackResponse = await fetch(`/locales/pt-BR.json`);
            return await fallbackResponse.json();
        }
        return {}; // Return empty if even pt-BR fails
    }
};


export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState(localStorage.getItem('marcenapp_lang') || 'pt-BR');
  const [translations, setTranslations] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadTranslations = async () => {
        const data = await fetchTranslations(language);
        setTranslations(data);
    };
    loadTranslations();
  }, [language]);

  const setLanguage = (lang: string) => {
    localStorage.setItem('marcenapp_lang', lang);
    setLanguageState(lang);
  };

  const t = useCallback((key: string, fallback?: string): string => {
    return translations[key] || fallback || key;
  }, [translations]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
