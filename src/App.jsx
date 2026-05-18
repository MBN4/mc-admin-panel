import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminRegister from './pages/AdminRegister';
import AdminLogin from './pages/AdminLogin';
import AdminForgotPassword from './pages/AdminForgotPassword';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Qualities from './pages/Qualities';
import QualityDetails from './pages/QualityDetails';
import Customers from './pages/Customers';
import Staff from './pages/Staff';
import { useAdminStore } from './store/useAdminStore';

const ProtectedRoute = ({ children }) => {
  const token = useAdminStore((state) => state.token);
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/register" element={<AdminRegister />} />
        <Route path="/forgot-password" element={<AdminForgotPassword />} />
        
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/qualities" element={<Qualities />} />
          <Route path="/qualities/:id" element={<QualityDetails />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/staff" element={<Staff />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;