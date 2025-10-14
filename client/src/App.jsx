import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Membership from './pages/Membership';
import BrowseMemberships from './pages/BrowseMemberships';
import PlanDetail from './pages/PlanDetail';
import ApplyMembership from './pages/ApplyMembership';
import ApplicationPayment from './pages/ApplicationPayment';
import Users from './pages/Users';
import CareerCenter from './pages/CareerCenter';
import JobDetail from './components/career/JobDetail';
import AdminDashboard from './pages/AdminDashboard';
import DebugRegistration from './components/DebugRegistration';
import ProtectedRoute from './components/ProtectedRoute';
import SimpleErrorLogger from './components/SimpleErrorLogger';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/debug" element={<DebugRegistration />} />
              <Route path="/browse-memberships" element={<BrowseMemberships />} />
              <Route path="/plan/:id" element={<PlanDetail />} />
                              <Route path="/apply/:planId" element={<ApplyMembership />} />
                <Route path="/payment/application/:applicationId" element={<ApplicationPayment />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:identifier"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/membership/*"
                element={
                  <ProtectedRoute>
                    <Membership />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/career"
                element={
                  <ProtectedRoute>
                    <CareerCenter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/career/job/:jobId"
                element={
                  <ProtectedRoute>
                    <JobDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          {/* <SimpleErrorLogger /> */}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;