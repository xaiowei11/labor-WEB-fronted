// src/components/forms/form-components/EyeFatigueScale.jsx
//視覺疲勞量表
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EyeFatigueScale = ({ workerCode, companyCode, batchNumber, formTypeId, timeSegment, stage = 0, onSubmitSuccess }) => {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
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
  
  // 處理選項變更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEyeFatigueData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 檢查是否所有欄位都已填寫
    const allFieldsFilled = Object.values(eyeFatigueData).every(value => value !== '');
    if (!allFieldsFilled) {
      setError('請填寫所有欄位');
      return;
    }
    
    try {
      // 獲取勞工資料 (已經在worker中)
      const workerId = worker.id;
      
      // 整合所有表單數據
      const combinedFormData = {
        ...eyeFatigueData,
        time_segment: timeSegment,
        batch_number: batchNumber,
        stage: stage || 0  // 傳入時段
      };
      
      // 準備提交的數據
      const submitData = {
        worker_id: workerId,
        form_type_id: formTypeId,
        submission_count: batchNumber,
        time_segment: timeSegment,
        form_data: combinedFormData,
        stage: stage,
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
        <p>感謝您填寫視覺疲勞量表。</p>
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
        <h2>視覺疲勞量表 (第{batchNumber}批次-第{stage}時段)</h2>
      </header>
      
      <div className="form-content">
        <div className="worker-info">
          <p>您好，<strong>{worker?.name || '勞工'}</strong></p>
          <p>勞工代碼: {worker?.code || workerCode}</p>
          <p>請填寫以下視覺疲勞量表</p>
        </div>
        
        <form onSubmit={handleSubmit} className="health-form">
          <div className="form-section">
            <h3>視覺疲勞量表</h3>
            <p>請圈選最能代表此刻的視覺疲勞程度：</p>
            
            <div className="table-container">
              <table className="eye-fatigue-table">
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>無</th>
                    <th>不確定</th>
                    <th>是</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>眼睛乾澀和灼熱？</td>
                    <td>
                      <input
                        type="radio"
                        name="dry_eyes"
                        value="無"
                        checked={eyeFatigueData.dry_eyes === '無'}
                        onChange={handleChange}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name="dry_eyes"
                        value="不確定"
                        checked={eyeFatigueData.dry_eyes === '不確定'}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name="dry_eyes"
                        value="是"
                        checked={eyeFatigueData.dry_eyes === '是'}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  {/* 其他項目相同格式 */}
                  <tr>
                    <td>眼痛或異物感？</td>
                    <td>
                      <input
                        type="radio"
                        name="eye_pain"
                        value="無"
                        checked={eyeFatigueData.eye_pain === '無'}
                        onChange={handleChange}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name="eye_pain"
                        value="不確定"
                        checked={eyeFatigueData.eye_pain === '不確定'}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name="eye_pain"
                        value="是"
                        checked={eyeFatigueData.eye_pain === '是'}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>視力模糊？</td>
                    <td>
                      <input
                        type="radio"
                        name="blurred_vision"
                        value="無"
                        checked={eyeFatigueData.blurred_vision === '無'}
                        onChange={handleChange}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name="blurred_vision"
                        value="不確定"
                        checked={eyeFatigueData.blurred_vision === '不確定'}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name="blurred_vision"
                        value="是"
                        checked={eyeFatigueData.blurred_vision === '是'}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>難以集中注意力？</td>
                    <td>
                      <input
                        type="radio"
                        name="focus_difficulty"
                        value="無"
                        checked={eyeFatigueData.focus_difficulty === '無'}
                        onChange={handleChange}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name="focus_difficulty"
                        value="不確定"
                        checked={eyeFatigueData.focus_difficulty === '不確定'}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name="focus_difficulty"
                        value="是"
                        checked={eyeFatigueData.focus_difficulty === '是'}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>頭痛或頭暈？</td>
                    <td>
                      <input
                        type="radio"
                        name="headache"
                        value="無"
                        checked={eyeFatigueData.headache === '無'}
                        onChange={handleChange}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name="headache"
                        value="不確定"
                        checked={eyeFatigueData.headache === '不確定'}
                        onChange={handleChange}
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name="headache"
                        value="是"
                        checked={eyeFatigueData.headache === '是'}
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

export default EyeFatigueScale;