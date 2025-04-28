// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import CompanyManagement from '../components/admin/CompanyManagement';
import api from '../services/api'; // 確保路徑正確

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 檢查用戶是否已登入且是超級管理員
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData && userData.role === 'superadmin') {
          setUser(userData);
        }
        setLoading(false);
      } catch (err) {
        console.error('解析用戶資料錯誤', err);
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // 登出處理
  const handleLogout = () => {
    // 實際環境中應使用 api.auth.logout()
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  
  // 如果正在載入，顯示載入中
  if (loading) {
    return <div className="loading">載入中...</div>;
  }
  
  // 如果未登入或不是超級管理員，重定向到登入頁面
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>超級管理員儀表板</h1>
        <div className="user-info">
          <span>您好，{user.username}</span>
          <button className="logout-btn" onClick={handleLogout}>登出</button>
        </div>
      </header>
      
      <nav className="dashboard-nav">
        <ul>
          <li className="active">公司管理</li>
          <li>系統設定</li>
          <li>用戶管理</li>
        </ul>
      </nav>
      
      <main className="dashboard-content">
        <CompanyManagement />
      </main>
      
      <footer className="dashboard-footer">
        <p>&copy; 2025 勞工健康數據平台</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;