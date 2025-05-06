// // src/components/forms/WorkerHealthForm.jsx
// import React, { useState, useEffect } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import axios from 'axios';
// import '../../styles/WorkerHealthForm.css';

// const WorkerHealthForm = ({ workerCode, companyCode, timeSegment, batchNumber = 1, onSubmitSuccess }) => {
//   const [worker, setWorker] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [identityConfirmed, setIdentityConfirmed] = useState(true); // 已在父組件確認過身份，預設為 true
//   const [formSubmitted, setFormSubmitted] = useState(false);
  
//   // 表單數據 - 睡眠相關
//   const [sleepData, setSleepData] = useState({
//     sleep_hours: '',
//     sleep_quality: ''
//   });
  
//   // 史丹佛嗜睡量表數據
//   const [sleepinessData, setSleepinessData] = useState({
//     sleepiness_level: ''
//   });
  
//   // 視覺疲勞量表數據
//   const [eyeFatigueData, setEyeFatigueData] = useState({
//     dry_eyes: '',
//     eye_pain: '',
//     blurred_vision: '',
//     focus_difficulty: '',
//     headache: ''
//   });
  
//   // NASA-TLX 任務負荷評估量表數據
//   const [nasaTlxData, setNasaTlxData] = useState({
//     selected_factor: '',
//     mental_demand: '50',
//     physical_demand: '50',
//     temporal_demand: '50',
//     performance: '50',
//     effort: '50',
//     frustration: '50'
//   });
  
//   // 使用傳入的 workerCode 和 companyCode 獲取勞工資料
//   useEffect(() => {
//     const fetchWorkerData = async () => {
//       if (!workerCode || !companyCode) {
//         setError('連結無效，缺少必要參數');
//         setLoading(false);
//         return;
//       }
      
//       try {
//         console.log('傳入的參數:', workerCode, companyCode);
        
//         // 使用 axios 直接調用
//         const response = await axios.get(`http://localhost:8000/api/public/worker-by-code/?worker_code=${workerCode}&company_code=${companyCode}`);
//         setWorker(response.data);
//         setLoading(false);
//       } catch (err) {
//         console.error('API 錯誤詳情:', err.response || err);
//         setError('無法載入勞工資料，請檢查連結是否正確');
//         setLoading(false);
//       }
//     };
    
//     fetchWorkerData();
//   }, [workerCode, companyCode]);
  
//   // 處理睡眠表單輸入變更
//   const handleSleepInputChange = (e) => {
//     const { name, value } = e.target;
//     setSleepData({
//       ...sleepData,
//       [name]: value
//     });
//   };
  
//   // 處理嗜睡量表輸入變更
//   const handleSleepinessInputChange = (e) => {
//     setSleepinessData({
//       sleepiness_level: e.target.value
//     });
//   };
  
//   // 處理視覺疲勞量表輸入變更
//   const handleEyeFatigueInputChange = (e) => {
//     const { name, value } = e.target;
//     setEyeFatigueData({
//       ...eyeFatigueData,
//       [name]: value
//     });
//   };
  
//   // 處理NASA-TLX輸入變更
//   const handleNasaTlxInputChange = (e) => {
//     const { name, value } = e.target;
//     setNasaTlxData({
//       ...nasaTlxData,
//       [name]: value
//     });
//   };
  
//   // 提交表單
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     try {
//       // 獲取勞工資料
//       const workerResponse = await axios.get(`http://localhost:8000/api/public/worker-by-code/?worker_code=${workerCode}&company_code=${companyCode}`);
//       const workerId = workerResponse.data.id;
      
//       // 設置表單類型ID (假設: 1=第一時段, 2=第二時段, 3=第三時段, 4=第四時段, 5=第五時段)
//       const formTypeId = parseInt(timeSegment);
      
//       // 整合所有表單數據
//       const combinedFormData = {
//         ...sleepData,
//         ...sleepinessData,
//         ...eyeFatigueData,
//         ...nasaTlxData,
//         time_segment: timeSegment,
//         batch_number: batchNumber
//       };
      
//       // 準備提交的數據
//       const submitData = {
//         worker_id: workerId,
//         form_type_id: formTypeId,
//         submission_count: batchNumber,
//         form_data: combinedFormData
//       };
      
//       console.log('將提交以下數據:', submitData);
      
//       // 提交表單數據
//       const response = await axios.post('http://localhost:8000/api/public/forms/submit/', submitData);
      
//       console.log('API響應成功:', response);
      
//       // 表單提交成功
//       setFormSubmitted(true);
      
//       // 如果有提供成功回調函數，則調用它
//       if (typeof onSubmitSuccess === 'function') {
//         // 暫時不調用，讓用戶看到成功畫面
//         // onSubmitSuccess();
//       }
//     } catch (err) {
//       console.error('提交表單失敗 - 完整錯誤:', err);
      
//       // 顯示用戶友好的錯誤消息
//       const errorMessage = err.response?.data?.error || 
//                          err.response?.data?.message || 
//                          `提交表單時發生錯誤 (${err.message})`;
//       setError(errorMessage);
//     }
//   };
  
//   // 渲染睡眠品質表單
//   const renderSleepForm = () => {
//     return (
//       <div className="form-section">
//         <h3>壹. 睡眠品質問卷</h3>
//         <div className="form-group">
//           <label htmlFor="sleep_hours">昨晚您實際的睡眠時數：</label>
//           <input
//             type="number"
//             id="sleep_hours"
//             name="sleep_hours"
//             value={sleepData.sleep_hours}
//             onChange={handleSleepInputChange}
//             required
//             min="0"
//             max="24"
//             step="0.5"
//           />
//           <span>小時</span>
//         </div>
        
//         <div className="form-group">
//           <label>您覺得昨晚的整體睡眠品質如何？</label>
//           <div className="radio-group">
//             <label>
//               <input
//                 type="radio"
//                 name="sleep_quality"
//                 value="very_poor"
//                 checked={sleepData.sleep_quality === 'very_poor'}
//                 onChange={handleSleepInputChange}
//                 required
//               />
//               非常差
//             </label>
//             <label>
//               <input
//                 type="radio"
//                 name="sleep_quality"
//                 value="poor"
//                 checked={sleepData.sleep_quality === 'poor'}
//                 onChange={handleSleepInputChange}
//               />
//               差
//             </label>
//             <label>
//               <input
//                 type="radio"
//                 name="sleep_quality"
//                 value="normal"
//                 checked={sleepData.sleep_quality === 'normal'}
//                 onChange={handleSleepInputChange}
//               />
//               普通
//             </label>
//             <label>
//               <input
//                 type="radio"
//                 name="sleep_quality"
//                 value="good"
//                 checked={sleepData.sleep_quality === 'good'}
//                 onChange={handleSleepInputChange}
//               />
//               好
//             </label>
//             <label>
//               <input
//                 type="radio"
//                 name="sleep_quality"
//                 value="very_good"
//                 checked={sleepData.sleep_quality === 'very_good'}
//                 onChange={handleSleepInputChange}
//               />
//               非常好
//             </label>
//           </div>
//         </div>
//       </div>
//     );
//   };
  
//   // 渲染史丹佛嗜睡量表
//   const renderSleepinessScale = () => {
//     return (
//       <div className="form-section">
//         <h3>貳. 史丹佛嗜睡量表 (Stanford Sleepiness Scale)</h3>
//         <p>請從下列 7 個選項中選擇一個，最能代表您此刻的嗜睡感受：</p>
        
//         <div className="table-container">
//           <table className="sleepiness-table">
//             <thead>
//               <tr>
//                 <th>編號</th>
//                 <th>描述</th>
//                 <th>選擇</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td>1</td>
//                 <td>感覺精力充沛，頭腦清醒，毫無倦意</td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="sleepiness_level"
//                     value="1"
//                     checked={sleepinessData.sleepiness_level === '1'}
//                     onChange={handleSleepinessInputChange}
//                     required
//                   />
//                 </td>
//               </tr>
//               <tr>
//                 <td>2</td>
//                 <td>精力尚可，但不是最佳狀態，能夠集中注意力</td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="sleepiness_level"
//                     value="2"
//                     checked={sleepinessData.sleepiness_level === '2'}
//                     onChange={handleSleepinessInputChange}
//                   />
//                 </td>
//               </tr>
//               <tr>
//                 <td>3</td>
//                 <td>清醒，但對外界的刺激有反應但不夠警覺</td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="sleepiness_level"
//                     value="3"
//                     checked={sleepinessData.sleepiness_level === '3'}
//                     onChange={handleSleepinessInputChange}
//                   />
//                 </td>
//               </tr>
//               <tr>
//                 <td>4</td>
//                 <td>意識已有點不清楚，沒有精神</td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="sleepiness_level"
//                     value="4"
//                     checked={sleepinessData.sleepiness_level === '4'}
//                     onChange={handleSleepinessInputChange}
//                   />
//                 </td>
//               </tr>
//               <tr>
//                 <td>5</td>
//                 <td>昏昏沉沉；在清醒時對周圍事物興趣不大，遲鈍</td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="sleepiness_level"
//                     value="5"
//                     checked={sleepinessData.sleepiness_level === '5'}
//                     onChange={handleSleepinessInputChange}
//                   />
//                 </td>
//               </tr>
//               <tr>
//                 <td>6</td>
//                 <td>昏睡；很想睡，但努力保持頭腦清醒、頭昏</td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="sleepiness_level"
//                     value="6"
//                     checked={sleepinessData.sleepiness_level === '6'}
//                     onChange={handleSleepinessInputChange}
//                   />
//                 </td>
//               </tr>
//               <tr>
//                 <td>7</td>
//                 <td>不想再努力保持清醒；很快就入睡，有做夢的感覺</td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="sleepiness_level"
//                     value="7"
//                     checked={sleepinessData.sleepiness_level === '7'}
//                     onChange={handleSleepinessInputChange}
//                   />
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   };
  
//   // 渲染視覺疲勞量表
//   const renderEyeFatigueScale = () => {
//     return (
//       <div className="form-section">
//         <h3>參. 視覺疲勞量表</h3>
//         <p>請圈選最能代表此刻的視覺疲勞程度：</p>
        
//         <div className="table-container">
//           <table className="eye-fatigue-table">
//             <thead>
//               <tr>
//                 <th>項目</th>
//                 <th>無</th>
//                 <th>不確定</th>
//                 <th>是</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td>眼睛乾澀和灼熱？</td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="dry_eyes"
//                     value="no"
//                     checked={eyeFatigueData.dry_eyes === 'no'}
//                     onChange={handleEyeFatigueInputChange}
//                     required
//                   />
//                 </td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="dry_eyes"
//                     value="unsure"
//                     checked={eyeFatigueData.dry_eyes === 'unsure'}
//                     onChange={handleEyeFatigueInputChange}
//                   />
//                 </td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="dry_eyes"
//                     value="yes"
//                     checked={eyeFatigueData.dry_eyes === 'yes'}
//                     onChange={handleEyeFatigueInputChange}
//                   />
//                 </td>
//               </tr>
//               <tr>
//                 <td>眼痛或異物感？</td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="eye_pain"
//                     value="no"
//                     checked={eyeFatigueData.eye_pain === 'no'}
//                     onChange={handleEyeFatigueInputChange}
//                     required
//                   />
//                 </td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="eye_pain"
//                     value="unsure"
//                     checked={eyeFatigueData.eye_pain === 'unsure'}
//                     onChange={handleEyeFatigueInputChange}
//                   />
//                 </td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="eye_pain"
//                     value="yes"
//                     checked={eyeFatigueData.eye_pain === 'yes'}
//                     onChange={handleEyeFatigueInputChange}
//                   />
//                 </td>
//               </tr>
//               <tr>
//                 <td>視力模糊？</td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="blurred_vision"
//                     value="no"
//                     checked={eyeFatigueData.blurred_vision === 'no'}
//                     onChange={handleEyeFatigueInputChange}
//                     required
//                   />
//                 </td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="blurred_vision"
//                     value="unsure"
//                     checked={eyeFatigueData.blurred_vision === 'unsure'}
//                     onChange={handleEyeFatigueInputChange}
//                   />
//                 </td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="blurred_vision"
//                     value="yes"
//                     checked={eyeFatigueData.blurred_vision === 'yes'}
//                     onChange={handleEyeFatigueInputChange}
//                   />
//                 </td>
//               </tr>
//               <tr>
//                 <td>難以集中注意力？</td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="focus_difficulty"
//                     value="no"
//                     checked={eyeFatigueData.focus_difficulty === 'no'}
//                     onChange={handleEyeFatigueInputChange}
//                     required
//                   />
//                 </td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="focus_difficulty"
//                     value="unsure"
//                     checked={eyeFatigueData.focus_difficulty === 'unsure'}
//                     onChange={handleEyeFatigueInputChange}
//                   />
//                 </td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="focus_difficulty"
//                     value="yes"
//                     checked={eyeFatigueData.focus_difficulty === 'yes'}
//                     onChange={handleEyeFatigueInputChange}
//                   />
//                 </td>
//               </tr>
//               <tr>
//                 <td>頭痛或頭暈？</td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="headache"
//                     value="no"
//                     checked={eyeFatigueData.headache === 'no'}
//                     onChange={handleEyeFatigueInputChange}
//                     required
//                   />
//                 </td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="headache"
//                     value="unsure"
//                     checked={eyeFatigueData.headache === 'unsure'}
//                     onChange={handleEyeFatigueInputChange}
//                   />
//                 </td>
//                 <td>
//                   <input
//                     type="radio"
//                     name="headache"
//                     value="yes"
//                     checked={eyeFatigueData.headache === 'yes'}
//                     onChange={handleEyeFatigueInputChange}
//                   />
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   };
  
//   // 渲染NASA-TLX任務負荷評估量表
//   const renderNasaTlxScale = () => {
//     return (
//       <div className="form-section">
//         <h3>肆. NASA-TLX 任務負荷評估量表</h3>
//         <p>本量表將影響工作的心智負荷(勞心程度)因素，列出以下六項：</p>
        
//         <div className="table-container">
//           <table className="nasa-tlx-table">
//             <thead>
//               <tr>
//                 <th>因素</th>
//                 <th>解釋</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td>心理需求 (Mental Demand)</td>
//                 <td>任務是否需要大量思考、決策、計算、記憶等認知處理？</td>
//               </tr>
//               <tr>
//                 <td>身體需求 (Physical Demand)</td>
//                 <td>任務是否需要大量身體活動 (搬運、走動、體力消耗)？</td>
//               </tr>
//               <tr>
//                 <td>時間壓力 (Temporal Demand)</td>
//                 <td>任務是否需要快速完成？是否感受到時間緊迫？</td>
//               </tr>
//               <tr>
//                 <td>表現滿意度 (Performance)</td>
//                 <td>自己對任務完成度是否滿意？</td>
//               </tr>
//               <tr>
//                 <td>努力程度 (Effort)</td>
//                 <td>為了達成任務，付出了多少努力？</td>
//               </tr>
//               <tr>
//                 <td>挫折感 (Frustration Level)</td>
//                 <td>任務中是否感到受挫、焦慮、沮喪或煩躁</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
        
//         <div className="form-group">
//           <h4>請就六大因素的個別影響您工作心智負荷的程度進行評定</h4>
//           <p>請問心智需求 (完成工作所耗費腦力程度)影響您工作心智負荷的程度：分數越高負荷越大</p>
          
//           <div className="rating-slider">
//             <input
//               type="range"
//               id="mental_demand"
//               name="mental_demand"
//               min="0"
//               max="100"
//               step="5"
//               value={nasaTlxData.mental_demand || '50'}
//               onChange={handleNasaTlxInputChange}
//             />
//             <div className="rating-marks">
//               <span>0</span>
//               <span>20</span>
//               <span>40</span>
//               <span>60</span>
//               <span>80</span>
//               <span>100</span>
//             </div>
//           </div>
//           <p>當前評分: {nasaTlxData.mental_demand || '0'}</p>
//         </div>
        
//         <div className="form-group">
//           <p>請問動作需求 (完成工作所耗費體力程度)影響您工作心智負荷的程度：分數越高負荷越大</p>
          
//           <div className="rating-slider">
//             <input
//               type="range"
//               id="physical_demand"
//               name="physical_demand"
//               min="0"
//               max="100"
//               step="5"
//               value={nasaTlxData.physical_demand || '50'}
//               onChange={handleNasaTlxInputChange}
//             />
//             <div className="rating-marks">
//               <span>0</span>
//               <span>20</span>
//               <span>40</span>
//               <span>60</span>
//               <span>80</span>
//               <span>100</span>
//             </div>
//           </div>
//           <p>當前評分: {nasaTlxData.physical_demand || '0'}</p>
//         </div>
        
//         <div className="form-group">
//           <p>請問時間需求 (完成工作所耗費時間程度)影響您工作心智負荷的程度：分數越高負荷越大</p>
          
//           <div className="rating-slider">
//             <input
//               type="range"
//               id="temporal_demand"
//               name="temporal_demand"
//               min="0"
//               max="100"
//               step="5"
//               value={nasaTlxData.temporal_demand || '50'}
//               onChange={handleNasaTlxInputChange}
//             />
//             <div className="rating-marks">
//               <span>0</span>
//               <span>20</span>
//               <span>40</span>
//               <span>60</span>
//               <span>80</span>
//               <span>100</span>
//             </div>
//           </div>
//           <p>當前評分: {nasaTlxData.temporal_demand || '0'}</p>
//         </div>
        
//         <div className="form-group">
//           <p>請問自我績效 (完成工作後自覺滿意程度)影響您工作心智負荷的程度：分數越高負荷越大</p>
          
//           <div className="rating-slider">
//             <input
//               type="range"
//               id="performance"
//               name="performance"
//               min="0"
//               max="100"
//               step="5"
//               value={nasaTlxData.performance || '50'}
//               onChange={handleNasaTlxInputChange}
//             />
//             <div className="rating-marks">
//               <span>0</span>
//               <span>20</span>
//               <span>40</span>
//               <span>60</span>
//               <span>80</span>
//               <span>100</span>
//             </div>
//           </div>
//           <p>當前評分: {nasaTlxData.performance || '0'}</p>
//         </div>
        
//         <div className="form-group">
//           <p>請問精力耗費 (完成工作所耗費心力程度)影響您工作心智負荷的程度：分數越高負荷越大</p>
          
//           <div className="rating-slider">
//             <input
//               type="range"
//               id="effort"
//               name="effort"
//               min="0"
//               max="100"
//               step="5"
//               value={nasaTlxData.effort || '50'}
//               onChange={handleNasaTlxInputChange}
//             />
//             <div className="rating-marks">
//               <span>0</span>
//               <span>20</span>
//               <span>40</span>
//               <span>60</span>
//               <span>80</span>
//               <span>100</span>
//             </div>
//           </div>
//           <p>當前評分: {nasaTlxData.effort || '0'}</p>
//         </div>
        
//         <div className="form-group">
//           <p>請問挫折程度 (完成工作自覺挫折感的程度)影響您工作心智負荷的程度：分數越高負荷越大</p>
          
//           <div className="rating-slider">
//             <input
//               type="range"
//               id="frustration"
//               name="frustration"
//               min="0"
//               max="100"
//               step="5"
//               value={nasaTlxData.frustration || '50'}
//               onChange={handleNasaTlxInputChange}
//             />
//             <div className="rating-marks">
//               <span>0</span>
//               <span>20</span>
//               <span>40</span>
//               <span>60</span>
//               <span>80</span>
//               <span>100</span>
//             </div>
//           </div>
//           <p>當前評分: {nasaTlxData.frustration || '0'}</p>
//         </div>
//       </div>
//     );
//   };
  
//   // 依據時段渲染適當的表單
//   const renderFormByTimeSegment = () => {
//     switch(timeSegment) {
//       case "1":
//         return (
//           <>
//             {renderSleepForm()}
//             {renderSleepinessScale()}
//             {renderEyeFatigueScale()}
//           </>
//         );
//       case "2":
//       case "3":
//       case "4":
//         return (
//           <>
//             {renderSleepinessScale()}
//             {renderEyeFatigueScale()}
//           </>
//         );
//       case "5":
//         return (
//           <>
//             {renderSleepinessScale()}
//             {renderEyeFatigueScale()}
//             {renderNasaTlxScale()}
//           </>
//         );
//       default:
//         return <p>無效的時段選擇</p>;
//     }
//   };
  
//   if (loading) {
//     return <div className="loading">載入中...</div>;
//   }
  
//   if (error) {
//     return <div className="error-message">{error}</div>;
//   }
  
//   if (formSubmitted) {
//     return (
//       <div className="success-container">
//         <h2>表單提交成功</h2>
//         <p>感謝您填寫第{timeSegment}時段健康表單。</p>
//         <p>這是第{batchNumber}批次的提交。</p>
//         <p>您可以關閉此頁面或返回表單列表填寫其他表單。</p>
//         <button onClick={() => {
//           if (typeof onSubmitSuccess === 'function') {
//             onSubmitSuccess();
//           }
//         }} className="back-to-list-button">
//           返回表單列表
//         </button>
//       </div>
//     );
//   }
  
//   return (
//     <div className="worker-form-container">
//       <header className="form-header">
//         <h1>勞工健康數據平台</h1>
//         <h2>第{timeSegment}時段健康問卷 (第{batchNumber}批次)</h2>
//       </header>
      
//       <div className="form-container">
//         <div className="worker-info">
//           <p>您好，<strong>{worker?.name || '勞工'}</strong></p>
//           <p>勞工代碼: {worker?.code || workerCode}</p>
//           <p>請填寫以下第{timeSegment}時段健康相關問題</p>
//         </div>
        
//         <form onSubmit={handleSubmit} className="health-form">
//           {renderFormByTimeSegment()}
          
//           <button type="submit" className="submit-button">提交表單</button>
//         </form>
//       </div>
      
//       <footer className="form-footer">
//         <p>&copy; 2025 勞工健康數據平台</p>
//         <p>如有問題，請聯絡您的公司管理員</p>
//       </footer>
//     </div>
//   );
// };

// export default WorkerHealthForm;