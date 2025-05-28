// src/App.jsx
import React from 'react';
import AppRouter from './AppRouter';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="app">
      <AppRouter />

      <ToastContainer
        position="top-right"     // 通知顯示位置
        autoClose={3000}         // 3秒後自動關閉
        hideProgressBar={false}  // 顯示進度條
        newestOnTop={false}      // 新通知不會在最上方
        closeOnClick            // 點擊可關閉
        rtl={false}             // 從左到右
        pauseOnFocusLoss        // 失去焦點時暫停
        draggable               // 可拖拽
        pauseOnHover            // 滑鼠懸停時暫停
        theme="light"           // 主題：light, dark, colored
      />
    </div>
  );
}

export default App;