import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

// 需要導入新的表單組件
import SleepQualityForm from './form-components/SleepQualityForm';
import SleepinessScale from './form-components/SleepinessScale';
import EyeFatigueScale from './form-components/EyeFatigueScale';
import NasaTlxScale from './form-components/NasaTlxScale';

import '../../styles/WorkerFormPage.css';

// 定義表單類型
const FORM_TYPES = [
  { id: 1, name: '睡眠時數調查', component: SleepQualityForm, description: '記錄睡眠時間' },
  { id: 2, name: '嗜睡量表', component: SleepinessScale, description: '評估當前嗜睡程度' },
  { id: 3, name: '視覺疲勞量表', component: EyeFatigueScale, description: '評估眼睛健康狀況' },
  { id: 4, name: 'NASA-TLX工作負荷量表', component: NasaTlxScale, description: '評估工作負荷程度' }
];

// 定義各階段所需填寫的表單類型
const STAGE_FORMS = [
  // 第一階段 (早上)
  { 
    id: 1, 
    name: '早上表單', 
    formTypeIds: [1, 2, 3] // 需要填寫睡眠、嗜睡、視覺疲勞表單
  },
  // 第二階段 (中午)
  { 
    id: 2, 
    name: '中午表單', 
    formTypeIds: [2, 3] // 需要填寫嗜睡、視覺疲勞表單
  },
  // 第三階段 (下午)
  { 
    id: 3, 
    name: '下午表單', 
    formTypeIds: [2, 3] // 需要填寫嗜睡、視覺疲勞表單
  },
  // 第四階段 (下班)
  { 
    id: 4, 
    name: '下班表單', 
    formTypeIds: [2, 3] // 需要填寫嗜睡、視覺疲勞表單
  },
  { 
    id: 5, 
    name: '晚上表單', 
    formTypeIds: [2, 3, 4] // 需要填寫嗜睡、視覺疲勞、NASA-TLX表單
  }
];

const WorkerFormPage = () => {
  const [searchParams] = useSearchParams();
  const workerCode = searchParams.get('worker_code');
  const companyCode = searchParams.get('company_code');
  
  const [worker, setWorker] = useState(null);
  const [currentStage, setCurrentStage] = useState(0); // 當前階段索引
  const [selectedForm, setSelectedForm] = useState(null); // 當前選擇的表單
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentBatch, setCurrentBatch] = useState(1); // 當前批次
  const [formSubmissions, setFormSubmissions] = useState([]); // 已提交的表單列表
  const [completedStages, setCompletedStages] = useState([]); // 存儲已完成的階段
  const [waitingForNextStage, setWaitingForNextStage] = useState(false); // 是否正在等待進入下一階段
  const [waitTimeRemaining, setWaitTimeRemaining] = useState(0); // 剩餘等待時間（秒）
  
  // 使用 useRef 創建函數引用
  const functionsRef = useRef({});
  
  // 定義函數，避免循環依賴
  // 從 localStorage 讀取已完成的階段
  functionsRef.current.loadCompletedStages = (workerCode, batchNumber) => {
    const key = `worker_completed_stages_${workerCode}_batch_${batchNumber}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  };
  
  // 保存已完成的階段到 localStorage
  functionsRef.current.saveCompletedStages = (stages, batch = currentBatch) => {
    const key = `worker_completed_stages_${workerCode}_batch_${batch}`;
    localStorage.setItem(key, JSON.stringify(stages));
    setCompletedStages(stages);
  };
  
  // 進入下一階段
  functionsRef.current.goToNextStage = () => {
    const nextStage = currentStage + 1;
    if (nextStage >= STAGE_FORMS.length) {
      const nextBatch = currentBatch + 1;
      setCurrentBatch(nextBatch);
      setCurrentStage(0);
      // 重置已完成階段
      functionsRef.current.saveCompletedStages([], nextBatch);
      alert(`第${currentBatch}批次所有表單已完成，您將進入第${nextBatch}批次。`);
    } else {
      setCurrentStage(nextStage);
    }
  };
  
  // 啟動等待計時器
  functionsRef.current.startWaitingTimer = (endTime) => {
    if (!endTime || typeof endTime !== 'number') {
      console.error('無效的結束時間:', endTime);
      return null;
    }
    
    // 清除任何現有的倒數計時器
    if (functionsRef.current.waitTimerInterval) {
      clearInterval(functionsRef.current.waitTimerInterval);
    }
    
    // 計算初始剩餘時間
    const now = Date.now();
    const initialTimeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
    
    // 如果結束時間已過，直接進入下一階段
    if (initialTimeLeft <= 0) {
      console.log('等待時間已過，直接進入下一階段');
      
      // 清除 localStorage 中的等待狀態
      localStorage.removeItem(`waiting_for_next_stage_${workerCode}_${currentBatch}_${currentStage}`);
      localStorage.removeItem(`wait_stage_end_time_${workerCode}_${currentBatch}_${currentStage}`);
      localStorage.removeItem(`global_waiting_${workerCode}`);
      localStorage.removeItem(`global_end_time_${workerCode}`);
      
      setWaitingForNextStage(false);
      functionsRef.current.goToNextStage();
      return null;
    }
    
    // 重要：設置狀態並保存到 localStorage
    setWaitingForNextStage(true);
    setWaitTimeRemaining(initialTimeLeft);
    
    // 使用更穩定的存儲機制
    try {
      // 同時存儲當前批次和階段信息，以便重新載入時恢復
      localStorage.setItem(`waiting_for_next_stage_${workerCode}_${currentBatch}_${currentStage}`, 'true');
      localStorage.setItem(`wait_stage_end_time_${workerCode}_${currentBatch}_${currentStage}`, endTime.toString());
      localStorage.setItem(`worker_batch_${workerCode}`, currentBatch.toString());
      localStorage.setItem(`worker_stage_${workerCode}`, currentStage.toString());
      
      // 另外存儲一個全局的等待狀態，不依賴批次和階段
      localStorage.setItem(`global_waiting_${workerCode}`, 'true');
      localStorage.setItem(`global_end_time_${workerCode}`, endTime.toString());
      localStorage.setItem(`global_batch_${workerCode}`, currentBatch.toString());
      localStorage.setItem(`global_stage_${workerCode}`, currentStage.toString());
    } catch (e) {
      console.error('無法存儲到 localStorage:', e);
    }
    
    // 輸出時間信息，用於調試
    console.log('===== 時間調試信息 =====');
    console.log('當前時間:', new Date(now).toLocaleString());
    console.log('下次填寫時間:', new Date(endTime).toLocaleString());
    console.log('剩餘等待時間(秒):', initialTimeLeft);
    console.log('等待狀態:', waitingForNextStage);
    console.log('localStorage 中的等待狀態:', localStorage.getItem(`waiting_for_next_stage_${workerCode}_${currentBatch}_${currentStage}`));
    console.log('localStorage 中的結束時間:', localStorage.getItem(`wait_stage_end_time_${workerCode}_${currentBatch}_${currentStage}`));
    console.log('全局等待狀態:', localStorage.getItem(`global_waiting_${workerCode}`));
    console.log('全局結束時間:', localStorage.getItem(`global_end_time_${workerCode}`));
    console.log('=======================');
    
    // 啟動計時器
    const countdownInterval = setInterval(() => {
      const now = Date.now();
      const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
      
      setWaitTimeRemaining(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        
        // 清除 localStorage 中的等待狀態
        localStorage.removeItem(`waiting_for_next_stage_${workerCode}_${currentBatch}_${currentStage}`);
        localStorage.removeItem(`wait_stage_end_time_${workerCode}_${currentBatch}_${currentStage}`);
        localStorage.removeItem(`global_waiting_${workerCode}`);
        localStorage.removeItem(`global_end_time_${workerCode}`);
        
        setWaitingForNextStage(false);
        functionsRef.current.goToNextStage();
      }
    }, 1000);
    
    // 儲存 interval ID 以便在組件卸載時清除
    functionsRef.current.waitTimerInterval = countdownInterval;
    return countdownInterval;
  };

  useEffect(() => {
    // 組件卸載時清除計時器
    return () => {
      if (functionsRef.current.waitTimerInterval) {
        clearInterval(functionsRef.current.waitTimerInterval);
        console.log('組件卸載，清除計時器');
      }
    };
  }, []);
  
  // 載入勞工信息和表單狀態
  useEffect(() => {
    const fetchWorkerData = async () => {
      if (!workerCode || !companyCode) {
        setError('連結無效，缺少必要參數');
        setLoading(false);
        return; 
      }
      
      try {
        console.log('===== 頁面初始載入 =====');
        
        // 立即從 localStorage 讀取身份確認狀態
        const savedIdentityConfirmed = localStorage.getItem(`identity_confirmed_${workerCode}`);
        console.log('儲存的身份確認狀態:', savedIdentityConfirmed);
        if (savedIdentityConfirmed === 'true') {
          setIdentityConfirmed(true);
          console.log('已恢復身份確認狀態: true');
        }
        
        // 從 localStorage 讀取批次和階段信息
        const savedBatch = localStorage.getItem(`worker_batch_${workerCode}`);
        const savedStage = localStorage.getItem(`worker_stage_${workerCode}`);
        console.log('儲存的批次:', savedBatch);
        console.log('儲存的階段:', savedStage);
        
        // 嘗試檢索所有可能的等待狀態鍵
        // 這是為了確保我們不會因為 currentBatch 或 currentStage 的變化而找不到原始的等待狀態
        let foundWaiting = false;
        let foundEndTime = null;
        let foundBatch = null;
        let foundStage = null;
        
        // 首先檢查全局等待狀態
        const globalWaiting = localStorage.getItem(`global_waiting_${workerCode}`);
        const globalEndTime = localStorage.getItem(`global_end_time_${workerCode}`);
        const globalBatch = localStorage.getItem(`global_batch_${workerCode}`);
        const globalStage = localStorage.getItem(`global_stage_${workerCode}`);
        
        if (globalWaiting === 'true' && globalEndTime) {
          console.log('找到全局等待狀態');
          console.log('全局結束時間:', globalEndTime);
          console.log('全局批次:', globalBatch);
          console.log('全局階段:', globalStage);
          
          foundWaiting = true;
          foundEndTime = parseInt(globalEndTime, 10);
          
          if (globalBatch) foundBatch = parseInt(globalBatch, 10);
          if (globalStage) foundStage = parseInt(globalStage, 10);
        }
        
        // 如果沒有找到全局等待狀態，遍歷所有可能的批次和階段組合
        if (!foundWaiting) {
          for (let b = 1; b <= 10; b++) {
            for (let s = 0; s < STAGE_FORMS.length; s++) {
              const waitKey = `waiting_for_next_stage_${workerCode}_${b}_${s}`;
              const endTimeKey = `wait_stage_end_time_${workerCode}_${b}_${s}`;
              
              const waitValue = localStorage.getItem(waitKey);
              const endTimeValue = localStorage.getItem(endTimeKey);
              
              if (waitValue === 'true' && endTimeValue) {
                console.log(`找到等待狀態: 批次=${b}, 階段=${s}`);
                console.log(`等待狀態鍵: ${waitKey}`);
                console.log(`結束時間鍵: ${endTimeKey}`);
                console.log(`結束時間值: ${endTimeValue}`);
                
                foundWaiting = true;
                foundEndTime = parseInt(endTimeValue, 10);
                foundBatch = b;
                foundStage = s;
                break;
              }
            }
            if (foundWaiting) break;
          }
        }
        
        // 獲取勞工資訊
        console.log('正在獲取勞工數據，參數:', workerCode, companyCode);
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
          
          // 設置當前批次（至少為1，除非已找到等待狀態中的批次）
          if (foundBatch) {
            setCurrentBatch(foundBatch);
          } else {
            const batchNumber = Math.max(maxBatch, 1);
            setCurrentBatch(batchNumber);
          }
          
          // 讀取已完成的階段
          const completed = functionsRef.current.loadCompletedStages(
            workerCode, 
            foundBatch || Math.max(maxBatch, 1)
          );
          setCompletedStages(completed);
          
          // 設置當前階段（如果已找到等待狀態中的階段）
          if (foundStage !== null) {
            setCurrentStage(foundStage);
          } else {
            // 計算當前階段
            functionsRef.current.determineCurrentStage(submissionsData, currentBatch, completed);
          }
          
        } catch (apiError) {
          console.error('API獲取提交記錄失敗，嘗試使用本地存儲:', apiError);
          
          // 使用localStorage模擬後端API
          const savedSubmissions = localStorage.getItem(`worker_submissions_${workerCode}`);
          let localSubmissions = [];
          
          if (savedSubmissions) {
            localSubmissions = JSON.parse(savedSubmissions);
            console.log("從本地儲存獲取提交記錄:", localSubmissions);
            setFormSubmissions(localSubmissions);
            
            // 設置當前批次（如果已找到等待狀態中的批次）
            if (foundBatch) {
              setCurrentBatch(foundBatch);
            } else {
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
            }
            
            // 讀取已完成的階段
            const completed = functionsRef.current.loadCompletedStages(
              workerCode, 
              foundBatch || currentBatch
            );
            setCompletedStages(completed);
            
            // 設置當前階段（如果已找到等待狀態中的階段）
            if (foundStage !== null) {
              setCurrentStage(foundStage);
            } else {
              // 計算當前階段
              functionsRef.current.determineCurrentStage(localSubmissions, currentBatch, completed);
            }
          } else {
            console.log("沒有找到提交記錄，用戶應從第一階段開始");
            setCurrentStage(0);
            setCurrentBatch(1);
            setCompletedStages([]);
          }
        }
        
        // 如果找到等待狀態，立即設置
        if (foundWaiting && foundEndTime) {
          const now = Date.now();
          
          // 如果結束時間還沒到
          if (now < foundEndTime) {
            console.log('設置找到的等待狀態:');
            console.log('當前時間:', new Date(now).toLocaleString());
            console.log('結束時間:', new Date(foundEndTime).toLocaleString());
            console.log('剩餘秒數:', Math.floor((foundEndTime - now) / 1000));
            
            // 設置等待狀態
            setWaitingForNextStage(true);
            setWaitTimeRemaining(Math.floor((foundEndTime - now) / 1000));
            
            // 使用 setTimeout 確保狀態更新後再啟動計時器
            setTimeout(() => {
              functionsRef.current.startWaitingTimer(foundEndTime);
            }, 500);
          } else {
            // 等待時間已過，清除狀態
            console.log('結束時間已過，清除等待狀態');
            if (foundBatch !== null && foundStage !== null) {
              localStorage.removeItem(`waiting_for_next_stage_${workerCode}_${foundBatch}_${foundStage}`);
              localStorage.removeItem(`wait_stage_end_time_${workerCode}_${foundBatch}_${foundStage}`);
            }
            localStorage.removeItem(`global_waiting_${workerCode}`);
            localStorage.removeItem(`global_end_time_${workerCode}`);
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
  
  
  // 根據已完成的階段和表單提交記錄確定當前應該顯示的階段
  functionsRef.current.determineCurrentStage = (submissions, batchNumber, completedStages) => {
    // 如果有已保存的階段完成信息，使用它來確定當前階段
    if (completedStages && completedStages.length > 0) {
      // 找出最大的已完成階段
      const maxCompletedStage = Math.max(...completedStages);
      
      // 下一個階段是最大已完成階段+1，除非已經是最後一個階段
      const nextStage = maxCompletedStage + 1 >= STAGE_FORMS.length 
        ? STAGE_FORMS.length - 1 // 如果所有階段都完成了，停留在最後一個階段
        : maxCompletedStage + 1;
        
      console.log(`根據已完成階段設置當前階段為 ${nextStage}: ${STAGE_FORMS[nextStage].name}`);
      setCurrentStage(nextStage);
      return;
    }
    
    // 如果沒有已保存的階段完成信息，檢查每個階段的表單是否都已提交
    // 並且這些表單的階段字段與當前檢查的階段匹配
    const stageCompletionStatus = STAGE_FORMS.map((stage, stageIndex) => {
      // 篩選出當前批次和階段的提交記錄
      const stageSubmissions = submissions.filter(sub => 
        Number(sub.submission_count) === Number(batchNumber) && 
        Number(sub.stage) === stageIndex
      );
      
      // 獲取已提交的表單類型
      const submittedFormTypes = new Set(stageSubmissions.map(sub => Number(sub.form_type_id)));
      
      // 檢查是否所有必需的表單類型都已提交
      const allFormsSubmitted = stage.formTypeIds.every(formId => 
        submittedFormTypes.has(Number(formId))
      );
      
      return {
        stageIndex,
        allFormsSubmitted
      };
    });
    
    // 更新已完成的階段數組
    const newCompletedStages = stageCompletionStatus
      .filter(status => status.allFormsSubmitted)
      .map(status => status.stageIndex);
    
    // 保存到 localStorage
    functionsRef.current.saveCompletedStages(newCompletedStages);
    
    // 找出第一個未完成的階段
    const firstIncompleteStage = stageCompletionStatus.find(status => !status.allFormsSubmitted);
    
    if (firstIncompleteStage) {
      setCurrentStage(firstIncompleteStage.stageIndex);
      console.log(`設置當前階段為 ${firstIncompleteStage.stageIndex}: ${STAGE_FORMS[firstIncompleteStage.stageIndex].name}`);
    } else {
      // 如果所有階段都已完成，則進入下一批次的第一階段
      console.log("當前批次所有表單已完成，準備進入下一批次");
      setCurrentBatch(batchNumber + 1);
      setCurrentStage(0);
      functionsRef.current.saveCompletedStages([], batchNumber + 1); // 重置已完成階段
    }
  };
  
  useEffect(() => {
    if (worker && !loading) {
      localStorage.setItem(`worker_stage_${workerCode}`, currentStage.toString());
      localStorage.setItem(`worker_batch_${workerCode}`, currentBatch.toString());
    }
  }, [currentStage, currentBatch, worker, loading, workerCode]);

  // 在組件掛載時檢查是否有進行中的等待
  useEffect(() => {
    if (worker && !loading) {
      const waitingKey = `waiting_for_next_stage_${workerCode}_${currentBatch}_${currentStage}`;
      const endTimeKey = `wait_stage_end_time_${workerCode}_${currentBatch}_${currentStage}`;
      
      const isWaiting = localStorage.getItem(waitingKey) === 'true';
      const endTimeStr = localStorage.getItem(endTimeKey);
      
      // 輸出頁面載入時的調試信息
      console.log('===== 頁面載入檢查等待狀態 =====');
      console.log('workerCode:', workerCode);
      console.log('currentBatch:', currentBatch);
      console.log('currentStage:', currentStage);
      console.log('localStorage 中的等待狀態:', isWaiting);
      console.log('localStorage 中的結束時間:', endTimeStr);
      console.log('identity_confirmed_${workerCode}:', localStorage.getItem(`identity_confirmed_${workerCode}`));
      console.log('================================');
      
      // 恢復身份確認狀態
      if (localStorage.getItem(`identity_confirmed_${workerCode}`) === 'true') {
        setIdentityConfirmed(true);
      }
      
      if (isWaiting && endTimeStr) {
        const endTime = parseInt(endTimeStr, 10);
        const now = Date.now();
        
        console.log('偵測到等待狀態:');
        console.log('當前時間:', new Date(now).toLocaleString());
        console.log('結束時間:', new Date(endTime).toLocaleString());
        console.log('剩餘秒數:', Math.floor((endTime - now) / 1000));
        
        if (now < endTime) {
          // 先設置狀態，再啟動計時器
          setWaitingForNextStage(true);
          setWaitTimeRemaining(Math.floor((endTime - now) / 1000));
          
          // 稍微延遲啟動計時器，確保狀態更新
          setTimeout(() => {
            console.log('重新啟動等待計時器');
            functionsRef.current.startWaitingTimer(endTime);
          }, 100);
        } else {
          // 等待時間已過，移除等待狀態並進入下一階段
          console.log('等待時間已過，進入下一階段');
          localStorage.removeItem(waitingKey);
          localStorage.removeItem(endTimeKey);
          functionsRef.current.goToNextStage();
        }
      } else {
        console.log('沒有進行中的等待狀態');
      }
    }
  }, [worker, loading, currentBatch, currentStage, workerCode]);
  

  // 處理身份確認
  const handleIdentityConfirm = (confirmed) => {
    if (confirmed) {
      setIdentityConfirmed(true);
      // 保存身份確認狀態到 localStorage
      localStorage.setItem(`identity_confirmed_${workerCode}`, 'true');
      console.log('身份已確認，保存到localStorage:', `identity_confirmed_${workerCode}`);
    } else {
      // 如果不是本人，顯示錯誤訊息
      alert('身份確認失敗，請聯絡您的公司管理員');
      setError('如果您不是此勞工本人，請聯絡您的公司管理員獲取正確的連結');
    }
  };
  
  // 選擇表單
  const handleFormSelect = (form, timeSegment) => {
    // 檢查該表單是否已在當前階段提交過
    const isSubmitted = isFormSubmittedInCurrentStage(form.id);
    
    if (isSubmitted) {
      alert(`您已經在當前階段填寫過此表單。`);
      return;
    }
    
    setSelectedForm({
      ...form,
      timeSegment: timeSegment
    });
  };
  
  // 處理表單提交成功
  const handleFormSubmitSuccess = (formTypeId) => {
    console.log(`表單${formTypeId}提交成功`);
    
    // 更新提交記錄，並明確地包含階段信息
    const newSubmission = {
      id: Date.now(), // 生成唯一ID
      worker_id: worker.id,
      form_type_id: Number(formTypeId),
      submission_count: currentBatch,
      time_segment: 1, // 每種表單在每個階段只填寫一次，固定為1
      stage: currentStage, // 明確設置當前階段
      submission_time: new Date().toISOString()
    };
    
    console.log("新增提交記錄:", newSubmission);
    
    const updatedSubmissions = [...formSubmissions, newSubmission];
    setFormSubmissions(updatedSubmissions);
    
    // 保存到本地存儲(模擬後端)
    localStorage.setItem(`worker_submissions_${workerCode}`, JSON.stringify(updatedSubmissions));
    
    // 檢查階段完成狀態
    const stageComplete = checkStageCompletion(updatedSubmissions);
    console.log('階段完成狀態:', stageComplete);
    
    // 當前階段所有表單都填寫完成，啟動等待計時器
    if (stageComplete) {
      console.log('所有表單已填寫完成，準備啟動等待計時器');
      
      // 設置等待時間（秒）
      const waitTimeInSeconds = 60; // 等待1分鐘
      
      // 計算結束時間（當前時間 + 等待時間）
      const endTime = Date.now() + (waitTimeInSeconds * 1000);
      console.log('當前時間:', new Date().toLocaleString());
      console.log('結束時間:', new Date(endTime).toLocaleString());
      console.log('等待秒數:', waitTimeInSeconds);
      
      // 啟動倒計時
      functionsRef.current.startWaitingTimer(endTime);
    }
    
    // 返回表單選擇頁面
    setSelectedForm(null);
  };
  
  // 檢查當前階段是否已完成所有必需的表單
  const checkStageCompletion = (submissions) => {
    // 獲取當前階段需要的表單類型
    const requiredFormTypes = STAGE_FORMS[currentStage].formTypeIds;
    
    // 篩選出當前批次和階段的提交記錄
    const stageSubmissions = submissions.filter(sub => 
      Number(sub.submission_count) === Number(currentBatch) && 
      Number(sub.stage) === currentStage
    );
    
    // 獲取已提交的表單類型
    const submittedFormTypes = new Set(stageSubmissions.map(sub => Number(sub.form_type_id)));
    
    // 檢查是否所有必需的表單類型都已提交
    const allFormsSubmitted = requiredFormTypes.every(formId => 
      submittedFormTypes.has(Number(formId))
    );
    
    if (allFormsSubmitted) {
      console.log(`第${currentStage + 1}階段 (${STAGE_FORMS[currentStage].name}) 所有必需表單已提交`);
      
      // 更新已完成階段列表
      const newCompletedStages = [...completedStages];
      if (!newCompletedStages.includes(currentStage)) {
        newCompletedStages.push(currentStage);
        functionsRef.current.saveCompletedStages(newCompletedStages);
      }
    }
    
    return allFormsSubmitted;
  };
  
  // 清除本地存儲數據 (用於開發測試)
  const clearLocalStorage = () => {
    console.log('清除所有本地存儲數據...');
    // 清除基本數據
    localStorage.removeItem(`worker_submissions_${workerCode}`);
    localStorage.removeItem(`worker_form_data_${workerCode}`);
    localStorage.removeItem(`worker_completed_stages_${workerCode}_batch_${currentBatch}`);
    localStorage.removeItem(`worker_stage_${workerCode}`);
    localStorage.removeItem(`worker_batch_${workerCode}`);
    
    // 清除等待相關的數據
    localStorage.removeItem(`waiting_for_next_stage_${workerCode}_${currentBatch}_${currentStage}`);
    localStorage.removeItem(`wait_stage_end_time_${workerCode}_${currentBatch}_${currentStage}`);
    
    // 清除身份確認狀態
    localStorage.removeItem(`identity_confirmed_${workerCode}`);
    
    // 清除全局等待狀態
    localStorage.removeItem(`global_waiting_${workerCode}`);
    localStorage.removeItem(`global_end_time_${workerCode}`);
    localStorage.removeItem(`global_batch_${workerCode}`);
    localStorage.removeItem(`global_stage_${workerCode}`);
    
    // 清除所有可能的批次和階段組合
    for (let b = 1; b <= 10; b++) {
      for (let s = 0; s < STAGE_FORMS.length; s++) {
        localStorage.removeItem(`waiting_for_next_stage_${workerCode}_${b}_${s}`);
        localStorage.removeItem(`wait_stage_end_time_${workerCode}_${b}_${s}`);
      }
    }
    
    window.location.reload();
  };
  
  // 檢查表單是否已在當前階段提交
  const isFormSubmittedInCurrentStage = (formTypeId) => {
    return formSubmissions.some(
      sub => Number(sub.form_type_id) === Number(formTypeId) && 
             Number(sub.submission_count) === Number(currentBatch) &&
             Number(sub.stage) === currentStage
    );
  };
  
  // 尋找下一個未填寫的表單
  const findNextUnsubmittedForm = (submissions) => {
    // 獲取當前階段需要填寫的表單類型
    const requiredFormTypes = STAGE_FORMS[currentStage].formTypeIds;
    
    // 篩選出當前階段和批次已提交的表單類型
    const submittedFormTypeIds = new Set(
      submissions.filter(sub => 
        Number(sub.submission_count) === Number(currentBatch) && 
        Number(sub.stage) === currentStage
      ).map(sub => Number(sub.form_type_id))
    );
    
    // 尋找第一個未提交的表單類型
    const nextFormTypeId = requiredFormTypes.find(formId => 
      !submittedFormTypeIds.has(Number(formId))
    );
    
    // 如果找到未提交的表單類型，返回對應的表單物件
    if (nextFormTypeId) {
      return FORM_TYPES.find(form => form.id === nextFormTypeId);
    }
    
    // 如果所有表單都已提交，返回null
    return null;
  };
  
  // 渲染當前階段的表單卡片
  const renderCurrentStageForms = () => {
    if (currentStage >= STAGE_FORMS.length) {
      return (
        <div className="all-forms-completed">
          <h3>所有表單已填寫完成</h3>
          <p>您已完成第 {currentBatch} 批次的所有表單。</p>
          <p>請等待下一批次開始。</p>
        </div>
      );
    }
    
    const currentStageForms = STAGE_FORMS[currentStage].formTypeIds.map(formTypeId => 
      FORM_TYPES.find(form => form.id === formTypeId)
    ).filter(Boolean);
    
    // 篩選出當前階段未填寫的表單和已填寫的表單
    const unfilledForms = currentStageForms.filter(form => !isFormSubmittedInCurrentStage(form.id));
    const filledForms = currentStageForms.filter(form => isFormSubmittedInCurrentStage(form.id));
    
    // 檢查當前階段的進度
    const allTypesSubmitted = unfilledForms.length === 0;
    
    return (
      <div className="form-cards-container">
        <div className="stage-info-message">
          <h3>{STAGE_FORMS[currentStage].name} - 請填寫以下表單</h3>
          {waitingForNextStage ? (
            <div className="waiting-next-stage">
              <p>所有表單已填寫完成，等待進入下一階段...</p>
              <div className="wait-timer-container">
                <div className="wait-timer-label">
                  <span>剩餘等待時間: {Math.floor(waitTimeRemaining / 60)}分{waitTimeRemaining % 60}秒</span>
                </div>
                <div className="wait-timer-progress">
                  <div 
                    className="wait-timer-bar" 
                    style={{
                      width: `${(waitTimeRemaining / 60) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (allTypesSubmitted ? (
            <p>所有表單已填寫完成，即將開始等待時間...</p>
          ) : (
            <p>此階段還有 {unfilledForms.length} 種表單需要填寫。</p>
          ))}
        </div>
        
        <div className="form-cards">
          {/* 先顯示未填寫的表單，使它們更加突出 */}
          {unfilledForms.map(form => (
            <div 
              key={form.id} 
              className="form-card needs-submission"
            >
              <h4>{form.name}</h4>
              <p>{form.description}</p>
              
              <div className="form-status">
                <p className="no-submissions">尚未提交</p>
              </div>
              
              <div className="next-submission">
                <button 
                  className="form-button" 
                  onClick={() => handleFormSelect(form, 1)}
                >
                  開始填寫
                </button>
              </div>
            </div>
          ))}
          
          {/* 再顯示已填寫的表單 */}
          {filledForms.map(form => (
            <div 
              key={form.id} 
              className="form-card has-submissions"
            >
              <h4>{form.name}</h4>
              <p>{form.description}</p>
              
              <div className="form-status">
                <div className="submission-info">
                  <p>已提交</p>
                  <div className="segment-dots">
                    <span className="segment-dot" title="已提交">●</span>
                  </div>
                </div>
              </div>
              
              <div className="next-submission">
                <button 
                  className="form-button" 
                  disabled={true}
                >
                  已填寫
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* 移除手動進入下一階段的按鈕，使用自動進入 */}
        
        {/* 階段進度指示器 */}
        <div className="stage-progress">
          <p>進度: {currentStage + 1} / {STAGE_FORMS.length}</p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{width: `${((currentStage) / STAGE_FORMS.length) * 100}%`}}
            ></div>
          </div>
        </div>
      </div>
    );
  };
  
  if (loading) return <div className="loading">載入中...</div>;
  
  if (error && !worker) return <div className="error-message">{error}</div>;
  
  // 如果已選擇表單
  if (selectedForm) {
    const FormComponent = selectedForm.component;
    
    if (!FormComponent) {
      console.error(`找不到對應的表單組件, ID: ${selectedForm.id}`);
      return <div className="error-message">載入表單失敗，找不到對應的表單組件</div>;
    }
    
    return (
      <div>
        <button className="back-button" onClick={() => setSelectedForm(null)}>返回</button>
        <FormComponent 
          workerCode={workerCode} 
          companyCode={companyCode}
          batchNumber={currentBatch}
          formTypeId={selectedForm.id}
          timeSegment={selectedForm.timeSegment} // 傳遞時段參數
          stage={currentStage} // 明確傳遞階段參數
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
           <p className="stage-info">目前階段: {STAGE_FORMS[currentStage].name}</p>
           {/* 開發測試用按鈕，正式環境可移除 */}
           {process.env.NODE_ENV === 'development' && (
             <div>
               <button onClick={clearLocalStorage} className="dev-button">
                 清除本地存儲資料
               </button>
               <button onClick={() => console.log(formSubmissions)} className="dev-button">
                 檢查提交記錄
               </button>
               <button onClick={() => console.log(completedStages)} className="dev-button">
                 檢查已完成階段
               </button>
             </div>
           )}
         </div>
       )}
     </header>
     
     {identityConfirmed && (
       <main className="forms-container">
         <h2>第 {currentBatch} 批次表單</h2>
         {renderCurrentStageForms()}
         
         <div className="forms-history">
           <h3>階段進度</h3>
           <div className="stage-list">
             {STAGE_FORMS.map((stage, index) => {
               const isCompleted = completedStages.includes(index);
               const isCurrent = index === currentStage;
               const isLocked = !isCompleted && index > currentStage;
               
               return (
                 <div 
                   key={stage.id}
                   className={`stage-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`}
                 >
                   <div className="stage-number">{index + 1}</div>
                   <div className="stage-content">
                     <h4>{stage.name}</h4>
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