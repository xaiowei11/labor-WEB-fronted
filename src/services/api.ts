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
    login: (companyCode: string, loginCode: string, password: string) => 
      apiClient.post('/api/login/', { 
        company_code: companyCode, 
        login_code: loginCode, 
        password 
      }),
    logout: () => apiClient.post('/api/logout/'),
  },
  
  // 公司相關
  companies: {
    // 獲取所有公司（需要認證，給管理員使用）
    getAll: () => apiClient.get('/api/companies/'),
    
    // 新增：獲取公開的公司列表（不需要認證，給登入頁面使用）
    getPublicList: () => {
      // 創建一個不帶認證的請求
      const publicClient = axios.create({
        baseURL: 'http://localhost:8000',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      return publicClient.get('/api/public/companies/');
    },
    
    getOne: (id: number, config?: any) => apiClient.get(`/api/companies/${id}/`, config),
    
    // 修正創建公司的 API 端點，根據後端路由定義
    create: (data: any) => apiClient.post('/api/companies/create/', data),
    
    update: (id: number, data: any) => apiClient.put(`/api/companies/${id}/`, data),
    
    delete: (id: number) => apiClient.delete(`/api/companies/${id}/`),
  },
  
  // 勞工相關
  workers: {
    // 獲取公司所有勞工
    getAll: (companyId: number) => apiClient.get(`/api/companies/${companyId}/workers/`),
    
    // 獲取特定勞工
    getOne: (id: number, config?: any) => apiClient.get(`/api/workers/${id}/`, config),
    
    // 通過代碼獲取勞工（公開API，不需要認證）
    getByCode: (workerCode: string, companyCode: string) => {
      const publicClient = axios.create({
        baseURL: 'http://localhost:8000',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      return publicClient.get('/api/public/worker-by-code/', {
        params: { 
          worker_code: workerCode, 
          company_code: companyCode 
        }
      });
    },
    
    // 創建勞工
    create: (data: any) => apiClient.post('/api/workers/', data),
    
    // 更新勞工
    update: (id: number, data: any) => apiClient.put(`/api/workers/${id}/`, data),
    
    // 刪除勞工
    delete: (id: number) => apiClient.delete(`/api/workers/${id}/`),
    
    // 強制刪除勞工（刪除勞工及其所有相關資料）
    forceDelete: (id: number) => apiClient.delete(`/api/workers/${id}/force/`),
    
    // 獲取勞工的表單
    getForms: (workerId: number) => apiClient.get(`/api/workers/${workerId}/forms/`),
    
    // 獲取勞工的實驗記錄
    getExperiments: (workerId: number) => apiClient.get(`/api/workers/${workerId}/experiments/`),
  },
  
  // 表單相關
  forms: {
    // 獲取表單類型
    getTypes: () => apiClient.get('/api/form-types/'),
    
    // 獲取公開的表單類型（不需要認證）
    getPublicTypes: () => {
      const publicClient = axios.create({
        baseURL: 'http://localhost:8000',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      return publicClient.get('/api/public/form-types/');
    },
    
    // 提交表單
    submit: (workerId: number, formTypeId: number, formData: any) => 
      apiClient.post('/api/forms/submit/', { 
        worker_id: workerId, 
        form_type_id: formTypeId, 
        form_data: formData 
      }),
    
    // 公開提交表單（不需要認證）
    submitPublic: (data: any) => {
      const publicClient = axios.create({
        baseURL: 'http://localhost:8000',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      return publicClient.post('/api/public/forms/submit/', data);
    },
    
    // 獲取勞工的表單提交記錄
    getSubmissions: (workerId: number) => apiClient.get(`/api/workers/${workerId}/submissions/`),
    
    // 獲取公開的勞工提交記錄
    getPublicSubmissions: (workerCode: string, companyCode: string) => {
      const publicClient = axios.create({
        baseURL: 'http://localhost:8000',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      return publicClient.get('/api/public/worker-submissions/', {
        params: {
          worker_code: workerCode,
          company_code: companyCode
        }
      });
    },
  },
  
  // 實驗相關
  experiments: {
    // 獲取實驗者的所有實驗
    getAll: () => apiClient.get('/api/experimenter/experiments/'),
    
    // 創建實驗
    create: (data: any) => {
      // 如果數據包含文件，使用 FormData
      if (data instanceof FormData) {
        return apiClient.post('/api/experiments/', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      return apiClient.post('/api/experiments/', data);
    },
    
    // 更新實驗
    update: (id: number, data: any) => apiClient.put(`/api/experiments/${id}/`, data),
    
    // 獲取勞工的實驗記錄
    getWorkerExperiments: (workerId: number) => apiClient.get(`/api/workers/${workerId}/experiments/`),
    
    // 獲取公司的實驗記錄
    getCompanyExperiments: () => apiClient.get('/api/companies/experiments/'),
    
    // 超級實驗者獲取所有實驗
    getSuperExperimenterExperiments: () => apiClient.get('/api/super-experimenter/experiments/'),
  },
  
  // 眼動儀分析相關 - 新增的分析功能
  analysis: {
    // 分析實驗數據
    analyzeExperiment: (experimentId: number) => {
      return apiClient.post(`/api/experiments/${experimentId}/analyze/`);
    },

    // 獲取分析結果
    getAnalysisResult: (experimentId: number) => {
      return apiClient.get(`/api/experiments/${experimentId}/analysis-result/`);
    },

    // 獲取分析狀態
    getAnalysisStatus: (experimentId: number) => {
      return apiClient.get(`/api/experiments/${experimentId}/analysis-status/`);
    },

    // 下載分析檔案
    downloadFile: (experimentId: number, filename: string) => {
      return fetch(`http://localhost:8000/api/experiments/${experimentId}/download/${filename}/`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      });
    }
  },
  
  // 使用者相關
  users: {
    // 獲取公司使用者
    getCompanyUsers: (companyId: number) => apiClient.get(`/api/companies/${companyId}/users/`),
    
    // 創建使用者
    create: (data: any) => {
      console.log('API 客戶端接收到的用戶數據:', data); // 添加這行來調試
      return apiClient.post('/api/users/', data);
    },  
    
    // 獲取使用者詳情
    getOne: (id: number) => apiClient.get(`/api/users/${id}/`),
    
    // 更新使用者
    update: (id: number, data: any) => apiClient.patch(`/api/users/${id}/`, data),
    
    // 刪除使用者
    delete: (id: number) => apiClient.delete(`/api/users/${id}/`),
  },
};

export default api;