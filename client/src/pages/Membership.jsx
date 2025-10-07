import React from 'react';
import MembershipNavbar from '../components/membership/MembershipNavbar';
import ErrorBoundary from '../components/ErrorBoundary';
import { MembershipDataProvider } from '../contexts/MembershipDataContext';

const Membership = () => {
  console.log('🚀 Membership component rendering');
  
  return (
    <ErrorBoundary>
      <MembershipDataProvider>
        <MembershipNavbar />
      </MembershipDataProvider>
    </ErrorBoundary>
  );
};

export default Membership;