import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { language, changeLanguage, availableLanguages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = availableLanguages.find(lang => lang.code === language);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="language-selector">
      <button 
        className="language-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('language.selector')}
      >
        <span className="language-flag">
          {language === 'en' ? '🇺🇸' : '🇹🇷'}
        </span>
        <span className="language-name">
          {currentLanguage?.nativeName || 'EN'}
        </span>
        <span className={`language-arrow ${isOpen ? 'open' : ''}`}>
          ▼
        </span>
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              className={`language-option ${language === lang.code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className="language-flag">
                {lang.code === 'en' ? '🇺🇸' : '🇹🇷'}
              </span>
              <span className="language-name">{lang.nativeName}</span>
              {language === lang.code && (
                <span className="language-check">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
