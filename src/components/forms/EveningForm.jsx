// src/components/forms/EveningForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SleepinessScale from './form-components/SleepinessScale';
import EyeFatigueScale from './form-components/EyeFatigueScale';
import '../../styles/FormComponents.css';

const EveningForm = ({ workerCode, companyCode, batchNumber, formTypeId = 1, onSubmitSuccess }) => {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // 嗜睡量表數據
  const [sleepinessData, setSleepinessData] = useState({
    sleepiness_level: ''
  });
  
  // 視覺疲勞量表數據
  const [eyeFatigueData, setEyeFatigueData] = useState({
    dry_eyes: '',
    eye_pain: '',
    blurred_vision: '',
    focus_difficulty: '',
    headache: ''
  });
  
  // 使用傳入的 workerCode 和 companyCode 獲取勞工資料
  useEffect(() => {
    const fetchWorkerData = async () => {
      if (!workerCode || !companyCode) {
        setError('連結無效，缺少必要參數');
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(`http://localhost:8000/api/public/worker-by-code/?worker_code=${workerCode}&company_code=${companyCode}`);
        setWorker(response.data);
        setLoading(false);
      } catch (err) {
        console.error('API 錯誤詳情:', err.response || err);
        setError('無法載入勞工資料，請檢查連結是否正確');
        setLoading(false);
      }
    };
    
    fetchWorkerData();
  }, [workerCode, companyCode]);
  
  // 從子元件接收嗜睡量表數據
  const handleSleepinessDataChange = (data) => {
    setSleepinessData(data);
  };
  
  // 從子元件接收視覺疲勞量表數據
  const handleEyeFatigueDataChange = (data) => {
    setEyeFatigueData(data);
  };
  
  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 獲取勞工資料
      const workerResponse = await axios.get(`http://localhost:8000/api/public/worker-by-code/?worker_code=${workerCode}&company_code=${companyCode}`);
      const workerId = workerResponse.data.id;
      
      // 整合所有表單數據
      const combinedFormData = {
        ...sleepinessData,
        ...eyeFatigueData,
        time_segment: 4, // 第四時段
        batch_number: batchNumber
      };
      
      // 準備提交的數據
      const submitData = {
        worker_id: workerId,
        form_type_id: formTypeId, // 第四時段表單ID
        submission_count: batchNumber,
        form_data: combinedFormData
      };
      
      console.log('將提交以下數據:', submitData);
      
      // 提交表單數據
      const response = await axios.post('http://localhost:8000/api/public/forms/submit/', submitData);
      
      console.log('API響應成功:', response);
      
      // 表單提交成功
      setFormSubmitted(true);
      
    } catch (err) {
      console.error('提交表單失敗 - 完整錯誤:', err);
      
      // 顯示用戶友好的錯誤消息
      const errorMessage = err.response?.data?.error || 
                         err.response?.data?.message || 
                         `提交表單時發生錯誤 (${err.message})`;
      setError(errorMessage);
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
        <p>感謝您填寫下班前表單。</p>
        <p>這是第{batchNumber}批次的提交。</p>
        <button onClick={() => {
          if (typeof onSubmitSuccess === 'function') {
            onSubmitSuccess();
          }
        }} className="back-to-list-button">
          返回表單列表
        </button>
      </div>
    );
  }
  
  return (
    <div className="form-container">
      <header className="form-header">
        <h1>勞工健康數據平台</h1>
        <h2>下班前表單 (第{batchNumber}批次)</h2>
      </header>
      
      <div className="form-content">
        <div className="worker-info">
          <p>您好，<strong>{worker?.name || '勞工'}</strong></p>
          <p>勞工代碼: {worker?.code || workerCode}</p>
          <p>請填寫以下下班前相關問題</p>
        </div>
        
        <form onSubmit={handleSubmit} className="health-form">
          <SleepinessScale onDataChange={handleSleepinessDataChange} />
          
          <EyeFatigueScale onDataChange={handleEyeFatigueDataChange} />
          
          <button type="submit" className="submit-button">提交表單</button>
        </form>
      </div>
      
      <footer className="form-footer">
        <p>&copy; 2025 勞工健康數據平台</p>
        <p>如有問題，請聯絡您的公司管理員</p>
      </footer>
    </div>
  );
};

export default EveningForm;