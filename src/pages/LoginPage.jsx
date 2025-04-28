// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/main.css';

const LoginPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    company_code: '',
    login_code: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 處理輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 提交登入表單
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.auth.login(
        formData.company_code, 
        formData.login_code, 
        formData.password
      );
      
      // 保存 token 和用戶資料
      console.log('登入回應:', response.data);
    
    // 保存 token 和用戶資料
    localStorage.setItem('token', response.data.token);
    
    // 添加這個日誌來確認 token 是否正確保存
    console.log('儲存的 token:', localStorage.getItem('token'));
    
    localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // 根據角色重定向到不同頁面
      const role = response.data.user.role;
      if (role === 'superadmin') {
        navigate('/admin/dashboard');
      } else if (role === 'owner' || role === 'admin') {
        navigate('/company/dashboard');
      } else if (role === 'experimenter') {
        navigate('/experimenter/dashboard');
      } else {
        navigate('/dashboard'); // 預設重定向
      }
      
    } catch (err) {
      console.error('登入失敗', err);
      const errorMessage = err.response?.data?.message || '登入失敗，請檢查您的登入資訊';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-page">
      <div className="login-container">
        <h1>勞工健康數據平台</h1>
        <h2>登入系統</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="company_code">公司代碼</label>
            <input
              type="text"
              id="company_code"
              name="company_code"
              value={formData.company_code}
              onChange={handleInputChange}
              required
              placeholder="輸入公司代碼"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="login_code">登入帳號</label>
            <input
              type="text"
              id="login_code"
              name="login_code"
              value={formData.login_code}
              onChange={handleInputChange}
              required
              placeholder="輸入登入帳號"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">密碼</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="輸入密碼"
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>
        
        <div className="login-info">
          <p>
            如果您是勞工，請使用管理員提供的專屬連結填寫表單。
          </p>
          <p>
            如果您忘記密碼，請聯繫系統管理員重設。
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;