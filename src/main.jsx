// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/main.css'; // 確保樣式正確引入
import './index.css'; // 引入全局樣式

// 應用程序入口點 - 只在這裡渲染一次
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);