import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api'; // 確保路徑正確

const CompanyDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('workers');
  const [workers, setWorkers] = useState([]); 
  const [forms, setForms] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [formSubmissions, setFormSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState(null);

  // 新增勞工表單狀態
  const [showAddWorkerForm, setShowAddWorkerForm] = useState(false);
  const [workerFormData, setWorkerFormData] = useState({
    name: '',
    code: ''
  });
  
  // 新增使用者表單狀態
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [userFormData, setUserFormData] = useState({
    username: '',
    login_code: '',
    password: '',
    confirm_password: '',
    role: 'admin'
  });

  // Toast 通知配置
  const TOAST_CONFIG = {
  SUCCESS: {
    position: "top-center",
    autoClose: 2000,
    theme: "light"
  },
  ERROR: {
    position: "top-center", 
    autoClose: 2000,
    theme: "light"
  },
  WARNING: {
    position: "top-center",
    autoClose: 3000,
    theme: "light"
  }
};
  
  // 檢查用戶是否已登入且是公司管理員或老闆
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData && userData.id && (userData.role === 'owner' || userData.role === 'admin')) {
          setUser(userData);
        }
        setLoading(false);
      } catch (err) {
        console.error('解析用戶資料錯誤', err);
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      // 直接使用这个公司代码
      setCompanyCode(user.company_code || '1111'); // 暂时使用硬编码的公司代码
      
      // 或者，尝试使用getAll方法获取所有公司，然后找到当前公司
      api.companies.getAll()
        .then(response => {
          if (Array.isArray(response.data)) {
            const currentCompany = response.data.find(c => c.id === user.company);
            if (currentCompany) {
              setCompanyCode(currentCompany.code);
              setCompanyName(currentCompany.name);
              console.log('設置公司資訊:', currentCompany.code, currentCompany.name);
            }
          }
        })
        .catch(err => {
          console.error('無法載入公司列表:', err);
        });
    }
  }, [user]);
  
  // 載入勞工、表單和使用者資料
  useEffect(() => {
    if (!user || !user.company) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 載入勞工資料
        try {
          const workersResponse = await api.workers.getAll(user.company);
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
        
        // 載入表單類型資料
        try {
          const formsResponse = await api.forms.getTypes();
          if (Array.isArray(formsResponse.data)) {
            setForms(formsResponse.data);
          } else {
            console.error('表單資料不是陣列:', formsResponse.data);
            setForms([]);
          }
        } catch (err) {
          console.error('載入表單資料失敗:', err);
          setForms([]);
        }
        
        // 載入公司使用者資料
        try {
          const usersResponse = await api.users.getCompanyUsers(user.company);
          if (Array.isArray(usersResponse.data)) {
            setUsers(usersResponse.data);
          } else {
            console.error('用戶資料不是陣列:', usersResponse.data);
            setUsers([]);
          }
        } catch (err) {
          console.error('載入用戶資料失敗:', err);
          setUsers([]);
        }
        
      } catch (err) {
        console.error('無法載入資料', err);
        setError('無法載入資料，請重新整理頁面');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // 處理勞工表單輸入變更
  const handleWorkerInputChange = (e) => {
    const { name, value } = e.target;
    setWorkerFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 刪除勞工
  // 簡化的刪除勞工函數 - 替換 CompanyDashboard.jsx 中的 handleDeleteWorker

const handleDeleteWorker = async (workerId, workerName) => {
  try {
    // 第一次確認：一般刪除
    if (!window.confirm(`確定要刪除勞工 "${workerName}" 嗎？`)) {
      return;
    }
    
    await api.workers.delete(workerId);
    
    // 刪除成功，更新本地勞工列表
    setWorkers(prev => prev.filter(worker => worker.id !== workerId));
    toast.success('刪除勞工成功', TOAST_CONFIG.SUCCESS);
    
  } catch (err) {
    console.error('刪除勞工失敗', err);
    
    // 如果是因為有相關資料而無法刪除（400錯誤）
    if (err.response && err.response.status === 400) {
      // 第二次確認：強制刪除
      const confirmForceDelete = window.confirm(
        `勞工 "${workerName}" 有相關資料記錄。\n\n確定要刪除該勞工及其所有相關資料嗎？\n\n注意：此操作無法復原！`
      );
      
      if (confirmForceDelete) {
        try {
          // 使用強制刪除
          await api.workers.forceDelete(workerId);
          
          // 刪除成功，更新本地勞工列表
          setWorkers(prev => prev.filter(worker => worker.id !== workerId));
          toast.success(`勞工 "${workerName}" 及其所有相關資料已刪除`, TOAST_CONFIG.SUCCESS);
          
        } catch (forceErr) {
          console.error('強制刪除失敗', forceErr);
          toast.error('刪除失敗，請稍後再試', TOAST_CONFIG.ERROR);
        }
      }
    } else {
      // 其他錯誤
      toast.error('刪除勞工失敗', TOAST_CONFIG.ERROR);
    }
  }
};
  
  // 處理使用者表單輸入變更
  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showSubmissionDetails = (submission) => {
    setActiveSubmission(submission);
    setShowFormModal(true);
  };

  const getStageNameById = (stageId) => {
    const stages = [
      '第一時段',
      '中午表單',
      '下午表單',
      '下班表單',
      '晚上表單'
    ];
    
    return stages[stageId] || `階段 ${stageId}`;
  };
  
  // 新增勞工
  const handleAddWorker = async (e) => {
    e.preventDefault();
    
    try {
      // 準備勞工資料
      const workerData = {
        ...workerFormData,
        company: user.company
      };
      
      // 新增勞工
      const response = await api.workers.create(workerData);
      
      // 新增成功，更新勞工列表
      setWorkers(prev => [...prev, response.data]);

      toast.success('新增勞工成功', TOAST_CONFIG.SUCCESS);
      
      // 重置表單
      setWorkerFormData({
        name: '',
        code: ''
      });
      
      // 隱藏表單
      setShowAddWorkerForm(false);
      
    } catch (err) {
      console.error('新增勞工失敗', err);
      //setError(err.response?.data?.message || '新增勞工失敗');

      toast.error('新增勞工失敗，請檢查代碼是否重複', TOAST_CONFIG.ERROR);
    }
  };
  
  // 新增使用者
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // 檢查密碼是否一致
    if (userFormData.password !== userFormData.confirm_password) {
      //setError('兩次輸入的密碼不一致');
      toast.error('兩次輸入密碼不一致', TOAST_CONFIG.ERROR);
      return;
    }
    else if (userFormData.password.length < 8) {
      //setError('密碼長度至少為8個字符');
      toast.error('密碼長度至少為8位', TOAST_CONFIG.ERROR);
      return;
    }
    
    try {
      // 準備使用者資料
      const userData = {
        username: userFormData.username,
        login_code: userFormData.login_code,
        password: userFormData.password,
        role: userFormData.role,
        company: user.company
      };

      // 新增使用者
      console.log('準備發送的用戶數據:', userData);
      console.log('發送的完整數據:', JSON.stringify(userData));
      const response = await api.users.create(userData);
      console.log('API 響應:', response);
      
      // 新增成功，更新使用者列表
      setUsers(prev => [...prev, response.data]);
      console.log('新增使用者成功:', response.data);

      // 顯示成功提示
      toast.success('新增使用者成功', TOAST_CONFIG.SUCCESS);
      
      // 重置表單
      setUserFormData({
        username: '',
        login_code: '',
        password: '',
        confirm_password: '',
        role: 'admin'
      });
      
      // 隱藏表單
      setShowAddUserForm(false);
      
    } catch (err) {
      console.error('完整錯誤:', err);
      console.error('錯誤狀態:', err.response?.status);
      console.error('錯誤數據:', err.response?.data);
      console.error('新增使用者失敗', err);
      //setError(err.response?.data?.message || '新增使用者失敗');
      toast.error('新增使用者失敗', TOAST_CONFIG.ERROR);
    }
  };
  
  // 生成勞工專屬連結
  const generateWorkerLink = (worker) => {
    const baseUrl = window.location.origin;
    // 使用勞工代碼(code)而非ID，並確保使用公司代碼(code)而非ID
    return `${baseUrl}/form?worker_code=${worker.code}&company_code=${companyCode}`;
  };
  
  // 複製連結到剪貼簿
  const copyLinkToClipboard = (link) => {
    navigator.clipboard.writeText(link)
      .then(() => {
        alert('連結已複製到剪貼簿');
      })
      .catch(err => {
        console.error('複製失敗:', err);
        alert('複製失敗，請手動複製連結');
      });
  };

  const loadWorkerSubmissions = async (workerId) => {
    if (!workerId) return;
    
    try {
      setLoadingSubmissions(true);
      const response = await api.forms.getSubmissions(workerId);
      
      if (Array.isArray(response.data)) {
        setFormSubmissions(response.data);
      } else {
        console.error('表單提交記錄不是陣列:', response.data);
        setFormSubmissions([]);
      }
    } catch (err) {
      console.error('載入表單提交記錄失敗:', err);
      setFormSubmissions([]);
      setError('無法載入表單提交記錄');
    } finally {
      setLoadingSubmissions(false);
    }
  };
  
  // 處理勞工選擇變更
  const handleWorkerSelect = (e) => {
    const workerId = e.target.value;
    setSelectedWorkerId(workerId);
    
    if (workerId) {
      loadWorkerSubmissions(workerId);
    } else {
      setFormSubmissions([]);
    }
  };
  
  
  // 登出
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  
  // 如果正在載入，顯示載入中
  if (loading) {
    return <div className="loading">載入中...</div>;
  }
  
  // 如果未登入或不是公司管理員/老闆，重定向到登入頁面
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="company-dashboard">
      <header className="dashboard-header">
        <h1>{companyName}管理儀表板</h1>
        <div className="user-info">
          <span>您好，{user.username}</span>
          <button className="logout-btn" onClick={handleLogout}>登出</button>
        </div>
      </header>
      
      <nav className="dashboard-nav">
        <ul>
          <li 
            className={activeTab === 'workers' ? 'active' : ''}   
            onClick={() => setActiveTab('workers')}
          >
            勞工管理
          </li>
          <li 
            className={activeTab === 'forms' ? 'active' : ''} 
            onClick={() => setActiveTab('forms')}
          >
            表單數據
          </li>
          <li 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            使用者管理
          </li>
        </ul>
      </nav>
      
      <main className="dashboard-content">
        {error && <div className="error-message">{error}</div>}
        
        {/* 勞工管理 */}
        {activeTab === 'workers' && (
          <div className="workers-management">
            <div className="section-header">
              <h2>勞工管理</h2>
              <button 
                className="add-button"
                onClick={() => setShowAddWorkerForm(!showAddWorkerForm)}
              >
                {showAddWorkerForm ? '取消' : '新增勞工'}
              </button>
            </div>
            
            {/* 新增勞工表單 */}
            {showAddWorkerForm && (
              <form onSubmit={handleAddWorker} className="add-form">
                <div className="form-group">
                  <label htmlFor="name">姓名</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={workerFormData.name}
                    onChange={handleWorkerInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="code">勞工代碼</label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={workerFormData.code}
                    onChange={handleWorkerInputChange}
                    required
                    maxLength={10}
                  />
                  <small>最多10個字符，用於識別勞工</small>
                </div>
                
                <button type="submit" className="submit-button">新增勞工</button>
              </form>
            )}
            
            {/* 勞工列表 */}
            <div className="workers-list">
              {workers.length === 0 ? (
                <p>目前還沒有勞工資料</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>姓名</th>
                      <th>勞工代碼</th>
                      <th>表單專屬連結</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(workers) && workers.map(worker => (
                      <tr key={worker.id}>
                        <td>{worker.name}</td>
                        <td>{worker.code}</td>
                        <td>
                          <div className="link-container">
                            <span className="worker-link">{generateWorkerLink(worker)}</span>
                            <button 
                              className="copy-button"
                              onClick={() => copyLinkToClipboard(generateWorkerLink(worker))}
                            >
                              複製
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-button view bg-pink">查看資料</button>
                            <button 
                              className="action-button delete"
                              onClick={() => handleDeleteWorker(worker.id, worker.name)}
                            >
                              刪除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        
        {/* 表單數據 */}
        {activeTab === 'forms' && (
          <div className="forms-data">
            <h2>表單數據</h2>
            <p>選擇勞工以查看其填寫的表單數據</p>
            
            <div className="worker-selector">
              <label htmlFor="worker-select">選擇勞工：</label>
              <select 
                id="worker-select" 
                value={selectedWorkerId} 
                onChange={handleWorkerSelect}
              >
                <option value="">-- 請選擇勞工 --</option>
                {Array.isArray(workers) && workers.map(worker => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} ({worker.code})
                  </option>
                ))}
              </select>
            </div>
            
            {/* 表單數據顯示 */}
            <div className="form-data-container">
              {!selectedWorkerId ? (
                <p>請選擇勞工以查看其填寫的表單數據</p>
              ) : loadingSubmissions ? (
                <p>載入中...</p>
              ) : formSubmissions.length === 0 ? (
                <p>該勞工尚未提交任何表單</p>
              ) : (
                <div className="submissions-list">
                  <h3>表單提交記錄</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>提交時間</th>
                        <th>表單類型</th>
                        <th>批次</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formSubmissions.map(submission => (
                        <tr key={submission.id}>
                          <td>{new Date(submission.submission_time).toLocaleString()}</td>
                          <td>{submission.form_type_name}</td>
                          <td>第 {submission.submission_count} 批次-第 {submission.stage+1} 時段 ({getStageNameById(submission.stage)})</td>                       
                          <td>
                          <button 
                            className="action-button view"
                            onClick={() => showSubmissionDetails(submission)}
                          >
                            查看詳情
                          </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* 使用者管理 */}
        {activeTab === 'users' && (
          <div className="users-management">
            <div className="section-header">
              <h2>使用者管理</h2>
              {user.role === 'owner' && (
                <button 
                  className="add-button"
                  onClick={() => setShowAddUserForm(!showAddUserForm)}
                >
                  {showAddUserForm ? '取消' : '新增使用者'}
                </button>
              )}
            </div>
            
            {/* 新增使用者表單 */}
            {showAddUserForm && user.role === 'owner' && (
              <form onSubmit={handleAddUser} className="add-form">
                <div className="form-group">
                  <label htmlFor="username">使用者名稱</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={userFormData.username}
                    onChange={handleUserInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="login_code">登入代碼</label>
                  <input
                    type="text"
                    id="login_code"
                    name="login_code"
                    value={userFormData.login_code}
                    onChange={handleUserInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">密碼</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={userFormData.password}
                    onChange={handleUserInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirm_password">確認密碼</label>
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={userFormData.confirm_password}
                    onChange={handleUserInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="role">角色</label>
                  <select
                    id="role"
                    name="role"
                    value={userFormData.role}
                    onChange={handleUserInputChange}
                    required
                  >
                    <option value="admin">公司管理員</option>
                    <option value="experimenter">實驗者</option>
                  </select>
                </div>
                
                <button type="submit" className="submit-button">新增使用者</button>
              </form>
            )}
            
            {/* 使用者列表 */}
            <div className="users-list">
              {users.length === 0 ? (
                <p>目前沒有使用者資料</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>使用者名稱</th>
                      <th>登入代碼</th>
                      <th>角色</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(users) && users.map(user => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.login_code}</td>
                        <td>{user.role === 'owner' ? '公司負責人' : 
                             user.role === 'admin' ? '公司管理員' : 
                             user.role === 'experimenter' ? '實驗者' : '未知'}</td>
                        <td>
                          {user.role !== 'owner' && (
                            <button 
                              className="action-button delete"
                              onClick={() => {
                                if (window.confirm('確定要刪除此使用者嗎？')) {
                                  api.users.delete(user.id)
                                    .then(() => {
                                      setUsers(prev => prev.filter(u => u.id !== user.id));
                                      toast.success('刪除使用者成功', TOAST_CONFIG.SUCCESS);
                                    })
                                    .catch(err => {
                                      console.error('刪除使用者失敗', err);
                                      //setError('刪除使用者失敗');
                                      toast.error('刪除使用者失敗，只有公司老闆有此功能', TOAST_CONFIG.ERROR);
                                    });
                                }
                              }}
                            >
                              刪除
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
      
      <footer className="dashboard-footer">
        <p>&copy; 2025 勞工健康數據平台</p>
      </footer>
      
      {showFormModal && activeSubmission && (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>表單詳情</h3>
            <button 
              className="close-button"
              onClick={() => setShowFormModal(false)}
            >
              ✕
            </button>
          </div>
          <div className="modal-body">
            <p><strong>提交時間:</strong> {new Date(activeSubmission.submission_time).toLocaleString()}</p>
            <p><strong>表單類型:</strong> {activeSubmission.form_type_name}</p>
            <p><strong>批次:</strong> 第 {activeSubmission.submission_count} 批次-第 {activeSubmission.stage+1} 時段</p>
            <p><strong>階段:</strong> {getStageNameById(activeSubmission.stage)}</p>
                        
            <h4>填寫內容:</h4>
            <div className="form-data-display">
              {Object.entries(activeSubmission.data).map(([key, value]) => (
                <div key={key} className="form-data-item">
                  <strong>{key.replace(/_/g, ' ')}:</strong> {value}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}

    </div>
  );
};

export default CompanyDashboard;