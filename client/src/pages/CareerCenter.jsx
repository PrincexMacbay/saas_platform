import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { updateUserType } from '../services/careerService';
import CompanyDashboard from '../components/career/CompanyDashboard';
import IndividualDashboard from '../components/career/IndividualDashboard';
import RoleSelection from '../components/career/RoleSelection';
import logoImage from '../Logo/neu2.png';

const CareerCenter = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasCompletedRoleSelection, setHasCompletedRoleSelection] = useState(false);

  useEffect(() => {
    // Check if user has completed role selection
    if (user?.profile?.userType) {
      // If user has a userType set, consider role selection complete
      // The profile data can be filled in later
      setHasCompletedRoleSelection(true);
    } else {
      setHasCompletedRoleSelection(false);
    }
  }, [user]);

  const handleRoleSelection = async (userType, additionalData) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await updateUserType({
        userType,
        ...additionalData,
      });
      
      // Update user context with new data
      updateUser(response.data.user);
      setHasCompletedRoleSelection(true);
      
    } catch (error) {
      console.error('Error updating user type:', error);
      setError(error.response?.data?.message || 'Failed to update user type');
    } finally {
      setLoading(false);
    }
  };

  // If user hasn't completed role selection yet
  if (!hasCompletedRoleSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-6">
              <img 
                src={logoImage} 
                alt="Near East University" 
                className="h-16 md:h-20 mx-auto"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('nav.career.center') || 'Career Center'}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              {t('career.choose.role') || 'Choose your role to get started'}
            </p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}
          
          {/* Role Selection Component */}
          <RoleSelection 
            onRoleSelect={handleRoleSelection}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  // Render different dashboards based on user type
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {t('nav.career.center') || 'Career Center'}
              </h1>
              <p className="text-gray-600">
                {user.profile?.userType === 'individual' 
                  ? t('career.job.seeker') || 'Job Seeker Dashboard'
                  : t('career.employer') || 'Employer Dashboard'
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                user.profile?.userType === 'individual'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {user.profile?.userType === 'individual' 
                  ? t('career.job.seeker') || 'Job Seeker'
                  : t('career.employer') || 'Employer'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.profile?.userType === 'individual' ? (
          <IndividualDashboard />
        ) : (
          <CompanyDashboard />
        )}
      </div>
    </div>
  );
};

export default CareerCenter;
