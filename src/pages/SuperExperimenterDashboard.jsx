// src/pages/SuperExperimenterDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import ExperimentDetail from '../components/experimenter/ExperimentDetail';
import '../styles/ExperimenterDashboard.css';
import { toast } from 'react-toastify';

const SuperExperimenterDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [experiments, setExperiments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [showExperimentDetail, setShowExperimentDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  // 休息功能相關狀態
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [breakReason, setBreakReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [breakRecords, setBreakRecords] = useState([]);
  const [currentBreakId, setCurrentBreakId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 休息原因選項
  const BREAK_REASONS = [
    '裝水或洗手間等休息情境',
    '開會做測試',
    '吃午餐',
    '午休',
    '午休(非睡眠)',
    '其他'
  ];

  const handleStartBreak = () => {
    setShowBreakModal(true);
  };

  const handleConfirmBreak = async () => {
    if (!breakReason) {
      toast.error('請選擇離開原因');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const startTime = new Date().toISOString();
      
      const breakData = {
        worker: selectedWorker,
        experiment: currentExperiment?.id || null,
        record_date: experimentFormData.experiment_date,
        start_time: startTime,
        reason: breakReason === '其他' ? otherReason : breakReason
      };
      
      const response = await axios.post('http://localhost:8000/api/break-records/', breakData, {
        headers: { Authorization: `Token ${token}` }
      });
      
      setCurrentBreakId(response.data.id);
      setBreakStartTime(startTime);
      setIsOnBreak(true);
      setShowBreakModal(false);
      
      toast.success('已記錄離開時間');
    } catch (err) {
      console.error('記錄休息開始失敗:', err);
      toast.error('記錄休息開始失敗');
    }
  };

  const handleEndBreak = async () => {
    try {
      const token = localStorage.getItem('token');
      const endTime = new Date().toISOString();
      
      await axios.put(`http://localhost:8000/api/break-records/${currentBreakId}/`, {
        end_time: endTime
      }, {
        headers: { Authorization: `Token ${token}` }
      });
      
      toast.success('休息記錄已保存');
      
      // 重置狀態
      setIsOnBreak(false);
      setBreakStartTime(null);
      setCurrentBreakId(null);
      setBreakReason('');
      setOtherReason('');
    } catch (err) {
      console.error('記錄休息結束失敗:', err);
      toast.error('記錄休息結束失敗');
    }
  };

  const handleCancelBreak = () => {
    setShowBreakModal(false);
    setBreakReason('');
    setOtherReason('');
  };
  
  // 實驗表單狀態
  const [showAddExperimentForm, setShowAddExperimentForm] = useState(false);
  const [experimentFormData, setExperimentFormData] = useState({
    worker_id: '',
    experiment_type: '',
    experiment_date: new Date().toLocaleDateString('en-CA', { 
      timeZone: 'Asia/Taipei'
    }),  // 轉換為 YYYY-MM-DD 格式
    time_period: 1,
    data: {},
    files: {}
  });
  
  // 當前實驗狀態
  const [currentExperiment, setCurrentExperiment] = useState(null);
  const [availablePeriods, setAvailablePeriods] = useState([1, 2, 3, 4, 5]);
  
  // 更新為新的實驗類型
  const experimentTypes = [
    { id: 'reaction_rod', name: '反應棒' },
    { id: 'flicker_test', name: '閃爍計' },
    { id: 'eye_tracking', name: '眼動儀' },
    { id: 'blood_pressure', name: '血壓' }
  ];
  
  // 實驗類型所需數據欄位
  const experimentFields = {
    eye_tracking: [
      { name: 'data_file', label: '眼動儀數據檔案', type: 'file', accept: '.csv,.txt,.json,.xlsx' },
      // { name: 'fixation_count', label: '注視次數', type: 'number' },
      // { name: 'saccade_count', label: '眼球跳動次數', type: 'number' },
      // { name: 'average_pupil_size', label: '平均瞳孔大小 (mm)', type: 'number', step: '0.01' },
      // { name: 'focus_duration', label: '專注時間 (秒)', type: 'number' },
      // { name: 'notes', label: '實驗備註', type: 'textarea' }
    ],
    blood_pressure: [
      { name: 'systolic_pressure', label: '收縮壓 (mmHg)', type: 'number' },
      { name: 'diastolic_pressure', label: '舒張壓 (mmHg)', type: 'number' },
      { name: 'heart_rate', label: '心率 (bpm)', type: 'number' },
      // { name: 'measurement_time', label: '測量時間', type: 'datetime-local' },
      { name: 'notes', label: '實驗備註', type: 'textarea' }
    ]
  };
  
  // 檢查用戶是否已登入且是超級實驗者
  useEffect(() => {
    const checkAuth = () => {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData && userData.role === 'super_experimenter') {
        setUser(userData);
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    let interval;
    if (isOnBreak) {
      interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOnBreak]);
  
  // 載入公司列表
  useEffect(() => {
    if (!user) return;
    
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Token ${token}` };
        
        const response = await axios.get(`http://localhost:8000/api/companies/`, { headers });
        if (Array.isArray(response.data)) {
          setCompanies(response.data);
        } else {
          console.error('公司資料不是陣列:', response.data);
          setCompanies([]);
        }
      } catch (err) {
        console.error('載入公司資料失敗:', err);
        setError('載入公司資料失敗');
      }
    };
    
    fetchCompanies();
  }, [user]);
  
  // 當選擇公司時，載入該公司的勞工
  useEffect(() => {
    if (!selectedCompany) return;
    
    const fetchWorkers = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Token ${token}` };
        
        const response = await axios.get(`http://localhost:8000/api/companies/${selectedCompany}/workers/`, { headers });
        if (Array.isArray(response.data)) {
          setWorkers(response.data);
          setSelectedWorker(null); // 重置選擇的勞工
        } else {
          console.error('勞工資料不是陣列:', response.data);
          setWorkers([]);
        }
      } catch (err) {
        console.error('載入勞工資料失敗:', err);
        setError('載入勞工資料失敗');
      }
    };
    
    fetchWorkers();
  }, [selectedCompany]);
  
  // 當選擇勞工時，載入該勞工的實驗記錄
  useEffect(() => {
    if (!selectedWorker) return;
    
    const fetchExperiments = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Token ${token}` };
        
        const response = await axios.get(`http://localhost:8000/api/workers/${selectedWorker}/experiments/`, { headers });
        if (Array.isArray(response.data)) {
          setExperiments(response.data);
        } else {
          console.error('實驗資料不是陣列:', response.data);
          setExperiments([]);
        }
      } catch (err) {
        console.error('載入實驗資料失敗:', err);
        setError('載入實驗資料失敗');
      }
    };
    
    fetchExperiments();
  }, [selectedWorker]);
  
  // 檢查今日實驗記錄
  const checkTodayExperiment = async (workerId, experimentType, date) => {

    console.log('=== checkTodayExperiment 調試 ===');
    console.log('勞工ID:', workerId);
    console.log('實驗類型:', experimentType);
    console.log('檢查日期:', date);
    console.log('日期類型:', typeof date);
    console.log('================================');

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Token ${token}` };
      
      // 查找指定日期的實驗記錄
      const response = await axios.get(`http://localhost:8000/api/workers/${workerId}/experiments/`, { headers });
      
      if (Array.isArray(response.data)) {
        const todayExperiment = response.data.find(exp => {
          const expDate = new Date(exp.experiment_time).toISOString().substring(0, 10);
          return expDate === date && exp.experiment_type === experimentType;
        });
        
        if (todayExperiment) {
          setCurrentExperiment(todayExperiment);
          // 計算已填寫的時段
          const filledPeriods = [];
          for (let period = 1; period <= 5; period++) {
            const hasData = [1, 2, 3, 4, 5].some(trial => 
              todayExperiment.data && todayExperiment.data[`period_${period}_trial_${trial}`]
            );
            if (hasData) {
              filledPeriods.push(period);
            }
          }
          
          // 更新可用時段
          const remaining = [1, 2, 3, 4, 5].filter(p => !filledPeriods.includes(p));
          setAvailablePeriods(remaining);

          // 設定時段為第一個可用時段
          if (remaining.length > 0) {
            setExperimentFormData(prev => ({
              ...prev,
              time_period: remaining[0]
            }));
          } else {
            // 如果所有時段都已完成，設定為最後一個時段
            setExperimentFormData(prev => ({
              ...prev,
              time_period: 5
            }));
          }
          
          return todayExperiment;
        }
      }
      
      // 沒有找到今日實驗，重置狀態
      setCurrentExperiment(null);
      setAvailablePeriods([1, 2, 3, 4, 5]);
      setExperimentFormData(prev => ({
        ...prev,
        time_period: 1
      }));
      return null;
      
    } catch (err) {
      console.error('檢查今日實驗失敗:', err);
      return null;
    }
  };
  
  // 處理勞工或實驗類型變更
  const handleWorkerOrTypeChange = async (workerId, experimentType, date) => {
    if (workerId && experimentType && ['reaction_rod', 'flicker_test'].includes(experimentType)) {
      await checkTodayExperiment(workerId, experimentType, date);
      // checkTodayExperiment 函數內部已經處理了 time_period 的設定，這裡不需要重複設定
    } else {
      setCurrentExperiment(null);
      setAvailablePeriods([1, 2, 3, 4, 5]);
      
      // 重置時段為1
      setExperimentFormData(prev => ({
        ...prev,
        time_period: 1
      }));
    }
  };
  
  // 處理公司選擇變更
  const handleCompanyChange = (e) => {
    setSelectedCompany(e.target.value);
  };
  
  // 處理勞工選擇變更
  const handleWorkerChange = async (e) => {
    const workerId = e.target.value;
    setSelectedWorker(workerId);
    
    // 清除當前實驗狀態
    setCurrentExperiment(null);
    setAvailablePeriods([1, 2, 3, 4, 5]);
    
    setExperimentFormData(prev => ({
      ...prev,
      worker_id: workerId,
      // 移除強制重置 time_period，讓系統自動檢測正確時段
      data: {},        // 清空表單數據
      files: {}        // 清空檔案數據
    }));
    
    // 當選擇勞工時，立即載入該勞工的實驗記錄
    if (workerId) {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Token ${token}` };
        
        const response = await axios.get(`http://localhost:8000/api/workers/${workerId}/experiments/`, { headers });
        if (Array.isArray(response.data)) {
          setExperiments(response.data);
        } else {
          console.error('實驗資料不是陣列:', response.data);
          setExperiments([]);
        }
        
        // 如果當前已經選擇了實驗類型，重新檢查新勞工的實驗記錄
        if (experimentFormData.experiment_type) {
          await handleWorkerOrTypeChange(workerId, experimentFormData.experiment_type, experimentFormData.experiment_date);
        }
        
      } catch (err) {
        console.error('載入實驗資料失敗:', err);
        setExperiments([]);
        setError('載入實驗資料失敗');
      }
    } else {
      // 如果沒有選擇勞工，清空實驗記錄
      setExperiments([]);
    }
  };
  
  // 處理單個時段的輸入變更
  const handlePeriodInputChange = (trial, value) => {
    const period = experimentFormData.time_period;
    const fieldName = `period_${period}_trial_${trial}`;
    setExperimentFormData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [fieldName]: value
      }
    }));
  };
  
  // 處理眼動儀數據分析
  const handleEyeTrackingAnalysis = async () => {
    if (!experimentFormData.files.data_file) {
      toast.error('請先上傳眼動儀數據檔案', {
        position: "top-right",
        autoClose: 2000,
        theme: "light"
      });
      return;
    }

    try {
      toast.info('正在分析眼動儀數據...', {
        position: "top-right",
        autoClose: 2000,
        theme: "light"
      });

      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('data_file', experimentFormData.files.data_file);
      formData.append('worker_id', experimentFormData.worker_id);
      formData.append('experiment_date', experimentFormData.experiment_date);

      // 調用後端分析 API
      const response = await axios.post('http://localhost:8000/api/analyze-eye-tracking/', formData, {
        headers: { 
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('眼動儀數據分析完成！', {
          position: "top-right",
          autoClose: 3000,
          theme: "light"
        });
        
        // 可以在這裡更新分析結果或觸發下載
        if (response.data.download_url) {
          // 使用帶認證的方式下載檔案
          const token = localStorage.getItem('token');
          
          // 創建帶認證的下載請求
          fetch(`http://localhost:8000${response.data.download_url}`, {
            method: 'GET',
            headers: {
              'Authorization': `Token ${token}`
            }
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('下載失敗');
            }
            return response.blob();
          })
          .then(blob => {
            // 創建下載連結
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `eyetracking_analysis_${experimentFormData.experiment_date}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          })
          .catch(error => {
            console.error('下載錯誤:', error);
            toast.error('下載分析結果失敗', {
              position: "top-right",
              autoClose: 3000,
              theme: "light"
            });
          });
        }
      }
    } catch (err) {
      console.error('眼動儀數據分析失敗:', err);
      toast.error('眼動儀數據分析失敗', {
        position: "top-right",
        autoClose: 3000,
        theme: "light"
      });
    }
  };
  
  // 處理實驗表單輸入變更
  const handleInputChange = async (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setExperimentFormData(prev => ({
        ...prev,
        files: {
          ...prev.files,
          [name]: files[0]
        }
      }));
    } else if (name === 'experiment_type') {
      setExperimentFormData(prev => ({
        ...prev,
        [name]: value,
        data: {},
        files: {}
      }));
      
      console.log('=== 選擇實驗類型調試 ===');
      console.log('選擇的實驗類型:', value);
      console.log('當前勞工ID:', experimentFormData.worker_id);
      console.log('當前實驗日期:', experimentFormData.experiment_date);
      console.log('日期類型:', typeof experimentFormData.experiment_date);
      console.log('========================');

      // 檢查今日實驗
      if (experimentFormData.worker_id && value) {
        await handleWorkerOrTypeChange(experimentFormData.worker_id, value, experimentFormData.experiment_date);
      }
    } else if (name === 'worker_id') {
      setExperimentFormData(prev => ({
        ...prev,
        [name]: value,
        data: {}
      }));
      
      // 檢查今日實驗
      if (value && experimentFormData.experiment_type) {
        await handleWorkerOrTypeChange(value, experimentFormData.experiment_type, experimentFormData.experiment_date);
      }
    } else if (name === 'experiment_date') {
      setExperimentFormData(prev => ({
        ...prev,
        [name]: value,
        data: {}
      }));
      
      // 檢查指定日期的實驗
      if (experimentFormData.worker_id && experimentFormData.experiment_type) {
        await handleWorkerOrTypeChange(experimentFormData.worker_id, experimentFormData.experiment_type, value);
      }
    } else if (name === 'time_period') {
      setExperimentFormData(prev => ({
        ...prev,
        [name]: parseInt(value),
        data: {} // 清空當前數據，準備填寫新時段
      }));
    } else {
      setExperimentFormData(prev => ({
        ...prev,
        data: {
          ...prev.data,
          [name]: value
        }
      }));
    }
  };
  
  // 提交實驗表單
  const handleSubmitExperiment = async (e) => {
    e.preventDefault();
    
    if (!experimentFormData.worker_id) {
      setError('請選擇勞工');
      return;
    }
    
    if (!experimentFormData.experiment_type) {
      setError('請選擇實驗類型');
      return;
    }
    
    try {

      setIsSubmitting(true);
      setCooldownTime(3); // 開始倒數
      
      // 開始倒數計時
      const countdown = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            setIsSubmitting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const token = localStorage.getItem('token');
      
      if (currentExperiment) {
        // 更新現有實驗記錄
        const updatedData = { ...currentExperiment.data, ...experimentFormData.data };
        
        const response = await axios.put(`http://localhost:8000/api/experiments/${currentExperiment.id}/`, {          data: updatedData
        }, {
          headers: { Authorization: `Token ${token}` }
        });
        
        // 更新本地實驗列表
        setExperiments(prev => prev.map(exp => 
          exp.id === currentExperiment.id ? response.data : exp
        ));

        toast.success("實驗記錄保存完成！", {
          position: "top-right",
          autoClose: 2000,
          theme: "light"
        });

        setSuccess(`第${experimentFormData.time_period}時段數據已更新！`);
        
      } else {
        // 創建新實驗記錄
        const experimentTime = `${experimentFormData.experiment_date}T${new Date().toTimeString().substring(0, 8)}`;
        
        // 如果有檔案需要上傳，使用 FormData
        const hasFiles = Object.keys(experimentFormData.files).length > 0;
        
        if (hasFiles) {
          const formData = new FormData();
          formData.append('worker', experimentFormData.worker_id);
          formData.append('experimenter', user.id);
          formData.append('experiment_time', experimentTime);
          formData.append('experiment_type', experimentFormData.experiment_type);
          formData.append('data', JSON.stringify(experimentFormData.data));
          
          // 添加檔案
          Object.entries(experimentFormData.files).forEach(([key, file]) => {
            if (file) {
              formData.append(`file_${key}`, file);
            }
          });
          
          const response = await axios.post('/api/experiments/', formData, {
            headers: { 
              Authorization: `Token ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
          
          setExperiments(prev => [...prev, response.data]);
          setCurrentExperiment(response.data);
        } else {
          // 沒有檔案，使用 JSON
          const response = await axios.post('/api/experiments/', {
            worker: experimentFormData.worker_id,
            experimenter: user.id,
            experiment_time: experimentTime,
            experiment_type: experimentFormData.experiment_type,
            data: experimentFormData.data
          }, {
            headers: { Authorization: `Token ${token}` }
          });

          // 更新載入通知為成功通知
          toast.success("實驗紀錄保存完成！", {
            position: "top-right",
            autoClose: 3000,           
          });
          
          setExperiments(prev => [...prev, response.data]);
          setCurrentExperiment(response.data);
        }
        setSuccess(`新實驗記錄已創建，第${experimentFormData.time_period}時段數據已保存！`); 
      }
      
      // 重新檢查可用時段
      await handleWorkerOrTypeChange(
        experimentFormData.worker_id, 
        experimentFormData.experiment_type, 
        experimentFormData.experiment_date
      );
      
      // 重置當前時段的數據
      setExperimentFormData(prev => ({
        ...prev,
        data: {}
      }));
      
      // 3秒後清除成功訊息
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      //console.error('保存實驗記錄失敗', err);
      toast.error("實驗記錄保存失敗", {
        position: "top-right",
        autoClose: 2000,
        theme: "light"
      });
      setError(err.response?.data?.message || '保存實驗記錄失敗');
    }
  };
  
  // 處理查看實驗詳情
  const handleViewExperiment = (experiment) => {
    setSelectedExperiment(experiment);
    setShowExperimentDetail(true);
  };
  
  // 關閉實驗詳情模態框
  const handleCloseExperimentDetail = () => {
    setShowExperimentDetail(false);
    setSelectedExperiment(null);
  };
  
  // 渲染單個時段輸入（反應棒和閃爍劑）
  const renderSinglePeriodInput = () => {
    if (!['reaction_rod', 'flicker_test'].includes(experimentFormData.experiment_type)) {
      return null;
    }
    
    const unit = experimentFormData.experiment_type === 'reaction_rod' ? 'ms' : 'Hz';
    const step = experimentFormData.experiment_type === 'reaction_rod' ? '1' : '0.1';
    const trials = [1, 2, 3, 4, 5];
    
    return (
      <div className="single-period-input-container">
        <h3>第{experimentFormData.time_period}時段數據</h3>
        
        {/* 時段選擇 */}
        <div className="form-group">
          <label htmlFor="time_period">選擇時段</label>
          <select
            id="time_period"
            name="time_period"
            value={experimentFormData.time_period}
            onChange={handleInputChange}
            required
          >
            {availablePeriods.map(period => (
              <option key={period} value={period}>
                第{period}時段
              </option>
            ))}
          </select>
          {availablePeriods.length < 5 && (
            <small className="text-info">
              已完成時段：{[1,2,3,4,5].filter(p => !availablePeriods.includes(p)).join(', ')}
            </small>
          )}
        </div>
        
        {/* 單個時段的 5 次測量 */}
        <div className="single-period-trials">
          <table className="single-period-table">
            <thead>
              <tr>
                <th>{experimentFormData.experiment_type === 'reaction_rod' ? '反應棒' : '閃爍劑'}</th>
                <th>第{experimentFormData.time_period}時段</th>
              </tr>
            </thead>
            <tbody>
              {trials.map(trial => (
                <tr key={trial}>
                  <td className="trial-label">第{trial}次</td>
                  <td>
                    <input
                      type="number"
                      step={step}
                      placeholder={unit}
                      value={experimentFormData.data[`period_${experimentFormData.time_period}_trial_${trial}`] || ''}
                      onChange={(e) => handlePeriodInputChange(trial, e.target.value)}
                      className="period-input"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 實驗備註 */}
        <div className="form-group">
          <label htmlFor="notes">實驗備註</label>
          <textarea
            id="notes"
            name="notes"
            value={experimentFormData.data.notes || ''}
            onChange={handleInputChange}
            rows={3}
            placeholder="請輸入實驗相關備註..."
          />
        </div>
      </div>
    );
  };
  
  // 渲染實驗數據欄位（眼動儀和血壓）
  const renderExperimentFields = () => {
    if (!experimentFormData.experiment_type || 
        ['reaction_rod', 'flicker_test'].includes(experimentFormData.experiment_type)) {
      return null;
    }
    
    const fields = experimentFields[experimentFormData.experiment_type] || [];
    
    return (
      <div className="experiment-data-fields">
        <h3>實驗數據</h3>
        {fields.map((field, index) => (
          <div key={index} className="form-group">
            <label htmlFor={field.name}>{field.label}</label>
            
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={experimentFormData.data[field.name] || ''}
                onChange={handleInputChange}
                rows={3}
              />
            ) : field.type === 'file' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="file"
                  id={field.name}
                  name={field.name}
                  onChange={handleInputChange}
                  accept={field.accept}
                />
                {/* 眼動儀專用分析按鈕 */}
                {experimentFormData.experiment_type === 'eye_tracking' && field.name === 'data_file' && (
                  <button
                    type="button"
                    className="analysis-button"
                    onClick={handleEyeTrackingAnalysis}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    分析數據
                  </button>
                )}
              </div>
            ) : (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={experimentFormData.data[field.name] || ''}
                onChange={handleInputChange}
                step={field.step}
              />
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // 處理登出
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  
  // 如果正在載入，顯示載入中
  if (loading) {
    return <div className="loading">載入中...</div>;
  }
  
  // 如果未登入或不是超級實驗者，重定向到登入頁面
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="super-experimenter-dashboard">
      <header className="dashboard-header">
        <h1>超級實驗者儀表板</h1>
        <div className="user-info">
          <span>您好，{user.username}</span>
          <button className="logout-btn" onClick={handleLogout}>登出</button>
        </div>
      </header>
      
      <main className="dashboard-content">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="company-selection">
          <h2>選擇公司</h2>
          <select
            value={selectedCompany || ''}
            onChange={handleCompanyChange}
          >
            <option value="">-- 請選擇公司 --</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.name} ({company.code})
              </option>
            ))}
          </select>
        </div>
        
        {selectedCompany && (
          <div className="worker-selection">
            <h2>選擇勞工</h2>
            <select
              value={selectedWorker || ''}
              onChange={handleWorkerChange}
            >
              <option value="">-- 請選擇勞工 --</option>
              {workers.map(worker => (
                <option key={worker.id} value={worker.id}>
                  {worker.name} ({worker.code})
                </option>
              ))}
            </select>
          </div>
        )}
        
        {selectedWorker && (
          <>
            <div className="section-header">
              <h2>實驗記錄</h2>
              <button 
                className="add-button"
                onClick={() => setShowAddExperimentForm(!showAddExperimentForm)}
              >
                {showAddExperimentForm ? '取消' : '新增實驗記錄'}
              </button>
            </div>

            {selectedWorker &&(
                  <div className="break-control-section mb-4">
                    <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">實驗進行控制</h4>
                        <p className="text-sm text-gray-600">記錄勞工離開和回來的時間</p>
                      </div>
                      {!isOnBreak ? (
                        <button
                          type="button"
                          onClick={handleStartBreak}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          🚶‍♂️ 休息
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleEndBreak}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors animate-pulse"
                        >
                          ✅ 回來了
                        </button>
                      )}
                    </div>
                  </div>
                )}

            
            {/* 新增實驗表單 */}
            {showAddExperimentForm && (
              <form onSubmit={handleSubmitExperiment} className="add-form experiment-form">
                <div className="form-group">
                  <label htmlFor="experiment_type">實驗類型</label>
                  <select
                    id="experiment_type"
                    name="experiment_type"
                    value={experimentFormData.experiment_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- 請選擇實驗類型 --</option>
                    {experimentTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="experiment_date">實驗日期</label>
                  <input
                    type="date"
                    id="experiment_date"
                    name="experiment_date"
                    value={experimentFormData.experiment_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                {/* 當前實驗狀態顯示 */}
                {currentExperiment && (
                  <div className="current-experiment-status">
                    <h4>📋 實驗進度</h4>
                    <p>已找到此日期的實驗記錄，您可以繼續填寫剩餘時段。</p>
                    {availablePeriods.length === 0 ? (
                      <p className="completed">✅ 所有時段已完成！</p>
                    ) : (
                      <p>剩餘時段：{availablePeriods.join(', ')}</p>
                    )}
                  </div>
                )}
                
                {/* 根據實驗類型渲染不同的輸入方式 */}
                {renderSinglePeriodInput()}
                {renderExperimentFields()}
                
                {availablePeriods.length > 0 && (
                  <button type="submit" disabled={isSubmitting} className="submit-button">
                    {/* {currentExperiment ? '更新時段數據' : '保存實驗記錄'} */}
                    {isSubmitting ? `請等待 ${cooldownTime} 秒` : '保存實驗記錄'}
                  </button>
                )}
              </form>
            )}
            
            {/* 實驗記錄列表 */}
            <div className="experiments-list">
              {experiments.length === 0 ? (
                <p>此勞工目前沒有實驗記錄</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>實驗類型</th>
                      <th>實驗時間</th>
                      <th>完成度</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {experiments.map(experiment => {
                      // 計算完成度
                      let completionRate = '100%';
                      if (['reaction_rod', 'flicker_test'].includes(experiment.experiment_type)) {
                        const filledPeriods = [];
                        for (let period = 1; period <= 5; period++) {
                          const hasData = [1, 2, 3, 4, 5].some(trial => 
                            experiment.data && experiment.data[`period_${period}_trial_${trial}`]
                          );
                          if (hasData) filledPeriods.push(period);
                        }
                        completionRate = `${filledPeriods.length}/5 時段`;
                      }
                      
                      return (
                        <tr key={experiment.id}>
                          <td>
                            {experimentTypes.find(t => t.id === experiment.experiment_type)?.name || 
                            experiment.experiment_type}
                          </td>
                          <td>{new Date(experiment.experiment_time).toLocaleString()}</td>
                          <td>{completionRate}</td>
                          <td>
                            <button 
                              className="action-button view"
                              onClick={() => handleViewExperiment(experiment)}
                            >
                              查看詳情
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
      
      {/* 實驗詳情模態框 */}
      {showExperimentDetail && selectedExperiment && (
        <ExperimentDetail
          experiment={selectedExperiment}
          experimentTypes={experimentTypes}
          onClose={handleCloseExperimentDetail}
        />
      )}

      {/* 休息原因選擇模態框 */}
        {showBreakModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">請選擇離開原因</h3>
              <div className="space-y-3">
                {BREAK_REASONS.map((reason) => (
                  <label key={reason} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="breakReason"
                      value={reason}
                      checked={breakReason === reason}
                      onChange={(e) => setBreakReason(e.target.value)}
                      className="text-blue-600"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
              
              {breakReason === '其他' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    請說明：
                  </label>
                  <input
                    type="text"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="請輸入其他原因"
                  />
                </div>
              )}
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleCancelBreak}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmBreak}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  確認離開
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 休息中的覆蓋層 */}
        {isOnBreak && (
          <div className="fixed inset-0 bg-yellow-100 bg-opacity-95 flex items-center justify-center z-40">
            <div className="text-center">
              <div className="text-6xl mb-4">☕</div>
              <h2 className="text-4xl font-bold text-gray-800 mb-2">休息中...</h2>
              <p className="text-xl text-gray-600 mb-4">
                離開原因: {breakReason === '其他' ? otherReason : breakReason}
              </p>
              <p className="text-lg text-gray-500 mb-2">
                離開時間: {breakStartTime ? new Date(breakStartTime).toLocaleTimeString() : ''}
              </p>
              <p className="text-lg text-gray-500 mb-4">
                目前時間: {new Date().toLocaleTimeString()}
              </p>
              <button
                onClick={handleEndBreak}
                className="mt-8 px-8 py-4 bg-blue-500 text-white text-xl rounded-lg hover:bg-blue-600 transition-colors"
              >
                回來了
              </button>
            </div>
          </div>
        )}
      
      <footer className="dashboard-footer">
        <p>&copy; 2025 勞工健康數據平台</p>
      </footer>
    </div>
  );
};

export default SuperExperimenterDashboard;



