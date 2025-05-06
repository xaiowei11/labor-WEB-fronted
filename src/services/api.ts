import axios from 'axios';

// 創建一個 axios 實例，設置基本 URL 和默認配置
const apiClient = axios.create({
  baseURL: 'http://localhost:8000',  // 開發環境中的後端 URL
  // 或者使用相對路徑，搭配 Vite 代理：baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,  // 請求超時時間：10秒
});

// 添加請求攔截器，用於處理 token 等認證信息
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 定義 API 端點和方法
const api = {
  // 認證相關
  auth: {
    login: (companyCode, loginCode, password) => 
      apiClient.post('/api/login/', { 
        company_code: companyCode, 
        login_code: loginCode, 
        password 
      }),
    logout: () => apiClient.post('/api/logout/'),
  },
  
  // 公司相關
  companies: {
    getAll: () => apiClient.get('/api/companies/'),
    getOne: (id, config) => apiClient.get(`/api/companies/${id}/`, config),
    // 修正創建公司的 API 端點，根據後端路由定義
    create: (data) => apiClient.post('/api/companies/create/', data),
    update: (id, data) => apiClient.put(`/api/companies/${id}/`, data),
    delete: (id) => apiClient.delete(`/api/companies/${id}/`),
  },
  
  // 勞工相關
  workers: {
    getAll: (companyId) => apiClient.get(`/api/companies/${companyId}/workers/`),
    getOne: (id, config) => apiClient.get(`/api/workers/${id}/`, config),
    create: (data) => apiClient.post('/api/workers/', data),
    update: (id, data) => apiClient.put(`/api/workers/${id}/`, data),
    delete: (id) => apiClient.delete(`/api/workers/${id}/`),
    getForms: (workerId) => apiClient.get(`/api/workers/${workerId}/forms/`),
  },
  
  // 表單相關
  forms: {
    getTypes: () => apiClient.get('/api/form-types/'),
    submit: (workerId, formTypeId, formData) => 
      apiClient.post('/api/forms/submit/', { worker_id: workerId, form_type_id: formTypeId, form_data: formData }),
    getSubmissions: (workerId) => apiClient.get(`/api/workers/${workerId}/submissions/`),
  },
  
  // 實驗相關
  experiments: {
    getAll: () => apiClient.get('/api/experimenter/experiments/'),
    create: (data) => apiClient.post('/api/experiments/', data),
    getWorkerExperiments: (workerId) => apiClient.get(`/api/workers/${workerId}/experiments/`),
  },
  
  // 使用者相關
  users: {
    getCompanyUsers: (companyId) => apiClient.get(`/api/companies/${companyId}/users/`),
    create: (data) => {
      console.log('API 客戶端接收到的用戶數據:', data); // 添加這行來調試
      return apiClient.post('/api/users/', data);
    },  
    update: (id, data) => apiClient.put(`/api/users/${id}/`, data),
    delete: (id) => apiClient.delete(`/api/users/${id}/`),
  }
};

export default api;