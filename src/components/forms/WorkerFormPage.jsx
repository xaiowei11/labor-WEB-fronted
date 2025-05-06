import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

// 導入表單組件
import SleepForm from './SleepForm';
import MorningForm from './MorningForm';
import AfternoonForm from './AfternoonForm';
import EveningForm from './EveningForm';
import NightForm from './NightForm';

import '../../styles/WorkerFormPage.css';

// 定義表單階段順序
const FORM_STAGES = [
  { id: 4, name: '睡眠健康表單', component: SleepForm, description: '記錄睡眠時間和睡眠品質' },
  { id: 2, name: '上午工作表單', component: MorningForm, description: '上午工作中填寫的表單' },
  { id: 3, name: '下午工作表單', component: AfternoonForm, description: '下午工作中填寫的表單' },
  { id: 1, name: '下班前表單', component: EveningForm, description: '下班前填寫的表單' },
  { id: 5, name: '晚上表單', component: NightForm, description: '晚上填寫的表單(含NASA-TLX任務負荷評估)' }
];

const WorkerFormPage = () => {
  const [searchParams] = useSearchParams();
  const workerCode = searchParams.get('worker_code');
  const companyCode = searchParams.get('company_code');
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);  
  const [worker, setWorker] = useState(null);
  const [currentStage, setCurrentStage] = useState(0); // 當前階段索引
  const [currentFormType, setCurrentFormType] = useState(null); // 當前可填寫的表單
  const [selectedFormType, setSelectedFormType] = useState(null); // 用戶選擇的表單
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentBatch, setCurrentBatch] = useState(1); // 當前批次
  const [formSubmissions, setFormSubmissions] = useState([]); // 已提交的表單列表
  
  // 載入勞工信息和表單狀態
  // 載入勞工信息和表單狀態
useEffect(() => {
    const fetchWorkerData = async () => {
      if (!workerCode || !companyCode) {
        setError('連結無效，缺少必要參數');
        setLoading(false);
        return; 
      }
      
      try {
        console.log('正在獲取勞工數據，參數:', workerCode, companyCode);
        // 獲取勞工資訊
        const response = await axios.get(`http://localhost:8000/api/public/worker-by-code/?worker_code=${workerCode}&company_code=${companyCode}`);
        setWorker(response.data);
        console.log('成功獲取勞工數據:', response.data);
        
        // 嘗試獲取已提交的表單記錄
        try {
          const submissionsResponse = await axios.get(`http://localhost:8000/api/public/worker-submissions/?worker_code=${workerCode}&company_code=${companyCode}`);
          const submissionsData = submissionsResponse.data;
          setFormSubmissions(submissionsData);
          
          // 計算當前批次
          let maxBatch = 0;
          submissionsData.forEach(sub => {
            if (sub.submission_count > maxBatch) {
              maxBatch = sub.submission_count;
            }
          });
          
          // 設置當前批次（至少為1）
          const batchNumber = Math.max(maxBatch, 1);
          setCurrentBatch(batchNumber);
          console.log("當前批次:", batchNumber);
          
          // 計算當前階段
          calculateCurrentStage(submissionsData, batchNumber);
          
        } catch (apiError) {
          console.error('API獲取提交記錄失敗，嘗試使用本地存儲:', apiError);
          
          // 使用localStorage模擬後端API
          const savedSubmissions = localStorage.getItem(`worker_submissions_${workerCode}`);
          let localSubmissions = [];
          
          if (savedSubmissions) {
            localSubmissions = JSON.parse(savedSubmissions);
            console.log("從本地儲存獲取提交記錄:", localSubmissions);
            setFormSubmissions(localSubmissions);
            
            // 計算當前批次
            let maxBatch = 0;
            localSubmissions.forEach(sub => {
              if (sub.submission_count > maxBatch) {
                maxBatch = sub.submission_count;
              }
            });
            
            // 設置當前批次（至少為1）
            const batchNumber = Math.max(maxBatch, 1);
            setCurrentBatch(batchNumber);
            console.log("當前批次:", batchNumber);
            
            // 計算當前階段
            calculateCurrentStage(localSubmissions, batchNumber);
          } else {
            console.log("沒有找到提交記錄，用戶應從第一階段開始");
            setCurrentStage(0);
            setCurrentBatch(1);
            setCurrentFormType(FORM_STAGES[0]);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('無法載入資料', err);
        setError('無法載入勞工資料，請檢查連結是否正確');
        setLoading(false);
      }
    };
    
    fetchWorkerData();
  }, [workerCode, companyCode]);
  
  // 根據提交記錄計算當前應該顯示的表單階段
  // 根據提交記錄計算當前應該顯示的表單階段
  const calculateCurrentStage = (submissions, batchNumber) => {
    // 篩選出當前批次的提交記錄
    const currentBatchSubmissions = submissions.filter(
      sub => Number(sub.submission_count) === Number(batchNumber)
    );
    
    console.log("當前批次號:", batchNumber);
    console.log("過濾後的當前批次提交記錄:", currentBatchSubmissions);
    
    // 獲取所有已提交的表單類型ID
    const submittedFormIds = new Set(
      currentBatchSubmissions.map(sub => Number(sub.form_type_id))
    );
    
    console.log("當前批次已提交的表單ID:", Array.from(submittedFormIds));
    
    // 找出第一個尚未提交的表單階段
    let nextStageIndex = 0;
    let allSubmitted = true;
    
    for (let i = 0; i < FORM_STAGES.length; i++) {
      const stageId = Number(FORM_STAGES[i].id);
      console.log(`檢查階段 ${i}: ID=${stageId}, 是否已提交: ${submittedFormIds.has(stageId)}`);
      
      if (!submittedFormIds.has(stageId)) {
        nextStageIndex = i;
        allSubmitted = false;
        break;
      }
    }
    
    console.log("下一個未提交的階段索引:", nextStageIndex, "是否已全部提交:", allSubmitted);
    
    // 如果所有階段都已完成，則進入下一批次的第一階段
    if (allSubmitted) {
      console.log("當前批次所有表單已完成，準備進入下一批次");
      setCurrentBatch(batchNumber + 1);
      nextStageIndex = 0;
    }
    
    setCurrentStage(nextStageIndex);
    setCurrentFormType(FORM_STAGES[nextStageIndex]);
  };
  
  // 處理身份確認
  const handleIdentityConfirm = (confirmed) => {
    if (confirmed) {
      setIdentityConfirmed(true);
    } else {
      // 如果不是本人，顯示錯誤訊息
      setError('如果您不是此勞工本人，請聯絡您的公司管理員獲取正確的連結');
    }
  };
  
  // 選擇表單類型
  const handleFormSelect = () => {
    if (!currentFormType) {
      alert('目前沒有可填寫的表單。');
      return;
    }
    
    console.log(`選擇表單: ID=${currentFormType.id}, 名稱=${currentFormType.name}`);
    setSelectedFormType(currentFormType);
  };
  
  // 處理表單提交成功
  // 處理表單提交成功
  const handleFormSubmitSuccess = () => {
    console.log(`表單${currentFormType.id}提交成功，更新進度`);
    
    // 更新提交記錄
    const newSubmission = {
      id: Date.now(), // 生成唯一ID
      worker_id: worker.id,
      form_type_id: Number(currentFormType.id), // 確保是數字類型
      submission_count: currentBatch, // 使用當前批次
      submission_time: new Date().toISOString()
    };
    
    console.log("新增提交記錄:", newSubmission);
    
    const updatedSubmissions = [...formSubmissions, newSubmission];
    setFormSubmissions(updatedSubmissions);
    
    // 保存到本地存儲(模擬後端)
    localStorage.setItem(`worker_submissions_${workerCode}`, JSON.stringify(updatedSubmissions));
    
    // 計算下一階段
    let nextStage = currentStage + 1;
    let nextBatch = currentBatch;
    
    // 如果所有階段都已完成，則進入下一批次
    if (nextStage >= FORM_STAGES.length) {
      nextBatch = currentBatch + 1;
      setCurrentBatch(nextBatch); // 先更新批次
      nextStage = 0;
      alert(`第${currentBatch}批次所有表單已完成，您將進入第${nextBatch}批次。`);
    }
    
    // 更新當前階段
    setCurrentStage(nextStage);
    setCurrentFormType(FORM_STAGES[nextStage]);
    
    // 返回表單選擇頁面
    setSelectedFormType(null);

    setCooldownActive(true);
    setCooldownTime(10); // 10秒冷卻時間
    
    // 啟動倒計時
    const countdownInterval = setInterval(() => {
      setCooldownTime(prevTime => {
        if (prevTime <= 1) {
          clearInterval(countdownInterval);
          setCooldownActive(false);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  
  // 返回表單選擇頁面
  const handleBackToForms = () => {
    setSelectedFormType(null);
  };
  
  // 清除本地存儲數據 (用於開發測試)
  const clearLocalStorage = () => {
    localStorage.removeItem(`worker_submissions_${workerCode}`);
    localStorage.removeItem(`worker_form_data_${workerCode}`);
    window.location.reload();
  };
  
  if (loading) return <div className="loading">載入中...</div>;
  
  if (error && !worker) return <div className="error-message">{error}</div>;
  
  // 如果已選擇表單
  if (selectedFormType) {
    const FormComponent = selectedFormType.component;
    
    if (!FormComponent) {
      console.error(`找不到對應的表單組件, ID: ${selectedFormType.id}`);
      return <div className="error-message">載入表單失敗，找不到對應的表單組件</div>;
    }
    
    return (
      <div>
        <button className="back-button" onClick={handleBackToForms}>返回</button>
        <FormComponent 
          workerCode={workerCode} 
          companyCode={companyCode}
          batchNumber={currentBatch}
          formTypeId={selectedFormType.id}
          onSubmitSuccess={handleFormSubmitSuccess}
        />
      </div>
    );
  }
  
  // 表單選擇頁面
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
            <p>您好，{worker.name}</p>
            <p>勞工代碼: {worker.code}</p>
            <p>公司: {worker.company_name}</p>
            <p className="batch-info">目前填寫批次: 第 {currentBatch} 批</p>
            {/* 開發測試用按鈕，正式環境可移除 */}
            {process.env.NODE_ENV === 'development' && (
              <button onClick={clearLocalStorage} className="dev-button">
                清除本地存儲資料 (開發用)
              </button>
            )}
          </div>
        )}
      </header>
      
      {identityConfirmed && (
        <main className="forms-container">
          <h2>目前階段表單</h2>
          
          {currentStage < FORM_STAGES.length ? (
            <div className="current-stage-info">
              <p>請完成以下表單以繼續下一階段：</p>
              
              <div className="form-card active">
                <h3>{currentFormType.name}</h3>
                <p>{currentFormType.description}</p>
                {cooldownActive ? (
                  <div className="cooldown-timer">
                    <p>請稍候，還需等待 {cooldownTime} 秒才能填寫下一個表單</p>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{width: `${(10 - cooldownTime) / 10 * 100}%`}}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <button 
                    className="form-button" 
                    onClick={handleFormSelect}
                  >
                    開始填寫
                  </button>
                )}
              </div>
              
              <div className="stage-progress">
                <p>進度: {currentStage + 1} / {FORM_STAGES.length}</p>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${((currentStage) / FORM_STAGES.length) * 100}%`}}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="all-forms-completed">
              <h3>所有表單已填寫完成</h3>
              <p>您已完成第 {currentBatch - 1} 批次的所有表單。</p>
              <p>請等待下一批次開始。</p>
            </div>
          )}
          
          <div className="forms-history">
            <h3>填寫歷史</h3>
            <div className="stage-list">
              {FORM_STAGES.map((stage, index) => {
                const isCompleted = index < currentStage;
                const isCurrent = index === currentStage;
                const isLocked = index > currentStage;
                
                return (
                  <div 
                    key={stage.id}
                    className={`stage-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`}
                  >
                    <div className="stage-number">{index + 1}</div>
                    <div className="stage-content">
                      <h4>{stage.name}</h4>
                      <p>{stage.description}</p>
                      {isCompleted && <div className="status-badge completed">已完成</div>}
                      {isCurrent && <div className="status-badge current">當前階段</div>}
                      {isLocked && <div className="status-badge locked">尚未解鎖</div>}
                    </div>
                  </div>
                );
              })}
            </div>
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