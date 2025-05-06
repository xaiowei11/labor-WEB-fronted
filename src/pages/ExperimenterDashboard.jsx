// src/pages/ExperimenterDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import ExperimentDetail from '../components/experimenter/ExperimentDetail';
import '../styles/ExperimenterDashboard.css';

const ExperimenterDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [showExperimentDetail, setShowExperimentDetail] = useState(false);
  
  // 新增實驗表單狀態
  const [showAddExperimentForm, setShowAddExperimentForm] = useState(false);
  const [experimentFormData, setExperimentFormData] = useState({
    worker_id: '',
    experiment_type: '',
    experiment_time: new Date().toISOString().substring(0, 16), // 格式: YYYY-MM-DDTHH:MM
    data: {}
  });
  
  // 預設實驗類型
  const experimentTypes = [
    { id: 'eye_tracking', name: '眼動儀實驗' },
    { id: 'heart_rate', name: '心率監測' },
    { id: 'brain_activity', name: '腦波活動' },
    { id: 'skin_conductance', name: '皮膚電導反應' }
  ];
  
  // 實驗類型所需數據欄位
  const experimentFields = {
    eye_tracking: [
      { name: 'fixation_count', label: '注視次數', type: 'number' },
      { name: 'saccade_count', label: '眼球跳動次數', type: 'number' },
      { name: 'average_pupil_size', label: '平均瞳孔大小 (mm)', type: 'number', step: '0.01' },
      { name: 'focus_duration', label: '專注時間 (秒)', type: 'number' },
      { name: 'notes', label: '實驗備註', type: 'textarea' }
    ],
    heart_rate: [
      { name: 'average_rate', label: '平均心率 (bpm)', type: 'number' },
      { name: 'max_rate', label: '最高心率 (bpm)', type: 'number' },
      { name: 'min_rate', label: '最低心率 (bpm)', type: 'number' },
      { name: 'variability', label: '心率變異性', type: 'number', step: '0.01' },
      { name: 'notes', label: '實驗備註', type: 'textarea' }
    ],
    brain_activity: [
      { name: 'alpha_waves', label: 'α波強度', type: 'number', step: '0.01' },
      { name: 'beta_waves', label: 'β波強度', type: 'number', step: '0.01' },
      { name: 'theta_waves', label: 'θ波強度', type: 'number', step: '0.01' },
      { name: 'delta_waves', label: 'δ波強度', type: 'number', step: '0.01' },
      { name: 'notes', label: '實驗備註', type: 'textarea' }
    ],
    skin_conductance: [
      { name: 'base_level', label: '基礎水平 (μS)', type: 'number', step: '0.01' },
      { name: 'response_amplitude', label: '反應振幅 (μS)', type: 'number', step: '0.01' },
      { name: 'response_count', label: '反應次數', type: 'number' },
      { name: 'recovery_time', label: '恢復時間 (秒)', type: 'number' },
      { name: 'notes', label: '實驗備註', type: 'textarea' }
    ]
  };
  
  // 檢查用戶是否已登入且是實驗者
  useEffect(() => {
    const checkAuth = () => {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData && userData.role === 'experimenter') {
        setUser(userData);
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // 載入勞工和實驗資料
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Token ${token}` };
        
        // 載入勞工資料
        try {
          const workersResponse = await axios.get(`http://localhost:8000/api/companies/${user.company}/workers/`, { headers });
          if (Array.isArray(workersResponse.data)) {
            setWorkers(workersResponse.data);
          } else {
            console.error('勞工資料不是陣列:', workersResponse.data);
            setWorkers([]);
          }
        } catch (err) {
          console.error('載入勞工資料失敗:', err);
          setWorkers([]);
        }
        
        // 載入實驗記錄
        try {
          const experimentsResponse = await axios.get(`http://localhost:8000/api/experimenter/experiments/`, { headers });
          if (Array.isArray(experimentsResponse.data)) {
            setExperiments(experimentsResponse.data);
          } else {
            console.error('實驗資料不是陣列:', experimentsResponse.data);
            setExperiments([]);
          }
        } catch (err) {
          console.error('載入實驗資料失敗:', err);
          setExperiments([]);
        }
        
      } catch (err) {
        console.error('無法載入資料', err);
        setError('無法載入資料，請重新整理頁面');
      }
    };
    
    fetchData();
  }, [user]);
  
  // 處理實驗表單輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'experiment_type') {
      // 當實驗類型改變時，重置數據欄位
      setExperimentFormData(prev => ({
        ...prev,
        [name]: value,
        data: {}
      }));
    } else if (name === 'worker_id' || name === 'experiment_time') {
      // 處理基本欄位
      setExperimentFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      // 處理數據欄位
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
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/experiments/', {
        worker: experimentFormData.worker_id,
        experimenter: user.id,
        experiment_time: experimentFormData.experiment_time,
        experiment_type: experimentFormData.experiment_type,
        data: experimentFormData.data
      }, {
        headers: { Authorization: `Token ${token}` }
      });
      
      // 新增成功，更新實驗列表
      setExperiments(prev => [...prev, response.data]);
      
      // 顯示成功訊息
      setSuccess('實驗記錄已成功保存');
      
      // 重置表單
      setExperimentFormData({
        worker_id: '',
        experiment_type: '',
        experiment_time: new Date().toISOString().substring(0, 16),
        data: {}
      });
      
      // 隱藏表單
      setShowAddExperimentForm(false);
      
      // 3秒後清除成功訊息
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      console.error('保存實驗記錄失敗', err);
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
  
  // 如果正在載入，顯示載入中
  if (loading) {
    return <div className="loading">載入中...</div>;
  }
  
  // 如果未登入或不是實驗者，重定向到登入頁面
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // 根據選擇的實驗類型渲染表單欄位
  const renderExperimentFields = () => {
    if (!experimentFormData.experiment_type) return null;
    
    const fields = experimentFields[experimentFormData.experiment_type] || [];
    
    return fields.map((field, index) => (
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
    ));
  };
  
  const handleLogout = () => {
    // 實際環境中應使用 api.auth.logout()
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="experimenter-dashboard">
      <header className="dashboard-header">
        <h1>實驗者儀表板</h1>
        <div className="user-info">
          <span>您好，{user.username}</span>
          <button className="logout-btn" onClick={handleLogout}>登出</button>
        </div>
      </header>
      
      <main className="dashboard-content">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="section-header">
          <h2>實驗記錄</h2>
          <button 
            className="add-button"
            onClick={() => setShowAddExperimentForm(!showAddExperimentForm)}
          >
            {showAddExperimentForm ? '取消' : '新增實驗記錄'}
          </button>
        </div>
        
        {/* 新增實驗表單 */}
        {showAddExperimentForm && (
          <form onSubmit={handleSubmitExperiment} className="add-form experiment-form">
            <div className="form-group">
              <label htmlFor="worker_id">選擇勞工</label>
              <select
                id="worker_id"
                name="worker_id"
                value={experimentFormData.worker_id}
                onChange={handleInputChange}
                required
              >
                <option value="">-- 請選擇勞工 --</option>
                {Array.isArray(workers) && workers.map(worker => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} ({worker.code})
                  </option>
                ))}
              </select>
            </div>
            
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
              <label htmlFor="experiment_time">實驗時間</label>
              <input
                type="datetime-local"
                id="experiment_time"
                name="experiment_time"
                value={experimentFormData.experiment_time}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* 根據實驗類型動態渲染表單欄位 */}
            {experimentFormData.experiment_type && (
              <div className="experiment-data-fields">
                <h3>實驗數據</h3>
                {renderExperimentFields()}
              </div>
            )}
            
            <button type="submit" className="submit-button">保存實驗記錄</button>
          </form>
        )}
        
        {/* 實驗記錄列表 */}
        <div className="experiments-list">
          {experiments.length === 0 ? (
            <p>目前沒有實驗記錄</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>勞工</th>
                  <th>實驗類型</th>
                  <th>實驗時間</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(experiments) && experiments.map(experiment => (
                  <tr key={experiment.id}>
                    <td>{experiment.worker_name}</td>
                    <td>
                      {experimentTypes.find(t => t.id === experiment.experiment_type)?.name || 
                       experiment.experiment_type}
                    </td>
                    <td>{new Date(experiment.experiment_time).toLocaleString()}</td>
                    <td>
                      <button 
                        className="action-button view"
                        onClick={() => handleViewExperiment(experiment)}
                      >
                        查看詳情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
      
      {/* 實驗詳情模態框 */}
      {showExperimentDetail && selectedExperiment && (
        <ExperimentDetail
          experiment={selectedExperiment}
          experimentTypes={experimentTypes}
          onClose={handleCloseExperimentDetail}
        />
      )}
      
      <footer className="dashboard-footer">
        <p>&copy; 2025 勞工健康數據平台</p>
      </footer>
    </div>
  );
};

export default ExperimenterDashboard;