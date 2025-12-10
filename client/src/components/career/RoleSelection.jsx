import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const RoleSelection = ({ onRoleSelect, loading }) => {
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({});

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onRoleSelect(selectedRole, formData);
  };

  const renderIndividualForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="workExperience" className="block text-sm font-semibold text-gray-700 mb-2">
          {t('career.individual.work.experience') || 'Work Experience'}
        </label>
        <textarea
          id="workExperience"
          name="workExperience"
          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          rows="6"
          placeholder={t('career.individual.work.experience.placeholder') || 'Describe your work experience, skills, and achievements...'}
          value={formData.workExperience || ''}
          onChange={handleInputChange}
        />
      </div>
      
      <div>
        <label htmlFor="jobPreferences" className="block text-sm font-semibold text-gray-700 mb-2">
          {t('career.individual.job.preferences') || 'Job Preferences'}
        </label>
        <textarea
          id="jobPreferences"
          name="jobPreferences"
          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          rows="4"
          placeholder={t('career.individual.job.preferences.placeholder') || 'Describe your job preferences (location, salary, industry, work style, etc.)...'}
          value={formData.jobPreferences || ''}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setSelectedRole(null)}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200"
        >
          {t('common.back') || 'Back'}
        </button>
        <button 
          type="submit" 
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading 
            ? (t('common.loading') || 'Setting up...') 
            : (t('career.individual.continue.as.job.seeker') || 'Continue as Job Seeker')
          }
        </button>
      </div>
    </form>
  );

  const renderCompanyForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="companyName" className="block text-sm font-semibold text-gray-700 mb-2">
            {t('career.company.name') || 'Company Name'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder={t('career.company.name.placeholder') || 'Enter your company name'}
            value={formData.companyName || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div>
          <label htmlFor="industry" className="block text-sm font-semibold text-gray-700 mb-2">
            {t('career.company.industry') || 'Industry'}
          </label>
          <input
            type="text"
            id="industry"
            name="industry"
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder={t('career.company.industry.placeholder') || 'e.g., Technology, Healthcare, Finance'}
            value={formData.industry || ''}
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <label htmlFor="companySize" className="block text-sm font-semibold text-gray-700 mb-2">
            {t('career.company.size') || 'Company Size'}
          </label>
          <select
            id="companySize"
            name="companySize"
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={formData.companySize || ''}
            onChange={handleInputChange}
          >
            <option value="">{t('career.company.size.select') || 'Select company size'}</option>
            <option value="1-10">1-10 {t('career.company.employees') || 'employees'}</option>
            <option value="11-50">11-50 {t('career.company.employees') || 'employees'}</option>
            <option value="51-200">51-200 {t('career.company.employees') || 'employees'}</option>
            <option value="201-500">201-500 {t('career.company.employees') || 'employees'}</option>
            <option value="501-1000">501-1000 {t('career.company.employees') || 'employees'}</option>
            <option value="1000+">1000+ {t('career.company.employees') || 'employees'}</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="website" className="block text-sm font-semibold text-gray-700 mb-2">
            {t('career.company.website') || 'Website'}
          </label>
          <input
            type="url"
            id="website"
            name="website"
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="https://yourcompany.com"
            value={formData.website || ''}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
            {t('career.location') || 'Location'}
          </label>
          <input
            type="text"
            id="location"
            name="location"
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder={t('career.location.placeholder') || 'City, State/Country'}
            value={formData.location || ''}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            {t('career.company.description') || 'Company Description'}
          </label>
          <textarea
            id="description"
            name="description"
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            rows="4"
            placeholder={t('career.company.description.placeholder') || 'Brief description of your company...'}
            value={formData.description || ''}
            onChange={handleInputChange}
          />
        </div>
      </div>
      
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setSelectedRole(null)}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200"
        >
          {t('common.back') || 'Back'}
        </button>
        <button 
          type="submit" 
          className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading 
            ? (t('common.loading') || 'Setting up...') 
            : (t('career.company.continue.as.employer') || 'Continue as Employer')
          }
        </button>
      </div>
    </form>
  );

  return (
    <div className="w-full">
      {!selectedRole ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Seeker Card */}
          <div 
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            onClick={() => handleRoleSelect('individual')}
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {t('career.role.seeker.title') || 'I am looking for a job'}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('career.role.seeker.description') || 'Browse job listings, apply for positions, and track your applications.'}
              </p>
              <button
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelect('individual');
                }}
              >
                {t('career.role.seeker.button') || 'Continue as Job Seeker'}
              </button>
            </div>
          </div>
          
          {/* Employer Card */}
          <div 
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            onClick={() => handleRoleSelect('company')}
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {t('career.role.employer.title') || 'I want to hire'}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('career.role.employer.description') || 'Post job openings, manage applications, and find the perfect candidates.'}
              </p>
              <button
                className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelect('company');
                }}
              >
                {t('career.role.employer.button') || 'Continue as Employer'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6">
            <h3 className="text-2xl font-bold text-white">
              {selectedRole === 'individual' 
                ? (t('career.setup.job.seeker') || 'Job Seeker Setup')
                : (t('career.setup.company') || 'Company Setup')
              }
            </h3>
            <p className="text-gray-300 mt-2">
              {selectedRole === 'individual'
                ? (t('career.setup.job.seeker.desc') || 'Tell us about yourself to get started')
                : (t('career.setup.company.desc') || 'Tell us about your company to get started')
              }
            </p>
          </div>
          <div className="p-8">
            {selectedRole === 'individual' ? renderIndividualForm() : renderCompanyForm()}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSelection;
