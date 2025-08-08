import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserType } from '../services/careerService';
import JobBoard from '../components/career/JobBoard';
import CompanyDashboard from '../components/career/CompanyDashboard';
import IndividualDashboard from '../components/career/IndividualDashboard';
import RoleSelection from '../components/career/RoleSelection';

const CareerCenter = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      
    } catch (error) {
      console.error('Error updating user type:', error);
      setError(error.response?.data?.message || 'Failed to update user type');
    } finally {
      setLoading(false);
    }
  };

  // If user hasn't selected a role yet
  if (!user.userType) {
    return (
      <div className="career-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="text-center mb-4">
                <h1>Career Center</h1>
                <p className="text-muted">Choose your role to get started</p>
              </div>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <RoleSelection 
                onRoleSelect={handleRoleSelection}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render different dashboards based on user type
  return (
    <div className="career-center">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1>Career Center</h1>
              <div className="user-type-badge">
                <span className={`badge ${user.userType === 'individual' ? 'bg-primary' : 'bg-success'}`}>
                  {user.userType === 'individual' ? 'Job Seeker' : 'Employer'}
                </span>
              </div>
            </div>
            
            {user.userType === 'individual' ? (
              <IndividualDashboard />
            ) : (
              <CompanyDashboard />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerCenter;
