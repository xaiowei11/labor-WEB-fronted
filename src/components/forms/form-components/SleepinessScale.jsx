// src/components/forms/form-components/SleepinessScale.jsx
import React, { useState, useEffect } from 'react';

const SleepinessScale = ({ onDataChange }) => {
  const [sleepinessLevel, setSleepinessLevel] = useState('');
  
  // 當選項變更時，將數據傳送給父元件
  useEffect(() => {
    if (onDataChange && sleepinessLevel) {
      onDataChange({ sleepiness_level: sleepinessLevel });
    }
  }, [sleepinessLevel, onDataChange]);
  
  // 處理選項變更
  const handleChange = (e) => {
    setSleepinessLevel(e.target.value);
  };
  
  return (
    <div className="form-section">
      <h3>史丹佛嗜睡量表 (Stanford Sleepiness Scale)</h3>
      <p>請從下列 7 個選項中選擇一個，最能代表您此刻的嗜睡感受：</p>
      
      <div className="table-container">
        <table className="sleepiness-table">
          <thead>
            <tr>
              <th>編號</th>
              <th>描述</th>
              <th>選擇</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>感覺精力充沛，頭腦清醒，毫無倦意</td>
              <td>
                <input
                  type="radio"
                  name="sleepiness_level"
                  value="1"
                  checked={sleepinessLevel === '1'}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>精力尚可，但不是最佳狀態，能夠集中注意力</td>
              <td>
                <input
                  type="radio"
                  name="sleepiness_level"
                  value="2"
                  checked={sleepinessLevel === '2'}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>3</td>
              <td>清醒，但對外界的刺激有反應但不夠警覺</td>
              <td>
                <input
                  type="radio"
                  name="sleepiness_level"
                  value="3"
                  checked={sleepinessLevel === '3'}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>4</td>
              <td>意識已有點不清楚，沒有精神</td>
              <td>
                <input
                  type="radio"
                  name="sleepiness_level"
                  value="4"
                  checked={sleepinessLevel === '4'}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>5</td>
              <td>昏昏沉沉；在清醒時對周圍事物興趣不大，遲鈍</td>
              <td>
                <input
                  type="radio"
                  name="sleepiness_level"
                  value="5"
                  checked={sleepinessLevel === '5'}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>6</td>
              <td>昏睡；很想睡，但努力保持頭腦清醒、頭昏</td>
              <td>
                <input
                  type="radio"
                  name="sleepiness_level"
                  value="6"
                  checked={sleepinessLevel === '6'}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>7</td>
              <td>不想再努力保持清醒；很快就入睡，有做夢的感覺</td>
              <td>
                <input
                  type="radio"
                  name="sleepiness_level"
                  value="7"
                  checked={sleepinessLevel === '7'}
                  onChange={handleChange}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SleepinessScale;