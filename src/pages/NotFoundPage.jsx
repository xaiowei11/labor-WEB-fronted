// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <h1>404</h1>
        <h2>頁面不存在</h2>
        <p>很抱歉，您嘗試訪問的頁面不存在或已被移除。</p>
        <Link to="/" className="back-link">回到首頁</Link>
      </div>
      
      <style jsx>{`
        .not-found-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f5f5f5;
        }
        
        .not-found-container {
          text-align: center;
          padding: 3rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-width: 500px;
        }
        
        h1 {
          font-size: 6rem;
          margin: 0;
          color: #1976d2;
        }
        
        h2 {
          font-size: 2rem;
          margin-bottom: 1.5rem;
          color: #333;
        }
        
        p {
          margin-bottom: 2rem;
          color: #757575;
        }
        
        .back-link {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: #1976d2;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 500;
          transition: background-color 0.3s;
        }
        
        .back-link:hover {
          background-color: #115293;
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;