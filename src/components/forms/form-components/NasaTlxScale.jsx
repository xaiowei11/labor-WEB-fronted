// src/components/forms/form-components/NasaTlxScale.jsx
// NASA-TLX 任務負荷評估量表
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NasaTlxScale = ({ workerCode, companyCode, batchNumber, formTypeId, timeSegment, stage = 0, onSubmitSuccess }) => {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [nasaTlxData, setNasaTlxData] = useState({
    mental_demand: '50',
    physical_demand: '50',
    temporal_demand: '50',
    performance: '50',
    effort: '50',
    frustration: '50'
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
  
  // 處理滑桿變更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNasaTlxData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 獲取勞工資料 (已經在worker中)
      const workerId = worker.id;
      
      // 整合表單數據
      const formData = {
        ...nasaTlxData,
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
        
        // 使用localStorage保存表單數據（臨時解決方案）
        const localFormData = localStorage.getItem(`worker_form_data_${workerCode}`) || '{}';
        const parsedData = JSON.parse(localFormData);
        
        // 添加新表單數據
        const formKey = `form_${formTypeId}_batch_${batchNumber}`;
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
        <p>感謝您填寫NASA-TLX任務負荷評估量表。</p>
        <p>這是第{batchNumber}批次的第{timeSegment}時段提交。</p>
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
        <h2>NASA-TLX任務負荷評估量表 (第{batchNumber}批次-第{timeSegment}時段)</h2>     
      </header>
      <div className="form-content">
        <div className="worker-info">
          <p>您好，<strong>{worker?.name || '勞工'}</strong></p>
          <p>勞工代碼: {worker?.code || workerCode}</p>
          <p>請填寫以下NASA-TLX任務負荷評估量表</p>
        </div>
        
        <form onSubmit={handleSubmit} className="health-form">
          <div className="form-section">
            <h3>NASA-TLX 任務負荷評估量表</h3>
            <p>本量表將影響工作的心智負荷(勞心程度)因素，列出以下六項：</p>
            
            <div className="table-container">
              <table className="nasa-tlx-table">
                <thead>
                  <tr>
                    <th>因素</th>
                    <th>解釋</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>心理需求 (Mental Demand)</td>
                    <td>任務是否需要大量思考、決策、計算、記憶等認知處理？</td>
                  </tr>
                  <tr>
                    <td>身體需求 (Physical Demand)</td>
                    <td>任務是否需要大量身體活動 (搬運、走動、體力消耗)？</td>
                  </tr>
                  <tr>
                    <td>時間壓力 (Temporal Demand)</td>
                    <td>任務是否需要快速完成？是否感受到時間緊迫？</td>
                  </tr>
                  <tr>
                    <td>表現滿意度 (Performance)</td>
                    <td>自己對任務完成度是否滿意？</td>
                  </tr>
                  <tr>
                    <td>努力程度 (Effort)</td>
                    <td>為了達成任務，付出了多少努力？</td>
                  </tr>
                  <tr>
                    <td>挫折感 (Frustration Level)</td>
                    <td>任務中是否感到受挫、焦慮、沮喪或煩躁</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="form-group">
              <h4>請就六大因素的個別影響您工作心智負荷的程度進行評定</h4>
              <p>請問心智需求 (完成工作所耗費腦力程度)影響您工作心智負荷的程度：分數越高負荷越大</p>
              
              <div className="rating-slider">
                <input
                  type="range"
                  id="mental_demand"
                  name="mental_demand"
                  min="0"
                  max="100"
                  step="5"
                  value={nasaTlxData.mental_demand}
                  onChange={handleChange}
                />
                <div className="rating-marks">
                  <span>0</span>
                  <span>20</span>
                  <span>40</span>
                  <span>60</span>
                  <span>80</span>
                  <span>100</span>
                </div>
              </div>
              <p>當前評分: {nasaTlxData.mental_demand}</p>
            </div>
            
            <div className="form-group">
              <p>請問動作需求 (完成工作所耗費體力程度)影響您工作心智負荷的程度：分數越高負荷越大</p>
              
              <div className="rating-slider">
                <input
                  type="range"
                  id="physical_demand"
                  name="physical_demand"
                  min="0"
                  max="100"
                  step="5"
                  value={nasaTlxData.physical_demand}
                  onChange={handleChange}
                />
                <div className="rating-marks">
                  <span>0</span>
                  <span>20</span>
                  <span>40</span>
                  <span>60</span>
                  <span>80</span>
                  <span>100</span>
                </div>
              </div>
              <p>當前評分: {nasaTlxData.physical_demand}</p>
            </div>
            
            <div className="form-group">
              <p>請問時間需求 (完成工作所耗費時間程度)影響您工作心智負荷的程度：分數越高負荷越大</p>
              
              <div className="rating-slider">
                <input
                  type="range"
                  id="temporal_demand"
                  name="temporal_demand"
                  min="0"
                  max="100"
                  step="5"
                  value={nasaTlxData.temporal_demand}
                  onChange={handleChange}
                />
                <div className="rating-marks">
                  <span>0</span>
                  <span>20</span>
                  <span>40</span>
                  <span>60</span>
                  <span>80</span>
                  <span>100</span>
                </div>
              </div>
              <p>當前評分: {nasaTlxData.temporal_demand}</p>
            </div>
            
            <div className="form-group">
              <p>請問自我績效 (完成工作後自覺滿意程度)影響您工作心智負荷的程度：分數越高負荷越大</p>
              
              <div className="rating-slider">
                <input
                  type="range"
                  id="performance"
                  name="performance"
                  min="0"
                  max="100"
                  step="5"
                  value={nasaTlxData.performance}
                  onChange={handleChange}
                />
                <div className="rating-marks">
                  <span>0</span>
                  <span>20</span>
                  <span>40</span>
                  <span>60</span>
                  <span>80</span>
                  <span>100</span>
                </div>
              </div>
              <p>當前評分: {nasaTlxData.performance}</p>
            </div>
            
            <div className="form-group">
              <p>請問精力耗費 (完成工作所耗費心力程度)影響您工作心智負荷的程度：分數越高負荷越大</p>
              
              <div className="rating-slider">
                <input
                  type="range"
                  id="effort"
                  name="effort"
                  min="0"
                  max="100"
                  step="5"
                  value={nasaTlxData.effort}
                  onChange={handleChange}
                />
                <div className="rating-marks">
                  <span>0</span>
                  <span>20</span>
                  <span>40</span>
                  <span>60</span>
                  <span>80</span>
                  <span>100</span>
                </div>
              </div>
              <p>當前評分: {nasaTlxData.effort}</p>
            </div>
            
            <div className="form-group">
              <p>請問挫折程度 (完成工作自覺挫折感的程度)影響您工作心智負荷的程度：分數越高負荷越大</p>
              
              <div className="rating-slider">
                <input
                  type="range"
                  id="frustration"
                  name="frustration"
                  min="0"
                  max="100"
                  step="5"
                  value={nasaTlxData.frustration}
                  onChange={handleChange}
                />
                <div className="rating-marks">
                  <span>0</span>
                  <span>20</span>
                  <span>40</span>
                  <span>60</span>
                  <span>80</span>
                  <span>100</span>
                </div>
              </div>
              <p>當前評分: {nasaTlxData.frustration}</p>
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

export default NasaTlxScale;