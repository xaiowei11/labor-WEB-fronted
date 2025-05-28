// src/components/forms/form-components/SleepinessScale.jsx
// 史丹佛嗜睡量表
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SleepinessScale = ({ workerCode, companyCode, batchNumber, formTypeId, timeSegment, stage = 0, onSubmitSuccess }) => {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [sleepinessLevel, setSleepinessLevel] = useState('');
  
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
  
  // 處理選項變更
  const handleChange = (e) => {
    setSleepinessLevel(e.target.value);
  };
  
  // 提交表單
  // 提交表單
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        // 獲取勞工資料 (已經在worker中)
        const workerId = worker.id;
        
        // 整合表單數據
        const formData = {
          sleepiness_level: sleepinessLevel,
          //stage: currentStage, 
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
          form_data: formData,
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
          
          // 使用localStorage保存表單數據
          const localFormData = localStorage.getItem(`worker_form_data_${workerCode}`) || '{}';
          const parsedData = JSON.parse(localFormData);
          
          // 添加新表單數據，使用批次號和時段組合作為key
          const formKey = `form_${formTypeId}_batch_${batchNumber}_segment_${timeSegment}`;
          parsedData[formKey] = formData;
          
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
        <p>感謝您填寫嗜睡量表。</p>
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
        <h2>嗜睡量表 (第{batchNumber}批次)</h2>
      </header>
      
      <div className="form-content">
        <div className="worker-info">
          <p>您好，<strong>{worker?.name || '勞工'}</strong></p>
          <p>勞工代碼: {worker?.code || workerCode}</p>
          <p>請填寫以下嗜睡量表</p>
        </div>
        
        <form onSubmit={handleSubmit} className="health-form">
          <div className="form-section">
            <h3>史丹佛嗜睡量表 (Stanford Sleepiness Scale)</h3>
            <p>請從下列 7 個選項中選擇一個，最能代表您此刻的嗜睡感受：</p>
            
            <div className="table-container">
              <table className="sleepiness-table">
                <thead>
                  <tr>
                    <th>編號</th>
                    <th>描述</th>
                    <th>選擇</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>感覺精力充沛，頭腦清醒，毫無倦意</td>
                    <td>
                      <input
                        type="radio"
                        name="sleepiness_level"
                        value="1"
                        checked={sleepinessLevel === '1'}
                        onChange={handleChange}
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>精力尚可，但不是最佳狀態，能夠集中注意力</td>
                    <td>
                      <input
                        type="radio"
                        name="sleepiness_level"
                        value="2"
                        checked={sleepinessLevel === '2'}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>清醒，但對外界的刺激有反應但不夠警覺</td>
                    <td>
                      <input
                        type="radio"
                        name="sleepiness_level"
                        value="3"
                        checked={sleepinessLevel === '3'}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td>意識已有點不清楚，沒有精神</td>
                    <td>
                      <input
                        type="radio"
                        name="sleepiness_level"
                        value="4"
                        checked={sleepinessLevel === '4'}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>5</td>
                    <td>昏昏沉沉；在清醒時對周圍事物興趣不大，遲鈍</td>
                    <td>
                      <input
                        type="radio"
                        name="sleepiness_level"
                        value="5"
                        checked={sleepinessLevel === '5'}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>6</td>
                    <td>昏睡；很想睡，但努力保持頭腦清醒、頭昏</td>
                    <td>
                      <input
                        type="radio"
                        name="sleepiness_level"
                        value="6"
                        checked={sleepinessLevel === '6'}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>7</td>
                    <td>不想再努力保持清醒；很快就入睡，有做夢的感覺</td>
                    <td>
                      <input
                        type="radio"
                        name="sleepiness_level"
                        value="7"
                        checked={sleepinessLevel === '7'}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
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

export default SleepinessScale;