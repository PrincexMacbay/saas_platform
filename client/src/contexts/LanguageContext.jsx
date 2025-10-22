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
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome back, {name}!',
    'dashboard.recent.activity': 'Recent Activity',
    'dashboard.quick.actions': 'Quick Actions',
    'dashboard.stats': 'Statistics',
    
    // Login/Register
    'auth.login.title': 'Login',
    'auth.register.title': 'Register',
    'auth.forgot.password': 'Forgot Password',
    'auth.reset.password': 'Reset Password',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirm.password': 'Confirm Password',
    'auth.first.name': 'First Name',
    'auth.last.name': 'Last Name',
    'auth.username': 'Username',
    'auth.remember.me': 'Remember me',
    'auth.login.button': 'Login',
    'auth.register.button': 'Register',
    'auth.reset.button': 'Reset Password',
    'auth.send.reset': 'Send Reset Email',
    'auth.dont.have.account': "Don't have an account?",
    'auth.have.account': 'Already have an account?',
    'auth.forgot.password.link': 'Forgot your password?',
    
    // Profile
    'profile.title': 'Profile',
    'profile.edit': 'Edit Profile',
    'profile.save': 'Save Changes',
    'profile.cancel': 'Cancel',
    'profile.about': 'About',
    'profile.location': 'Location',
    'profile.website': 'Website',
    'profile.bio': 'Bio',
    'profile.skills': 'Skills',
    'profile.experience': 'Experience',
    'profile.education': 'Education',
    
    // Membership
    'membership.title': 'Membership',
    'membership.plans': 'Membership Plans',
    'membership.current': 'Current Membership',
    'membership.upgrade': 'Upgrade',
    'membership.downgrade': 'Downgrade',
    'membership.cancel': 'Cancel Membership',
    'membership.features': 'Features',
    'membership.benefits': 'Benefits',
    'membership.price': 'Price',
    'membership.duration': 'Duration',
    'membership.dashboard': 'Dashboard',
    'membership.payments': 'Payments',
    'membership.scheduled.payments': 'Scheduled Payments',
    'membership.debts': 'Debts',
    'membership.reminders': 'Reminders',
    'membership.applications': 'Applications',
    'membership.settings': 'Settings',
    'membership.coupons': 'Coupons',
    'membership.application.forms': 'Application Forms',
    'membership.application.form.builder': 'Application Form Builder',
    'membership.digital.card': 'Digital Card',
    'membership.payment.info': 'Payment Info',
    
    // Career Center
    'career.title': 'Career Center',
    'career.jobs': 'Job Listings',
    'career.apply': 'Apply',
    'career.saved': 'Saved Jobs',
    'career.applications': 'My Applications',
    'career.job.title': 'Job Title',
    'career.company': 'Company',
    'career.location': 'Location',
    'career.salary': 'Salary',
    'career.type': 'Job Type',
    'career.description': 'Description',
    'career.requirements': 'Requirements',
    
    // Users
    'users.title': 'People',
    'users.search': 'Search People',
    'users.follow': 'Follow',
    'users.unfollow': 'Unfollow',
    'users.message': 'Message',
    'users.connect': 'Connect',
    'users.mutual.connections': 'Mutual Connections',
    
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
    'common.submit': 'Submit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.confirm': 'Confirm',
    'common.required': 'Required',
    'common.optional': 'Optional',
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
    
    // Dashboard
    'dashboard.title': 'Panel',
    'dashboard.welcome': 'Tekrar hoş geldiniz, {name}!',
    'dashboard.recent.activity': 'Son Aktiviteler',
    'dashboard.quick.actions': 'Hızlı İşlemler',
    'dashboard.stats': 'İstatistikler',
    
    // Login/Register
    'auth.login.title': 'Giriş Yap',
    'auth.register.title': 'Kayıt Ol',
    'auth.forgot.password': 'Şifremi Unuttum',
    'auth.reset.password': 'Şifre Sıfırla',
    'auth.email': 'E-posta',
    'auth.password': 'Şifre',
    'auth.confirm.password': 'Şifreyi Onayla',
    'auth.first.name': 'Ad',
    'auth.last.name': 'Soyad',
    'auth.username': 'Kullanıcı Adı',
    'auth.remember.me': 'Beni hatırla',
    'auth.login.button': 'Giriş Yap',
    'auth.register.button': 'Kayıt Ol',
    'auth.reset.button': 'Şifre Sıfırla',
    'auth.send.reset': 'Sıfırlama E-postası Gönder',
    'auth.dont.have.account': 'Hesabınız yok mu?',
    'auth.have.account': 'Zaten hesabınız var mı?',
    'auth.forgot.password.link': 'Şifrenizi mi unuttunuz?',
    
    // Profile
    'profile.title': 'Profil',
    'profile.edit': 'Profili Düzenle',
    'profile.save': 'Değişiklikleri Kaydet',
    'profile.cancel': 'İptal',
    'profile.about': 'Hakkında',
    'profile.location': 'Konum',
    'profile.website': 'Web Sitesi',
    'profile.bio': 'Biyografi',
    'profile.skills': 'Yetenekler',
    'profile.experience': 'Deneyim',
    'profile.education': 'Eğitim',
    
    // Membership
    'membership.title': 'Üyelik',
    'membership.plans': 'Üyelik Planları',
    'membership.current': 'Mevcut Üyelik',
    'membership.upgrade': 'Yükselt',
    'membership.downgrade': 'Düşür',
    'membership.cancel': 'Üyeliği İptal Et',
    'membership.features': 'Özellikler',
    'membership.benefits': 'Avantajlar',
    'membership.price': 'Fiyat',
    'membership.duration': 'Süre',
    'membership.dashboard': 'Panel',
    'membership.payments': 'Ödemeler',
    'membership.scheduled.payments': 'Planlanmış Ödemeler',
    'membership.debts': 'Borçlar',
    'membership.reminders': 'Hatırlatıcılar',
    'membership.applications': 'Başvurular',
    'membership.settings': 'Ayarlar',
    'membership.coupons': 'Kuponlar',
    'membership.application.forms': 'Başvuru Formları',
    'membership.application.form.builder': 'Başvuru Formu Oluşturucu',
    'membership.digital.card': 'Dijital Kart',
    'membership.payment.info': 'Ödeme Bilgileri',
    
    // Career Center
    'career.title': 'Kariyer Merkezi',
    'career.jobs': 'İş İlanları',
    'career.apply': 'Başvur',
    'career.saved': 'Kaydedilen İşler',
    'career.applications': 'Başvurularım',
    'career.job.title': 'İş Unvanı',
    'career.company': 'Şirket',
    'career.location': 'Konum',
    'career.salary': 'Maaş',
    'career.type': 'İş Türü',
    'career.description': 'Açıklama',
    'career.requirements': 'Gereksinimler',
    
    // Users
    'users.title': 'Kişiler',
    'users.search': 'Kişi Ara',
    'users.follow': 'Takip Et',
    'users.unfollow': 'Takipten Çık',
    'users.message': 'Mesaj',
    'users.connect': 'Bağlan',
    'users.mutual.connections': 'Ortak Bağlantılar',
    
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
    'common.submit': 'Gönder',
    'common.back': 'Geri',
    'common.next': 'İleri',
    'common.previous': 'Önceki',
    'common.close': 'Kapat',
    'common.open': 'Aç',
    'common.yes': 'Evet',
    'common.no': 'Hayır',
    'common.confirm': 'Onayla',
    'common.required': 'Gerekli',
    'common.optional': 'Opsiyonel',
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
