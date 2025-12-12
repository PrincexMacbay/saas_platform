import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import logoImage from '../Logo/neu2.png';

const Homepage = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Content */}
              <div className="text-center lg:text-left">
                <div className="inline-block mb-6">
                  <img 
                    src={logoImage} 
                    alt="Near East University" 
                    className="h-16 md:h-20 lg:h-24 mx-auto lg:mx-0"
                  />
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  {t('homepage.hero.title') || 'Your All-in-One Platform for'} <span className="text-[#3498db]">Membership Management</span> {t('homepage.hero.title.and') || '&'} <span className="text-[#3498db]">Social Networking</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                  {t('homepage.hero.subtitle') || 'Connect, collaborate, and grow with our comprehensive platform featuring membership management, career opportunities, and vibrant community spaces.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  {!isAuthenticated ? (
                    <>
                      <Link
                        to="/register"
                        className="inline-flex items-center justify-center px-8 py-4 bg-[#3498db] text-white font-semibold rounded-lg shadow-lg hover:bg-[#2980b9] transition-all duration-200 transform hover:scale-105"
                      >
                        {t('homepage.cta.get.started') || 'Get Started Free'}
                        <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                      <Link
                        to="/browse-memberships"
                        className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#3498db] font-semibold rounded-lg border-2 border-[#3498db] hover:bg-[#f0f8ff] transition-all duration-200"
                      >
                        {t('homepage.cta.browse.memberships') || 'Browse Memberships'}
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center justify-center px-8 py-4 bg-[#3498db] text-white font-semibold rounded-lg shadow-lg hover:bg-[#2980b9] transition-all duration-200 transform hover:scale-105"
                    >
                      {t('homepage.cta.go.to.dashboard') || 'Go to Dashboard'}
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>

              {/* Right Column - Visual */}
              <div className="relative">
                <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-[#3498db] rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{t('homepage.feature.membership') || 'Membership Management'}</div>
                        <div className="text-sm text-gray-600">{t('homepage.feature.membership.desc') || 'Manage your organization'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{t('homepage.feature.career') || 'Career Center'}</div>
                        <div className="text-sm text-gray-600">{t('homepage.feature.career.desc') || 'Find your next opportunity'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{t('homepage.feature.social') || 'Social Networking'}</div>
                        <div className="text-sm text-gray-600">{t('homepage.feature.social.desc') || 'Connect with your community'}</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative background elements */}
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t('homepage.features.title') || 'Everything You Need in One Platform'}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('homepage.features.subtitle') || 'Powerful features designed to help organizations and individuals connect, grow, and succeed.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 - Membership Management */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-200">
                <div className="w-14 h-14 bg-[#3498db] rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t('homepage.feature.card.membership.title') || 'Membership Management'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('homepage.feature.card.membership.desc') || 'Create custom membership plans, manage applications, process payments, and issue digital membership cards all in one place.'}
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('homepage.feature.card.membership.item1') || 'Customizable plans & pricing'}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('homepage.feature.card.membership.item2') || 'Automated payment processing'}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('homepage.feature.card.membership.item3') || 'Digital membership cards'}
                  </li>
                </ul>
              </div>

              {/* Feature 2 - Career Center */}
              <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-100">
                <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t('homepage.feature.card.career.title') || 'Career Center'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('homepage.feature.card.career.desc') || 'Post jobs, browse opportunities, manage applications, and connect employers with talented professionals.'}
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('homepage.feature.card.career.item1') || 'Job posting & management'}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('homepage.feature.card.career.item2') || 'Application tracking'}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('homepage.feature.card.career.item3') || 'Company profiles & analytics'}
                  </li>
                </ul>
              </div>

              {/* Feature 3 - Social Networking */}
              <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-purple-100">
                <div className="w-14 h-14 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t('homepage.feature.card.social.title') || 'Social Networking'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('homepage.feature.card.social.desc') || 'Create spaces, share posts, engage with your community, and build meaningful connections.'}
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('homepage.feature.card.social.item1') || 'Community spaces & groups'}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('homepage.feature.card.social.item2') || 'Posts, comments & likes'}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('homepage.feature.card.social.item3') || 'Personalized activity feeds'}
                  </li>
                </ul>
              </div>

              {/* Feature 4 - Payment Processing */}
              <div className="bg-gradient-to-br from-yellow-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-yellow-100">
                <div className="w-14 h-14 bg-yellow-600 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t('homepage.feature.card.payment.title') || 'Secure Payments'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('homepage.feature.card.payment.desc') || 'Multiple payment methods, automated billing, invoice generation, and comprehensive payment tracking.'}
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('homepage.feature.card.payment.item1') || 'Multiple payment methods'}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('homepage.feature.card.payment.item2') || 'Automated recurring billing'}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('homepage.feature.card.payment.item3') || 'Invoice & receipt management'}
                  </li>
                </ul>
              </div>

              {/* Feature 5 - Analytics */}
              <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-indigo-100">
                <div className="w-14 h-14 bg-indigo-600 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t('homepage.feature.card.analytics.title') || 'Analytics & Insights'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('homepage.feature.card.analytics.desc') || 'Real-time dashboards, revenue tracking, member analytics, and comprehensive reporting tools.'}
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('homepage.feature.card.analytics.item1') || 'Real-time KPIs & metrics'}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('homepage.feature.card.analytics.item2') || 'Revenue & growth tracking'}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('homepage.feature.card.analytics.item3') || 'Export & reporting tools'}
                  </li>
                </ul>
              </div>

              {/* Feature 6 - Security */}
              <div className="bg-gradient-to-br from-red-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-red-100">
                <div className="w-14 h-14 bg-red-600 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t('homepage.feature.card.security.title') || 'Enterprise Security'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('homepage.feature.card.security.desc') || 'Bank-level security, data encryption, role-based access control, and comprehensive audit trails.'}
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('homepage.feature.card.security.item1') || 'JWT authentication'}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('homepage.feature.card.security.item2') || 'Role-based permissions'}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t('homepage.feature.card.security.item3') || 'Data encryption & backup'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-[#3498db] to-[#2980b9] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">100%</div>
                <div className="text-gray-100">{t('homepage.stats.uptime') || 'Uptime'}</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
                <div className="text-gray-100">{t('homepage.stats.support') || 'Support'}</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">1000+</div>
                <div className="text-gray-100">{t('homepage.stats.users') || 'Active Users'}</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
                <div className="text-gray-100">{t('homepage.stats.organizations') || 'Organizations'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {t('homepage.cta.title') || 'Ready to Get Started?'}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {t('homepage.cta.description') || 'Join thousands of organizations and individuals who are already using our platform to manage memberships, connect communities, and grow their networks.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-8 py-4 bg-[#3498db] text-white font-semibold rounded-lg shadow-lg hover:bg-[#2980b9] transition-all duration-200 transform hover:scale-105"
                  >
                    {t('homepage.cta.create.account') || 'Create Free Account'}
                  </Link>
                  <Link
                    to="/browse-memberships"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#3498db] font-semibold rounded-lg border-2 border-[#3498db] hover:bg-[#f0f8ff] transition-all duration-200"
                  >
                    {t('homepage.cta.explore') || 'Explore Memberships'}
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-4 bg-[#3498db] text-white font-semibold rounded-lg shadow-lg hover:bg-[#2980b9] transition-all duration-200 transform hover:scale-105"
                >
                  {t('homepage.cta.go.to.dashboard') || 'Go to Dashboard'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <img 
                  src={logoImage} 
                  alt="Near East University" 
                  className="h-12 mb-4"
                />
                <p className="text-sm">
                  {t('homepage.footer.description') || 'A comprehensive platform for membership management, social networking, and career opportunities.'}
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">{t('homepage.footer.product') || 'Product'}</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/browse-memberships" className="hover:text-white transition-colors">{t('homepage.footer.memberships') || 'Memberships'}</Link></li>
                  <li><Link to="/career" className="hover:text-white transition-colors">{t('homepage.footer.career') || 'Career Center'}</Link></li>
                  <li><a href="#" className="hover:text-white transition-colors">{t('homepage.footer.features') || 'Features'}</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">{t('homepage.footer.company') || 'Company'}</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">{t('homepage.footer.about') || 'About'}</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">{t('homepage.footer.contact') || 'Contact'}</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">{t('homepage.footer.support') || 'Support'}</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">{t('homepage.footer.legal') || 'Legal'}</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">{t('homepage.footer.privacy') || 'Privacy Policy'}</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">{t('homepage.footer.terms') || 'Terms of Service'}</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
              <p>&copy; {new Date().getFullYear()} {t('homepage.footer.copyright') || 'Near East University. All rights reserved.'}</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Add animation styles */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Homepage;

