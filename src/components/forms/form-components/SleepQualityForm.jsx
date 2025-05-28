// src/components/forms/form-components/SleepQualityForm.jsx
// 睡眠品質
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../styles/FormComponents.css'; // 假設這是你的 CSS 檔案路徑

const SleepQualityForm = ({ workerCode, companyCode, batchNumber, formTypeId, timeSegment, stage = 0, onSubmitSuccess }) => {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // 表單數據 - 睡眠相關
  const [sleepData, setSleepData] = useState({
    sleep_hours: '',
    sleep_quality: '' // 新增睡眠品質欄位
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
  
  // 處理睡眠表單輸入變更
  const handleSleepInputChange = (e) => {
    const { name, value } = e.target;
    setSleepData({
      ...sleepData,
      [name]: value
    });
  };
  
  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 檢查是否所有欄位都已填寫
    if (!sleepData.sleep_hours || !sleepData.sleep_quality) {
      setError('請填寫所有欄位');
      return;
    }
    
    try {
      // 獲取勞工資料 (已經在worker中)
      const workerId = worker.id;
      
      // 整合所有表單數據
      const combinedFormData = {
        ...sleepData,
        time_segment: timeSegment,
        batch_number: batchNumber,
        stage: stage || 0 //傳入時段
      };
      
      // 準備提交的數據
      const submitData = {
        worker_id: workerId,
        form_type_id: formTypeId,
        submission_count: batchNumber,
        time_segment: timeSegment,
        form_data: combinedFormData,
        stage: stage
      };
      
      console.log('將提交以下數據:', submitData);
      
      try {
        // 嘗試使用API提交
        const response = await axios.post('http://localhost:8000/api/public/forms/submit/', submitData);
        console.log('API響應成功:', response);
      } catch (apiError) {
        console.error('API提交失敗，使用localStorage保存:', apiError);
        console.error('詳細錯誤信息:', apiError.response?.data);
        
        // 使用localStorage保存表單數據（臨時解決方案）
        const localFormData = localStorage.getItem(`worker_form_data_${workerCode}`) || '{}';
        const parsedData = JSON.parse(localFormData);
        
        // 添加新表單數據
        const formKey = `form_${formTypeId}_batch_${batchNumber}`;
        parsedData[formKey] = combinedFormData;
        
        // 保存回localStorage
        localStorage.setItem(`worker_form_data_${workerCode}`, JSON.stringify(parsedData));
      }
      
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
        <p>感謝您填寫睡眠時數調查。</p>
        <p>這是第{batchNumber}批次的第{stage}時段提交。</p>
        <button onClick={() => {
          if (typeof onSubmitSuccess === 'function') {
            onSubmitSuccess(formTypeId);
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
        <h2>睡眠時數調查 (第{batchNumber}批次-第{stage}時段)</h2>
      </header>
      
      <div className="form-content">
        <div className="worker-info">
          <p>您好，<strong>{worker?.name || '勞工'}</strong></p>
          <p>勞工代碼: {worker?.code || workerCode}</p>
          <p>請填寫以下睡眠相關問題</p>
        </div>
        
        <form onSubmit={handleSubmit} className="health-form">
          <div className="form-section">
            <h3>睡眠品質問卷</h3>
            
            {/* 問題1: 睡眠時數 */}
            <div className="form-group">
              <label htmlFor="sleep_hours">1. 昨晚您實際的睡眠時數：</label>
              <input
                type="number"
                id="sleep_hours"
                name="sleep_hours"
                value={sleepData.sleep_hours}
                onChange={handleSleepInputChange}
                required
                min="0"
                max="24"
                step="0.5"
              />
              <span>小時</span>
            </div>
            
            {/* 問題2: 睡眠品質 */}
            <div className="form-group">
              <label>2. 您覺得昨晚的整體睡眠品質如何？</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="sleep_quality"
                    value="非常差"
                    checked={sleepData.sleep_quality === '非常差'}
                    onChange={handleSleepInputChange}
                    required
                  />
                  <span>非常差</span>
                </label>
                
                <label className="radio-option">
                  <input
                    type="radio"
                    name="sleep_quality"
                    value="差"
                    checked={sleepData.sleep_quality === '差'}
                    onChange={handleSleepInputChange}
                  />
                  <span>差</span>
                </label>
                
                <label className="radio-option">
                  <input
                    type="radio"
                    name="sleep_quality"
                    value="普通"
                    checked={sleepData.sleep_quality === '普通'}
                    onChange={handleSleepInputChange}
                  />
                  <span>普通</span>
                </label>
                
                <label className="radio-option">
                  <input
                    type="radio"
                    name="sleep_quality"
                    value="好"
                    checked={sleepData.sleep_quality === '好'}
                    onChange={handleSleepInputChange}
                  />
                  <span>好</span>
                </label>
                
                <label className="radio-option">
                  <input
                    type="radio"
                    name="sleep_quality"
                    value="非常好"
                    checked={sleepData.sleep_quality === '非常好'}
                    onChange={handleSleepInputChange}
                  />
                  <span>非常好</span>
                </label>
              </div>
            </div>
          </div>
          
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

export default SleepQualityForm;