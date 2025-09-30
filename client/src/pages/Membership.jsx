import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MembershipDashboard from '../components/membership/MembershipDashboard';
import Payments from '../components/membership/Payments';
import ScheduledPayments from '../components/membership/ScheduledPayments';
import Debts from '../components/membership/Debts';
import Plans from '../components/membership/Plans';
import Reminders from '../components/membership/Reminders';
import Applications from '../components/membership/Applications';
import MembershipSettings from '../components/membership/MembershipSettings';
import Coupons from '../components/membership/Coupons';
import ApplicationFormBuilder from '../components/membership/ApplicationFormBuilder';
import ApplicationForms from '../components/membership/ApplicationForms';
import DigitalCard from '../components/membership/DigitalCard';
import PaymentInfo from '../components/membership/PaymentInfo';
import MembershipNavbar from '../components/membership/MembershipNavbar';
import ErrorBoundary from '../components/ErrorBoundary';

const Membership = () => {
  return (
    <MembershipNavbar>
      <Routes>
        <Route path="/" element={<MembershipDashboard />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/scheduled-payments" element={<ScheduledPayments />} />
        <Route path="/debts" element={<Debts />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/settings" element={<MembershipSettings />} />
        <Route path="/coupons" element={<Coupons />} />
        <Route path="/application-forms" element={<ApplicationForms />} />
        <Route path="/application-form" element={<ApplicationFormBuilder />} />
        <Route path="/digital-card" element={<DigitalCard />} />
        <Route path="/payment-info" element={<PaymentInfo />} />
      </Routes>
    </MembershipNavbar>
  );
};

export default Membership;