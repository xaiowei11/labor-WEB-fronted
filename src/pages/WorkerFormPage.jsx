// src/pages/WorkerFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import WorkerSleepForm from '../components/forms/WorkerSleepForm';
import '../styles/WorkerFormPage.css'; 
import api from '../services/api';


const WorkerFormPage = () => {
  const [searchParams] = useSearchParams();
  const workerId = searchParams.get('worker_id');
  const companyCode = searchParams.get('company_code');
  
  const [worker, setWorker] = useState(null);
  const [showSleepForm, setShowSleepForm] = useState(false);
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 載入勞工信息
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
        
        // 修改這一行，使用 api 服務而不是直接的 axios 調用
        const workerResponse = await api.workers.getOne(workerId, { 
          params: { company_code: companyCode } 
        });
        console.log('API 響應:', workerResponse);
        setWorker(workerResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('無法載入資料', err);
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
  
  if (loading) return <div className="loading">載入中...</div>;
  
  if (error && !worker) return <div className="error-message">{error}</div>;
  
  if (showSleepForm) {
    // 傳遞 workerId 和 companyCode 作為 props
    return <WorkerSleepForm workerId={workerId} companyCode={companyCode} />;
  }
  
  return (
    <div className="worker-form-page">
      <header className="form-header">
        <h1>勞工健康數據平台</h1>
        {worker && !identityConfirmed && (
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
        )}
        {worker && identityConfirmed && (
          <div className="worker-info">
            <h2>您好，{worker.name}</h2>
            <p>勞工代碼: {worker.code}</p>
            <p>公司: {worker.company_name}</p>
          </div>
        )}
      </header>
      
      {identityConfirmed && (
        <main className="forms-container">
          <h2>請選擇要填寫的表單</h2>
          <div className="form-cards">
            <div className="form-card" onClick={() => setShowSleepForm(true)}>
              <h3>睡眠健康表單</h3>
              <p>填寫有關您的睡眠時間和品質</p>
              <button className="form-button">開始填寫</button>
            </div>
            
            {/* 可以添加更多表單卡片 */}
          </div>
        </main>
      )}
      
      <footer className="form-footer">
        <p>&copy; 2025 勞工健康數據平台</p>
        <p>如遇問題，請聯絡您的公司管理員</p>
      </footer>
      

    </div>
  );
};

export default WorkerFormPage;