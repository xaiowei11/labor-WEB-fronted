// src/AppRouter.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 導入頁面組件
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import ExperimenterDashboard from './pages/ExperimenterDashboard';
import WorkerFormPage from './pages/WorkerFormPage';
import NotFoundPage from './pages/NotFoundPage';

// 身份驗證保護組件
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  
  if (!token || !user) {
    // 未登入，重定向到登入頁面
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // 沒有權限，重定向到對應角色的儀表板
    if (user.role === 'superadmin') {
      return <Navigate to="/admin/dashboard" />;
    } else if (user.role === 'owner' || user.role === 'admin') {
      return <Navigate to="/company/dashboard" />;
    } else if (user.role === 'experimenter') {
      return <Navigate to="/experimenter/dashboard" />;
    }
  }
  
  return children;
};

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* 公開頁面 */}
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/form" 
          element={<WorkerFormPage />} 
        />
        
        {/* 超級管理員專用頁面 */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* 公司管理員專用頁面 */}
        <Route 
          path="/company/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['owner', 'admin']}>
              <CompanyDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* 實驗者專用頁面 */}
        <Route 
          path="/experimenter/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['experimenter']}>
              <ExperimenterDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* 首頁重定向 */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* 404 頁面 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;