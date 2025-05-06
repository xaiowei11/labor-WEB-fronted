// src/components/forms/form-components/EyeFatigueScale.jsx
import React, { useState, useEffect } from 'react';

const EyeFatigueScale = ({ onDataChange }) => {
  const [eyeFatigueData, setEyeFatigueData] = useState({
    dry_eyes: '',
    eye_pain: '',
    blurred_vision: '',
    focus_difficulty: '',
    headache: ''
  });
  
  // 當數據變更時，將數據傳送給父元件
  useEffect(() => {
    if (onDataChange && Object.values(eyeFatigueData).some(val => val !== '')) {
      onDataChange(eyeFatigueData);
    }
  }, [eyeFatigueData, onDataChange]);
  
  // 處理選項變更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEyeFatigueData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <div className="form-section">
      <h3>視覺疲勞量表</h3>
      <p>請圈選最能代表此刻的視覺疲勞程度：</p>
      
      <div className="table-container">
        <table className="eye-fatigue-table">
          <thead>
            <tr>
              <th>項目</th>
              <th>無</th>
              <th>不確定</th>
              <th>是</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>眼睛乾澀和灼熱？</td>
              <td>
                <input
                  type="radio"
                  name="dry_eyes"
                  value="無"
                  checked={eyeFatigueData.dry_eyes === '無'}
                  onChange={handleChange}
                  required
                />
              </td>
              <td>
                <input
                  type="radio"
                  name="dry_eyes"
                  value="不確定"
                  checked={eyeFatigueData.dry_eyes === '不確定'}
                  onChange={handleChange}
                />
              </td>
              <td>
                <input
                  type="radio"
                  name="dry_eyes"
                  value="是"
                  checked={eyeFatigueData.dry_eyes === '是'}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>眼痛或異物感？</td>
              <td>
                <input
                  type="radio"
                  name="eye_pain"
                  value="無"
                  checked={eyeFatigueData.eye_pain === '無'}
                  onChange={handleChange}
                  required
                />
              </td>
              <td>
                <input
                  type="radio"
                  name="eye_pain"
                  value="不確定"
                  checked={eyeFatigueData.eye_pain === '不確定'}
                  onChange={handleChange}
                />
              </td>
              <td>
                <input
                  type="radio"
                  name="eye_pain"
                  value="是"
                  checked={eyeFatigueData.eye_pain === '是'}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>視力模糊？</td>
              <td>
                <input
                  type="radio"
                  name="blurred_vision"
                  value="無"
                  checked={eyeFatigueData.blurred_vision === '無'}
                  onChange={handleChange}
                  required
                />
              </td>
              <td>
                <input
                  type="radio"
                  name="blurred_vision"
                  value="不確定"
                  checked={eyeFatigueData.blurred_vision === '不確定'}
                  onChange={handleChange}
                />
              </td>
              <td>
                <input
                  type="radio"
                  name="blurred_vision"
                  value="是"
                  checked={eyeFatigueData.blurred_vision === '是'}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>難以集中注意力？</td>
              <td>
                <input
                  type="radio"
                  name="focus_difficulty"
                  value="無"
                  checked={eyeFatigueData.focus_difficulty === '無'}
                  onChange={handleChange}
                  required
                />
              </td>
              <td>
                <input
                  type="radio"
                  name="focus_difficulty"
                  value="不確定"
                  checked={eyeFatigueData.focus_difficulty === '不確定'}
                  onChange={handleChange}
                />
              </td>
              <td>
                <input
                  type="radio"
                  name="focus_difficulty"
                  value="是"
                  checked={eyeFatigueData.focus_difficulty === '是'}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>頭痛或頭暈？</td>
              <td>
                <input
                  type="radio"
                  name="headache"
                  value="無"
                  checked={eyeFatigueData.headache === '無'}
                  onChange={handleChange}
                  required
                />
              </td>
              <td>
                <input
                  type="radio"
                  name="headache"
                  value="不確定"
                  checked={eyeFatigueData.headache === '不確定'}
                  onChange={handleChange}
                />
              </td>
              <td>
                <input
                  type="radio"
                  name="headache"
                  value="是"
                  checked={eyeFatigueData.headache === '是'}
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

export default EyeFatigueScale;