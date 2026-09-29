import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import CreateTicketPage from '../pages/ticket/CreateTicketPage';
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
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}