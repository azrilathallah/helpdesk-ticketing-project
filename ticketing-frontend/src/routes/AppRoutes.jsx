import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import CreateTicketPage from '../pages/ticket/CreateTicketPage';
import CustomerFormPage from '../pages/ticket/sap-masterdata/CustomerFormPage';
import SubmissionPage from '../pages/submission/SubmissionPage';
import ApprovalPage from '../pages/approval/ApprovalPage';

import MainLayout from '../layouts/MainLayout';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        element={ 
          <ProtectedRoute> 
            <MainLayout /> 
          </ProtectedRoute> 
        } 
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        
        <Route path="/create-ticket" element={<CreateTicketPage />} /> 
        <Route path="/create-ticket/sap-masterdata/customer-form" element={<CustomerFormPage />} />

        <Route path="/submission" element={<SubmissionPage />} />
        <Route path="/submission/:id" element={ <SubmissionPage /> } />

        <Route path="/approval" element={<ApprovalPage />} />
        <Route path="/approval/:id" element={ <ApprovalPage /> } />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}