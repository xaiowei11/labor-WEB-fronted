// src/components/forms/WorkerSleepForm.jsx
import React, { useState, useEffect, useSearchParams } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../services/api';
import  '../../styles/WorkerSleepForm.css'; // 假設這是你的 CSS 檔案路徑

const WorkerSleepForm = ({ workerId, companyCode }) => {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // 表單數據
  const [formData, setFormData] = useState({
    sleep_hours: '',
    sleep_quality: ''
  });
  
  // 使用傳入的 workerId 和 companyCode 獲取勞工資料
  useEffect(() => {
    const fetchWorkerData = async () => {
      if (!workerId || !companyCode) {
        setError('連結無效，缺少必要參數');
        setLoading(false);
        return;
      }
      
      try {
        console.log('傳入的參數:', workerId, companyCode);
        console.log('正在調用 API:', `/api/workers/${workerId}/?company_code=${companyCode}`);
        
        // 使用 axios 直接調用
        const response = await axios.get(`http://localhost:8000/api/workers/${workerId}/?company_code=${companyCode}`);
        console.log('API 響應:', response);
        setWorker(response.data);
        setLoading(false);
      } catch (err) {
        console.error('API 錯誤詳情:', err.response || err);
        setError('無法載入勞工資料，請檢查連結是否正確');
        setLoading(false);
      }
    };
    
    fetchWorkerData();
  }, [workerId, companyCode]);
  
  
  // 處理身份確認
  const handleIdentityConfirm = (confirmed) => {
    if (confirmed) {
      setIdentityConfirmed(true);
    } else {
      // 如果不是本人，顯示錯誤訊息
      setError('如果您不是此勞工本人，請聯絡您的公司管理員獲取正確的連結');
    }
  };
  
  // 處理表單輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 獲取URL參數
      const params = new URLSearchParams(window.location.search);
      const workerId = params.get('worker_id');
      
      // 假設表單類型ID為4（睡眠健康表單）
      const formTypeId = 4;
      
      // 提交表單數據
      await axios.post('/api/forms/submit/', {
        worker_id: workerId,
        form_type_id: formTypeId,
        form_data: formData
      });
      
      // 表單提交成功
      setFormSubmitted(true);
    } catch (err) {
      console.error('提交表單失敗', err);
      setError(err.response?.data?.error || '提交表單時發生錯誤');
    }
  };
  
  if (loading) {
    return <div className="loading">載入中...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (formSubmitted) {
    return (
      <div className="success-container">
        <h2>表單提交成功</h2>
        <p>感謝您填寫睡眠健康表單。</p>
        <p>您可以關閉此頁面或繼續填寫其他表單。</p>
      </div>
    );
  }
  
  return (
    <div className="worker-form-container">
      <header className="form-header">
        <h1>勞工健康數據平台</h1>
        <h2>睡眠健康表單</h2>
      </header>
      
      {worker && !identityConfirmed ? (
        <div className="identity-confirmation">
          <h3>身份確認</h3>
          <p>您是 <strong>{worker.name}</strong> 嗎？</p>
          <div className="confirmation-buttons">
            <button 
              className="confirm-yes" 
              onClick={() => handleIdentityConfirm(true)}
            >
              是，我是
            </button>
            <button 
              className="confirm-no" 
              onClick={() => handleIdentityConfirm(false)}
            >
              不是
            </button>
          </div>
        </div>
      ) : worker && identityConfirmed ? (
        <div className="form-container">
          <div className="worker-info">
            <p>您好，<strong>{worker.name}</strong></p>
            <p>勞工代碼: {worker.code}</p>
            <p>請填寫以下睡眠健康相關問題</p>
          </div>
          
          <form onSubmit={handleSubmit} className="sleep-form">
            <div className="form-group">
              <label htmlFor="sleep_hours">昨晚您睡了幾個小時？</label>
              <select
                id="sleep_hours"
                name="sleep_hours"
                value={formData.sleep_hours}
                onChange={handleInputChange}
                required
              >
                <option value="">請選擇</option>
                <option value="less_than_4">少於4小時</option>
                <option value="4_to_6">4-6小時</option>
                <option value="6_to_8">6-8小時</option>
                <option value="8_to_10">8-10小時</option>
                <option value="more_than_10">超過10小時</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="sleep_quality">您昨晚睡得好嗎？</label>
              <select
                id="sleep_quality"
                name="sleep_quality"
                value={formData.sleep_quality}
                onChange={handleInputChange}
                required
              >
                <option value="">請選擇</option>
                <option value="very_poor">非常差</option>
                <option value="poor">差</option>
                <option value="fair">普通</option>
                <option value="good">好</option>
                <option value="very_good">非常好</option>
              </select>
            </div>
            
            <button type="submit" className="submit-button">提交表單</button>
          </form>
        </div>
      ) : (
        <div className="error-container">
          <p>無法載入勞工資料，請確認連結是否正確</p>
        </div>
      )}
      
      <footer className="form-footer">
        <p>&copy; 2025 勞工健康數據平台</p>
        <p>如有問題，請聯絡您的公司管理員</p>
      </footer>
      
      {/* 內嵌樣式 */}
    </div>
  );
};

export default WorkerSleepForm;