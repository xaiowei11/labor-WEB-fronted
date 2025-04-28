// src/components/admin/CompanyManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api'; // 確保路徑正確指向您的 api.ts 文件所在位置

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 新增公司表單狀態
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    ownerUsername: '',
    ownerLoginCode: '',
    ownerPassword: '',
    ownerConfirmPassword: ''
  });
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // 載入公司列表
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        
        // 檢查token是否存在
        const token = localStorage.getItem('token');
        console.log('使用的Token:', token);
        
        // 檢查用戶信息
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('當前用戶資訊:', user);
        
        // 打印請求頭信息
        console.log('請求頭:', { Authorization: `Token ${token}` });
        
        const response = await api.companies.getAll();
        
        console.log('API響應:', response);
        
        if (Array.isArray(response.data)) {
          setCompanies(response.data);
        } else {
          console.error('API返回的數據不是陣列:', response.data);
          setCompanies([]); 
          setError('API返回的數據格式不正確');
        }
      } catch (err) {
        console.error('無法載入公司資料', err);
        console.error('完整錯誤:', JSON.stringify(err, null, 2));
        console.error('錯誤響應:', err.response);
        console.error('錯誤狀態:', err.response?.status);
        console.error('錯誤數據:', err.response?.data);
        
        setError('無法載入公司資料: ' + (err.response?.data?.message || err.message));
        setCompanies([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // 處理表單輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 驗證表單
  const validateForm = () => {
    if (!formData.name.trim()) return '請輸入公司名稱';
    if (!formData.code.trim()) return '請輸入公司代碼';
    if (formData.code.length > 10) return '公司代碼不得超過10個字符';
    if (!formData.ownerUsername.trim()) return '請輸入負責人使用者名稱';
    if (!formData.ownerLoginCode.trim()) return '請輸入負責人登入代碼';
    if (!formData.ownerPassword) return '請輸入負責人密碼';
    if (formData.ownerPassword !== formData.ownerConfirmPassword) 
      return '兩次輸入的密碼不一致';
    
    return '';
  };

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 表單驗證
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      // 準備提交的數據
      const companyData = {
        name: formData.name,
        code: formData.code,
        owner_username: formData.ownerUsername,
        owner_login_code: formData.ownerLoginCode,
        owner_password: formData.ownerPassword
      };
      
      // 使用 API 新增公司
      const response = await api.companies.create(companyData);
      
      // 新增成功，更新列表
      const newCompany = response.data;
      setCompanies(prev => [...prev, newCompany]);
      
      // 重置表單
      setFormData({
        name: '',
        code: '',
        ownerUsername: '',
        ownerLoginCode: '',
        ownerPassword: '',
        ownerConfirmPassword: ''
      });
      
      // 顯示成功訊息
      setFormSuccess('公司新增成功！');
      setFormError('');
      
      // 3秒後清除成功訊息
      setTimeout(() => {
        setFormSuccess('');
      }, 3000);
      
    } catch (err) {
      console.error('新增公司失敗', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          '新增公司時發生錯誤: ' + err.message;
      setFormError(errorMessage);
    }
  };

  if (loading) return <div className="loading">載入中...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="company-management">
      <h1>公司管理</h1>
      
      {/* 新增公司表單 */}
      <div className="add-company-form-container">
        <h2>新增公司</h2>
        
        {formError && <div className="error-message">{formError}</div>}
        {formSuccess && <div className="success-message">{formSuccess}</div>}
        
        <form onSubmit={handleSubmit} className="add-company-form">
          <div className="form-group">
            <label htmlFor="name">公司名稱</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="code">公司代碼</label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              required
              maxLength={10}
            />
            <small>最多10個字符，用於公司識別</small>
          </div>
          
          <h3>公司負責人帳號設定</h3>
          
          <div className="form-group">
            <label htmlFor="ownerUsername">使用者名稱</label>
            <input
              type="text"
              id="ownerUsername"
              name="ownerUsername"
              value={formData.ownerUsername}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="ownerLoginCode">登入代碼</label>
            <input
              type="text"
              id="ownerLoginCode"
              name="ownerLoginCode"
              value={formData.ownerLoginCode}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="ownerPassword">密碼</label>
            <input
              type="password"
              id="ownerPassword"
              name="ownerPassword"
              value={formData.ownerPassword}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="ownerConfirmPassword">確認密碼</label>
            <input
              type="password"
              id="ownerConfirmPassword"
              name="ownerConfirmPassword"
              value={formData.ownerConfirmPassword}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <button type="submit" className="submit-button">新增公司</button>
        </form>
      </div>
      
      {/* 公司列表 */}
      <div className="company-list-container">
        <h2>現有公司</h2>
        {companies.length === 0 ? (
          <p>目前還沒有公司資料</p>
        ) : (
          <table className="company-table">
            <thead>
              <tr>
                <th>公司名稱</th>
                <th>公司代碼</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(company => (
                <tr key={company.id}>
                  <td>{company.name}</td>
                  <td>{company.code}</td>
                  <td>
                    <button className="action-button view">查看詳情</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CompanyManagement;