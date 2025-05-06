// src/components/forms/form-components/NasaTlxScale.jsx
import React, { useState, useEffect } from 'react';

const NasaTlxScale = ({ onDataChange }) => {
  const [nasaTlxData, setNasaTlxData] = useState({
    mental_demand: '50',
    physical_demand: '50',
    temporal_demand: '50',
    performance: '50',
    effort: '50',
    frustration: '50'
  });
  
  // 當數據變更時，將數據傳送給父元件
  useEffect(() => {
    if (onDataChange) {
      onDataChange(nasaTlxData);
    }
  }, [nasaTlxData, onDataChange]);
  
  // 處理滑桿變更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNasaTlxData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <div className="form-section">
      <h3>NASA-TLX 任務負荷評估量表</h3>
      <p>本量表將影響工作的心智負荷(勞心程度)因素，列出以下六項：</p>
      
      <div className="table-container">
        <table className="nasa-tlx-table">
          <thead>
            <tr>
              <th>因素</th>
              <th>解釋</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>心理需求 (Mental Demand)</td>
              <td>任務是否需要大量思考、決策、計算、記憶等認知處理？</td>
            </tr>
            <tr>
              <td>身體需求 (Physical Demand)</td>
              <td>任務是否需要大量身體活動 (搬運、走動、體力消耗)？</td>
            </tr>
            <tr>
              <td>時間壓力 (Temporal Demand)</td>
              <td>任務是否需要快速完成？是否感受到時間緊迫？</td>
            </tr>
            <tr>
              <td>表現滿意度 (Performance)</td>
              <td>自己對任務完成度是否滿意？</td>
            </tr>
            <tr>
              <td>努力程度 (Effort)</td>
              <td>為了達成任務，付出了多少努力？</td>
            </tr>
            <tr>
              <td>挫折感 (Frustration Level)</td>
              <td>任務中是否感到受挫、焦慮、沮喪或煩躁</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="form-group">
        <h4>請就六大因素的個別影響您工作心智負荷的程度進行評定</h4>
        <p>請問心智需求 (完成工作所耗費腦力程度)影響您工作心智負荷的程度：分數越高負荷越大</p>
        
        <div className="rating-slider">
          <input
            type="range"
            id="mental_demand"
            name="mental_demand"
            min="0"
            max="100"
            step="5"
            value={nasaTlxData.mental_demand}
            onChange={handleChange}
          />
          <div className="rating-marks">
            <span>0</span>
            <span>20</span>
            <span>40</span>
            <span>60</span>
            <span>80</span>
            <span>100</span>
          </div>
        </div>
        <p>當前評分: {nasaTlxData.mental_demand}</p>
      </div>
      
      <div className="form-group">
        <p>請問動作需求 (完成工作所耗費體力程度)影響您工作心智負荷的程度：分數越高負荷越大</p>
        
        <div className="rating-slider">
          <input
            type="range"
            id="physical_demand"
            name="physical_demand"
            min="0"
            max="100"
            step="5"
            value={nasaTlxData.physical_demand}
            onChange={handleChange}
          />
          <div className="rating-marks">
            <span>0</span>
            <span>20</span>
            <span>40</span>
            <span>60</span>
            <span>80</span>
            <span>100</span>
          </div>
        </div>
        <p>當前評分: {nasaTlxData.physical_demand}</p>
      </div>
      
      <div className="form-group">
        <p>請問時間需求 (完成工作所耗費時間程度)影響您工作心智負荷的程度：分數越高負荷越大</p>
        
        <div className="rating-slider">
          <input
            type="range"
            id="temporal_demand"
            name="temporal_demand"
            min="0"
            max="100"
            step="5"
            value={nasaTlxData.temporal_demand}
            onChange={handleChange}
          />
          <div className="rating-marks">
            <span>0</span>
            <span>20</span>
            <span>40</span>
            <span>60</span>
            <span>80</span>
            <span>100</span>
          </div>
        </div>
        <p>當前評分: {nasaTlxData.temporal_demand}</p>
      </div>
      
      <div className="form-group">
        <p>請問自我績效 (完成工作後自覺滿意程度)影響您工作心智負荷的程度：分數越高負荷越大</p>
        
        <div className="rating-slider">
          <input
            type="range"
            id="performance"
            name="performance"
            min="0"
            max="100"
            step="5"
            value={nasaTlxData.performance}
            onChange={handleChange}
          />
          <div className="rating-marks">
            <span>0</span>
            <span>20</span>
            <span>40</span>
            <span>60</span>
            <span>80</span>
            <span>100</span>
          </div>
        </div>
        <p>當前評分: {nasaTlxData.performance}</p>
      </div>
      
      <div className="form-group">
        <p>請問精力耗費 (完成工作所耗費心力程度)影響您工作心智負荷的程度：分數越高負荷越大</p>
        
        <div className="rating-slider">
          <input
            type="range"
            id="effort"
            name="effort"
            min="0"
            max="100"
            step="5"
            value={nasaTlxData.effort}
            onChange={handleChange}
          />
          <div className="rating-marks">
            <span>0</span>
            <span>20</span>
            <span>40</span>
            <span>60</span>
            <span>80</span>
            <span>100</span>
          </div>
        </div>
        <p>當前評分: {nasaTlxData.effort}</p>
      </div>
      
      <div className="form-group">
        <p>請問挫折程度 (完成工作自覺挫折感的程度)影響您工作心智負荷的程度：分數越高負荷越大</p>
        
        <div className="rating-slider">
          <input
            type="range"
            id="frustration"
            name="frustration"
            min="0"
            max="100"
            step="5"
            value={nasaTlxData.frustration}
            onChange={handleChange}
          />
          <div className="rating-marks">
            <span>0</span>
            <span>20</span>
            <span>40</span>
            <span>60</span>
            <span>80</span>
            <span>100</span>
          </div>
        </div>
        <p>當前評分: {nasaTlxData.frustration}</p>
      </div>
    </div>
  );
};

export default NasaTlxScale;