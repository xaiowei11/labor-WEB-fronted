// src/pages/LoginPage.jsx - 修改為使用公司下拉選單
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import '../styles/main.css';

const LoginPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    company_code: '',
    login_code: '',
    password: ''
  });
  
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  
  // 載入所有公司列表
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setCompaniesLoading(true);
        // 使用公開的API獲取公司列表，不需要認證
        const response = await api.companies.getPublicList();
        if (Array.isArray(response.data)) {
          setCompanies(response.data);
        } else {
          console.error('公司資料不是陣列:', response.data);
          setCompanies([]);
        }
      } catch (err) {
        console.error('載入公司列表失敗:', err);
        // 如果無法載入公司列表，可以提供一個回退機制
        toast.error('無法載入公司列表，請稍後再試', {
          position: "top-center",
          autoClose: 3000,
        });
        setCompanies([]);
      } finally {
        setCompaniesLoading(false);
      }
    };
    
    fetchCompanies();
  }, []);
  
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
      localStorage.setItem('token', response.data.token);
      console.log('儲存的 token:', localStorage.getItem('token'));
      localStorage.setItem('user', JSON.stringify(response.data.user));
    
      // 顯示成功通知
      toast.success('登入成功！即將跳轉到儀表板...', {
        position: "top-center",
        autoClose: 2000,
      });

      // 根據角色重定向到不同頁面
      setTimeout(() => {
        const role = response.data.user.role;
        if (role === 'superadmin') {
          navigate('/admin/dashboard');
        } else if (role === 'owner' || role === 'admin') {
          navigate('/company/dashboard');
        } else if (role === 'experimenter') {
          navigate('/experimenter/dashboard');
        } else if (role === 'super_experimenter') {
          navigate('/super-experimenter/dashboard'); 
        } else {
          navigate('/dashboard'); // 預設重定向
        }
      }, 2000); // 2秒後跳轉
      
    } catch (err) {
      console.error('登入失敗', err);
      
      // 修正錯誤處理
      const errorMessage = err.response?.data?.message || '登入失敗，請檢查您的登入資訊';
      setError(errorMessage); 
      
      // 顯示 toast 錯誤通知
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
      });
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
            <label htmlFor="company_code">選擇公司</label>
            {companiesLoading ? (
              <div className="loading-select">載入公司列表中...</div>
            ) : (
              <select
                id="company_code"
                name="company_code"
                value={formData.company_code}
                onChange={handleInputChange}
                required
              >
                <option value="">-- 請選擇公司 --</option>
                {companies.map(company => (
                  <option key={company.id} value={company.code}>
                    {company.code} - {company.name}
                  </option>
                ))}
              </select>
            )}
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
            disabled={loading || companiesLoading}
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