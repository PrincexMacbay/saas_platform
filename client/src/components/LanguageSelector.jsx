import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelector = () => {
  const { language, changeLanguage, availableLanguages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  const currentLanguage = availableLanguages.find(lang => lang.code === language);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Language Selector Button - Responsive Design */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('language.selector')}
        className="
          flex items-center gap-1.5 sm:gap-2
          px-2 sm:px-3 py-1.5 sm:py-2
          bg-white hover:bg-gray-50
          border border-gray-300 hover:border-gray-400
          rounded-lg sm:rounded-xl
          shadow-sm hover:shadow-md
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          active:scale-95
          min-w-[60px] sm:min-w-[70px]
          group
        "
      >
        {/* Flag Emoji */}
        <span className="text-base sm:text-lg leading-none select-none">
          {language === 'en' ? '🇺🇸' : '🇹🇷'}
        </span>
        
        {/* Language Code - Hidden on very small screens, shown on mobile+ */}
        <span className="
          font-semibold text-xs sm:text-sm
          text-gray-700 group-hover:text-gray-900
          hidden xs:inline
        ">
          {language === 'en' ? 'EN' : 'TR'}
        </span>
        
        {/* Dropdown Arrow Icon */}
        <svg 
          className={`
            w-3 h-3 sm:w-3.5 sm:h-3.5
            text-gray-500 group-hover:text-gray-700
            transition-transform duration-200 ease-in-out
            ${isOpen ? 'rotate-180' : ''}
          `}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="
          absolute top-full right-0 mt-2
          bg-white rounded-lg sm:rounded-xl
          border border-gray-200
          shadow-lg
          z-50
          min-w-[120px] sm:min-w-[140px]
          overflow-hidden
          animate-fade-in animate-slide-in-from-top
        ">
          {availableLanguages.map((lang) => {
            const isActive = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`
                  w-full flex items-center justify-between gap-3
                  px-4 py-2.5 sm:py-3
                  text-left
                  transition-all duration-150 ease-in-out
                  ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                  first:rounded-t-lg last:rounded-b-lg
                  focus:outline-none focus:bg-gray-50
                  active:bg-gray-100
                `}
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {/* Flag */}
                  <span className="text-lg sm:text-xl leading-none select-none">
                    {lang.code === 'en' ? '🇺🇸' : '🇹🇷'}
                  </span>
                  
                  {/* Language Info */}
                  <div className="flex flex-col">
                    <span className="text-sm sm:text-base font-medium">
                      {lang.code.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 hidden sm:block">
                      {lang.nativeName}
                    </span>
                  </div>
                </div>
                
                {/* Checkmark for active language */}
                {isActive && (
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
