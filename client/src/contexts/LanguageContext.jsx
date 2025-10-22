import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation files
const translations = {
  en: {
    // Admin Dashboard
    'admin.dashboard.title': 'Admin Dashboard',
    'admin.dashboard.welcome': 'Welcome, {name}',
    'admin.dashboard.loading': 'Loading admin dashboard...',
    'admin.badge': 'Admin',
    
    // Language selector
    'language.selector': 'Language',
    'language.english': 'English',
    'language.turkish': 'Türkçe',
    
    // Navbar
    'nav.browse.memberships': 'Browse Memberships',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.dashboard': 'Dashboard',
    'nav.membership': 'Membership',
    'nav.people': 'People',
    'nav.career.center': 'Career Center',
    'nav.admin': 'Admin',
    'nav.view.profile': 'View Profile',
    'nav.edit.profile': 'Edit Profile',
    'nav.logout': 'Logout',
    'nav.followers': 'Followers',
    'nav.following': 'Following',
    'nav.memberships': 'Memberships',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
  },
  tr: {
    // Admin Dashboard
    'admin.dashboard.title': 'Yönetici Paneli',
    'admin.dashboard.welcome': 'Hoş geldiniz, {name}',
    'admin.dashboard.loading': 'Yönetici paneli yükleniyor...',
    'admin.badge': 'Yönetici',
    
    // Language selector
    'language.selector': 'Dil',
    'language.english': 'English',
    'language.turkish': 'Türkçe',
    
    // Navbar
    'nav.browse.memberships': 'Üyelikleri Gözat',
    'nav.login': 'Giriş Yap',
    'nav.register': 'Kayıt Ol',
    'nav.dashboard': 'Panel',
    'nav.membership': 'Üyelik',
    'nav.people': 'Kişiler',
    'nav.career.center': 'Kariyer Merkezi',
    'nav.admin': 'Yönetici',
    'nav.view.profile': 'Profili Görüntüle',
    'nav.edit.profile': 'Profili Düzenle',
    'nav.logout': 'Çıkış Yap',
    'nav.followers': 'Takipçiler',
    'nav.following': 'Takip Edilenler',
    'nav.memberships': 'Üyelikler',
    
    // Common
    'common.loading': 'Yükleniyor...',
    'common.error': 'Hata',
    'common.success': 'Başarılı',
    'common.cancel': 'İptal',
    'common.save': 'Kaydet',
    'common.edit': 'Düzenle',
    'common.delete': 'Sil',
    'common.view': 'Görüntüle',
    'common.add': 'Ekle',
    'common.search': 'Ara',
    'common.filter': 'Filtrele',
    'common.export': 'Dışa Aktar',
    'common.import': 'İçe Aktar',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to English
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key, params = {}) => {
    let translation = translations[language]?.[key] || translations.en[key] || key;
    
    // Replace parameters in translation
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param]);
    });
    
    return translation;
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const value = {
    language,
    changeLanguage,
    t,
    availableLanguages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
