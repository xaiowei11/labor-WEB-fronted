// import React, { useState, useEffect } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import axios from 'axios';

// // 需要導入新的表單組件
// import SleepQualityForm from './form-components/SleepQualityForm';
// import SleepinessScale from './form-components/SleepinessScale';
// import EyeFatigueScale from './form-components/EyeFatigueScale';
// import NasaTlxScale from './form-components/NasaTlxScale';

// import '../../styles/WorkerFormPage.css';

// // 定義表單類型
// const FORM_TYPES = [
//   { id: 1, name: '睡眠時數調查', component: SleepQualityForm, description: '記錄睡眠時間' },
//   { id: 2, name: '嗜睡量表', component: SleepinessScale, description: '評估當前嗜睡程度' },
//   { id: 3, name: '視覺疲勞量表', component: EyeFatigueScale, description: '評估眼睛健康狀況' },
//   { id: 4, name: 'NASA-TLX工作負荷量表', component: NasaTlxScale, description: '評估工作負荷程度' }
// ];

// // 定義各階段所需填寫的表單類型
// const STAGE_FORMS = [
//   // 第一階段 (早上)
//   { 
//     id: 1, 
//     name: '早上表單', 
//     formTypeIds: [1, 2, 3] // 需要填寫睡眠、嗜睡、視覺疲勞表單
//   },
//   // 第二階段 (中午)
//   { 
//     id: 2, 
//     name: '中午表單', 
//     formTypeIds: [2, 3] // 需要填寫嗜睡、視覺疲勞表單
//   },
//   // 第三階段 (下午)
//   { 
//     id: 3, 
//     name: '下午表單', 
//     formTypeIds: [2, 3] // 需要填寫嗜睡、視覺疲勞表單
//   },
//   // 第四階段 (下班)
//   { 
//     id: 4, 
//     name: '下班表單', 
//     formTypeIds: [2, 3] // 需要填寫嗜睡、視覺疲勞、NASA-TLX表單
//   },
//   { 
//     id: 5, 
//     name: '晚上表單', 
//     formTypeIds: [2, 3, 4] // 需要填寫嗜睡、視覺疲勞、NASA-TLX表單
//   }
// ];

// const TestWorkerFormPage = () => {
//   const [searchParams] = useSearchParams();
//   const workerCode = searchParams.get('worker_code');
//   const companyCode = searchParams.get('company_code');
  
//   const [worker, setWorker] = useState(null);
//   const [currentStage, setCurrentStage] = useState(0); // 當前階段索引
//   const [selectedForm, setSelectedForm] = useState(null); // 當前選擇的表單
//   const [completedForms, setCompletedForms] = useState({}); // 記錄已完成的表單 {stageId_formTypeId: true}
//   const [identityConfirmed, setIdentityConfirmed] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [currentBatch, setCurrentBatch] = useState(1); // 當前批次
//   const [formSubmissions, setFormSubmissions] = useState([]); // 已提交的表單列表
//   const [cooldownActive, setCooldownActive] = useState(false);
//   const [cooldownTime, setCooldownTime] = useState(0);
  
//   // 載入勞工信息和表單狀態
//   useEffect(() => {
//     const fetchWorkerData = async () => {
//       if (!workerCode || !companyCode) {
//         setError('連結無效，缺少必要參數');
//         setLoading(false);
//         return; 
//       }
      
//       try {
//         console.log('正在獲取勞工數據，參數:', workerCode, companyCode);
//         // 獲取勞工資訊
//         const response = await axios.get(`http://localhost:8000/api/public/worker-by-code/?worker_code=${workerCode}&company_code=${companyCode}`);
//         setWorker(response.data);
//         console.log('成功獲取勞工數據:', response.data);
        
//         // 嘗試獲取已提交的表單記錄
//         try {
//           const submissionsResponse = await axios.get(`http://localhost:8000/api/public/worker-submissions/?worker_code=${workerCode}&company_code=${companyCode}`);
//           const submissionsData = submissionsResponse.data;
//           setFormSubmissions(submissionsData);
          
//           // 計算當前批次
//           let maxBatch = 0;
//           submissionsData.forEach(sub => {
//             if (sub.submission_count > maxBatch) {
//               maxBatch = sub.submission_count;
//             }
//           });
          
//           // 設置當前批次（至少為1）
//           const batchNumber = Math.max(maxBatch, 1);
//           setCurrentBatch(batchNumber);
//           console.log("當前批次:", batchNumber);
          
//           // 更新已完成表單的記錄
//           updateCompletedForms(submissionsData);
          
//           // 計算當前階段
//           calculateCurrentStage(submissionsData, batchNumber);
          
//         } catch (apiError) {
//           console.error('API獲取提交記錄失敗，嘗試使用本地存儲:', apiError);
          
//           // 使用localStorage模擬後端API
//           const savedSubmissions = localStorage.getItem(`worker_submissions_${workerCode}`);
//           let localSubmissions = [];
          
//           if (savedSubmissions) {
//             localSubmissions = JSON.parse(savedSubmissions);
//             console.log("從本地儲存獲取提交記錄:", localSubmissions);
//             setFormSubmissions(localSubmissions);
            
//             // 計算當前批次
//             let maxBatch = 0;
//             localSubmissions.forEach(sub => {
//               if (sub.submission_count > maxBatch) {
//                 maxBatch = sub.submission_count;
//               }
//             });
            
//             // 設置當前批次（至少為1）
//             const batchNumber = Math.max(maxBatch, 1);
//             setCurrentBatch(batchNumber);
//             console.log("當前批次:", batchNumber);
            
//             // 更新已完成表單的記錄
//             updateCompletedForms(localSubmissions);
            
//             // 計算當前階段
//             calculateCurrentStage(localSubmissions, batchNumber);
//           } else {
//             console.log("沒有找到提交記錄，用戶應從第一階段開始");
//             setCurrentStage(0);
//             setCurrentBatch(1);
//             // 清空已完成表單記錄
//             setCompletedForms({});
//           }
//         }
        
//         setLoading(false);
//       } catch (err) {
//         console.error('無法載入資料', err);
//         setError('無法載入勞工資料，請檢查連結是否正確');
//         setLoading(false);
//       }
//     };
    
//     fetchWorkerData();
//   }, [workerCode, companyCode]);
  
//   // 更新已完成表單的記錄
//   const updateCompletedForms = (submissions) => {
//     const currentBatchSubmissions = submissions.filter(
//       sub => Number(sub.submission_count) === Number(currentBatch)
//     );
    
//     const completed = {};
//     currentBatchSubmissions.forEach(sub => {
//       const formKey = `${currentStage}_${sub.form_type_id}_${currentBatch}`;
//       completed[formKey] = true;
//     });
    
//     setCompletedForms(completed);
//     console.log("已完成的表單:", completed);
//   };
  
//   // 根據提交記錄計算當前應該顯示的表單階段
//   const calculateCurrentStage = (submissions, batchNumber) => {
//     // 篩選出當前批次的提交記錄
//     const currentBatchSubmissions = submissions.filter(
//       sub => Number(sub.submission_count) === Number(batchNumber)
//     );
    
//     console.log("當前批次號:", batchNumber);
//     console.log("過濾後的當前批次提交記錄:", currentBatchSubmissions);
    
//     // 獲取所有已提交的表單類型ID
//     const submittedFormIds = new Set(
//       currentBatchSubmissions.map(sub => Number(sub.form_type_id))
//     );
    
//     console.log("當前批次已提交的表單ID:", Array.from(submittedFormIds));
    
//     // 確定當前階段
//     for (let stageIndex = 0; stageIndex < STAGE_FORMS.length; stageIndex++) {
//       const stage = STAGE_FORMS[stageIndex];
//       const allFormsCompleted = stage.formTypeIds.every(formId => 
//         submittedFormIds.has(Number(formId))
//       );
      
//       if (!allFormsCompleted) {
//         setCurrentStage(stageIndex);
//         console.log(`設置當前階段為 ${stageIndex}: ${stage.name}`);
//         return;
//       }
//     }
    
//     // 如果所有階段都已完成，則進入下一批次的第一階段
//     console.log("當前批次所有表單已完成，準備進入下一批次");
//     setCurrentBatch(batchNumber + 1);
//     setCurrentStage(0);
//   };
  
//   // 處理身份確認
//   const handleIdentityConfirm = (confirmed) => {
//     if (confirmed) {
//       setIdentityConfirmed(true);
//     } else {
//       // 如果不是本人，顯示錯誤訊息
//       setError('如果您不是此勞工本人，請聯絡您的公司管理員獲取正確的連結');
//     }
//   };
  
//   // 選擇表單
//   const handleFormSelect = (form, timeSegment) => {
//     setSelectedForm({
//       ...form,
//       timeSegment: timeSegment
//     });
//   };
  
//   // 處理表單提交成功
//   const handleFormSubmitSuccess = (formTypeId) => {
//     console.log(`表單${formTypeId}提交成功`);
    
//     // 更新已完成表單記錄
//     const formKey = `${currentStage}_${formTypeId}_${currentBatch}`;
//     const updatedCompletedForms = {
//       ...completedForms,
//       [formKey]: true
//     };
//     setCompletedForms(updatedCompletedForms);
    
//     // 保存到本地存儲
//     localStorage.setItem(`worker_completed_forms_${workerCode}`, JSON.stringify(updatedCompletedForms));
    
//     // 更新提交記錄
//     const newSubmission = {
//       id: Date.now(), // 生成唯一ID
//       worker_id: worker.id,
//       form_type_id: Number(formTypeId),
//       submission_count: currentBatch,
//       submission_time: new Date().toISOString()
//     };
    
//     console.log("新增提交記錄:", newSubmission);
    
//     const updatedSubmissions = [...formSubmissions, newSubmission];
//     setFormSubmissions(updatedSubmissions);
    
//     // 保存到本地存儲(模擬後端)
//     localStorage.setItem(`worker_submissions_${workerCode}`, JSON.stringify(updatedSubmissions));
    
//     // 檢查當前階段是否所有表單都已完成
//     const currentStageForms = STAGE_FORMS[currentStage].formTypeIds;
//     const allFormsCompleted = currentStageForms.every(id => {
//       const key = `${currentStage}_${id}_${currentBatch}`;
//       return updatedCompletedForms[key];
//     });
    
//     // 如果當前階段所有表單都已完成，進入下一階段
//     if (allFormsCompleted) {
//       let nextStage = currentStage + 1;
      
//       // 如果所有階段都已完成，則進入下一批次
//       if (nextStage >= STAGE_FORMS.length) {
//         const nextBatch = currentBatch + 1;
//         setCurrentBatch(nextBatch);
//         nextStage = 0;
//         alert(`第${currentBatch}批次所有表單已完成，您將進入第${nextBatch}批次。`);
//       }
      
//       setCurrentStage(nextStage);
//     }
    
//     // 啟動冷卻時間
//     setCooldownActive(true);
//     setCooldownTime(1); // 10秒冷卻時間
    
//     const countdownInterval = setInterval(() => {
//       setCooldownTime(prevTime => {
//         if (prevTime <= 1) {
//           clearInterval(countdownInterval);
//           setCooldownActive(false);
//           return 0;
//         }
//         return prevTime - 1;
//       });
//     }, 1000);
    
//     // 返回表單選擇頁面
//     setSelectedForm(null);
//   };
  
//   // 清除本地存儲數據 (用於開發測試)
//   const clearLocalStorage = () => {
//     localStorage.removeItem(`worker_submissions_${workerCode}`);
//     localStorage.removeItem(`worker_form_data_${workerCode}`);
//     localStorage.removeItem(`worker_completed_forms_${workerCode}`);
//     window.location.reload();
//   };

//   const getFormSubmissionCount = (formTypeId, batchNumber) => {
//     // 篩選出當前批次的特定表單類型的提交記錄
//     const submissions = formSubmissions.filter(
//       sub => sub.form_type_id === formTypeId && sub.submission_count === batchNumber
//     );
    
//     return submissions.length;
//   };
  
//   // 渲染當前階段的表單卡片
//   const renderCurrentStageForms = () => {
//     if (currentStage >= STAGE_FORMS.length) {
//       return (
//         <div className="all-forms-completed">
//           <h3>所有表單已填寫完成</h3>
//           <p>您已完成第 {currentBatch} 批次的所有表單。</p>
//           <p>請等待下一批次開始。</p>
//         </div>
//       );
//     }
    
//     const currentStageForms = STAGE_FORMS[currentStage].formTypeIds.map(formTypeId => 
//       FORM_TYPES.find(form => form.id === formTypeId)
//     ).filter(Boolean);
    
//     return (
//       <div className="form-cards-container">
//         <h3>{STAGE_FORMS[currentStage].name} - 請完成以下表單</h3>
//         <div className="form-cards">
//           {currentStageForms.map(form => {
//             const formKey = `${currentStage}_${form.id}_${currentBatch}`;
//             const isCompleted = completedForms[formKey];
            
//             // 計算該表單的時段 - 查詢已有的提交次數加1
//             const submissionCount = getFormSubmissionCount(form.id, currentBatch);
//             const timeSegment = submissionCount + 1;
            
//             return (
//               <div 
//                 key={form.id} 
//                 className={`form-card ${isCompleted ? 'completed' : 'active'}`}
//               >
//                 <h4>{form.name}</h4>
//                 <p>{form.description}</p>
//                 <p className="time-segment-info">第{currentBatch}批次-第{timeSegment}時段</p>
//                 {isCompleted ? (
//                   <div className="form-status completed">已完成</div>
//                 ) : (
//                   <button 
//                     className="form-button" 
//                     onClick={() => handleFormSelect(form, timeSegment)}
//                     disabled={cooldownActive}
//                   >
//                     {cooldownActive ? `請等待 ${cooldownTime} 秒` : '開始填寫'}
//                   </button>
//                 )}
//               </div>
//             );
//           })}
//         </div>
        
//         {/* 階段進度指示器 */}
//         <div className="stage-progress">
//           <p>進度: {currentStage + 1} / {STAGE_FORMS.length}</p>
//           <div className="progress-bar">
//             <div 
//               className="progress-fill" 
//               style={{width: `${((currentStage) / STAGE_FORMS.length) * 100}%`}}
//             ></div>
//           </div>
//         </div>
//       </div>
//     );
//   };
  
//   if (loading) return <div className="loading">載入中...</div>;
  
//   if (error && !worker) return <div className="error-message">{error}</div>;
  
//   // 如果已選擇表單
//   // 如果已選擇表單
//   if (selectedForm) {
//     const FormComponent = selectedForm.component;
    
//     if (!FormComponent) {
//       console.error(`找不到對應的表單組件, ID: ${selectedForm.id}`);
//       return <div className="error-message">載入表單失敗，找不到對應的表單組件</div>;
//     }
    
//     return (
//       <div>
//         <button className="back-button" onClick={() => setSelectedForm(null)}>返回</button>
//         <FormComponent 
//           workerCode={workerCode} 
//           companyCode={companyCode}
//           batchNumber={currentBatch}
//           formTypeId={selectedForm.id}
//           timeSegment={selectedForm.timeSegment} // 傳遞時段參數
//           onSubmitSuccess={handleFormSubmitSuccess}
//         />
//       </div>
//     );
//   }
  
//   // 表單選擇頁面
//   return (
//     <div className="worker-form-page">
//       <header className="form-header">
//         <h1>勞工健康數據平台</h1>
//         {worker && !identityConfirmed && (
//           <div className="identity-confirmation">
//             <h3>身份確認</h3>
//             <p>您是 <strong>{worker.name}</strong> 嗎？</p>
//             <div className="confirmation-buttons">
//               <button 
//                 className="confirm-yes" 
//                 onClick={() => handleIdentityConfirm(true)}
//               >
//                 是，我是
//               </button>
//               <button 
//                 className="confirm-no" 
//                 onClick={() => handleIdentityConfirm(false)}
//               >
//                 不是
//               </button>
//             </div>
//           </div>
//         )}
//         {worker && identityConfirmed && (
//           <div className="worker-info">
//             <p>您好，{worker.name}</p>
//             <p>勞工代碼: {worker.code}</p>
//             <p>公司: {worker.company_name}</p>
//             <p className="batch-info">目前填寫批次: 第 {currentBatch} 批</p>
//             {/* 開發測試用按鈕，正式環境可移除 */}
//             {process.env.NODE_ENV === 'development' && (
//               <div>
//                 <button onClick={clearLocalStorage} className="dev-button">
//                   清除本地存儲資料
//                 </button>
//                 <button onClick={() => console.log(completedForms)} className="dev-button">
//                   檢查已完成表單
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </header>
      
//       {identityConfirmed && (
//         <main className="forms-container">
//           <h2>第 {currentBatch} 批次表單</h2>
//           {renderCurrentStageForms()}
          
//           <div className="forms-history">
//             <h3>階段進度</h3>
//             <div className="stage-list">
//               {STAGE_FORMS.map((stage, index) => {
//                 const isCompleted = index < currentStage;
//                 const isCurrent = index === currentStage;
//                 const isLocked = index > currentStage;
                
//                 return (
//                   <div 
//                     key={stage.id}
//                     className={`stage-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`}
//                   >
//                     <div className="stage-number">{index + 1}</div>
//                     <div className="stage-content">
//                       <h4>{stage.name}</h4>
//                       {isCompleted && <div className="status-badge completed">已完成</div>}
//                       {isCurrent && <div className="status-badge current">當前階段</div>}
//                       {isLocked && <div className="status-badge locked">尚未解鎖</div>}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </main>
//       )}
      
//       <footer className="form-footer">
//         <p>&copy; 2025 勞工健康數據平台</p>
//         <p>如遇問題，請聯絡您的公司管理員</p>
//       </footer>
//     </div>
//   );
// };

// export default Testworkerformpage;